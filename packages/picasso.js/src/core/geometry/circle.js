import { pointsToLine, pointsToRect } from './util';
import {
  testCirclePoint,
  testCircleRect,
  testCircleLine,
  testCircleCircle,
  testCirclePolygon,
  testCircleGeoPolygon,
} from '../math/narrow-phase-collision';

/**
 * Construct a new GeoCircle instance
 * @private
 */
class GeoCircle {
  constructor({ cx = 0, cy = 0, r = 0, minRadius = 0 } = {}) {
    this.set({
      cx,
      cy,
      r,
      minRadius,
    });
  }

  set({ cx = 0, cy = 0, r = 0, minRadius = 0 } = {}) {
    this.type = 'circle';
    this.cx = cx;
    this.cy = cy;
    this.r = Math.max(r, minRadius);
    this.vector = { x: this.cx, y: this.cy };
  }

  /**
   * @param {Point} p
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  containsPoint(p) {
    return testCirclePoint(this, p);
  }

  /**
   * @param {Point[]} points - Line start and end point as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsLine(points) {
    const line = pointsToLine(points);

    return testCircleLine(this, line);
  }

  /**
   * @param {Point[]} points - Rect vertices as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsRect(points) {
    const rect = pointsToRect(points);

    return testCircleRect(this, rect);
  }

  /**
   * @param {Circle} c
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsCircle(c) {
    return testCircleCircle(this, c);
  }

  /**
   * @param {Polygon} polygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsPolygon(polygon) {
    return testCirclePolygon(this, polygon);
  }

  /**
   * @param {Geopolygon} geopolygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsGeoPolygon(geopolygon) {
    return testCircleGeoPolygon(this, geopolygon);
  }

  /**
   * Get the points
   * @returns {Point[]}
   */
  points() {
    return [
      {
        x: this.cx,
        y: this.cy,
      },
    ];
  }
}

export function create(...args) {
  return new GeoCircle(...args);
}

export default GeoCircle;
