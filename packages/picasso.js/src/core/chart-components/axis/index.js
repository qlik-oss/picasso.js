import axisComponent from './axis';

/**
 * @typedef {object} ComponentAxis
 * @property {string} type name of the component
 * @property {string} scale reference to band or linear scale
 * @property {ComponentAxis.DiscreteSettings|ComponentAxis.ContinuousSettings} settings discrete or continuous axis settings
 * @example
 * {
 *  type: 'axis',
 *  scale: '<name-of-scale>'
 * }
 */

const type = 'axis';

export default function axis(picasso) {
  picasso.component(type, axisComponent);
}
