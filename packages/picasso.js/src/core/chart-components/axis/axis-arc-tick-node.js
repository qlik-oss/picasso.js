import extend from 'extend';

function appendStyle(struct, buildOpts) {
  extend(struct, buildOpts.style);
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
  const plotSize = Math.min(rect.height, rect.width) / 2;
  const innerRadius = plotSize * buildOpts.outerRadius;
  const outerRadius = innerRadius + 1;
  const startAngle = buildOpts.startAngle || 0;
  const endAngle = buildOpts.endAngle || Math.PI / 2;
  const tickWidth = 1;
  const tickLength = 6;
  const angleRange = endAngle - startAngle;

  let angle = endAngle - tick.position * angleRange;

  angle -= Math.PI / 2;
  const innerPos = polarToCartesian(centerPoint.cx, centerPoint.cy, outerRadius + tickLength, angle);
  const outerPos = polarToCartesian(centerPoint.cx, centerPoint.cy, outerRadius, angle);

  const struct = {
    type: 'line',
    stroke: buildOpts.tickColor || '#000',
    strokeWidth: tickWidth,
    padding: 5,
    x1: innerPos.x,
    y1: innerPos.y,
    x2: outerPos.x,
    y2: outerPos.y,
  };

  appendStyle(struct, buildOpts);
  return struct;
}
