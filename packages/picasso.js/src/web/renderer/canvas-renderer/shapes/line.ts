export default function render(line, { g, doStroke }) {
  g.beginPath();
  g.moveTo(line.x1, line.y1);
  g.lineTo(line.x2, line.y2);
  if (doStroke) {
    g.stroke();
  }
}
