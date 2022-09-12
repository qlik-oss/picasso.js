import { pointsToLine, pointsToRect } from './util';
import {
  testCircleRect,
  testPolygonRect,
  testRectRect,
  testRectPoint,
  testRectLine,
  testGeoPolygonRect,
} from '../math/narrow-phase-collision';

/**
 * Construct a new GeoRect instance
 * @private
 */
class GeoRect {
  constructor({ x = 0, y = 0, width = 0, height = 0, minWidth = 0, minHeight = 0 } = {}) {
    this.set({
      x,
      y,
      width,
      height,
      minWidth,
      minHeight,
    });
  }

  set({ x = 0, y = 0, width = 0, height = 0, minWidth = 0, minHeight = 0 } = {}) {
    this.type = 'rect';

    if (width >= 0) {
      this.x = x;
      this.width = Math.max(width, minWidth);
    } else {
      this.x = x + Math.min(width, -minWidth);
      this.width = -Math.min(width, -minWidth);
    }

    if (height >= 0) {
      this.y = y;
      this.height = Math.max(height, minHeight);
    } else {
      this.y = y + Math.min(height, -minHeight);
      this.height = -Math.min(height, -minHeight);
    }
  }

  /**
   * @param {Point} p
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  containsPoint(p) {
    return testRectPoint(this, p);
  }

  /**
   * @param {Point[]} points - Line start and end point as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsLine(points) {
    const line = pointsToLine(points);
    return testRectLine(this, line);
  }

  /**
   * @param {Point[]} points - Rect vertices as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsRect(points) {
    const rect = pointsToRect(points);
    return testRectRect(this, rect);
  }

  /**
   * @param {Circle} c
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsCircle(c) {
    return testCircleRect(c, this);
  }

  /**
   * @param {Polygon} polygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsPolygon(polygon) {
    return testPolygonRect(polygon, this);
  }

  /**
   * @param {Geopolygon} geopolygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsGeoPolygon(geopolygon) {
    return testGeoPolygonRect(geopolygon, this);
  }

  /**
   * Get the points
   * @returns {Point[]}
   */
  points() {
    return [
      { x: this.x, y: this.y },
      { x: this.x + this.width, y: this.y },
      { x: this.x + this.width, y: this.y + this.height },
      { x: this.x, y: this.y + this.height },
    ];
  }
}

export function create(...args) {
  return new GeoRect(...args);
}

export default GeoRect;
