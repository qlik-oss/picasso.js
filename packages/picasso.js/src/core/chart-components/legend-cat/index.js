import component from './legend-cat';

/**
 * @typedef {object} ComponentLegendCat
 * @property {string} scale
 */

/**
 * @type {string}
 * @memberof ComponentLegendCat
 */
const type = 'legend-cat';

export default function categoricalLegend(picasso) {
  picasso.component(type, component);
}
