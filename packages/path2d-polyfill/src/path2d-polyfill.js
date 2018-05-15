import parsePath from './parse-path';

/**
 * Work around for https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8438884/
 * @ignore
 */
function supportsSvgPathArgument(window) {
  const canvas = window.document.createElement('canvas');
  const g = canvas.getContext('2d');
  const p = new window.Path2D('M0 0 L1 1');
  g.strokeStyle = 'red';
  g.lineWidth = 1;
  g.stroke(p);
  const imgData = g.getImageData(0, 0, 1, 1);
  return imgData.data[0] === 255; // Check if pixel is red
}

function rotatePoint(point, angle) {
  let nx = (point.x * Math.cos(angle)) - (point.y * Math.sin(angle));
  let ny = (point.y * Math.cos(angle)) + (point.x * Math.sin(angle));
  point.x = nx;
  point.y = ny;
}

function translatePoint(point, dx, dy) {
  point.x += dx;
  point.y += dy;
}

function polyFillPath2D(window) {
  if (!window) {
    return;
  }
  if (window.Path2D && supportsSvgPathArgument(window)) {
    return;
  }

  /**
   * Crates a Path2D polyfill object
   * @constructor
   * @ignore
   * @param {String} path
   */
  function Path2D(path) {
    this.segments = [];
    if (path) {
      this.segments = parsePath(path);
    }
  }

  Path2D.prototype.moveTo = function moveTo(x, y) {
    this.segments.push(['M', x, y]);
  };

  Path2D.prototype.lineTo = function lineTo(x, y) {
    this.segments.push(['L', x, y]);
  };

  Path2D.prototype.arc = function arc(x, y, r, start, end, ccw) {
    this.segments.push(['AC', x, y, r, start, end, !!ccw]);
  };

  Path2D.prototype.closePath = function closePath() {
    this.segments.push(['Z']);
  };

  Path2D.prototype.bezierCurveTo = function bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.segments.push(['C', cp1x, cp1y, cp2x, cp2y, x, y]);
  };

  Path2D.prototype.quadraticCurveTo = function bezierCurveTo(cpx, cpy, x, y) {
    this.segments.push(['Q', cpx, cpy, x, y]);
  };

  let _fill = window.CanvasRenderingContext2D.prototype.fill;
  let _stroke = window.CanvasRenderingContext2D.prototype.stroke;

  function buildPath(canvas, segments) {
    let endAngle;
    let startAngle;
    let largeArcFlag;
    let sweepFlag;
    let endPoint;
    let angle;
    let x;
    let y;
    let r;
    let b;
    let pathType;
    let centerPoint;
    let cpx;
    let cpy;
    let qcpx;
    let qcpy;
    let currentPoint = { x: 0, y: 0 };

    // Reset control point if command is not cubic
    if (pathType !== 'S' && pathType !== 's' && pathType !== 'C' && pathType !== 'c') {
      cpx = null;
      cpy = null;
    }

    if (pathType !== 'T' && pathType !== 't' && pathType !== 'Q' && pathType !== 'q') {
      qcpx = null;
      qcpy = null;
    }

    canvas.beginPath();
    for (let i = 0; i < segments.length; ++i) {
      let s = segments[i];
      pathType = s[0];
      switch (pathType) {
        case 'm':
        case 'M':
          if (pathType === 'm') {
            x += s[1];
            y += s[2];
          } else {
            x = s[1];
            y = s[2];
          }
          canvas.moveTo(x, y);
          break;
        case 'l':
        case 'L':
          if (pathType === 'l') {
            x += s[1];
            y += s[2];
          } else {
            x = s[1];
            y = s[2];
          }
          canvas.lineTo(x, y);
          break;
        case 'H':
          x = s[1];
          canvas.lineTo(x, y);
          break;
        case 'h':
          x += s[1];
          canvas.lineTo(x, y);
          break;
        case 'V':
          y = s[1];
          canvas.lineTo(x, y);
          break;
        case 'v':
          y += s[1];
          canvas.lineTo(x, y);
          break;
        case 'a':
        case 'A':
          if (pathType === 'a') {
            x += s[6];
            y += s[7];
          } else {
            x = s[6];
            y = s[7];
          }

          r = s[1];
          // s[2] = 2nd radius in ellipse, ignore
          // s[3] = rotation of ellipse, ignore
          largeArcFlag = s[4];
          sweepFlag = s[5];
          endPoint = { x, y };
          // translate all points so that currentPoint is origin
          translatePoint(endPoint, -currentPoint.x, -currentPoint.y);

          // angle to destination
          angle = Math.atan2(endPoint.y, endPoint.x);

          // rotate points so that angle is 0
          rotatePoint(endPoint, -angle);

          b = endPoint.x / 2;
          // var sweepAngle = Math.asin(b / r);

          centerPoint = { x: 0, y: 0 };
          centerPoint.x = endPoint.x / 2;
          if ((sweepFlag && !largeArcFlag) || (!sweepFlag && largeArcFlag)) {
            centerPoint.y = Math.sqrt((r * r) - (b * b));
          } else {
            centerPoint.y = -Math.sqrt((r * r) - (b * b));
          }
          startAngle = Math.atan2(-centerPoint.y, -centerPoint.x);
          endAngle = Math.atan2(endPoint.y - centerPoint.y, endPoint.x - centerPoint.x);

          // rotate back
          startAngle += angle;
          endAngle += angle;
          rotatePoint(endPoint, angle);
          rotatePoint(centerPoint, angle);

          // translate points
          translatePoint(endPoint, currentPoint.x, currentPoint.y);
          translatePoint(centerPoint, currentPoint.x, currentPoint.y);

          canvas.arc(centerPoint.x, centerPoint.y, r, startAngle, endAngle, !sweepFlag);
          break;
        case 'C':
          cpx = s[3]; // Last control point
          cpy = s[4];
          x = s[5];
          y = s[6];
          canvas.bezierCurveTo(s[1], s[2], cpx, cpy, x, y);
          break;
        case 'c':
          canvas.bezierCurveTo(
            s[1] + x,
            s[2] + y,
            s[3] + x,
            s[4] + y,
            s[5] + x,
            s[6] + y
          );
          cpx = s[3] + x; // Last control point
          cpy = s[4] + y;
          x += s[5];
          y += s[6];
          break;
        case 'S':
          if (cpx === null || cpx === null) {
            cpx = x;
            cpy = y;
          }

          canvas.bezierCurveTo(
            (2 * x) - cpx,
            (2 * y) - cpy,
            s[1],
            s[2],
            s[3],
            s[4]
          );
          cpx = s[1]; // last control point
          cpy = s[2];
          x = s[3];
          y = s[4];
          break;
        case 's':
          if (cpx === null || cpx === null) {
            cpx = x;
            cpy = y;
          }

          canvas.bezierCurveTo(
            (2 * x) - cpx,
            (2 * y) - cpy,
            s[1] + x,
            s[2] + y,
            s[3] + x,
            s[4] + y
          );
          cpx = s[1] + x; // last control point
          cpy = s[2] + y;
          x += s[3];
          y += s[4];
          break;
        case 'Q':
          qcpx = s[1]; // last control point
          qcpy = s[2];
          x = s[3];
          y = s[4];
          canvas.quadraticCurveTo(qcpx, qcpy, x, y);
          break;
        case 'q':
          qcpx = s[1] + x; // last control point
          qcpy = s[2] + y;
          x += s[3];
          y += s[4];
          canvas.quadraticCurveTo(qcpx, qcpy, x, y);
          break;
        case 'T':
          if (qcpx === null || qcpx === null) {
            qcpx = x;
            qcpy = y;
          }
          qcpx = (2 * x) - qcpx; // last control point
          qcpy = (2 * y) - qcpy;
          x = s[1];
          y = s[2];
          canvas.quadraticCurveTo(qcpx, qcpy, x, y);
          break;
        case 't':
          if (qcpx === null || qcpx === null) {
            qcpx = x;
            qcpy = y;
          }
          qcpx = (2 * x) - qcpx; // last control point
          qcpy = (2 * y) - qcpy;
          x += s[1];
          y += s[2];
          canvas.quadraticCurveTo(qcpx, qcpy, x, y);
          break;
        case 'z':
        case 'Z':
          canvas.closePath();
          break;
        default:
          // throw new Error(`${pathType} is not implemented`);
      }

      currentPoint.x = x;
      currentPoint.y = y;
    }
  }

  window.CanvasRenderingContext2D.prototype.fill = function fill(...args) {
    let fillRule = 'nonzero';
    if (args.length === 0 || (args.length === 1 && typeof args[0] === 'string')) {
      _fill.apply(this, args);
      return;
    }
    if (arguments.length === 2) {
      fillRule = args[1];
    }
    let path = args[0];
    buildPath(this, path.segments);
    _fill.call(this, fillRule);
  };

  window.CanvasRenderingContext2D.prototype.stroke = function stroke(path) {
    if (!path) {
      _stroke.call(this);
      return;
    }
    buildPath(this, path.segments);
    _stroke.call(this);
  };

  window.Path2D = Path2D;
}

export default polyFillPath2D;
