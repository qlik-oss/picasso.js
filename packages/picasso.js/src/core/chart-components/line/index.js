import component from './line';

/**
 * @typedef {object} ComponentLine
 */

/**
 * Name of the component
 * @type {string}
 * @memberof ComponentLine
 */
const type = 'line';

export default function line(picasso) {
  picasso.component(type, component);
}
