import definition from './brush-area';

/**
 * A component that can brush a rectangular area
 * @typedef {object} ComponentBrushArea
 * @property {string} type Name of the component
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
