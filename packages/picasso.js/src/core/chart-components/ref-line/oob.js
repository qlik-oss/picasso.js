/**
 * Return a D property for a SVG path to get a direction marker
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} r - Radius
 * @param {string} [d='bottom'] - Direction
 * @returns {string} - Finished D property
 * @ignore
 */
export function directionMarker(x, y, r, d = 'bottom') {
  r *= 0.8;
  if (d === 'left' || d === 'right') {
    let right = d === 'right';
    return `
      M ${x} ${y - r}
      A ${r * 1.25} ${r * 1.25}, 0, 1, ${right ? 0 : 1}, ${x} ${y + r}
      L ${right ? x + r : x - r} ${y} Z
    `;
  }
  let bottom = d === 'bottom';
  return `
    M ${x - r} ${y}
    A ${r * 1.25} ${r * 1.25}, 0, 1, ${bottom ? 1 : 0}, ${x + r} ${y}
    L ${x} ${bottom ? y + r : y - r} Z
  `;
}

function directionTriangle(x, y, r, d = 'bottom') {
  r *= 0.75;
  if (d === 'left' || d === 'right') {
    let right = d === 'right';
    x += (right ? r * 1.5 : -(r * 1.5));
    return `
      M ${x} ${y - r}
      L ${x} ${y + r}
      L ${right ? x + r : x - r} ${y} Z
    `;
  }
  let bottom = d === 'bottom';
  y += (bottom ? r * 1.5 : -(r * 1.5));
  return `
    M ${x - r} ${y}
    L ${x + r} ${y}
    L ${x} ${bottom ? y + r : y - r} Z
  `;
}

/**
 * Handle out of bound shapes
 * Does not return anything, modifies "items" property instead (should be re-considered)
 *
 * @param {object} oob - Out of bounds object from parent
 * @param {object} settings - Settings object from parent
 * @param {object[]} items - Array of all items (for collision detection)
 * @ignore
 */
export function oobManager({ blueprint, oob, settings, items }) {
  const oobKeys = Object.keys(oob);
  let style = settings.style.oob || {};

  for (let i = 0, len = oobKeys.length; i < len; i++) {
    const key = oobKeys[i];
    const value = oob[key];

    if (value.length > 0) {
      let position = (key.charAt(1));
      let flipXY = key.charAt(0) === 'y';

      let xPadding = style.padding.x + (style.width);
      let yPadding = style.padding.y + style.width;
      let direction = 'bottom';

      if (flipXY) {
        direction = (position === '1' ? 'bottom' : 'top');
      } else {
        direction = (position === '1' ? 'right' : 'left');
      }

      let indicator = blueprint.processItem({
        fn: ({ width, height }) => { /* eslint no-loop-func: 0 */
          let x = (position * width) + (position === '1' ? -xPadding : xPadding);
          let y = flipXY ? yPadding : height - yPadding;

          if (style.type === 'arc') {
            return {
              type: 'path',
              d: directionMarker(flipXY ? y : x, flipXY ? x : y, style.width, direction),
              x,
              y,
              stroke: style.stroke,
              fill: style.fill,
              strokeWidth: style.strokeWidth || 0
            };
          }

          return {
            type: 'circle',
            cx: x,
            cy: y,
            r: style.width,
            stroke: style.stroke,
            fill: style.fill,
            strokeWidth: style.strokeWidth || 0,
            opacity: style.opacity,
            data: value
          };
        },
        flipXY
      });

      let x = indicator.cx || indicator.x;
      let y = indicator.cy || indicator.y;

      let text = {
        type: 'text',
        text: value.length || '',
        x: x - (style.width * 0.4),
        y: y + (style.width * 0.4),
        fontFamily: style.text.fontFamily,
        fontSize: `${style.width * 1.3}px`,
        stroke: style.text.stroke,
        fill: style.text.fill,
        strokeWidth: style.text.strokeWidth || 0,
        opacity: style.text.opacity
      };

      let triangle = {
        type: 'path',
        d: directionTriangle(x, y, style.width, direction),
        x,
        y,
        stroke: style.triangle.stroke,
        fill: style.triangle.fill,
        strokeWidth: style.triangle.strokeWidth || 0,
        opacity: style.triangle.opacity
      };

      items.push(indicator, text, triangle);
    }
  }
}
