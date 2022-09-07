import { pointsToLine, pointsToRect } from './util';
import {
  testCirclePolygon,
  testPolygonPoint,
  testPolygonLine,
  testPolygonRect,
  testPolygonPolygon,
  testGeoPolygonPolygon,
} from '../math/narrow-phase-collision';

function close(vertices) {
  const first = vertices[0];
  const last = vertices[vertices.length - 1];

  if (first.x !== last.x || first.y !== last.y) {
    vertices.push(first);
  }
}

function removeDuplicates(vertices) {
  for (let i = 0; i < vertices.length - 1; i++) {
    const v0 = vertices[i];
    const v1 = vertices[i + 1];
    if (v0.x === v1.x && v0.y === v1.y) {
      vertices.splice(i, 1);
      i--;
    }
  }
}

/**
 * Construct a new Polygon instance
 * Added ignore flag as the name collide with definition in index.js
 * @ignore
 * @private
 */
export default class Polygon {
  constructor({ vertices = [] } = {}) {
    this.set({ vertices });
  }

  /**
   * Set the vertices.
   * If vertices doesn't close the polygon, a closing vertice is appended.
   * @ignore
   * @param {object} input An object with a vertices property
   * @param {Point[]} [input.vertices=[]] Vertices are represented as an array of points.
   */
  set({ vertices = [] } = {}) {
    this.type = 'polygon';
    this.vertices = vertices.slice();
    this.edges = [];

    removeDuplicates(this.vertices);

    if (this.vertices.length <= 2) {
      return;
    }

    close(this.vertices);

    this.xMin = NaN;
    this.yMin = NaN;
    this.xMax = NaN;
    this.yMax = NaN;

    for (let i = 0; i < this.vertices.length; i++) {
      if (i < this.vertices.length - 1) {
        this.edges.push([this.vertices[i], this.vertices[i + 1]]);
      }

      this.xMin = isNaN(this.xMin) ? this.vertices[i].x : Math.min(this.xMin, this.vertices[i].x);
      this.xMax = isNaN(this.xMax) ? this.vertices[i].x : Math.max(this.xMax, this.vertices[i].x);
      this.yMin = isNaN(this.yMin) ? this.vertices[i].y : Math.min(this.yMin, this.vertices[i].y);
      this.yMax = isNaN(this.yMax) ? this.vertices[i].y : Math.max(this.yMax, this.vertices[i].y);
    }

    this._bounds = null;
    this._boundingRect = null;
  }

  /**
   * Check if a point is inside the area of the polygon.
   * Supports convex, concave and self-intersecting polygons (filled area).
   * @ignore
   * @param {Point} point
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  containsPoint(point) {
    return testPolygonPoint(this, point);
  }

  /**
   * Check if circle is inside the area of the polygon.
   * Supports convex, concave and self-intersecting polygons (filled area).
   * @ignore
   * @param {Circle} circle
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsCircle(circle) {
    return testCirclePolygon(circle, this);
  }

  /**
   * @ignore
   * @param {Point[]} points - Line start and end point as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsLine(points) {
    return testPolygonLine(this, pointsToLine(points));
  }

  /**
   * @ignore
   * @param {Point[]} points - Rect vertices as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsRect(points) {
    return testPolygonRect(this, pointsToRect(points));
  }

  /**
   * Check if polygon intersects another polygon.
   * Supports convex, concave and self-intersecting polygons (filled area).
   * @ignore
   * @param {Polygon} polygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsPolygon(polygon) {
    return testPolygonPolygon(this, polygon);
  }

  /**
   * Check if polygon intersects a geopolygon.
   * @ignore
   * @param {Geopolygon} geopolygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsGeoPolygon(geopolygon) {
    return testGeoPolygonPolygon(geopolygon, this);
  }

  /**
   * Get the points
   * @ignore
   * @returns {Point[]}
   */
  points() {
    return this.vertices;
  }

  /**
   * Get the bounds of the polygon, as an array of points
   * @ignore
   * @returns {Point[]}
   */
  bounds() {
    if (!this._bounds) {
      this._bounds = [
        { x: this.xMin, y: this.yMin },
        { x: this.xMax, y: this.yMin },
        { x: this.xMax, y: this.yMax },
        { x: this.xMin, y: this.yMax },
      ];
    }

    return this._bounds;
  }

  /**
   * Get the bounding rect of the polygon
   * @ignore
   * @returns {Rect}
   */
  boundingRect() {
    if (!this._boundingRect) {
      this._boundingRect = {
        x: this.xMin,
        y: this.yMin,
        width: this.xMax - this.xMin,
        height: this.yMax - this.yMin,
      };
    }
    return this._boundingRect;
  }
}

export function create(...a) {
  return new Polygon(...a);
}
