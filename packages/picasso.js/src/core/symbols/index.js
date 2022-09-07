import { mappedAttributes } from '../scene-graph/attributes';
import circle from './circle';
import diamond from './diamond';
import saltire from './saltire';
import square from './square';
import triangle from './triangle';
import line from './line';
import star from './star';
import nPolygon from './n-polygon';
import cross from './cross';
import bar from './bar';
import rect from './rect';
import registry from '../utils/registry';

const parentReg = registry();

parentReg.add('circle', circle);
parentReg.add('diamond', diamond);
parentReg.add('saltire', saltire);
parentReg.add('square', square);
parentReg.add('triangle', triangle);
parentReg.add('line', line);
parentReg.add('star', star);
parentReg.add('n-polygon', nPolygon);
parentReg.add('cross', cross);
parentReg.add('bar', bar);
parentReg.add('rect', rect);

function applyOpts(obj, opts = {}) {
  Object.keys(opts).forEach((key) => {
    if (typeof mappedAttributes[key] !== 'undefined' && key !== 'transform') {
      obj[key] = opts[key];
    }
  });
}

/**
 * Factory function for symbols.
 * Options object is passed to symbols function.
 * @private
 * @param {SymbolRect|SymbolBar|SymbolCircle|SymbolCross|SymbolDiamond|SymbolLine|SymbolPolygon|SymbolSaltire|SymbolSquare|SymbolStar|SymbolTriangle} options - Options definition may contain any of the supported display-object attributes
 * @returns {object} A node definition
 */
const create =
  (reg = parentReg) =>
  (options = {}) => {
    // TODO handle reserverd properties x, y, size, data, etc..
    const fn = reg.get(options.type);
    if (fn) {
      const s = fn(options);
      applyOpts(s, options);

      if (typeof options.data !== 'undefined') {
        s.data = options.data;
      }

      return s;
    }
    return fn;
  };

export { parentReg as symbolRegistry };
export default create;

/**
 * Mandatory symbol config
 * @private
 * @typedef {object} Symbol
 * @property {object} options - Options definition may contain any of the supported display-object attributes
 * @property {string} options.type - Type of symbol
 * @property {number} options.x - x-coordinate
 * @property {number} options.y - y-coordinate
 * @property {number} options.size
 * @property {object} [options.data]
 */
