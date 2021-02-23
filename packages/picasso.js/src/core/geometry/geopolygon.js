import { create as createPolygon } from './polygon';
import { pointsToLine, pointsToRect } from './util';
import {
  testCircleGeoPolygon,
  testGeoPolygonPoint,
  testGeoPolygonLine,
  testGeoPolygonRect,
  testGeoPolygonPolygon,
  testGeoPolygonGeoPolygon,
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
 * A geo-polygon is a polygon which is similar to a polygon in GeoJson. A typical geopolygon is an array of polygons where the first polygon is an outer polygon and the rest are inner polygons
 * @private
 */

/**
 * Construct a new GeoPolygon instance
 * @private
 */
class GeoPolygon {
  constructor({ vertices = [[]] } = {}) {
    this.set({ vertices });
  }

  /**
   * Set the vertices.
   * If vertices doesn't close the polygon, a closing vertice is appended.
   * @param {object} input An object with a vertices property
   * @param {Array} [input.vertices=[]] Vertices are represented as an array of arrays of points.
   */
  set({ vertices = [] } = {}) {
    this.type = 'geopolygon';
    this.vertices = vertices.slice();
    this.numPolygons = this.vertices.length;
    this.polygons = [];
    this.xMin = NaN;
    this.yMin = NaN;
    this.xMax = NaN;
    this.yMax = NaN;

    for (let i = 0; i < this.numPolygons; i++) {
      removeDuplicates(this.vertices[i]);
      if (this.vertices[i].length > 2) {
        close(this.vertices[i]);
      }
      this.polygons[i] = createPolygon({ vertices: this.vertices[i] });
      this.xMin = isNaN(this.xMin) ? this.polygons[i].xMin : Math.min(this.xMin, this.polygons[i].xMin);
      this.xMax = isNaN(this.xMax) ? this.polygons[i].xMax : Math.max(this.xMax, this.polygons[i].xMax);
      this.yMin = isNaN(this.yMin) ? this.polygons[i].yMin : Math.min(this.yMin, this.polygons[i].yMin);
      this.yMax = isNaN(this.yMax) ? this.polygons[i].yMax : Math.max(this.yMax, this.polygons[i].yMax);
    }

    this._bounds = null;
    this._boundingRect = null;
  }

  /**
   * Check if a point is inside the area of the geopolygon.
   * Supports convex, concave and self-intersecting polygons (filled area).
   * @param {Point} point
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  containsPoint(point) {
    return testGeoPolygonPoint(this, point);
  }

  /**
   * Check if circle is inside the area of the polygon.
   * Supports convex, concave and self-intersecting polygons (filled area).
   * @param {Circle} circle
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsCircle(circle) {
    return testCircleGeoPolygon(circle, this);
  }

  /**
   * @param {Point[]} points - Line start and end point as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsLine(points) {
    return testGeoPolygonLine(this, pointsToLine(points));
  }

  /**
   * @param {Point[]} points - Rect vertices as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsRect(points) {
    return testGeoPolygonRect(this, pointsToRect(points));
  }

  /**
   * Check if geopolygon intersects another polygon.
   * Supports convex, concave and self-intersecting polygons (filled area).
   * @param {Polygon} polygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsPolygon(polygon) {
    return testGeoPolygonPolygon(this, polygon);
  }

  /**
   * Check if geopolygon intersects another geopolygon.
   * Supports convex, concave and self-intersecting polygons (filled area).
   * @param {Geopolygon} geopolygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsGeoPolygon(geopolygon) {
    return testGeoPolygonGeoPolygon(this, geopolygon);
  }

  /**
   * Get the points
   * @returns {Point[]}
   */
  points() {
    return this.vertices;
  }

  /**
   * Get the bounds of the polygon, as an array of points
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

function create(...a) {
  return new GeoPolygon(...a);
}

export { create, GeoPolygon as default };
