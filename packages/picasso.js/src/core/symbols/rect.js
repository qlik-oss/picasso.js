/**
 * @private
 * @extends Symbol
 * @typedef {object} SymbolRect
 */
function rect(options) {
  const { x, y, size } = options;
  const width = typeof options.width === 'undefined' ? size : options.width;
  const height = typeof options.height === 'undefined' ? size : options.height;

  return {
    type: 'rect',
    fill: 'black',
    x: x - width / 2,
    y: y - height / 2,
    width,
    height,
  };
}

export { rect as default };
