/**
 * @extends symbol-config
 * @typedef {object} symbol--square
 */
function square(options) {
  const size = options.size;

  return {
    type: 'rect',
    fill: 'black',
    x: options.x - (size / 2),
    y: options.y - (size / 2),
    width: size,
    height: size
  };
}

export {
  square as default
};
