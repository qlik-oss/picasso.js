/**
 * @private
 * @extends Symbol
 * @typedef {object} SymbolCircle
 */
export default function circle(options) {
  return {
    type: 'circle',
    fill: 'black',
    cx: options.x,
    cy: options.y,
    r: options.size / 2,
  };
}
