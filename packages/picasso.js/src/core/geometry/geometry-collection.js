import { create as factory } from './index';

/**
 * Construct a new GeometryCollection instance
 * @private
 */
class GeometryCollection {
  constructor(collection = []) {
    this.set(collection);
  }

  set(collection = []) {
    this.geometries = [];
    collection.forEach((geo) => {
      const geoInstance = factory(geo.type, geo);
      if (geoInstance) {
        this.geometries.push(geoInstance);
      }
    });
  }

  /**
   * @param {Point} p
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  containsPoint(p) {
    return this.geometries.some((geo) => geo.containsPoint(p));
  }

  /**
   * @param {Point[]} points - Line start and end point as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsLine(points) {
    return this.geometries.some((geo) => geo.intersectsLine(points));
  }

  /**
   * @param {Point[]} points - Rect vertices as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsRect(points) {
    return this.geometries.some((geo) => geo.intersectsRect(points));
  }

  /**
   * @param {Circle} c
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsCircle(c) {
    return this.geometries.some((geo) => geo.intersectsCircle(c));
  }

  /**
   * @param {Polygon} polygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsPolygon(polygon) {
    return this.geometries.some((geo) => geo.intersectsPolygon(polygon));
  }

  /**
   * @param {Geopolygon} geopolygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsGeoPolygon(geopolygon) {
    return this.geometries.some((geo) => geo.intersectsGeoPolygon(geopolygon));
  }
}

export function create(...args) {
  return new GeometryCollection(...args);
}

export default GeometryCollection;
