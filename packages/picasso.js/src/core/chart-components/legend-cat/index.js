import component from './legend-cat';

/**
 * @typedef {object} ComponentLegendCat
 * @property {string} scale Reference to categorical color scale
 */

/**
 * Name of the component
 * @type {string}
 * @memberof ComponentLegendCat
 */
const type = 'legend-cat';

export default function categoricalLegend(picasso) {
  picasso.component(type, component);
}
