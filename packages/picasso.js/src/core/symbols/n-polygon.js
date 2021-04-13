import pointsToPath from '../utils/points-to-path';
import { toRadians } from '../math/angles';

/**
 * @private
 * @extends Symbol
 * @typedef {object} SymbolPolygon
 * @property {object} [sides=6] - Number of sides on the regular polygon
 * @property {object} [startAngle=0] - Start drawing angle
 */
function nPolygon(options) {
  const points = [];
  const radius = options.size / 2;
  const drawPoints = Math.max(isNaN(options.sides) ? 6 : options.sides, 3);
  const angle = 360 / drawPoints;
  const startAngle = isNaN(options.startAngle) ? 0 : options.startAngle;

  for (let i = 1; i <= drawPoints; i++) {
    const radians = toRadians(angle * i + startAngle);
    const y = Math.sin(radians);
    const x = Math.cos(radians);
    points.push({
      x: options.x + x * radius,
      y: options.y + y * radius,
    });
  }

  return {
    type: 'path',
    fill: 'black',
    d: pointsToPath(points),
  };
}

export { nPolygon as default };
