/**
 * @private
 * @extends Symbol
 * @typedef {object} SymbolImage
 */
export default function image(options) {
  const { x, y, size, src } = options;
  const width = typeof options.width === 'undefined' ? size : options.width;
  const height = typeof options.height === 'undefined' ? size : options.height;

  return {
    type: 'image',
    x: x - width / 2,
    y: y - height / 2,
    width,
    height,
    src,
  };
}
