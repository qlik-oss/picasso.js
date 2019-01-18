import extend from 'extend';
import DisplayObject from './display-object';
import NodeContainer from '../node-container';

/**
 * @extends node-def
 * @typedef {object} node--container-def
 * @property {node-def[]} children - Array of child nodes
 */

const NC = NodeContainer.prototype;

export default class Container extends DisplayObject {
  constructor(s = {}) {
    const { type = 'container' } = s;
    super(type);
    this.set(s);
  }

  set(v = {}) {
    super.set(v);

    const { collider } = v;
    const opts = extend({
      type: null
    }, collider);

    this.collider = opts;
    this.__boundingRect = { true: null, false: null };
    this.__bounds = { true: null, false: null };
  }

  appendChildRect(child, includeTransform) {
    if (typeof child.bounds !== 'undefined') {
      const rect = this.__boundingRect[includeTransform] || {};
      const [p0, , p2] = child.bounds(includeTransform);
      const { x: xMin, y: yMin } = p0;
      const { x: xMax, y: yMax } = p2;

      const _xMax = isNaN(rect.width) ? xMax : Math.max(xMax, rect.width + rect.x);
      const _yMax = isNaN(rect.height) ? yMax : Math.max(yMax, rect.height + rect.y);

      rect.x = isNaN(rect.x) ? xMin : Math.min(xMin, rect.x);
      rect.y = isNaN(rect.y) ? yMin : Math.min(yMin, rect.y);
      rect.width = _xMax - rect.x;
      rect.height = _yMax - rect.y;

      this.__boundingRect[includeTransform] = rect;
    }
  }

  boundingRect(includeTransform = false) {
    if (this.__boundingRect[includeTransform] !== null) {
      return this.__boundingRect[includeTransform];
    }

    const num = this.children.length;

    for (let i = 0; i < num; i++) {
      this.appendChildRect(this.children[i], includeTransform);
    }

    this.__boundingRect[includeTransform] = extend({
      x: 0, y: 0, width: 0, height: 0
    }, this.__boundingRect[includeTransform]);

    return this.__boundingRect[includeTransform];
  }

  bounds(includeTransform = false) {
    if (this.__bounds[includeTransform] !== null) {
      return this.__bounds[includeTransform];
    }
    const rect = this.boundingRect(includeTransform);

    this.__bounds[includeTransform] = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height }
    ];
    return this.__bounds[includeTransform];
  }

  addChild(c) {
    const r = NC.addChild.call(this, c);

    if (this._collider && this._collider.type === 'bounds') {
      this.appendChildRect(c, true);
      const opts = extend({
        type: 'bounds', x: 0, y: 0, width: 0, height: 0
      }, this.__boundingRect.true);
      this.collider = opts;
    }

    return r;
  }

  addChildren(children) {
    const r = NC.addChildren.call(this, children);
    const num = children.length;

    if (this._collider && this._collider.type === 'bounds' && num > 0) {
      for (let i = 0; i < num; i++) {
        this.appendChildRect(children[i], true);
      }
      const opts = extend({
        type: 'bounds', x: 0, y: 0, width: 0, height: 0
      }, this.__boundingRect.true);
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
      this.__boundingRect = { true: null, false: null };
      this.__bounds = { true: null, false: null };
      const opts = extend(this.boundingRect(true), { type: 'bounds' });
      this.collider = opts;
    }

    return this;
  }

  removeChildren(children) {
    NC.removeChildren.call(this, children);

    if (this._collider && this._collider.type === 'bounds') {
      this.__boundingRect = { true: null, false: null };
      this.__bounds = { true: null, false: null };
      const opts = extend(this.boundingRect(true), { type: 'bounds' });
      this.collider = opts;
    }

    return this;
  }
}

export function create(...s) {
  return new Container(...s);
}
