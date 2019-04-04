import extend from 'extend';
import DisplayObject from './display-object';
import {
  rectToPoints,
  getMinMax
} from '../../geometry/util';

/**
 * @extends node-def
 * @typedef {object} node--rect-def
 * @property {number} x - {@link https://www.w3.org/TR/SVG/shapes.html#RectElementXAttribute}
 * @property {number} y - {@link https://www.w3.org/TR/SVG/shapes.html#RectElementYAttribute}
 * @property {number} width - {@link https://www.w3.org/TR/SVG/shapes.html#RectElementWidthAttribute}
 * @property {number} height- {@link https://www.w3.org/TR/SVG/shapes.html#RectElementHeightAttribute}
 */

export default class Rect extends DisplayObject {
  constructor(...s) {
    super('rect');
    this.set(...s);
  }

  set(v = {}) {
    const {
      x = 0,
      y = 0,
      width = 0,
      height = 0,
      rx = NaN,
      ry = NaN,
      collider
    } = v;
    const opts = extend({
      type: 'rect', x, y, width, height
    }, collider);

    super.set(v);

    if (width >= 0) {
      this.attrs.x = x;
      this.attrs.width = width;
    } else {
      this.attrs.x = x + width;
      this.attrs.width = -width;
    }

    if (height >= 0) {
      this.attrs.y = y;
      this.attrs.height = height;
    } else {
      this.attrs.y = y + height;
      this.attrs.height = -height;
    }

    this.attrs.rx = Math.max(0, rx);
    this.attrs.ry = Math.max(0, ry);

    this.collider = opts;
    this.__boundingRect = { true: null, false: null };
    this.__bounds = { true: null, false: null };
  }

  boundingRect(includeTransform = false) {
    if (this.__boundingRect[includeTransform] !== null) {
      return this.__boundingRect[includeTransform];
    }
    const p = rectToPoints(this.attrs);
    const pt = includeTransform && this.modelViewMatrix ? this.modelViewMatrix.transformPoints(p) : p;
    const [xMin, yMin, xMax, yMax] = getMinMax(pt);

    this.__boundingRect[includeTransform] = {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin
    };

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
}

export function create(...s) {
  return new Rect(...s);
}
