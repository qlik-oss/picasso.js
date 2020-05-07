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
export default function createRendererBox({ x, y, width, height, scaleRatio, margin, edgeBleed } = {}) {
  const box = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scaleRatio: {
      x: 1,
      y: 1,
    },
    margin: {
      left: 0,
      top: 0,
    },
    edgeBleed: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      bool: false,
    },
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

  if (typeof edgeBleed === 'object') {
    ['left', 'right', 'top', 'bottom'].forEach((prop) => {
      if (!isNaN(edgeBleed[prop]) && edgeBleed[prop] > 0) {
        box.edgeBleed[prop] = edgeBleed[prop];
        box.edgeBleed.bool = true;
      }
    });
  }

  box.computedPhysical = {
    x: Math.round(box.margin.left + (box.x - box.edgeBleed.left) * box.scaleRatio.x),
    y: Math.round(box.margin.top + (box.y - box.edgeBleed.top) * box.scaleRatio.y),
    width: Math.round((box.width + box.edgeBleed.left + box.edgeBleed.right) * box.scaleRatio.x),
    height: Math.round((box.height + box.edgeBleed.top + box.edgeBleed.bottom) * box.scaleRatio.y),
  };

  return box;
}
