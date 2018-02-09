export default function render(rect, { g, doFill, doStroke }) {
  g.beginPath();
  g.rect(rect.x, rect.y, rect.width, rect.height);
  if (doFill) {
    g.fill();
  }
  if (doStroke) {
    g.stroke();
  }
}
