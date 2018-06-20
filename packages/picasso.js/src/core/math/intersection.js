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

/**
 * Check if the pie slice label is located entirely within it's parent rect
 * @param {rect} childRect - A rect describing the position(x,y), width and height of label
 * @param {rect} parentRect - A rect describing the position(x,y), width and height of parent rect
 * @ignore
 */
export function rectContainsRect(childRect, parentRect) {
  if (!childRect || !parentRect) {
    throw new Error('A rect or both rects are missing');
  }

  if (!childRect.x || !childRect.y || !parentRect.width || !parentRect.height) {
    throw new Error('Position on child rect is missing or parent rect have a missing width or height');
  }

  const totalLabelWidth = childRect.x + childRect.width;
  const totalLabelHeight = childRect.y < parentRect.height / 2 ? childRect.y - childRect.height : childRect.y + childRect.height;

  return totalLabelWidth > 0 && totalLabelHeight > 0 &&
   totalLabelWidth < parentRect.width && totalLabelHeight < parentRect.height;
}
