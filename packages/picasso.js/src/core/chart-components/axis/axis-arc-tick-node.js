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

export default function buildArcTicks(ticks, buildOpts) {
  const rect = buildOpts.innerRect;
  const centerPoint = { cx: rect.width / 2, cy: rect.height / 2 }; // Center of the container
  const plotSize = Math.min(rect.height, rect.width) / 2;

  const innerRadius = plotSize * buildOpts.outerRadius;
  const outerRadius = innerRadius + 1;

  const startAngle = buildOpts.startAngle || 0; // Start angle of the arc
  const endAngle = buildOpts.endAngle || Math.PI / 2; // End angle of the arc

  const tickWidth = 1;
  const tickLength = 6;
  const struct = [];
  const angleRange = endAngle - startAngle;

  // Generate ticks
  ticks.forEach((tick, index) => {
    const normalizedPosition = index / (ticks.length - 1);
    let angle = startAngle + normalizedPosition * angleRange;

    angle -= Math.PI / 2;
    const innerPos = polarToCartesian(centerPoint.cx, centerPoint.cy, outerRadius + tickLength, angle);

    const outerPos = polarToCartesian(centerPoint.cx, centerPoint.cy, outerRadius, angle);

    // Add tick line to struct
    struct.push({
      type: 'line',
      stroke: buildOpts.tickColor || '#000',
      strokeWidth: tickWidth,
      padding: 5,
      x1: innerPos.x,
      y1: innerPos.y,
      x2: outerPos.x,
      y2: outerPos.y,
    });
  });

  // Apply styles from buildOpts (optional, e.g., stroke, stroke-width)
  appendStyle(struct, buildOpts);
  return struct;
}
