import { add, sub, projectOnto, distance } from './vector';

const EPSILON = 1e-12;

export function closestPointToLine(start, end, p) {
  const startToPoint = sub(p, start);
  const startToEnd = sub(end, start);
  const pointOnLine = add(projectOnto(startToPoint, startToEnd), start);
  return pointOnLine;
}

export function isPointOnLine(start, end, p) {
  return (distance(start, p) + distance(end, p)) - distance(start, end) < EPSILON;
}

export function isCollinear(p1, p2, p3, e = EPSILON) {
  const t = Math.abs((p1.x * (p2.y - p3.y)) + (p2.x * (p3.y - p1.y)) + (p3.x * (p1.y - p2.y)));
  return t < e;
}
