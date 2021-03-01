import { rotate } from '../math/vector';
import { pointsToRect } from '../geometry/util';
import { toRadians } from '../math/angles';

/**
 * @extends Symbol
 * @typedef {object} SymbolBar
 * @property {string} [direction='horizontal'] - Direction of bar ('horizontal'|'vertical').
 */
function bar(options) {
  const p = { x: options.x, y: options.y };
  const isVertical = options.direction === 'vertical';
  const r = options.size / 2;
  const width = r / 2;
  const halfWidth = width / 2;

  let points = [
    { x: p.x - r, y: p.y + halfWidth },
    { x: p.x - r, y: p.y - halfWidth },
    { x: p.x + r, y: p.y - halfWidth },
    { x: p.x + r, y: p.y + halfWidth },
  ];

  if (isVertical) {
    const radians = toRadians(90);
    points = points.map((pp) => rotate(pp, radians, p));
  }

  const rect = pointsToRect(points);
  rect.type = 'rect';
  rect.fill = 'black';

  return rect;
}

export { bar as default };
