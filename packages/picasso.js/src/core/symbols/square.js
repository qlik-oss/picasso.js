/**
 * @private
 * @extends Symbol
 * @typedef {object} SymbolSquare
 */
export default function square(options) {
  const size = options.size;

  return {
    type: 'rect',
    fill: 'black',
    x: options.x - size / 2,
    y: options.y - size / 2,
    width: size,
    height: size,
  };
}
