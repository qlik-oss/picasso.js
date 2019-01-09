import { degreesToPoints } from '../../../core/math/angles';

/**
 * Get or create a gradient
 * @ignore
 * @param  {Object} g        Canvas 2d context
 * @param  {Object} node    Current node (for width/height properties)
 * @param  {Object} gradient The gradient properties
 * @return {Object}          A canvas compatible radial or linear gradient object
 */
export default function createCanvasGradient(g, node, gradient) {
  const { orientation, degree, stops = [] } = gradient;

  let newGradient = null;

  if (orientation === 'radial') {
    const bounds = node.boundingRect();

    newGradient = g.createRadialGradient(
      bounds.x + (bounds.width / 2),
      bounds.y + (bounds.height / 2),
      1e-5,
      bounds.x + (bounds.width / 2),
      bounds.y + (bounds.height / 2),
      (Math.max(bounds.width, bounds.height) / 2)
    );
  } else {
    const points = degreesToPoints(degree);

    const bounds = node.boundingRect();

    newGradient = g.createLinearGradient(
      bounds.x + (points.x1 * bounds.width),
      bounds.y + (points.y1 * bounds.height),
      bounds.x + (points.x2 * bounds.width),
      bounds.y + (points.y2 * bounds.height)
    );
  }

  for (let i = 0, len = stops.length; i < len; i++) {
    let stop = stops[i];
    newGradient.addColorStop(stop.offset, stop.color);
  }

  return newGradient;
}
