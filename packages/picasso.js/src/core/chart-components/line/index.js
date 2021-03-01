import component from './line';

/**
 * @typedef {object} ComponentLine
 */

/**
 * @type {string}
 * @memberof ComponentLine
 */
const type = 'line';

export default function line(picasso) {
  picasso.component(type, component);
}
