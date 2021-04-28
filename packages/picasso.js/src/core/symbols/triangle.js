import pointsToPath from '../utils/points-to-path';
import { rotate } from '../math/vector';
import { toRadians } from '../math/angles';

const DIRECTION_TO_ANGLE = {
  up: 0,
  down: 180,
  left: 90,
  right: -90,
};

/**
 * @private
 * @extends Symbol
 * @typedef {object} SymbolTriangle
 * @property {string} [direction='up'] - Direction of the triangle ('up'|'down'|'left'|'right')
 */
function triangle(options) {
  const size = options.size;
  const p = { x: options.x, y: options.y };
  const directionAngle = DIRECTION_TO_ANGLE[options.direction] || 0;
  const halfSize = size / 2;
  const left = options.x - halfSize;
  const top = options.y - halfSize;
  let points = [
    { x: left, y: top + size },
    { x: left + halfSize, y: top },
    { x: left + size, y: top + size },
    { x: left, y: top + size },
  ];

  const radians = toRadians(directionAngle);
  points = points.map((pp) => rotate(pp, radians, p));

  return {
    type: 'path',
    fill: 'black',
    d: pointsToPath(points),
  };
}

export { triangle as default };
