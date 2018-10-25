import pointsToPath from '../utils/points-to-path';
import { rotate } from '../math/vector';
import { toRadians } from '../math/angles';

const DIRECTION_TO_ANGLE = {
  up: 0,
  down: 180,
  left: 90,
  right: -90
};

/**
 * @extends symbol-config
 * @typedef {object} symbol--triangle
 * @property {string} [direction='up'] - Direction of the triangle ('up'|'down'|'left'|'right')
 */
function advancedTriangle(options) {
  const width = options.width;
  const height = options.height;
  const alignment = options.alignment || 0.5;
  const extend = options.extend || 0;
  const contract = options.contract || 0;
  const p = { x: options.x, y: options.y };
  const directionAngle = DIRECTION_TO_ANGLE[options.direction] || 0;
  const left = options.x;
  const top = options.y;
  let points = [
    { x: left, y: top + height },
    { x: left + (width * alignment), y: top + contract },
    { x: left + width, y: top + height + extend },
    { x: left, y: top + height + extend }
  ];

  const radians = toRadians(directionAngle);
  points = points.map(pp => rotate(pp, radians, p));

  return {
    type: 'path',
    fill: 'black',
    d: pointsToPath(points)
  };
}

export { advancedTriangle as default };
