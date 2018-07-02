import DisplayObject from './display-object';
import { getMinMax } from '../../geometry/util';
import pathToSegments from '../parse-path-d';
import flatten from '../../utils/flatten-array';

const EPSILON = 1e-12;

/**
 * @extends node-def
 * @typedef {object} node--path-def
 * @property {string} d - {@link https://www.w3.org/TR/SVG/paths.html#DAttribute}
 */

function isClosed(points) {
  if (points.length < 2) {
    return false;
  }
  const p0 = points[0];
  const p1 = points[points.length - 1];

  return Math.abs(p0.x - p1.x) < EPSILON && Math.abs(p0.y - p1.y) < EPSILON;
}

export default class Path extends DisplayObject {
  constructor(...s) {
    super('path');
    this.set(...s);
  }

  set(v = {}) {
    super.set(v);
    this.segments = [];
    this.points = [];
    this.attrs.d = v.d;

    if (v.collider) {
      super.collider(v.collider);
    } else if (v.d) {
      const col = [];
      this.segments = pathToSegments(v.d);
      this.segments.forEach((segment) => {
        if (segment.length <= 1) {
          // Omit empty and single point segments
        } else if (isClosed(segment)) {
          col.push({
            type: 'polygon',
            vertices: segment
          });
        } else {
          col.push({
            type: 'polyline',
            points: segment
          });
        }
      });

      super.collider(col);
    }
  }

  boundingRect(includeTransform = false) {
    if (!this.points.length) {
      this.segments = this.segments.length ? this.segments : pathToSegments(this.attrs.d);
      this.points = flatten(this.segments);
    }

    const pt = includeTransform && this.modelViewMatrix ? this.modelViewMatrix.transformPoints(this.points) : this.points;
    const [xMin, yMin, xMax, yMax] = getMinMax(pt);

    return {
      x: xMin || 0,
      y: yMin || 0,
      width: (xMax - xMin) || 0,
      height: (yMax - yMin) || 0
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
  return new Path(...s);
}
