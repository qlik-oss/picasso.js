import pointMarkerComponent from './point';

/**
 * @typedef {object} ComponentPoint
 * @extends ComponentSettings
 */

const type = 'point';

export default function pointMarker(picasso) {
  picasso.component(type, pointMarkerComponent);

  picasso.component('point-marker', pointMarkerComponent); // temporary backwards compatibility - DEPRECATED
}
