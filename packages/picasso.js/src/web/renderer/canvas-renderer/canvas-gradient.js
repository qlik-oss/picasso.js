import { degreesToPoints } from '../../../core/math/angles';

/**
 * Get or create a gradient
 * @ignore
 * @param  {Object} g        Canvas 2d context
 * @param  {Object} shape    Current shape (for width/height properties)
 * @param  {Object} gradient The gradient properties
 * @return {Object}          A canvas compatible radial or linear gradient object
 */
export default function createCanvasGradient(g, shape, gradient) {
  const { orientation, degree, stops = [] } = gradient;

  let newGradient = null;

  if (orientation === 'radial') {
    const width = (shape.width || 0);
    const height = (shape.height || 0);

    const theX = (shape.x !== undefined ? shape.x : shape.cx);
    const theY = (shape.y !== undefined ? shape.y : shape.cy);

    newGradient = g.createRadialGradient(
      theX + (width / 2),
      theY + (height / 2),
      1,
      theX + (width / 2),
      theY + (height / 2),
      (shape.r || Math.max(shape.width, shape.height) / 2)
    );
  } else {
    const points = degreesToPoints(degree);

    const width = (shape.width || (shape.r * 2));
    const height = (shape.height || (shape.r * 2));

    const theX = (shape.x !== undefined ? shape.x : (shape.cx - shape.r));
    const theY = (shape.y !== undefined ? shape.y : (shape.cy - shape.r));

    newGradient = g.createLinearGradient(
      theX + (points.x1 * width),
      theY + (points.y1 * height),
      theX + (points.x2 * width),
      theY + (points.y2 * height)
    );
  }

  for (let i = 0, len = stops.length; i < len; i++) {
    let stop = stops[i];
    newGradient.addColorStop(stop.offset, stop.color);
  }

  return newGradient;
}
