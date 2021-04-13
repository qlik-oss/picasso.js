import component from './legend-cat';

/**
 * @typedef {object} ComponentLegendCat
 * @extends ComponentSettings
 * @property {string} scale Reference to categorical color scale
 */

const type = 'legend-cat';

export default function categoricalLegend(picasso) {
  picasso.component(type, component);
}
