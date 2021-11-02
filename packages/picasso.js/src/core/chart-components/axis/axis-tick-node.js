import extend from 'extend';

function appendStyle(struct, buildOpts) {
  extend(struct, buildOpts.style);
}

function appendPadding(struct, buildOpts) {
  if (buildOpts.align === 'top') {
    struct.y1 -= buildOpts.padding;
    struct.y2 -= buildOpts.padding;
  } else if (buildOpts.align === 'bottom') {
    struct.y1 += buildOpts.padding;
    struct.y2 += buildOpts.padding;
  } else if (buildOpts.align === 'left') {
    struct.x1 -= buildOpts.padding;
    struct.x2 -= buildOpts.padding;
  } else if (buildOpts.align === 'right') {
    struct.x1 += buildOpts.padding;
    struct.x2 += buildOpts.padding;
  }
}

function adjustForEnds(struct, buildOpts) {
  const halfWidth = struct.strokeWidth / 2;

  if (struct.x1 === buildOpts.innerRect.width) {
    // outer end tick
    struct.x1 -= halfWidth;
    struct.x2 -= halfWidth;
  } else if (struct.x1 === 0) {
    // outer start tick
    struct.x1 += halfWidth;
    struct.x2 += halfWidth;
  } else if (struct.y1 === buildOpts.innerRect.height) {
    struct.y1 -= halfWidth;
    struct.y2 -= halfWidth;
  } else if (struct.y1 === 0) {
    struct.y1 += halfWidth;
    struct.y2 += halfWidth;
  }
}

export default function buildNode(tick, buildOpts) {
  const struct = {
    type: 'line',
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    collider: {
      type: null,
    },
    tickLabel: tick.label,
  };

  if (buildOpts.align === 'top' || buildOpts.align === 'bottom') {
    struct.x1 = struct.x2 = tick.position * buildOpts.innerRect.width + (buildOpts.innerRect.x - buildOpts.outerRect.x);
    struct.y1 = buildOpts.align === 'top' ? buildOpts.innerRect.height : 0;
    struct.y2 = buildOpts.align === 'top' ? struct.y1 - buildOpts.tickSize : struct.y1 + buildOpts.tickSize;
  } else {
    struct.y1 = struct.y2 =
      tick.position * buildOpts.innerRect.height + (buildOpts.innerRect.y - buildOpts.outerRect.y);
    struct.x1 = buildOpts.align === 'left' ? buildOpts.innerRect.width : 0;
    struct.x2 = buildOpts.align === 'left' ? struct.x1 - buildOpts.tickSize : struct.x1 + buildOpts.tickSize;
  }

  appendStyle(struct, buildOpts);
  appendPadding(struct, buildOpts);
  adjustForEnds(struct, buildOpts);
  return struct;
}
