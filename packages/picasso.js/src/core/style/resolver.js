import extend from 'extend';

const VARIABLE_RX = /^\$/;
const EXTEND = '@extend';

function throwCyclical(s) {
  throw new Error(`Cyclical reference for "${s}"`);
}

function res(style, references, path) {
  if (typeof style === 'string') {
    let value = references[style];
    if (path.indexOf(style) !== -1) {
      throwCyclical(style);
    }
    if (VARIABLE_RX.test(value)) {
      path.push(style);
      return res(value, references, path);
    }
    return value;
  }
  let computed = style;
  const refs = extend(true, {}, references, style);
  const s = {};

  if (style[EXTEND]) {
    const extendFrom = style[EXTEND];
    if (path.indexOf(extendFrom) !== -1) {
      throwCyclical(extendFrom);
    }
    let pext = path.slice();
    pext.push(extendFrom);
    computed = extend(true, {}, res(refs[extendFrom], references, pext), style);
  }

  Object.keys(computed).forEach((key) => {
    let p = path.slice();
    if (key === EXTEND || VARIABLE_RX.test(key)) {
      return;
    }
    s[key] = computed[key];
    let value = s[key];
    if (VARIABLE_RX.test(value) && value in refs) {
      if (path.indexOf(value) !== -1) {
        throwCyclical(value);
      }
      p.push(value);
      value = refs[value];
      if (typeof value === 'object') {
        s[key] = res(value, refs, p);
      } else if (VARIABLE_RX.test(value) && value in refs) {
        s[key] = res(value, refs, p);
      } else {
        s[key] = value;
      }
    } else if (typeof value === 'object') {
      s[key] = res(value, refs, p);
    }
  });
  return s;
}

/**
 * Resolve style references
 * @private
 * @param {style-object} style
 * @param {style-object} references
 * @returns {object} The resolved style
 * @example
 * resolve({
 *   label: '$label--big'
 * }, {
 *   '$size--m': '12px',
 *   '$label--big': {
 *     fontFamily: 'Arial',
 *     fontSize: '$size--m'
 *   }
 * }); // { label: { fontFamily: 'Arial', fontSize: '12px' } }
 */
function resolve(style, references) {
  return res(style, references, []);
}

export {
  resolve as default
};
