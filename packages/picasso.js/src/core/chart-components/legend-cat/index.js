import component from './legend-cat';

/**
 * @typedef {object} component--legend-cat
 * @property {string} scale
 */

/**
 * @type {string}
 * @memberof component--legend-cat
 */
const type = 'legend-cat';

export default function categoricalLegend(picasso) {
  picasso.component(type, component);
}
