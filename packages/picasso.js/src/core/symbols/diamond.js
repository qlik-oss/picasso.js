import pointsToPath from '../utils/points-to-path';

/**
 * @extends symbol-config
 * @typedef {object} symbol--diamond
 */
function diamond(options) {
  const size = options.size;
  const left = options.x - (size / 2);
  const top = options.y - (size / 2);
  const points = [
    { x: left, y: top + (size / 2) },
    { x: left + (size / 2), y: top },
    { x: left + size, y: top + (size / 2) },
    { x: left + (size / 2), y: top + size },
    { x: left, y: top + (size / 2) }
  ];

  return {
    type: 'path',
    fill: 'black',
    d: pointsToPath(points)
  };
}

export { diamond as default };
