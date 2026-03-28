export default function render(path, { g, doStroke, doFill }) {
  const p = new Path2D(path.d);
  if (doFill) {
    g.fill(p);
  }
  if (doStroke) {
    g.stroke(p);
  }
}
