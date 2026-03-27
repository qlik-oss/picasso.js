import definition from './brush-area';

/**
 * A component that can brush a rectangular area
 * @typedef {object} ComponentBrushArea
 * @extends ComponentSettings
 * @property {'brush-area'} type component type
 * @example
 * {
 *  type: 'brush-area',
 *  brush: {
 *    components: [{ key: '<target-component>', contexts: ['highlight'] }]
 *  }
 * }
 */

export default function areaBrush(picasso) {
  picasso.component('brush-area', definition);
}
