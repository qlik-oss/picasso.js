import { rotate as rotateVector } from '../../math/vector';

function appendStyle(struct, buildOpts) {
  ['fill', 'fontSize', 'fontFamily'].forEach((style) => {
    struct[style] = buildOpts.style[style];
  });
}

function polarToCartesian(centerX, centerY, radius, angle) {
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

function checkText(text) {
  return typeof text === 'string' || typeof text === 'number' ? text : '-';
}

function clampEnds(struct, buildOpts) {
  if (buildOpts.tilted || buildOpts.stepSize) {
    return;
  }

  if (buildOpts.align === 'top' || buildOpts.align === 'bottom') {
    const leftBoundary = 0;
    const rightBoundary = buildOpts.outerRect.width;
    const textWidth = Math.min(buildOpts.maxWidth / 2, buildOpts.textRect.width / 2);
    const leftTextBoundary = struct.x - textWidth;
    const rightTextBoundary = struct.x + textWidth;
    if (leftTextBoundary < leftBoundary) {
      struct.anchor = 'start';
      struct.x = buildOpts.innerRect.x - buildOpts.outerRect.x;
    } else if (rightTextBoundary > rightBoundary) {
      struct.anchor = 'end';
      struct.x = buildOpts.innerRect.width + buildOpts.innerRect.x;
    }
  } else {
    const topBoundary = 0;
    const bottomBoundary = buildOpts.outerRect.height;
    const textHeight = buildOpts.maxHeight / 2;
    const topTextBoundary = struct.y - textHeight;
    const bottomTextBoundary = struct.y + textHeight;
    if (topTextBoundary < topBoundary) {
      struct.y = buildOpts.innerRect.y - buildOpts.outerRect.y;
      struct.baseline = 'text-before-edge';
    } else if (bottomTextBoundary > bottomBoundary) {
      struct.y = buildOpts.innerRect.height + (buildOpts.innerRect.y - buildOpts.outerRect.y);
      struct.baseline = 'text-after-edge';
    }
  }
}

function appendTilting(struct, buildOpts) {
  if (buildOpts.tilted) {
    const r = -buildOpts.angle;
    const radians = r * (Math.PI / 180);

    if (buildOpts.align === 'bottom') {
      struct.x -= (buildOpts.maxHeight * Math.sin(radians)) / 2;
      struct.y -= buildOpts.maxHeight;
      struct.y += (buildOpts.maxHeight * Math.cos(radians)) / 2;
    } else {
      struct.x -= (buildOpts.maxHeight * Math.sin(radians)) / 3;
    }

    struct.transform = `rotate(${r}, ${struct.x}, ${struct.y})`;
    struct.anchor = (buildOpts.align === 'bottom') === buildOpts.angle < 0 ? 'start' : 'end';

    // adjustForEnds
    const textWidth = Math.cos(radians) * buildOpts.maxWidth;
    if ((buildOpts.align === 'bottom') === buildOpts.angle < 0) {
      // right
      const rightBoundary = buildOpts.outerRect.width - buildOpts.paddingEnd;
      const rightTextBoundary = struct.x + textWidth;
      if (rightTextBoundary > rightBoundary) {
        struct.maxWidth = (rightBoundary - struct.x - 10) / Math.cos(radians);
      }
    } else {
      // left
      const leftBoundary = buildOpts.paddingEnd;
      const leftTextBoundary = struct.x - textWidth;
      if (leftTextBoundary < leftBoundary) {
        struct.maxWidth = (struct.x - leftBoundary - 10) / Math.cos(radians);
      }
    }
  }
}

function bandwidthCollider(tick, struct, buildOpts) {
  if (buildOpts.align === 'bottom' || buildOpts.align === 'top') {
    const tickCenter = tick.position * buildOpts.innerRect.width;
    const leftBoundary = tickCenter + (buildOpts.innerRect.x - buildOpts.outerRect.x - buildOpts.stepSize / 2);
    struct.collider = {
      type: 'rect',
      x: leftBoundary,
      y: 0,
      width: leftBoundary < 0 ? buildOpts.stepSize + leftBoundary : buildOpts.stepSize, // Adjust collider so that it doesnt extend onto neighbor collider
      height: buildOpts.innerRect.height,
    };
  } else {
    const tickCenter = tick.position * buildOpts.innerRect.height;
    const topBoundary = tickCenter + (buildOpts.innerRect.y - buildOpts.outerRect.y - buildOpts.stepSize / 2);
    struct.collider = {
      type: 'rect',
      x: 0,
      y: topBoundary,
      width: buildOpts.innerRect.width,
      height: topBoundary < 0 ? buildOpts.stepSize + topBoundary : buildOpts.stepSize, // Adjust collider so that it doesnt extend onto neighbor collider
    };
  }

  // Clip edges of the collider, should not extend beyoned the outerRect
  const collider = struct.collider;
  collider.x = Math.max(collider.x, 0);
  collider.y = Math.max(collider.y, 0);
  const widthClip = collider.x + collider.width - (buildOpts.outerRect.x + buildOpts.outerRect.width);
  collider.width = widthClip > 0 ? collider.width - widthClip : collider.width;
  const heightClip = collider.y + collider.height - (buildOpts.outerRect.y + buildOpts.outerRect.height);
  collider.height = heightClip > 0 ? collider.height - heightClip : collider.height;
}

function boundsCollider(tick, struct) {
  struct.collider = {
    type: 'polygon',
    vertices: [
      { x: struct.boundingRect.x, y: struct.boundingRect.y },
      { x: struct.boundingRect.x + struct.boundingRect.width, y: struct.boundingRect.y },
      { x: struct.boundingRect.x + struct.boundingRect.width, y: struct.boundingRect.y + struct.boundingRect.height },
      { x: struct.boundingRect.x, y: struct.boundingRect.y + struct.boundingRect.height },
    ],
  };
}

function tiltedCollider(tick, struct, buildOpts) {
  const radians = buildOpts.angle * (Math.PI / 180);
  const halfWidth = Math.max(buildOpts.stepSize / 2, struct.boundingRect.height / 2); // Handle if bandwidth is zero
  const startAnchor = struct.anchor === 'start';
  const em = struct.anchor === 'end' && radians < 0;
  const sp = struct.anchor === 'start' && radians >= 0;
  const y = struct.boundingRect.y + (sp || em ? struct.boundingRect.height : 0);
  // Generate starting points at bandwidth boundaries
  const points = [
    { x: struct.x - halfWidth, y },
    { x: struct.x + halfWidth, y },
  ].map((p) => rotateVector(p, radians, { x: struct.x, y: struct.y })); // Rotate around center point to counteract labels rotation

  // Append points to wrap polygon around label
  const margin = 10; // extend slightly to handle single char labels better
  const leftPoint = {
    x: startAnchor ? struct.boundingRect.x + struct.boundingRect.width + margin : struct.boundingRect.x - margin,
    y: struct.boundingRect.y + struct.boundingRect.height,
  };

  const rightPoint = {
    x: startAnchor ? struct.boundingRect.x + struct.boundingRect.width + margin : struct.boundingRect.x - margin,
    y: struct.boundingRect.y,
  };

  const orderedPoints = radians >= 0 ? [leftPoint, rightPoint] : [rightPoint, leftPoint];
  points.push(...orderedPoints);

  struct.collider = {
    type: 'polygon',
    vertices: points,
  };
}

function appendCollider(tick, struct, buildOpts) {
  if (buildOpts.layered || !buildOpts.stepSize) {
    boundsCollider(tick, struct);
  } else if (buildOpts.tilted) {
    tiltedCollider(tick, struct, buildOpts);
  } else {
    bandwidthCollider(tick, struct, buildOpts);
  }
}

function appendBounds(struct, buildOpts) {
  struct.boundingRect = buildOpts.textBounds(struct);
}
export default function buildArcLabels(ticks, tick, idx, buildOpts) {
  const rect = buildOpts.innerRect;
  const centerPoint = { cx: rect.width / 2, cy: rect.height / 2 }; // Center of the container
  const plotSize = Math.min(rect.height, rect.width) / 2;

  const innerRadius = plotSize * buildOpts.outerRadius;
  const outerRadius = innerRadius + 1;

  const startAngle = buildOpts.startAngle || 0; // Start angle of the arc
  const endAngle = buildOpts.endAngle || Math.PI / 2; // End angle of the arc

  const tickLength = 6;

  const angleRange = endAngle - startAngle;

  // Generate labels

  const normalizedPosition = idx / (ticks.length - 1);
  let angle = startAngle + normalizedPosition * angleRange;
  let side;
  if (angle < 0 && angle > -Math.PI) {
    // Label should be on the left
    side = 'left';
  } else if (angle > 0 && angle < Math.PI) {
    side = 'right';
  } else {
    side = 'center';
  }
  angle -= Math.PI / 2;
  const innerPos = polarToCartesian(centerPoint.cx, centerPoint.cy, outerRadius + tickLength + 12.5, angle);
  let textAnchor;
  if (side === 'left') {
    textAnchor = 'end'; // Align text to the right of the x-coordinate
  } else if (side === 'right') {
    textAnchor = 'start'; // Align text to the left of the x-coordinate
  } else {
    textAnchor = 'middle'; // Center align the text
  }
  // Add tick line to struct
  const struct = {
    type: 'text',
    text: checkText(tick.label),
    align: side,
    fontSmooth: 'auto',
    fontSize: 12,
    padding: 50,
    x: innerPos.x,
    y: innerPos.y,
    maxHeight: 16,
    maxWidth: 89,
    anchor: textAnchor,
    baseline: 'middle',
  };

  appendStyle(struct, buildOpts);
  clampEnds(struct, buildOpts);
  appendTilting(struct, buildOpts);
  appendBounds(struct, buildOpts);
  appendCollider(tick, struct, buildOpts);
  return struct;
}
