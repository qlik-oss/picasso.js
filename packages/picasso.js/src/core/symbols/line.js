function createRectCollider({ x, y, size }) {
  const r = size / 2;
  return {
    type: 'rect',
    x: x - r,
    y: y - r,
    width: size,
    height: size,
  };
}

/**
 * @private
 * @extends Symbol
 * @typedef {object} SymbolLine
 * @property {string} [direction='horizontal'] - Direction of line ('horizontal'|'vertical').
 */
function line(options) {
  const isVertical = options.direction === 'vertical';
  const r = options.size / 2;
  const x = options.x;
  const y = options.y;

  return {
    type: 'line',
    stroke: 'black',
    strokeWidth: 1,
    x1: x - (isVertical ? 0 : r),
    y1: y - (isVertical ? r : 0),
    x2: x + (isVertical ? 0 : r),
    y2: y + (isVertical ? r : 0),
    collider: createRectCollider(options), // TODO Use visual collider?
  };
}

export { line as default };
