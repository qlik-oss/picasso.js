import extend from 'extend';

function appendStyle(struct, buildOpts) {
  extend(struct, buildOpts.style);
}

export default function buildArcLine(buildOpts) {
  const rect = buildOpts.innerRect;
  const centerPoint = { cx: rect.width / 2, cy: rect.height / 2 };
  const halfPlotSize = Math.min(rect.height, rect.width) / 2;
  const innerRadius = halfPlotSize * buildOpts.radius;
  const outerRadius = innerRadius + buildOpts.style.strokeWidth;
  const startAngle = buildOpts.startAngle;
  const endAngle = buildOpts.endAngle;

  const struct = {
    visible: true,
    type: 'path',
    arcDatum: { startAngle, endAngle },
    transform: `translate(0, 0) translate(${centerPoint.cx}, ${centerPoint.cy})`,
    desc: {
      share: 1,
      slice: {
        cornerRadius: 0,
        innerRadius,
        outerRadius,
      },
    },
    ticks: [],
  };
  appendStyle(struct, buildOpts);
  return struct;
}
