import pointsToPath from '../utils/points-to-path';
import { toRadians } from '../math/angles';

/**
 * @extends Symbol
 * @typedef {object} SymbolStar
 * @property {number} [points=5] - Number of points on the star
 * @property {number} [startAngle=90] - Start drawing angle
 * @property {number} [innerRadius=size/2] - Size of the star core. My not exceed size of symbol.
 */
function star(options) {
  const size = options.size;
  const points = [];
  const outerRadius = size / 2;
  const drawPoints = options.points || 5;
  const innerRadius = Math.min(options.innerRadius || size / 2, size) / 2;
  const startAngle = isNaN(options.startAngle) ? 90 : options.startAngle;
  const angle = 360 / drawPoints;

  for (let i = 1; i <= drawPoints; i++) {
    const pAngle = angle * i + startAngle;
    const radians = toRadians(pAngle);
    const innerRadians = toRadians(pAngle + angle / 2);
    const y = Math.sin(radians);
    const x = Math.cos(radians);
    const iy = Math.sin(innerRadians);
    const ix = Math.cos(innerRadians);

    points.push({
      x: options.x + x * outerRadius,
      y: options.y + y * outerRadius,
    });

    points.push({
      x: options.x + ix * innerRadius,
      y: options.y + iy * innerRadius,
    });
  }

  return {
    type: 'path',
    fill: 'black',
    d: pointsToPath(points),
  };
}

export { star as default };
