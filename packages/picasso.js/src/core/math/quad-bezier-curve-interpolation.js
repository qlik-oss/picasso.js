import cubicToPoints from './cubic-bezier-curve-interpolation';

export function interpolate(t, s, cp, e) {
  const td = 1 - t;

  return td ** 2 * s + 2 * td * t * cp + t ** 2 * e;
}

function toCubic(s, cp, e) {
  const cp1x = s.x + (2 / 3) * (cp.x - s.x);
  const cp1y = s.y + (2 / 3) * (cp.y - s.y);
  const cp2x = e.x + (2 / 3) * (cp.x - e.x);
  const cp2y = e.y + (2 / 3) * (cp.y - e.y);
  const cp1 = { x: cp1x, y: cp1y };
  const cp2 = { x: cp2x, y: cp2y };

  return { cp1, cp2 };
}

/**
 * Recursive subdivision of a curve using de Casteljau algorithm.
 * Splits the curve into multiple line segments where each segments is choosen based on a level of flatness.
 * @ignore
 * @param {Point} s - Start point
 * @param {Point} cp - Control point
 * @param {Point} e - End point
 * @returns {Point[]} Array of points
 */
export default function toPoints(s, cp, e) {
  const { cp1, cp2 } = toCubic(s, cp, e);

  return cubicToPoints(s, cp1, cp2, e);
}
