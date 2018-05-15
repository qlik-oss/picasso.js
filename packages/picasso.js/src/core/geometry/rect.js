import {
  pointsToLine,
  pointsToRect
} from '../geometry/util';
import NarrowPhaseCollision from '../math/narrow-phase-collision';

/**
 * Construct a new GeoRect instance
 * @private
 */
class GeoRect {
  constructor({
    x = 0, y = 0, width = 0, height = 0, minWidth = 0, minHeight = 0
  } = {}) {
    this.set({
      x, y, width, height, minWidth, minHeight
    });
  }

  set({
    x = 0, y = 0, width = 0, height = 0, minWidth = 0, minHeight = 0
  } = {}) {
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
   * @param {point} p
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  containsPoint(p) {
    return NarrowPhaseCollision.testRectPoint(this, p);
  }

  /**
   * @param {point[]} points - Line start and end point as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsLine(points) {
    const line = pointsToLine(points);
    return NarrowPhaseCollision.testRectLine(this, line);
  }

  /**
   * @param {point[]} points - Rect vertices as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsRect(points) {
    const rect = pointsToRect(points);
    return NarrowPhaseCollision.testRectRect(this, rect);
  }

  /**
   * @param {circle} c
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsCircle(c) {
    return NarrowPhaseCollision.testCircleRect(c, this);
  }

  /**
   * @param {GeoPolygon} polygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsPolygon(polygon) {
    return NarrowPhaseCollision.testPolygonRect(polygon, this);
  }

  /**
   * Get the points
   * @returns {point[]}
   */
  points() {
    return [
      { x: this.x, y: this.y },
      { x: this.x + this.width, y: this.y },
      { x: this.x + this.width, y: this.y + this.height },
      { x: this.x, y: this.y + this.height }
    ];
  }
}

function create(...args) {
  return new GeoRect(...args);
}

export {
  GeoRect as default,
  create
};
