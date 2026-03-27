import extend from 'extend';
import DisplayObject from './display-object';
import { lineToPoints, getMinMax } from '../../geometry/util';

/**
 * @private
 * @extends DisplayObject
 * @typedef {object} LineNode
 * @property {number} x1 - {@link https://www.w3.org/TR/SVG/shapes.html#LineElementX1Attribute}
 * @property {number} y1 - {@link https://www.w3.org/TR/SVG/shapes.html#LineElementY1Attribute}
 * @property {number} x2 - {@link https://www.w3.org/TR/SVG/shapes.html#LineElementX2Attribute}
 * @property {number} y2 - {@link https://www.w3.org/TR/SVG/shapes.html#LineElementY2Attribute}
 */

export default class Line extends DisplayObject {
  declare __boundingRect: any;
  declare __bounds: any;
  constructor(...s) {
    super('line');
    this.set(...s);
  }

  set(v = {}) {
    const { x1 = 0, y1 = 0, x2 = 0, y2 = 0, collider } = v;
    super.set(v);
    this.attrs.x1 = x1;
    this.attrs.y1 = y1;
    this.attrs.x2 = x2;
    this.attrs.y2 = y2;

    const defaultCollider = {
      type: 'line',
      x1,
      y1,
      x2,
      y2,
    };
    this.collider = extend(defaultCollider, collider);
    this.__boundingRect = { true: null, false: null };
    this.__bounds = { true: null, false: null };
  }

  boundingRect(includeTransform = false) {
    if (this.__boundingRect[includeTransform as any] !== null) {
      return this.__boundingRect[includeTransform as any];
    }
    let p = lineToPoints(this.attrs);

    if (includeTransform && this.modelViewMatrix) {
      p = this.modelViewMatrix.transformPoints(p);
    }

    const [xMin, yMin, xMax, yMax] = getMinMax(p);
    const hasSize = xMin !== xMax || yMin !== yMax;

    this.__boundingRect[includeTransform as any] = {
      x: xMin,
      y: yMin,
      width: hasSize ? Math.max(1, xMax - xMin) : 0,
      height: hasSize ? Math.max(1, yMax - yMin) : 0,
    };
    return this.__boundingRect[includeTransform as any];
  }

  bounds(includeTransform = false) {
    if (this.__bounds[includeTransform as any] !== null) {
      return this.__bounds[includeTransform as any];
    }
    const rect = this.boundingRect(includeTransform);
    this.__bounds[includeTransform as any] = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ];
    return this.__bounds[includeTransform as any];
  }
}

export function create(...s) {
  return new Line(...s);
}
