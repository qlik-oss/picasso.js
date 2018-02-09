import { pointsToLine, pointsToRect } from '../geometry/util';
import NarrowPhaseCollision from '../math/narrow-phase-collision';

/**
 * Construct a new GeoLine instance
 * @private
 */
class GeoLine {
  constructor({ x1 = 0, y1 = 0, x2 = 0, y2 = 0, tolerance = 0 } = {}) {
    this.set({ x1, y1, x2, y2, tolerance });
  }

  set({ x1 = 0, y1 = 0, x2 = 0, y2 = 0, tolerance = 0 } = {}) {
    this.type = 'line';
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.tolerance = Math.max(0, Math.round(tolerance));

    this.vectors = this.points();
    this.zeroSize = x1 === x2 && y1 === y2;
  }

  /**
   * @param {point} p
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  containsPoint(p) {
    if (this.tolerance > 0) {
      const c = { cx: p.x, cy: p.y, r: this.tolerance };
      return NarrowPhaseCollision.testCircleLine(c, this);
    }
    return NarrowPhaseCollision.testLinePoint(this, p);
  }

  /**
   * @param {point[]} points - Line start and end point as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsLine(points) {
    const line = pointsToLine(points);
    return NarrowPhaseCollision.testLineLine(this, line);
  }

  /**
   * @param {point[]} points - Rect vertices as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsRect(points) {
    const rect = pointsToRect(points);
    return NarrowPhaseCollision.testRectLine(rect, this);
  }

  /**
   * @param {circle} c
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsCircle(c) {
    return NarrowPhaseCollision.testCircleLine(c, this);
  }

  /**
   * @param {GeoPolygon} polygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsPolygon(polygon) {
    return NarrowPhaseCollision.testPolygonLine(polygon, this);
  }

  /**
   * Get the points
   * @returns {point[]}
   */
  points() {
    return [
      { x: this.x1, y: this.y1 },
      { x: this.x2, y: this.y2 }
    ];
  }
}

function create(...args) {
  return new GeoLine(...args);
}

export {
  GeoLine as default,
  create
};
