import { pointsToLine, pointsToRect } from './util';
import {
  testCircleLine,
  testPolygonLine,
  testLinePoint,
  testLineLine,
  testRectLine,
  testGeoPolygonLine,
} from '../math/narrow-phase-collision';

function pointsAreNotEqual(p0, p1) {
  return p0.x !== p1.x || p0.y !== p1.y;
}

/**
 * Construct a new GeoPolyline instance
 * @private
 */
class GeoPolyline {
  constructor({ points = [] } = {}) {
    this.set({ points });
  }

  set({ points = [] } = {}) {
    this.type = 'polyline';
    this.segments = [];
    this._points = points.slice();

    if (this._points.length > 1) {
      for (let i = 0, len = this._points.length - 1; i < len; i++) {
        if (pointsAreNotEqual(this._points[i], this._points[i + 1])) {
          this.segments.push({
            x1: this._points[i].x,
            y1: this._points[i].y,
            x2: this._points[i + 1].x,
            y2: this._points[i + 1].y,
          });
        }
      }
    }
  }

  /**
   * @param {Point} point
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  containsPoint(point) {
    return this.segments.some((line) => testLinePoint(line, point));
  }

  /**
   * @param {Circle} circle
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsCircle(circle) {
    return this.segments.some((line) => testCircleLine(circle, line));
  }

  /**
   * @param {Point[]} points - Line start and end point as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsLine(points) {
    const testLine = pointsToLine(points);
    return this.segments.some((line) => testLineLine(line, testLine));
  }

  /**
   * @param {Point[]} points - Rect vertices as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsRect(points) {
    const rect = pointsToRect(points);
    return this.segments.some((line) => testRectLine(rect, line));
  }

  /**
   * @param {Polygon} polygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsPolygon(polygon) {
    // This is a unoptimized solution and should be replaced by a more efficient algorithm.
    return this.segments.some((line) => testPolygonLine(polygon, line));
  }

  /**
   * @param {Geopolygon} geopolygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsGeoPolygon(geopolygon) {
    // This is a unoptimized solution and should be replaced by a more efficient algorithm.
    return this.segments.some((line) => testGeoPolygonLine(geopolygon, line));
  }

  /**
   * Get the points
   * @returns {Point[]}
   */
  points() {
    return this._points;
  }
}

function create(...a) {
  return new GeoPolyline(...a);
}

export { create, GeoPolyline as default };
