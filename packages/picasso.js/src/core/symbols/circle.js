/**
 * @extends symbol-config
 * @typedef {object} symbol--circle
 */
function circle(options) {
  return {
    type: 'circle',
    fill: 'black',
    cx: options.x,
    cy: options.y,
    r: options.size / 2
  };
}

export { circle as default };
