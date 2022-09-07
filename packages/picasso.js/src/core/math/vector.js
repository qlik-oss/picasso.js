export function add(v1, v2) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
}

export function sub(v1, v2) {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
  };
}

export function scalarMultiply(v, s) {
  return {
    x: v.x * s,
    y: v.y * s,
  };
}

export function sqrMagnitude(v) {
  return v.x ** 2 + v.y ** 2;
}

export function magnitude(v) {
  return Math.sqrt(sqrMagnitude(v));
}

export function distanceX(v1, v2) {
  return v1.x - v2.x;
}

export function distanceY(v1, v2) {
  return v1.y - v2.y;
}

export function sqrDistance(v1, v2) {
  return distanceX(v1, v2) ** 2 + distanceY(v1, v2) ** 2;
}

export function distance(v1, v2) {
  return Math.sqrt(sqrDistance(v1, v2));
}

export function determinant(v1, v2) {
  return v1.x * v2.y - v2.x * v1.y;
}

export function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

export function projectOnto(v1, v2) {
  const m = dot(v1, v2) / dot(v2, v2) || 1;
  return {
    x: v2.x * m,
    y: v2.y * m,
  };
}

export function rotate(v, radians, origin = { x: 0, y: 0 }) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const t1 = sub(v, origin);

  const t2 = {
    x: cos * t1.x - sin * t1.y,
    y: sin * t1.x + cos * t1.y,
  };

  return add(t2, origin);
}

export function unit(v) {
  const m = magnitude(v);
  return { x: v.x / m, y: v.y / m };
}

export function cross(u, v, a) {
  return (v.x - u.x) * (a.y - u.y) - (v.y - u.y) * (v.x - u.x);
}
