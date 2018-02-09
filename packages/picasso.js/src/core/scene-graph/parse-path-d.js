import { parsePath } from 'path2d-polyfill';
import arcToCenter, { PI_X2 } from '../math/arc-to-center';
import cubicCurveToPoints from '../math/cubic-bezier-curve-interpolation';
import quadCurveToPoints from '../math/quad-bezier-curve-interpolation';

/**
 * Transform an arc to a set of points a long the arc.
 * Specifiction F.6 (https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes)
 * @ignore
 * @param {array} s - Segments
 * @param {number} startX - X-coordinate for start of arc
 * @param {number} startY - Y-coordinate for start of arc
 */
function arcToPoints(s, startX, startY) {
  const points = [];
  const largeArcFlag = !!s[4]; // F.6.3
  const sweepFlag = !!s[5]; // F.6.3
  const rotation = s[3];
  let endX = s[6];
  let endY = s[7];
  let rx = s[1];
  let ry = s[2];
  let cx;
  let cy;
  let sweepAngle;
  let startAngle;

  if (s[0] === 'a') {
    endX += startX;
    endY += startY;
  }

  // F.6.2
  if (startX === endY && startY === endY) {
    return points;
  }

  // Given no radius, threat as lineTo command
  if (!rx || !ry) {
    points.push({ x: endX, y: endY });
    return points;
  }

  ({ cx, cy, rx, ry, sweepAngle, startAngle } = arcToCenter(rx, ry, rotation, largeArcFlag, sweepFlag, endX, endY, startX, startY));

  // Approximation of perimeter
  const p = Math.abs(sweepAngle * Math.sqrt((Math.pow(rx, 2) + Math.pow(ry, 2)) / 2));

  // Generate a point every 10th pixel. Scaling of the node should probably be included in this calculation
  const res = Math.ceil(p / 10);
  const resAngle = sweepAngle / res;

  for (let k = 1; k <= res; k++) {
    const deltaAngle = resAngle * k;
    const radians = (startAngle + deltaAngle) % PI_X2;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    // F.6.3 https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
    points.push({
      x: cx + (cos * rx) + (-sin * cos),
      y: cy + (sin * ry) + (cos * sin)
    });
  }

  // points.push({ x: cx, y: cy });

  return points;
}

/**
 * Converts a SVG path data string into a set of points.
 * @ignore
 * @param {string} path
 * @returns {Array<point[]>} Array of points
 */
function pathToPoints(path) {
  const commands = parsePath(path);
  const segments = [];
  const points = [];
  let x = 0; // Current point
  let y = 0;
  let cpx = null; // Last control point on a cubic curve
  let cpy = null;
  let qcpx = null; // Last control point on a quad curve
  let qcpy = null;

  for (let i = 0; i < commands.length; ++i) {
    const cmd = commands[i];
    const pathType = cmd[0];

    // Reset control point if command is not cubic
    if (pathType !== 'S' && pathType !== 's' && pathType !== 'C' && pathType !== 'c') {
      cpx = null;
      cpy = null;
    }

    if (pathType !== 'T' && pathType !== 't' && pathType !== 'Q' && pathType !== 'q') {
      qcpx = null;
      qcpy = null;
    }

    switch (pathType) {
      case 'm':
        if (points.length) {
          segments.push(points.splice(0));
        }
        // Fall through
      case 'l': // eslint-disable-line no-fallthrough
        x += cmd[1];
        y += cmd[2];
        points.push({ x, y });
        break;
      case 'M':
        if (points.length) {
          segments.push(points.splice(0));
        }
        // Fall through
      case 'L': // eslint-disable-line no-fallthrough
        x = cmd[1];
        y = cmd[2];
        points.push({ x, y });
        break;
      case 'H':
        x = cmd[1];
        points.push({ x, y });
        break;
      case 'h':
        x += cmd[1];
        points.push({ x, y });
        break;
      case 'V':
        y = cmd[1];
        points.push({ x, y });
        break;
      case 'v':
        y += cmd[1];
        points.push({ x, y });
        break;
      case 'a':
        points.push(...arcToPoints(cmd, x, y));
        x += cmd[6];
        y += cmd[7];
        break;
      case 'A':
        points.push(...arcToPoints(cmd, x, y));
        x = cmd[6];
        y = cmd[7];
        break;
      case 'c':
        points.push(...cubicCurveToPoints(
          { x, y },
          { x: cmd[1] + x, y: cmd[2] + y },
          { x: cmd[3] + x, y: cmd[4] + y },
          { x: cmd[5] + x, y: cmd[6] + y }
        ));
        cpx = cmd[3] + x; // Last control point
        cpy = cmd[4] + y;
        x += cmd[5];
        y += cmd[6];
        break;
      case 'C':
        points.push(...cubicCurveToPoints(
          { x, y },
          { x: cmd[1], y: cmd[2] },
          { x: cmd[3], y: cmd[4] },
          { x: cmd[5], y: cmd[6] }
        ));
        cpx = cmd[3]; // Last control point
        cpy = cmd[4];
        x = cmd[5];
        y = cmd[6];
        break;
      case 's':
        if (cpx === null || cpx === null) {
          cpx = x;
          cpy = y;
        }

        points.push(...cubicCurveToPoints(
          { x, y },
          { x: (2 * x) - cpx, y: (2 * y) - cpy },
          { x: cmd[1] + x, y: cmd[2] + y },
          { x: cmd[3] + x, y: cmd[4] + y }
        ));
        cpx = cmd[1] + x; // last control point
        cpy = cmd[2] + y;
        x += cmd[3];
        y += cmd[4];
        break;
      case 'S':
        if (cpx === null || cpx === null) {
          cpx = x;
          cpy = y;
        }

        points.push(...cubicCurveToPoints(
          { x, y },
          { x: (2 * x) - cpx, y: (2 * y) - cpy },
          { x: cmd[1], y: cmd[2] },
          { x: cmd[3], y: cmd[4] }
        ));
        cpx = cmd[1]; // last control point
        cpy = cmd[2];
        x = cmd[3];
        y = cmd[4];
        break;
      case 'Q':
        points.push(...quadCurveToPoints(
          { x, y },
          { x: cmd[1], y: cmd[2] },
          { x: cmd[3], y: cmd[4] }
        ));

        qcpx = cmd[1]; // last control point
        qcpy = cmd[2];
        x = cmd[3];
        y = cmd[4];
        break;
      case 'q':
        points.push(...quadCurveToPoints(
          { x, y },
          { x: cmd[1] + x, y: cmd[2] + y },
          { x: cmd[3] + x, y: cmd[4] + y }
        ));

        qcpx = cmd[1] + x; // last control point
        qcpy = cmd[2] + y;
        x += cmd[3];
        y += cmd[4];
        break;
      case 'T':
        if (qcpx === null || qcpx === null) {
          qcpx = x;
          qcpy = y;
        }

        qcpx = (2 * x) - qcpx; // last control point
        qcpy = (2 * y) - qcpy;
        points.push(...quadCurveToPoints(
          { x, y },
          { x: qcpx, y: qcpy },
          { x: cmd[1], y: cmd[2] }
        ));

        x = cmd[1];
        y = cmd[2];
        break;
      case 't':
        if (qcpx === null || qcpx === null) {
          qcpx = x;
          qcpy = y;
        }

        qcpx = (2 * x) - qcpx; // last control point
        qcpy = (2 * y) - qcpy;
        points.push(...quadCurveToPoints(
          { x, y },
          { x: qcpx, y: qcpy },
          { x: cmd[1] + x, y: cmd[2] + y }
        ));
        x += cmd[1];
        y += cmd[2];
        break;
      case 'z':
      case 'Z':
        points.push({ x: points[0].x, y: points[0].y });
        break;
      default:
        // Do nothing
    }
  }

  segments.push(points.splice(0));

  return segments;
}

export {
  pathToPoints as default
};
