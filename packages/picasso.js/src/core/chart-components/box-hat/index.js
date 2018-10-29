import component from './box-hat';

/**
 * @typedef {object} component--box-hat
 * @property {component--box~data} data Box data
 */

/**
 * @type {string}
 * @memberof component--box-hat
 */
const type = 'box-hat';


export default function boxhat(picasso) {
  picasso.component(type, component);
}
