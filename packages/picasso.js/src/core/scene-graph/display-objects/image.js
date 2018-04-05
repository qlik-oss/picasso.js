import extend from 'extend';
import DisplayObject from './display-object';
import { getMinMax } from '../../geometry/util';

/**
 * @extends node-def
 * @typedef {object} node--image-def
 * @property {number} href 
 * @property {number} x 
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

export default class Image extends DisplayObject {
  constructor(...s) {
    super('image');
    this.set(...s);
  }

  set(v = {}) {
    const { x = 0, y = 0, width = 0, height = 0, href, collider } = v;
    const opts = extend({ type: 'image', x, y, width, height }, collider);

    super.set(v);
    super.collider(opts);

    this.attrs.x = x;
    this.attrs.y = y;
    this.attrs.width = width;
    this.attrs.height = height;
    this.attrs.href = href;
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
    const { cx, cy, r: rX, r: rY } = this.attrs;
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
  return new Image(...s);
}
