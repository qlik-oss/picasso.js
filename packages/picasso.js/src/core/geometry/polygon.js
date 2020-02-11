import { pointsToLine, pointsToRect } from './util';
import {
  testCirclePolygon,
  testPolygonPoint,
  testPolygonLine,
  testPolygonRect,
  testRectRect,
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
 * @private
 */
class Polygon {
  constructor({ vertices = [] } = {}) {
    this.set({ vertices });
  }

  /**
   * Set the vertices.
   * If vertices doesn't close the polygon, a closing vertice is appended.
   * @param {object} input An object with a vertices property
   * @param {point[]} [input.vertices=[]] Vertices are represented as an array of points.
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
   * @param {point} point
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  containsPoint(point) {
    return testPolygonPoint(this, point);
  }

  /**
   * Check if circle is inside the area of the polygon.
   * Supports convex, concave and self-intersecting polygons (filled area).
   * @param {circle} circle
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsCircle(circle) {
    return testCirclePolygon(circle, this);
  }

  /**
   * @param {point[]} points - Line start and end point as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsLine(points) {
    return testPolygonLine(this, pointsToLine(points));
  }

  /**
   * @param {point[]} points - Rect vertices as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsRect(points) {
    return testPolygonRect(this, pointsToRect(points));
  }

  /**
   * Check if polygon intersects another polygon.
   * Supports convex, concave and self-intersecting polygons (filled area).
   * @param {Polygon} polygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsPolygon(polygon) {
    // This is a unoptimized solution and should be replaced by a more efficient algorithm.
    if (!testRectRect(this.boundingRect(), polygon.boundingRect())) {
      return false;
    }

    let intersects = false;
    for (let i = 0, len = this.edges.length; i < len; i++) {
      intersects = testPolygonLine(polygon, pointsToLine(this.edges[i]));
      if (intersects === true) {
        break;
      }
    }
    return intersects;
  }

  /**
   * Get the points
   * @returns {point[]}
   */
  points() {
    return this.vertices;
  }

  /**
   * Get the bounds of the polygon, as an array of points
   * @returns {point[]}
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
   * @returns {rect}
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

/**
 * Construct a new Polygon instance
 * @param {object} input An object with a vertices property
 * @param {point[]} [input.vertices=[]] Vertices are represented as an array of points.
 * @returns {Polygon} Polygon instance
 * @private
 */
function create(...a) {
  return new Polygon(...a);
}

export { create, Polygon as default };
