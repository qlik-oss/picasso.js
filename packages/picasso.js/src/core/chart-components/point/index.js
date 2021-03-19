import pointMarkerComponent from './point';

/**
 * @typedef {object} ComponentPoint
 */

/**
 * Name of the component
 * @type {string}
 * @memberof ComponentPoint
 */
const type = 'point';

export default function pointMarker(picasso) {
  picasso.component(type, pointMarkerComponent);

  picasso.component('point-marker', pointMarkerComponent); // temporary backwards compatibility - DEPRECATED
}
