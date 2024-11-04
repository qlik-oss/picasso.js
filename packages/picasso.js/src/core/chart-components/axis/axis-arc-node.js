import extend from 'extend';

function appendStyle(struct, buildOpts) {
  extend(struct, buildOpts.style);
}

export default function buildArcLine(buildOpts, ticks) {
  const rect = buildOpts.innerRect;
  const centerPoint = { cx: rect.width / 2, cy: rect.height / 2 };
  const plotSize = Math.min(rect.height, rect.width) / 2;

  const innerRadius = buildOpts.radius !== undefined ? plotSize * buildOpts.radius : plotSize * 0.5;
  const outerRadius = innerRadius + 1;

  const startAngle = buildOpts.startAngle !== undefined ? buildOpts.startAngle : -Math.PI / 2;
  const endAngle = buildOpts.endAngle !== undefined ? buildOpts.endAngle : Math.PI / 2;
  const arcValue = ticks && ticks.length > 0 ? ticks[ticks.length - 1].value : 0;
  const struct = {
    visible: true,
    type: 'path',
    arc: arcValue,
    arcDatum: { data: arcValue, value: arcValue, startAngle, endAngle },
    transform: `translate(0, 0) translate(${centerPoint.cx}, ${centerPoint.cy})`,
    desc: {
      share: 1,
      slice: {
        cornerRadius: 0,
        innerRadius,
        outerRadius,
      },
    },
    innerRadius,
    outerRadius,
    ticks: [],
  };
  appendStyle(struct, buildOpts);
  return struct;
}
