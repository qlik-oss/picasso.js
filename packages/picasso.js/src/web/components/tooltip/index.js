import tooltip from './tooltip';

/**
 * @typedef {object} ComponentTooltip
 */

/**
 * @type {string}
 * @memberof ComponentTooltip
 */
const type = 'tooltip';

export default function addTooltip(picasso) {
  picasso.component(type, tooltip);
}
