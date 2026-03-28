import extend from 'extend';

function appendStyle(struct, buildOpts) {
  extend(struct, buildOpts.style);
}

export default function buildLine(buildOpts) {
  const struct = {
    type: 'line',
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    collider: {
      type: null,
    },
  };

  if (buildOpts.align === 'top' || buildOpts.align === 'bottom') {
    struct.x1 = buildOpts.innerRect.x - buildOpts.outerRect.x;
    struct.x2 = struct.x1 + buildOpts.innerRect.width;
    struct.y1 = struct.y2 =
      buildOpts.align === 'top' ? buildOpts.innerRect.height - buildOpts.padding : buildOpts.padding;
  } else {
    struct.x1 = struct.x2 =
      buildOpts.align === 'left' ? buildOpts.innerRect.width - buildOpts.padding : buildOpts.padding;
    struct.y1 = buildOpts.innerRect.y - buildOpts.outerRect.y;
    struct.y2 = struct.y1 + buildOpts.innerRect.height;
  }

  appendStyle(struct, buildOpts);

  return struct;
}
