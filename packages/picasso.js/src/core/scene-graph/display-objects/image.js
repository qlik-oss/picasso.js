import extend from 'extend';
import DisplayObject from './display-object';
import { rectToPoints, getMinMax } from '../../geometry/util';

/**
 * @private
 * @extends DisplayObject
 * @typedef {object} ImageNode
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width
 * @property {number} height- Height
 * @property {string} src- Image source
 */

export default class Image extends DisplayObject {
  constructor(...s) {
    super('image');
    this.set(...s);
    console.log('%c Image', 'color: orangered', s);
  }

  set(v = {}) {
    const { x = 0, y = 0, width = 0, height = 0, rx = 0, ry = 0, src, collider } = v;
    const opts = extend(
      {
        type: 'bounds',
        x,
        y,
        width,
        height,
      },
      collider
    );

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

    if (rx > 0) {
      this.attrs.rx = rx;
    }
    if (ry > 0) {
      this.attrs.ry = ry;
    }

    if (src) {
      this.attrs.src = src;
    }

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
      height: yMax - yMin,
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
      { x: rect.x, y: rect.y + rect.height },
    ];

    return this.__bounds[includeTransform];
  }
}

export function create(...s) {
  return new Image(...s);
}
