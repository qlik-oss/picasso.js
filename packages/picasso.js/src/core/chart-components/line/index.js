import component from './line';

/**
 * @typedef {object} ComponentLine
 * @extends ComponentSettings
 */

const type = 'line';

export default function line(picasso) {
  picasso.component(type, component);
}
