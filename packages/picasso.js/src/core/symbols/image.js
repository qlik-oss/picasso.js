/**
 * @private
 * @extends Symbol
 * @typedef {object} SymbolImage
 */
export default function image(options) {
  let { x, y, size, src, position, symbol, imgScalingFactor } = options;
  const width = typeof options.width === 'undefined' ? size : options.width;
  const height = typeof options.height === 'undefined' ? size : options.height;
  return {
    type: 'image',
    x,
    y,
    width,
    height,
    src,
    symbol,
    radius: 10,
    imgScalingFactor,
    imgPosition: position,
  };
}
