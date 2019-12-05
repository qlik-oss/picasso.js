import flatness from './curve-flattness';

function mid(p0, p1) {
  return {
    x: (p0.x + p1.x) * 0.5,
    y: (p0.y + p1.y) * 0.5
  };
}

function interpolate(t, s, cp1, cp2, e) {
  const td = 1 - t;
  const t0 = Math.pow(td, 3) * s;
  const t1 = 3 * Math.pow(td, 2) * t * cp1;
  const t2 = 3 * td * Math.pow(t, 2) * cp2;
  const t3 = Math.pow(t, 3) * e;

  return t0 + t1 + t2 + t3;
}

/**
 * Recursive subdivision of a curve using de Casteljau algorithm.
 * Splits the curve into multiple line segments where each segments is choosen based on a level of flatness.
 *
 * At most it will be able to generate 2**maxNbrOfSplits + 1 = 257 points
 * @ignore
 * @param {point} s - Start point
 * @param {point} cp1 - First control point
 * @param {point} cp2 - Second control point
 * @param {point} e - End point
 * @param {array} points - Initial set of points
 * @returns {point[]} Array of points
 */
function toPoints(s, cp1, cp2, e, points = [], maxNbrOfSplits = 8) {
  if (maxNbrOfSplits < 1 || flatness(s, cp1, cp2, e) <= 10) {
    if (points[points.length - 1] !== s) {
      points.push(s);
    }

    points.push(e);

    return points;
  }

  const t = 0.5;

  const m0 = mid(s, cp1);
  const m1 = mid(cp1, cp2);
  const m2 = mid(cp2, e);

  const b = { // Split curve at point
    x: interpolate(t, s.x, cp1.x, cp2.x, e.x),
    y: interpolate(t, s.y, cp1.y, cp2.y, e.y)
  };

  const q0 = mid(m0, m1); // New cp2 for left curve
  const q1 = mid(m1, m2); // New cp1 for right curve

  toPoints(s, m0, q0, b, points, maxNbrOfSplits - 1); // left curve
  toPoints(b, q1, m2, e, points, maxNbrOfSplits - 1); // Right curve

  return points;
}

export {
  toPoints as default,
  interpolate
};
