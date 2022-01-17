import component from './legend-cat';

/**
 * @typedef {object} ComponentLegendCat
 * @extends ComponentSettings
 * @property {'legend-cat'} type component type
 * @property {string} scale Reference to categorical color scale
 * @example
{
  type: 'legend-cat',
  scale: '<categorical-color-scale>',
}
 */

const type = 'legend-cat';

export default function categoricalLegend(picasso) {
  picasso.component(type, component);
}
