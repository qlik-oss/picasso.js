import axisComponent from './axis';

/**
 * @typedef {object} ComponentAxis
 */

/**
 * @type {string}
 * @memberof ComponentAxis
 */

const type = 'axis';

export default function axis(picasso) {
  picasso.component(type, axisComponent);
}
