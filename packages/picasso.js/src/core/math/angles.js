/**
 * Get x1, y1, x2, y2 point from angle
 * Source: {@link https://codepen.io/NV/pen/jcnmK}
 * @private
 *
 * @param  {number} angle Radians
 * @return {object}       Point with x1, y2, x2, y2.
 */
export function angleToPoints(angle) {
  let segment = Math.floor((angle / Math.PI) * 2) + 2;
  let diagonal = ((0.5 * segment) + 0.25) * Math.PI;
  let op = Math.cos(Math.abs(diagonal - angle)) * Math.sqrt(2);
  let x = op * Math.cos(angle);
  let y = op * Math.sin(angle);

  return {
    x1: x < 0 ? 1 : 0,
    y1: y < 0 ? 1 : 0,
    x2: x >= 0 ? x : x + 1,
    y2: y >= 0 ? y : y + 1
  };
}

/**
 * Turns degrees into radians
 * @private
 *
 * @param  {number} degrees Degrees
 * @return {number}         Radians
 */
export function toRadians(d) {
  return ((-d) / 180) * Math.PI;
}

/**
 * Turns radians into degrees
 * @private
 *
 * @param  {number} degrees Degrees
 * @return {number}         Radians
 */
export function toDegrees(r) {
  return r * (180 / Math.PI);
}

/**
 * Get x1, y1, x2, y2 point from degree
 * @private
 *
 * @param  {number} d Degree
 * @return {object}   Point with x1, y2, x2, y2.
 */
export function degreesToPoints(d) {
  return angleToPoints(toRadians(d));
}
