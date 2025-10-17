import { picassojs } from '.';
import { isNumber } from '../utils/is-number';

export function getMinMax(points: picassojs.Point[]): [number, number, number, number] {
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
 * @returns {Point[]} Array of points
 */
export function lineToPoints(line: picassojs.Line): picassojs.Point[] {
  const x1 = line.x1 || 0;
  const y1 = line.y1 || 0;
  const x2 = line.x2 || 0;
  const y2 = line.y2 || 0;
  return [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
  ];
}

/**
 * @ignore
 * @param {oject} rect
 * @returns {Point[]} Array of points
 */
export function rectToPoints(rect: picassojs.Rect): picassojs.Point[] {
  return [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];
}

export function pointsToRect(points: picassojs.Point[]): picassojs.Rect {
  const [xMin, yMin, xMax, yMax] = getMinMax(points);

  return {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
  };
}

export function pointsToCircle(points: picassojs.Point[], r: number): picassojs.Circle {
  return {
    cx: points[0].x,
    cy: points[0].y,
    r,
  };
}

export function pointsToLine(points: picassojs.Point[]): picassojs.Line {
  return {
    x1: points[0].x,
    y1: points[0].y,
    x2: points[1].x,
    y2: points[1].y,
  };
}

export function pointToArray(p: picassojs.Point): number[] {
  return [p.x, p.y];
}

export function arrayToPoint(ary: number[]): picassojs.Point {
  return { x: ary[0], y: ary[1] };
}

/**
 * @ignore
 * @param {oject}
 * @returns {string} Type of geometry
 */
export function getShapeType(shape: picassojs.Shape): string | null {
  if ('cx' in shape && isNumber(shape.cx) && isNumber(shape.cy) && isNumber(shape.r)) {
    return 'circle';
  }
  if ('x1' in shape && isNumber(shape.x1) && isNumber(shape.x2) && isNumber(shape.y1) && isNumber(shape.y2)) {
    return 'line';
  }
  if ('height' in shape && isNumber(shape.x) && isNumber(shape.y) && isNumber(shape.width) && isNumber(shape.height)) {
    return 'rect';
  }
  if ('x' in shape && 'y' in shape && isNumber(shape.x) && isNumber(shape.y)) {
    return 'point';
  }
  if ('vertices' in shape && Array.isArray(shape.vertices)) {
    return shape.vertices.every((item) => Array.isArray(item)) ? 'geopolygon' : 'polygon';
  }
  return null;
}

export function expandRect(size: number, rect: picassojs.Rect): picassojs.Rect {
  return {
    x: rect.x - size,
    y: rect.y - size,
    width: rect.width + size,
    height: rect.height + size,
  };
}
