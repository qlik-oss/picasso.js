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
      x = 0, y = 0, width = 0, height = 0, collider
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

    this.collider = opts;
  }

  boundingRect(includeTransform = false) {
    const p = rectToPoints(this.attrs);
    const pt = includeTransform && this.modelViewMatrix ? this.modelViewMatrix.transformPoints(p) : p;
    const [xMin, yMin, xMax, yMax] = getMinMax(pt);

    return {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin
    };
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
}

export function create(...s) {
  return new Rect(...s);
}
