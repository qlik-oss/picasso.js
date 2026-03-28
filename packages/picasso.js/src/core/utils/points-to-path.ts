export default function pointsToPath(points, close = true) {
  let d = '';

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (i === 0) {
      d += `M${p.x} ${p.y}`;
    } else {
      d += `L${p.x} ${p.y}`;
    }

    d += ' ';
  }

  if (close) {
    d += 'Z';
  }

  return d;
}
