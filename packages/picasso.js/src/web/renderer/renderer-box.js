/**
 * @typedef {object} renderer-container-def
 * @property {number} [x] - x-coordinate
 * @property {number} [y] - y-coordinate
 * @property {number} [width] - Width
 * @property {number} [height] - Height
 * @property {object} [scaleRatio]
 * @property {number} [scaleRatio.x] - Scale ratio on x-axis
 * @property {number} [scaleRatio.y] - Scale ratio on y-axis
 * @property {object} [margin]
 * @property {number} [margin.left] - Left margin
 * @property {number} [margin.top] - Top margin
 */

  /**
 * Create the renderer box
 * @private
 * @param {renderer-container-def} [opts]
 * @returns {renderer-container-def} A svg renderer instance
 */
export default function createRendererBox({ x, y, width, height, scaleRatio, margin } = {}) {
  const box = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scaleRatio: {
      x: 1,
      y: 1
    },
    margin: {
      left: 0,
      top: 0
    }
  };

  box.x = isNaN(x) ? box.x : x;
  box.y = isNaN(y) ? box.y : y;
  box.width = isNaN(width) ? box.width : width;
  box.height = isNaN(height) ? box.height : height;
  if (typeof scaleRatio !== 'undefined') {
    box.scaleRatio.x = isNaN(scaleRatio.x) ? box.scaleRatio.x : scaleRatio.x;
    box.scaleRatio.y = isNaN(scaleRatio.y) ? box.scaleRatio.y : scaleRatio.y;
  }
  if (typeof margin !== 'undefined') {
    box.margin.left = isNaN(margin.left) ? 0 : margin.left;
    box.margin.top = isNaN(margin.top) ? 0 : margin.top;
  }

  return box;
}
