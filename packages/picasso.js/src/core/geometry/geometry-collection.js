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
   * @param {point} p
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  containsPoint(p) {
    return this.geometries.some((geo) => geo.containsPoint(p));
  }

  /**
   * @param {point[]} points - Line start and end point as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsLine(points) {
    return this.geometries.some((geo) => geo.intersectsLine(points));
  }

  /**
   * @param {point[]} points - Rect vertices as an array of points
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsRect(points) {
    return this.geometries.some((geo) => geo.intersectsRect(points));
  }

  /**
   * @param {circle} c
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
   * @param {GeoPolygon} geopolygon
   * @returns {boolean} True if there is an intersection, false otherwise
   */
  intersectsGeoPolygon(geopolygon) {
    return this.geometries.some((geo) => geo.intersectsGeoPolygon(geopolygon));
  }
}

function create(...args) {
  return new GeometryCollection(...args);
}

export { GeometryCollection as default, create };
