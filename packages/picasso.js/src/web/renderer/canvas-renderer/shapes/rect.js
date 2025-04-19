import nebula from './nebula';

function clampRadius(max, value) {
  return Math.max(0, Math.min(max, value));
}

const dataUrl =
  'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiCiAgICAgd2lkdGg9IjI1IiBoZWlnaHQ9IjI1IgogICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InJlZCIgLz4KCiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9ImdyZWVuIiAvPgoKPC9zdmc+Cg==';

/**
 * Implementation details follow rx/ry restrictions from https://svgwg.org/svg2-draft/geometry.html#RX
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

  if (rect.src) {
    console.log('%c rect with src', 'color: orangered');
    const image = new Image(rect.width, rect.height);
    image.src = rect.src;
    image.onload = () => {
      console.log('%c loaded image', 'color: lime', image.src);
      // g.drawImage(image, 0, 0, rect.width, rect.height, rect.x, rect.y, rect.width, rect.height);
    };

    try {
      g.drawImage(image, rect.x, rect.y, rect.width, rect.height, rect.x, rect.y, rect.width, rect.height);
      // g.drawImage(image, 0, 0, rect.width, rect.height, rect.x, rect.y, rect.width, rect.height);
    } catch (error) {
      console.log('%c draw image error', 'color: orangered', error);
    }
  }
}
