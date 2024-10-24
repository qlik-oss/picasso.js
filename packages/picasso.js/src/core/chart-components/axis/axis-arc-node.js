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

export default function buildArcLine(buildOpts) {
  const rect = buildOpts.innerRect;
  const centerPoint = { cx: rect.width / 2, cy: rect.height / 2 }; // Center of the container
  const plotSize = Math.min(rect.height, rect.width) / 2;

  const innerRadius = plotSize * buildOpts.outerRadius;
  const outerRadius = innerRadius + 1;

  const startAngle = buildOpts.startAngle || 0; // Start angle of the arc
  const endAngle = buildOpts.endAngle || Math.PI / 2; // End angle of the arc

  const numTicks = buildOpts.numTicks || 5;
  const tickLength = 10;
  const tickWidth = 2;

  const struct = {
    visible: true,
    type: 'path',
    arc: 412.29,
    arcDatum: { data: 412.29, value: 412.29, startAngle, endAngle }, // Arc data
    transform: `translate(0, 0) translate(${centerPoint.cx}, ${centerPoint.cy})`,
    desc: {
      share: 1,
      slice: {
        cornerRadius: 0,
        end: 6.283185307179586,
        innerRadius,
        offset: { x: 308, y: 207.5 },
        outerRadius,
      },
    },
    innerRadius: 0.85,
    outerRadius: 0.86,
    ticks: [],
  };
  const angleRange = endAngle - startAngle;
  const angleStep = angleRange / numTicks;

  // Generate ticks
  for (let i = 0; i <= numTicks; i++) {
    const angle = startAngle + i * angleStep;

    // Calculate outer position for tick (on outer arc radius)
    const outerPos = polarToCartesian(centerPoint.cx, centerPoint.cy, outerRadius, angle);

    // Calculate inner position for tick (closer to the arc center)
    const innerPos = polarToCartesian(centerPoint.cx, centerPoint.cy, outerRadius - tickLength, angle);

    // Add tick line to struct
    struct.ticks.push({
      type: 'line',
      stroke: buildOpts.tickColor || '#000', // Default tick color or use from buildOpts
      strokeWidth: tickWidth,
      shape: {
        x1: innerPos.x,
        y1: innerPos.y,
        x2: outerPos.x,
        y2: outerPos.y,
      },
    });
  }

  // Apply styles from buildOpts (optional, e.g., stroke, stroke-width)
  appendStyle(struct, buildOpts);

  console.log('arc line', struct, buildOpts);
  return struct; // Return the struct object containing the path definition
}
