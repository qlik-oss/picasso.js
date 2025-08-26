/**
 * @private
 * @extends Symbol
 * @typedef {object} SymbolImage
 */
export default function image(options) {
  const { x, y } = options;
  const { width, height, imageSrc, position, symbol, imgScalingFactor } = options.imageSettings || {};
  return {
    type: 'image',
    x,
    y,
    width,
    height,
    src: imageSrc,
    symbol,
    r: 10,
    cx: 0,
    cy: 0,
    imgScalingFactor,
    imgPosition: position,
  };
}
