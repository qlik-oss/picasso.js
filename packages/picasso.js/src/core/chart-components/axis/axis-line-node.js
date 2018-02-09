import extend from 'extend';

function appendStyle(struct, buildOpts) {
  extend(struct, buildOpts.style);
  const halfWidth = struct.strokeWidth / 2;

  if (buildOpts.align === 'top') {
    struct.y1 -= halfWidth;
    struct.y2 -= halfWidth;
  } else if (buildOpts.align === 'bottom') {
    struct.y1 += halfWidth;
    struct.y2 += halfWidth;
  } else if (buildOpts.align === 'left') {
    struct.x1 -= halfWidth;
    struct.x2 -= halfWidth;
  } else if (buildOpts.align === 'right') {
    struct.x1 += halfWidth;
    struct.x2 += halfWidth;
  }
}

export default function buildLine(buildOpts) {
  const struct = {
    type: 'line',
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    collider: {
      type: null
    }
  };

  if (buildOpts.align === 'top' || buildOpts.align === 'bottom') {
    struct.x1 = buildOpts.innerRect.x - buildOpts.outerRect.x;
    struct.x2 = buildOpts.innerRect.width + buildOpts.innerRect.x;
    struct.y1 = struct.y2 = buildOpts.align === 'top' ? buildOpts.innerRect.height - buildOpts.padding : buildOpts.padding;
  } else {
    struct.x1 = struct.x2 = buildOpts.align === 'left' ? buildOpts.innerRect.width - buildOpts.padding : buildOpts.padding;
    struct.y1 = buildOpts.innerRect.y - buildOpts.outerRect.y;
    struct.y2 = buildOpts.innerRect.height + buildOpts.innerRect.y;
  }

  appendStyle(struct, buildOpts);

  return struct;
}
