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
    const {
      cx = 0, cy = 0, r = 0, collider
    } = v;
    const opts = extend({
      type: 'circle', cx, cy, r
    }, collider);

    super.set(v);
    super.collider(opts);

    this.attrs.cx = cx;
    this.attrs.cy = cy;
    this.attrs.r = r;
  }

  boundingRect(includeTransform = false) {
    // TODO Handle Circle bounds correctly for a circle transformed to an non axis aligned ellipse/circle
    // Current solution only rotate the bounds, giving a larger boundingRect if rotated
    const p = this.bounds(includeTransform);

    return {
      x: p[0].x,
      y: p[0].y,
      width: p[2].x - p[0].x,
      height: p[2].y - p[0].y
    };
  }

  bounds(includeTransform = false) {
    // TODO Handle Circle bounds correctly for a circle transformed to an non axis aligned ellipse/circle
    const {
      cx, cy, r: rX, r: rY
    } = this.attrs;
    const x = cx - rX;
    const y = cy - rY;
    let w = rX * 2;
    let h = rY * 2;
    let p = [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h }
    ];

    if (includeTransform && this.modelViewMatrix) {
      p = this.modelViewMatrix.transformPoints(p);
      const [xMin, yMin, xMax, yMax] = getMinMax(p);
      w = xMax - xMin;
      h = yMax - yMin;

      return [
        { x: xMin, y: yMin },
        { x: xMin + w, y: yMin },
        { x: xMin + w, y: yMin + h },
        { x: xMin, y: yMin + h }
      ];
    }

    return p;
  }
}

export function create(...s) {
  return new Circle(...s);
}
