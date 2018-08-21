import component from './line';

/**
 * @typedef {object} component--line
 */

/**
 * @type {string}
 * @memberof component--line
 */
const type = 'line';

export default function pointMarker(picasso) {
  picasso.component(type, component);
}
