/**
 * @private
 * @extends Symbol
 * @typedef {object} SymbolImage
 */
export default function image(options) {
  const { x, y } = options;
  const { size, imageSrc, position, symbol, imgScalingFactor } = options.imageSettings || {};
  const width = typeof options.imageSettings.width === 'undefined' ? size : options.imageSettings.width;
  const height = typeof options.imageSettings.height === 'undefined' ? size : options.imageSettings.height;
  return {
    type: 'image',
    x,
    y,
    width,
    height,
    src: imageSrc,
    symbol,
    radius: 10,
    imgScalingFactor,
    imgPosition: position,
  };
}
