/* eslint-disable no-undef */
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
 * @property {number} cx - Center X coordinate (for circle symbol)
 * @property {number} cy - Center Y coordinate (for circle symbol)
 * @property {number} r - Radius (for circle symbol)
 */

export default class Image extends DisplayObject {
  constructor(...s) {
    super('image');
    this.set(...s);
  }

  set(v = {}) {
    const { x = 0, y = 0, width = 0, height = 0, rx = 0, ry = 0, src, collider, cx = 0, cy = 0, r = 0 } = v;
    let opts;
    if (v.symbol === 'circle') {
      opts = extend(
        {
          type: 'circle',
          cx,
          cy,
          r,
        },
        collider
      );
    } else {
      opts = extend(
        {
          type: 'bounds',
          x,
          y,
          width,
          height,
        },
        collider
      );
    }
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
    this.attrs.r = r;
    this.attrs.cx = cx;
    this.attrs.cy = cy;
    this.collider = opts;
    this.__boundingRect = { true: null, false: null };
    this.__bounds = { true: null, false: null };
    // If no collider is provided, we add an updateCollider function that updates the collider based on the image attributes.
    if (!v.collider) {
      this.attrs.updateCollider = this.updateCollider.bind(this);
    }
  }

  // This function updates the collider properties based on the image attributes. This function is called in the rendering phase.
  updateCollider(img) {
    let opts;
    if (img.symbol === 'circle') {
      opts = extend(this.collider, {
        type: 'circle',
        cx: img.cx,
        cy: img.cy,
        r: img.r,
      });
    } else {
      opts = extend(this.collider, {
        type: 'bounds',
        x: img.x,
        y: img.y,
        width: img.width,
        height: img.height,
      });
    }
    this.collider = opts;
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
    if (this._node.symbol === 'circle') {
      const rect = this.boundingRect(includeTransform);
      const r = Math.min(rect.width, rect.height) / 2;
      const cx = rect.x;
      const cy = rect.y;
      const x = cx - r;
      const y = cy - r;
      let w = r * 2;
      let h = r * 2;
      let p = [
        { x, y },
        { x: x + w, y },
        { x: x + w, y: y + h },
        { x, y: y + h },
      ];

      if (includeTransform && this.modelViewMatrix) {
        p = this.modelViewMatrix.transformPoints(p);
        const [xMin, yMin, xMax, yMax] = getMinMax(p);
        w = xMax - xMin;
        h = yMax - yMin;

        this.__bounds[includeTransform] = [
          { x: xMin, y: yMin },
          { x: xMin + w, y: yMin },
          { x: xMin + w, y: yMin + h },
          { x: xMin, y: yMin + h },
        ];
      } else {
        this.__bounds[includeTransform] = p;
      }

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
