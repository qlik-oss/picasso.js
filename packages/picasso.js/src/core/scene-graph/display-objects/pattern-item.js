import DisplayObject from './display-object';
import NodeContainer from '../node-container';

/**
 * @private
 * @experimental
 * @typedef {object} PatternNode
 * @property {string} [type='pattern']
 * @property {string} fill
 * @property {number} width
 * @property {number} height
 * @property {object[]} shapes
 * @example
 * // Stripe pattern
 * {
 *   type: 'pattern',
 *   fill: 'red',
 *   width: 4,
 *   height: 4,
 *   shapes: [
 *     { type: 'rect', x: 3, y: 0, width: 1, height: 1 },
 *     { type: 'rect', x: 2, y: 1, width: 1, height: 1 },
 *     { type: 'rect', x: 1, y: 2, width: 1, height: 1 },
 *     { type: 'rect', x: 0, y: 3, width: 1, height: 1 },
 *   ]
 * }
 */

const NC = NodeContainer.prototype;

const allowedAttrs = ['patternUnits', 'x', 'y', 'width', 'height', 'id'];

export default class PatternItem extends DisplayObject {
  constructor(s = {}) {
    const { type = 'container' } = s;
    super(type);
    this.set(s);
    this._boundingRect = {};
  }

  set(v = {}) {
    super.set(v);

    const attrs = this.attrs;

    let attrKey = '';

    for (let i = 0, len = allowedAttrs.length; i !== len; i++) {
      attrKey = allowedAttrs[i];

      if (typeof v[attrKey] !== 'undefined') {
        attrs[attrKey] = v[attrKey];
      }
    }
  }

  addChild(c) {
    const r = NC.addChild.call(this, c);

    return r;
  }

  addChildren(children) {
    const r = NC.addChildren.call(this, children);

    return r;
  }

  removeChild(c) {
    c._stage = null;
    let desc = c.descendants,
      num = desc ? desc.length : 0,
      i;
    // remove reference to stage from all descendants
    for (i = 0; i < num; i++) {
      desc[i]._stage = null;
    }

    NC.removeChild.call(this, c);

    return this;
  }

  removeChildren(children) {
    NC.removeChildren.call(this, children);

    return this;
  }
}

export function create(...s) {
  return new PatternItem(...s);
}
