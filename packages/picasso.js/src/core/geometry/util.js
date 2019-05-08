import { isNumber } from '../utils/is-number';

export function getMinMax(points) {
  const num = points.length;
  let xMin = NaN;
  let xMax = NaN;
  let yMin = NaN;
  let yMax = NaN;

  for (let i = 0; i < num; i++) {
    xMin = isNaN(xMin) ? points[i].x : Math.min(xMin, points[i].x);
    xMax = isNaN(xMax) ? points[i].x : Math.max(xMax, points[i].x);
    yMin = isNaN(yMin) ? points[i].y : Math.min(yMin, points[i].y);
    yMax = isNaN(yMax) ? points[i].y : Math.max(yMax, points[i].y);
  }
  return [xMin, yMin, xMax, yMax];
}

/**
 * @ignore
 * @param {oject} line
 * @returns {point[]} Array of points
 */
export function lineToPoints(line) {
  const x1 = line.x1 || 0;
  const y1 = line.y1 || 0;
  const x2 = line.x2 || 0;
  const y2 = line.y2 || 0;
  return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
}

/**
 * @ignore
 * @param {oject} rect
 * @returns {point[]} Array of points
 */
export function rectToPoints(rect) {
  return [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height }
  ];
}

export function pointsToRect(points) {
  const [xMin, yMin, xMax, yMax] = getMinMax(points);

  return {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin
  };
}

export function pointsToCircle(points, r) {
  return {
    cx: points[0].x,
    cy: points[0].y,
    r
  };
}

export function pointsToLine(points) {
  return {
    x1: points[0].x,
    y1: points[0].y,
    x2: points[1].x,
    y2: points[1].y
  };
}

export function pointToArray(p) {
  return [p.x, p.y];
}

export function arrayToPoint(ary) {
  return { x: ary[0], y: ary[1] };
}

/**
 * @ignore
 * @param {oject}
 * @returns {string} Type of geometry
 */
export function getShapeType(shape) {
  const {
    x, y, // Point
    width, height, // Rect
    x1, x2, y1, y2, // Line
    cx, cy, r, // Circle
    vertices // Polygon
  } = shape || {};

  if (isNumber(cx) && isNumber(cy) && isNumber(r)) {
    return 'circle';
  }
  if (isNumber(x1) && isNumber(x2) && isNumber(y1) && isNumber(y2)) {
    return 'line';
  }
  if (isNumber(x) && isNumber(y) && isNumber(width) && isNumber(height)) {
    return 'rect';
  }
  if (isNumber(x) && isNumber(y)) {
    return 'point';
  }
  if (Array.isArray(vertices)) {
    return 'polygon';
  }
  return null;
}

export function expandRect(size, rect) {
  return {
    x: rect.x - size,
    y: rect.y - size,
    width: rect.width + size,
    height: rect.height + size
  };
}
