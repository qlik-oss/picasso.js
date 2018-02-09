import pointMarkerComponent from './point';

/**
 * @typedef {object} component--point
 */

/**
 * @type {string}
 * @memberof component--point
 */
const type = 'point';

export default function pointMarker(picasso) {
  picasso.component(type, pointMarkerComponent);

  picasso.component('point-marker', pointMarkerComponent); // temporary backwards compatibility - DEPRECATED
}

