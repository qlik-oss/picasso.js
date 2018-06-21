import { add, sub, projectOnto, distance } from './vector';

const EPSILON = 1e-12;

function calculateMiddlePosHeight(childRect, parentRect) {
  return childRect.y < parentRect.height / 2 ? childRect.y - (childRect.height / 2) : childRect.y + (childRect.height / 2);
}

function calculateHeight(childRect, parentRect, orientation) {
  if (orientation === 'top') {
    return childRect.y + childRect.height;
  } else if (orientation === 'bottom') {
    return childRect.y;
  }

  // Try to fit assuming orientation at middle
  return calculateMiddlePosHeight(childRect, parentRect);
}

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
 * Check if the child rect is located entirely within it's parent rect. If no settings object is provided,
 * it tries to check if the child rect fits assuming ltr mode and orientation at middle of the child rect.
 * Returns true if child rect fits inside the parent rect, otherwise false.
 * @param {rect} childRect - A rect describing the position(x,y), width and height of label
 * @param {rect} parentRect - A rect describing the position(x,y), width and height of parent rect
 * @param {object} settings - An object containing alignment(rtl or ltr) of childRect and orientation (optional)
 * @ignore
 */
export function rectContainsRect(childRect, parentRect, settings) {
  if (!childRect || !parentRect) {
    throw new Error('A rect or both rects are missing');
  }

  const isInvalid = (cRect, pRect) => (typeof cRect.x !== 'number' || isNaN(cRect.x)) || (typeof cRect.y !== 'number' || isNaN(cRect.y))
     || (typeof pRect.x !== 'number' || isNaN(pRect.x)) || (typeof pRect.y !== 'number' || isNaN(pRect.y))
     || pRect.width <= 0 || pRect.height <= 0;


  if (isInvalid(childRect, parentRect)) {
    throw new Error('One or more entries are either not a number or the parent rect has wrongly specified width and height');
  }

  if (childRect.width < parentRect.width && childRect.height < parentRect.height) {
    const orientation = settings && settings.orientation ? settings.orientation : undefined;

    const relativeChildWidth = settings && settings.rtl ? childRect.x : childRect.x + childRect.width;
    const relativeChildHeight = calculateHeight(childRect, parentRect, orientation);

    const relativeParentWidth = parentRect.x + parentRect.width;
    const relativeParentHeight = parentRect.y + parentRect.height;

    return relativeChildWidth > 0 && relativeChildHeight > 0 && relativeChildWidth < relativeParentWidth && relativeChildHeight < relativeParentHeight;
  }
  return false;
}
