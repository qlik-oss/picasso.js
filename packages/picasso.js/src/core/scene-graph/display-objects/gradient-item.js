import DisplayObject from './display-object';
import NodeContainer from '../node-container';

/**
 * @private
 * @typedef {object} gradient-def
 * @property {string} type
 * @property {object[]} stops
 * @property {string} [stops[].type=linearGradient] - radialGradient|linearGradient
 * @property {string} stops[].color - {@link https://www.w3.org/TR/SVG/types.html#DataTypeColor}
 * @property {string} [stops[].opacity=1] - {@link https://www.w3.org/TR/css-color-4/#propdef-opacity}
 * @property {number} stops[].offset - {@link https://www.w3.org/TR/SVG/pservers.html#StopElementOffsetAttribute}
 * @property {number} [degree] - Gradient rotation angle
 */

/**
 * @private
 * @typedef {object} node--gradient-item-def
 * @property {string} id - Gradient identifier
 * @property {number} x1 - {@link https://www.w3.org/TR/SVG/pservers.html#LinearGradientElementX1Attribute}
 * @property {number} y1 - {@link https://www.w3.org/TR/SVG/pservers.html#LinearGradientElementY1Attribute}
 * @property {number} x2 - {@link https://www.w3.org/TR/SVG/pservers.html#LinearGradientElementX2Attribute}
 * @property {number} y2 - {@link https://www.w3.org/TR/SVG/pservers.html#LinearGradientElementY2Attribute}
 * @property {number} offset - {@link https://www.w3.org/TR/SVG/pservers.html#StopElementOffsetAttribute}
 * @property {object} style - {@link https://www.w3.org/TR/SVG/styling.html#StyleAttribute}
 */

const NC = NodeContainer.prototype;

const allowedAttrs = ['x1', 'x2', 'y1', 'y2', 'id', 'offset', 'style'];

export default class GradientItem extends DisplayObject {
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
  return new GradientItem(...s);
}
