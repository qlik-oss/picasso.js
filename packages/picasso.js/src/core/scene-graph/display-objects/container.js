import extend from 'extend';
import DisplayObject from './display-object';
import NodeContainer from '../node-container';

/**
 * @extends node-def
 * @typedef {object} node--container-def
 * @property {node-def[]} children - Array of child nodes
 */

const NC = NodeContainer.prototype;

function reCalcBoundingRect(c, child, includeTransform = false) {
  if (typeof child.bounds !== 'undefined') {
    const [p0, , p2] = child.bounds(includeTransform);
    const { x: xMin, y: yMin } = p0;
    const { x: xMax, y: yMax } = p2;

    const _xMax = isNaN(c._boundingRect.width) ? xMax : Math.max(xMax, c._boundingRect.width + c._boundingRect.x);
    const _yMax = isNaN(c._boundingRect.height) ? yMax : Math.max(yMax, c._boundingRect.height + c._boundingRect.y);

    c._boundingRect.x = isNaN(c._boundingRect.x) ? xMin : Math.min(xMin, c._boundingRect.x);
    c._boundingRect.y = isNaN(c._boundingRect.y) ? yMin : Math.min(yMin, c._boundingRect.y);
    c._boundingRect.width = _xMax - c._boundingRect.x;
    c._boundingRect.height = _yMax - c._boundingRect.y;
  }
}

export default class Container extends DisplayObject {
  constructor(s = {}) {
    const { type = 'container' } = s;
    super(type);
    this.set(s);
    this._boundingRect = {};
  }

  set(v = {}) {
    super.set(v);

    const { collider } = v;
    const opts = extend({
      type: null
    }, collider);

    this.collider = opts;
  }

  boundingRect(includeTransform = false) {
    const num = this.children.length;
    this._boundingRect = {};

    for (let i = 0; i < num; i++) {
      reCalcBoundingRect(this, this.children[i], includeTransform);
    }
    return extend({
      x: 0, y: 0, width: 0, height: 0
    }, this._boundingRect);
  }

  bounds(includeTransform = false) {
    const rect = this.boundingRect(includeTransform);

    return [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height }
    ];
  }

  addChild(c) {
    const r = NC.addChild.call(this, c);

    if (this._collider && this._collider.type === 'bounds') {
      reCalcBoundingRect(this, c, true);
      const opts = extend({
        type: 'bounds', x: 0, y: 0, width: 0, height: 0
      }, this._boundingRect);
      this.collider = opts;
    }

    return r;
  }

  addChildren(children) {
    const r = NC.addChildren.call(this, children);
    const num = children.length;

    if (this._collider && this._collider.type === 'bounds' && num > 0) {
      for (let i = 0; i < num; i++) {
        reCalcBoundingRect(this, children[i], true);
      }
      const opts = extend({
        type: 'bounds', x: 0, y: 0, width: 0, height: 0
      }, this._boundingRect);
      this.collider = opts;
    }

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

    if (this._collider && this._collider.type === 'bounds') {
      const opts = extend(this.boundingRect(true), { type: 'bounds' });
      this.collider = opts;
    }

    return this;
  }

  removeChildren(children) {
    NC.removeChildren.call(this, children);

    if (this._collider && this._collider.type === 'bounds') {
      const opts = extend(this.boundingRect(true), { type: 'bounds' });
      this.collider = opts;
    }

    return this;
  }
}

export function create(...s) {
  return new Container(...s);
}
