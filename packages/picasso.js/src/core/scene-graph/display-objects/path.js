import extend from 'extend';
import DisplayObject from './display-object';
import { getMinMax } from '../../geometry/util';
import pathToSegments from '../parse-path-d';
import polylineToPolygonCollider from '../polyline-to-polygon-collider';
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
    this.__boundingRect = { true: null, false: null };
    this.__bounds = { true: null, false: null };

    if (Array.isArray(v.collider) || (typeof v.collider === 'object' && typeof v.collider.type !== 'undefined')) {
      this.collider = v.collider;
    } else if (v.d) {
      this.segments = pathToSegments(v.d);
      if (this.segments.length > 1 && this.segments.every((segment) => isClosed(segment))) {
        this.collider = extend({
          type: 'geopolygon',
          vertices: this.segments
        }, v.collider);
        return;
      }
      this.segments.forEach((segment) => {
        if (segment.length <= 1) {
          // Omit empty and single point segments
        } else if (isClosed(segment)) {
          this.collider = extend({
            type: 'polygon',
            vertices: segment
          }, v.collider);
        } else if (typeof v.collider === 'object' && v.collider.visual) {
          const size = this.attrs['stroke-width'] / 2;
          this.collider = polylineToPolygonCollider(segment, size, v.collider);
        } else {
          this.collider = extend({
            type: 'polyline',
            points: segment
          }, v.collider);
        }
      });
    }
  }

  boundingRect(includeTransform = false) {
    if (this.__boundingRect[includeTransform] !== null) {
      return this.__boundingRect[includeTransform];
    }

    if (!this.points.length) {
      this.segments = this.segments.length ? this.segments : pathToSegments(this.attrs.d);
      this.points = flatten(this.segments);
    }

    const pt = includeTransform && this.modelViewMatrix ? this.modelViewMatrix.transformPoints(this.points) : this.points;
    const [xMin, yMin, xMax, yMax] = getMinMax(pt);

    this.__boundingRect[includeTransform] = {
      x: xMin || 0,
      y: yMin || 0,
      width: (xMax - xMin) || 0,
      height: (yMax - yMin) || 0
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
  return new Path(...s);
}
