import extend from 'extend';
import DisplayObject from './display-object';
import { getMinMax } from '../../geometry/util';

/**
 * @extends node-def
 * @typedef {object} node--circle-def
 * @property {number} cx - {@link https://www.w3.org/TR/SVG/shapes.html#CircleElementCXAttribute}
 * @property {number} cy - {@link https://www.w3.org/TR/SVG/shapes.html#CircleElementCYAttribute}
 * @property {number} r - {@link https://www.w3.org/TR/SVG/shapes.html#CircleElementRAttribute}
 */

export default class Circle extends DisplayObject {
  constructor(...s) {
    super('circle');
    this.set(...s);
  }

  set(v = {}) {
    const { cx = 0, cy = 0, r = 0, collider } = v;
    const opts = extend(
      {
        type: 'circle',
        cx,
        cy,
        r,
      },
      collider
    );

    super.set(v);

    this.attrs.cx = cx;
    this.attrs.cy = cy;
    this.attrs.r = r;

    this.collider = opts;
    this.__boundingRect = { true: null, false: null };
    this.__bounds = { true: null, false: null };
  }

  boundingRect(includeTransform = false) {
    if (this.__boundingRect[includeTransform] !== null) {
      return this.__boundingRect[includeTransform];
    }
    // TODO Handle Circle bounds correctly for a circle transformed to an non axis aligned ellipse/circle
    // Current solution only rotate the bounds, giving a larger boundingRect if rotated
    const p = this.bounds(includeTransform);

    this.__boundingRect[includeTransform] = {
      x: p[0].x,
      y: p[0].y,
      width: p[2].x - p[0].x,
      height: p[2].y - p[0].y,
    };
    return this.__boundingRect[includeTransform];
  }

  bounds(includeTransform = false) {
    if (this.__bounds[includeTransform] !== null) {
      return this.__bounds[includeTransform];
    }
    // TODO Handle Circle bounds correctly for a circle transformed to an non axis aligned ellipse/circle
    const { cx, cy, r: rX, r: rY } = this.attrs;
    const x = cx - rX;
    const y = cy - rY;
    let w = rX * 2;
    let h = rY * 2;
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
}

export function create(...s) {
  return new Circle(...s);
}
