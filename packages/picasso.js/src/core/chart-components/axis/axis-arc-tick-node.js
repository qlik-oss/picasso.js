import extend from 'extend';

function appendStyle(struct, buildOpts) {
  const styleClone = { ...buildOpts.style }; // Shallow clone
  extend(struct, styleClone);
}

function polarToCartesian(centerX, centerY, radius, angle) {
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

export default function buildArcTicks(tick, buildOpts) {
  const rect = buildOpts.innerRect;
  const centerPoint = { cx: rect.width / 2, cy: rect.height / 2 };
  const halfPlotSize = Math.min(rect.height, rect.width) / 2;
  const innerRadius = halfPlotSize * buildOpts.radius;
  const outerRadius = innerRadius + buildOpts.padding;
  const startAngle = buildOpts.startAngle;
  const endAngle = buildOpts.endAngle;
  const tickLength = buildOpts.tickSize;
  const angleRange = endAngle - startAngle;

  let angle = endAngle - tick.position * angleRange;

  angle -= Math.PI / 2;
  const innerPos = polarToCartesian(centerPoint.cx, centerPoint.cy, outerRadius + tickLength, angle);
  const outerPos = polarToCartesian(centerPoint.cx, centerPoint.cy, outerRadius, angle);

  const struct = {
    type: 'line',
    x1: innerPos.x,
    y1: innerPos.y,
    x2: outerPos.x,
    y2: outerPos.y,
    value: tick.value,
  };
  appendStyle(struct, buildOpts);
  return struct;
}
