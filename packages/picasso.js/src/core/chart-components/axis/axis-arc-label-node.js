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

function collider(struct, tickPos) {
  if (struct.align === 'right') {
    if (tickPos.x >= struct.x) {
      struct.text = '';
    }
  }
}

function calculateMaxWidth(buildOpts, side, innerPos) {
  let maxWidth;
  if (side === 'left') {
    maxWidth = innerPos.x;
  } else if (side === 'right') {
    maxWidth = buildOpts.outerRect.width - innerPos.x;
  } else {
    maxWidth = Math.max(innerPos.x, buildOpts.outerRect.width - innerPos.x);
  }
  return maxWidth;
}

function checkRadialOutOfBounds(buildOpts, innerPos, struct) {
  let maxHeightTop;
  let maxHeightBottom;
  const textHeight = parseFloat(struct.fontSize) || 0;
  maxHeightTop = innerPos.y - textHeight / 2;
  maxHeightBottom = buildOpts.innerRect.height - (innerPos.y + textHeight / 2);
  if (maxHeightTop < 0 || maxHeightBottom < 0) {
    struct.text = '';
  }
  return maxHeightBottom;
}

function appendCollider(tick, struct, buildOpts, tickPos) {
  collider(tick, struct, buildOpts, tickPos);
}

function appendBounds(struct, buildOpts) {
  struct.boundingRect = buildOpts.textBounds(struct);
}

export default function buildArcLabels(tick, buildOpts) {
  const rect = buildOpts.innerRect;
  const centerPoint = { cx: rect.width / 2, cy: rect.height / 2 };
  const halfPlotSize = Math.min(rect.height, rect.width) / 2;
  const innerRadius = halfPlotSize * buildOpts.radius;
  const outerRadius = innerRadius + buildOpts.padding;
  const startAngle = buildOpts.startAngle;
  const endAngle = buildOpts.endAngle;
  const tickLength = buildOpts.tickSize;
  const angleRange = endAngle - startAngle;
  const centerOffset = 0.2;

  let angle;
  let side;

  if (buildOpts.align === 'top' || buildOpts.align === 'bottom') {
    angle = endAngle - tick.position * angleRange;
  } else {
    angle = startAngle + tick.position * angleRange;
  }
  if (angle < 0 - centerOffset && angle > -Math.PI + centerOffset) {
    side = 'left';
  } else if (angle > 0 + centerOffset && angle < Math.PI - centerOffset) {
    side = 'right';
  } else {
    side = 'center';
  }
  angle -= Math.PI / 2;
  const padding = 6;
  const innerPos = polarToCartesian(centerPoint.cx, centerPoint.cy, outerRadius + tickLength + padding, angle);
  let textAnchor;
  if (side === 'left') {
    textAnchor = 'end'; // Align text to the right of the x-coordinate
  } else if (side === 'right') {
    textAnchor = 'start'; // Align text to the left of the x-coordinate
  } else {
    textAnchor = 'middle'; // Center align the text
  }

  const struct = {
    type: 'text',
    text: checkText(tick.label),
    align: side,
    x: innerPos.x,
    y: innerPos.y,
    maxHeight: buildOpts.maxHeight,
    maxWidth: calculateMaxWidth(buildOpts, side, innerPos),
    anchor: textAnchor,
    baseline: 'middle',
  };

  const tickPos = polarToCartesian(centerPoint.cx, centerPoint.cy, outerRadius + 6, angle);
  appendStyle(struct, buildOpts);
  appendBounds(struct, buildOpts);
  appendCollider(struct, tickPos);
  checkRadialOutOfBounds(buildOpts, innerPos, struct);
  return struct;
}
