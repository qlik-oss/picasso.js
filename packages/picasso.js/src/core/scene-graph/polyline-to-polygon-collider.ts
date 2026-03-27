const PI_2 = Math.PI / 2;

function lineAngle(p0, p1) {
  const t = Math.atan2(p1.y - p0.y, p1.x - p0.x);
  return t < 0 ? t + Math.PI * 2 : t;
}

// TODO Find a more accurate method to find the open and closed points
function rotatePoint(p, angle, radius) {
  return {
    x: p.x + Math.cos(angle) * radius,
    y: p.y + Math.sin(angle) * radius,
  };
}

export default function polylineToPolygonCollider(points, radius, opts = {}) {
  const open = [];
  const close = [];

  // TODO handle case if points.length === 2

  if (opts.forceOrientation === 'h') {
    const start = points[0].x < points[1].x ? -1 : 1;
    const end = points[points.length - 1].x > points[points.length - 2].x ? 1 : -1;

    points.unshift({ x: points[0].x + start, y: points[0].y });
    points.push({ x: points[points.length - 1].x + end, y: points[points.length - 1].y });
  } else if (opts.forceOrientation === 'v') {
    const start = points[0].y < points[1].y ? -1 : 1;
    const end = points[points.length - 1].y > points[points.length - 2].y ? 1 : -1;

    points.unshift({ x: points[0].x, y: points[0].y + start });
    points.push({ x: points[points.length - 1].x, y: points[points.length - 1].y + end });
  }

  const len = points.length - 1;
  for (let i = 1; i < len; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const currToPrev = lineAngle(curr, prev);
    const currToNext = lineAngle(curr, next);
    const openAngle = (currToPrev + currToNext) / 2;
    const closeAngle = openAngle + Math.PI;
    const maxAngle = Math.max(openAngle, closeAngle);
    const minAngle = Math.min(openAngle, closeAngle);
    const openClose = currToPrev > currToNext;

    if (i === 1) {
      const prevToCurr = lineAngle(prev, curr);
      open.push(rotatePoint(prev, prevToCurr - PI_2, radius));
      close.unshift(rotatePoint(prev, prevToCurr + PI_2, radius));
    }

    const opened = openClose ? maxAngle : minAngle;
    const closed = openClose ? minAngle : maxAngle;

    open.push(rotatePoint(curr, opened, radius));
    close.unshift(rotatePoint(curr, closed, radius));

    if (i === len - 1) {
      const nextToCurr = lineAngle(next, curr);
      open.push(rotatePoint(next, nextToCurr + PI_2, radius));
      close.unshift(rotatePoint(next, nextToCurr - PI_2, radius));
    }
  }

  return {
    type: 'polygon',
    vertices: [...open, ...close],
  };
}
