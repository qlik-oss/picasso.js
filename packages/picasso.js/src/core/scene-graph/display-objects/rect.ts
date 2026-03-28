import type { DisplayNodeSettings } from './display-object';
import extend from 'extend';
import DisplayObject from './display-object';
import { rectToPoints, getMinMax } from '../../geometry/util';

/**
 * @private
 * @extends DisplayObject
 * @typedef {object} RectNode
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width
 * @property {number} height- Height
 */

export default class Rect extends DisplayObject {
  declare __boundingRect: Record<string, { x: number; y: number; width: number; height: number } | null>;
  declare __bounds: Record<string, Array<{ x: number; y: number }> | null>;
  constructor(...s) {
    super('rect');

    this.boundingRect = (includeTransform = false) => {
      if (this.__boundingRect[String(includeTransform)] !== null) {
        return this.__boundingRect[String(includeTransform)];
      }
      const p = rectToPoints(this.attrs);
      const pt = includeTransform && this.modelViewMatrix ? this.modelViewMatrix.transformPoints(p) : p;
      const [xMin, yMin, xMax, yMax] = getMinMax(pt);

      this.__boundingRect[String(includeTransform)] = {
        x: xMin,
        y: yMin,
        width: xMax - xMin,
        height: yMax - yMin,
      };

      return this.__boundingRect[String(includeTransform)];
    };

    this.set(...s);
  }

  set(v: DisplayNodeSettings = {}) {
    const { x = 0, y = 0, width = 0, height = 0, rx = 0, ry = 0, collider } = v;
    const opts = extend(
      {
        type: 'rect',
        x,
        y,
        width,
        height,
      },
      collider
    );

    super.set(v);

    if ((width as number) >= 0) {
      this.attrs.x = x;
      this.attrs.width = width;
    } else {
      this.attrs.x = (x as number) + (width as number);
      this.attrs.width = -(width as number);
    }

    if ((height as number) >= 0) {
      this.attrs.y = y;
      this.attrs.height = height;
    } else {
      this.attrs.y = (y as number) + (height as number);
      this.attrs.height = -(height as number);
    }

    if ((rx as number) > 0) {
      this.attrs.rx = rx;
    }
    if ((ry as number) > 0) {
      this.attrs.ry = ry;
    }

    this.collider = opts;
    this.__boundingRect = { true: null, false: null };
    this.__bounds = { true: null, false: null };
  }

  bounds(includeTransform = false) {
    if (this.__bounds[String(includeTransform)] !== null) {
      return this.__bounds[String(includeTransform)];
    }
    const rect = this.boundingRect!(includeTransform);

    this.__bounds[String(includeTransform)] = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ];

    return this.__bounds[String(includeTransform)];
  }
}

export function create(...s) {
  return new Rect(...s);
}
