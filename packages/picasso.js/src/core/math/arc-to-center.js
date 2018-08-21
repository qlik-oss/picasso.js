import { toRadians } from './angles';

const PI_X2 = Math.PI * 2;

/**
 * Implementation of F.6.5 https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
 * @ignore
 * @param {number} rx - Arc x-radius
 * @param {number} ry - Arc y-radius
 * @param {number} rotation - Arc rotation in degrees (0-360)
 * @param {boolean} largeArcFlag
 * @param {boolean} sweepFlag
 * @param {number} endX - X-coordinate for end of arc
 * @param {number} endY - Y-coordinate for end of arc
 * @param {number} startX - X-coordinate for start of arc
 * @param {number} startY - Y-coordinate for start of arc
 * @returns {object}
 */
function arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY) {
  let startAngle;
  let endAngle;
  let sweepAngle;
  let cx;
  let cy;
  let radiusRatio;

  const rad = toRadians(rotation % 360);

  // F.6.5.1
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hdx = (startX - endX) / 2;
  const hdy = (startY - endY) / 2;

  const x1d = (cos * hdx) + (sin * hdy);
  const y1d = (cos * hdy) - (sin * hdx);

  // F.6.6
  rx = Math.abs(rx);
  ry = Math.abs(ry);

  radiusRatio = (Math.pow(x1d, 2) / Math.pow(rx, 2)) + (Math.pow(y1d, 2) / Math.pow(ry, 2));
  if (radiusRatio > 1) {
    radiusRatio = Math.sqrt(radiusRatio);
    rx *= radiusRatio;
    ry *= radiusRatio;
  }

  // F.6.5.2
  const rxry = rx * ry;
  const rxy1d = rx * y1d;
  const ryx1d = ry * x1d;
  const den = Math.pow(rxy1d, 2) + Math.pow(ryx1d, 2);
  const num = Math.pow(rxry, 2) - den;

  let frac = Math.sqrt(Math.max(num / den, 0));

  if (largeArcFlag === sweepFlag) {
    frac = -frac;
  }

  const cxd = frac * (rxy1d / ry);
  const cyd = frac * -(ryx1d / rx);

  // F.6.5.3
  const mx = (startX + endX) / 2;
  const my = (startY + endY) / 2;
  cx = ((cos * cxd) - (sin * cyd)) + mx;
  cy = (sin * cxd) + (cos * cyd) + my;

  // F.6.5.6 clockwise angle
  const ux = (x1d - cxd) / rx;
  const uy = (y1d - cyd) / ry;
  const vx = (-x1d - cxd) / rx;
  const vy = (-y1d - cyd) / ry;
  startAngle = Math.atan2(uy, ux);
  startAngle += startAngle < 0 ? PI_X2 : 0;
  endAngle = Math.atan2(vy, vx);
  endAngle += endAngle < 0 ? PI_X2 : 0;

  sweepAngle = endAngle - startAngle;

  if (!sweepFlag && startAngle < endAngle) {
    sweepAngle -= PI_X2;
  } else if (sweepFlag && endAngle < startAngle) {
    sweepAngle += PI_X2;
  }

  sweepAngle %= PI_X2;

  return {
    startAngle,
    sweepAngle,
    cx,
    cy,
    rx,
    ry
  };
}

export {
  arcToCenter as default,
  PI_X2
};
