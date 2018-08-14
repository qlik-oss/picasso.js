import tooltip from './tooltip';

/**
 * @typedef {object} component--tooltip
 */

/**
 * @type {string}
 * @memberof component--tooltip
 */
const type = 'tooltip';

export default function addTooltip(picasso) {
  picasso.component(type, tooltip);
}
