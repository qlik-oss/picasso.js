export default function render(circle, { g, doFill, doStroke }) {
  g.beginPath();
  g.moveTo(circle.cx + circle.r, circle.cy);
  g.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2, false);
  if (doFill) {
    g.fill();
  }
  if (doStroke) {
    g.stroke();
  }
}
