/**
 * @extends Symbol
 * @typedef {object} SymbolCircle
 */
function circle(options) {
  return {
    type: 'circle',
    fill: 'black',
    cx: options.x,
    cy: options.y,
    r: options.size / 2,
  };
}

export { circle as default };
