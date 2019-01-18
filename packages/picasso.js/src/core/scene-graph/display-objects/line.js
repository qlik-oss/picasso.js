import extend from 'extend';
import DisplayObject from './display-object';
import {
  lineToPoints,
  getMinMax
} from '../../geometry/util';

/**
 * @extends node-def
 * @typedef {object} node--line-def
 * @property {number} x1 - {@link https://www.w3.org/TR/SVG/shapes.html#LineElementX1Attribute}
 * @property {number} y1 - {@link https://www.w3.org/TR/SVG/shapes.html#LineElementY1Attribute}
 * @property {number} x2 - {@link https://www.w3.org/TR/SVG/shapes.html#LineElementX2Attribute}
 * @property {number} y2 - {@link https://www.w3.org/TR/SVG/shapes.html#LineElementY2Attribute}
 */

export default class Line extends DisplayObject {
  constructor(...s) {
    super('line');
    this.set(...s);
  }

  set(v = {}) {
    const {
      x1 = 0, y1 = 0, x2 = 0, y2 = 0, collider
    } = v;
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
      y2
    };
    this.collider = extend(defaultCollider, collider);
    this.__boundingRect = { true: null, false: null };
    this.__bounds = { true: null, false: null };
  }

  boundingRect(includeTransform = false) {
    if (this.__boundingRect[includeTransform] !== null) {
      return this.__boundingRect[includeTransform];
    }
    let p = lineToPoints(this.attrs);

    if (includeTransform && this.modelViewMatrix) {
      p = this.modelViewMatrix.transformPoints(p);
    }

    const [xMin, yMin, xMax, yMax] = getMinMax(p);
    const hasSize = xMin !== xMax || yMin !== yMax;

    this.__boundingRect[includeTransform] = {
      x: xMin,
      y: yMin,
      width: hasSize ? Math.max(1, xMax - xMin) : 0,
      height: hasSize ? Math.max(1, yMax - yMin) : 0
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
  return new Line(...s);
}
