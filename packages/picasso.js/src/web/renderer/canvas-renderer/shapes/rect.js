function clampRadius(max, value) {
  return Math.max(0, Math.min(max, value));
}

/**
 * Implementation details follow rx/ry restrictions from https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx#rect
 *
 * Solution based on roundedRect function from https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes#Making_combinations
 *
 * Using Quadratic Bézier curve it's not possible accurately represent a circle or ellipse but should for the case of a rounded rectangle be sufficent.
 * @private
 */
function quadraticRoundedRect(g, x, y, width, height, rx, ry) {
  rx = clampRadius(width / 2, rx > 0 ? rx : ry);
  ry = clampRadius(height / 2, ry > 0 ? ry : rx);

  g.moveTo(x, y + ry);
  g.lineTo(x, y + height - ry);
  g.quadraticCurveTo(x, y + height, x + rx, y + height);
  g.lineTo(x + width - rx, y + height);
  g.quadraticCurveTo(x + width, y + height, x + width, y + height - ry);
  g.lineTo(x + width, y + ry);
  g.quadraticCurveTo(x + width, y, x + width - rx, y);
  g.lineTo(x + rx, y);
  g.quadraticCurveTo(x, y, x, y + ry);
}

export default function render(rect, { g, doFill, doStroke }) {
  g.beginPath();

  if (rect.rx > 0 || rect.ry > 0) {
    quadraticRoundedRect(g, rect.x, rect.y, rect.width, rect.height, rect.rx, rect.ry);
  } else {
    g.rect(rect.x, rect.y, rect.width, rect.height);
  }

  if (doFill) {
    g.fill();
  }
  if (doStroke) {
    g.stroke();
  }
}
