import pointMarkerComponent from './point';

/**
 * @typedef {object} ComponentPoint
 * @extends ComponentSettings
 * @example
 * {
    type: 'point',
    data: {
      extract: {
        field: 'Month',
        props: {
          x: { field: 'Margin' },
          y: { field: 'Year' }
        }
      }
    },
    settings: {
      x: { scale: 'm' },
      y: { scale: 'y' },
    }
  }
 */

const type = 'point';

export default function pointMarker(picasso) {
  picasso.component(type, pointMarkerComponent);

  picasso.component('point-marker', pointMarkerComponent); // temporary backwards compatibility - DEPRECATED
}
