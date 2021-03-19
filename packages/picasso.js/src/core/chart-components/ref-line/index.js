import refLineComponent from './refline';

/**
 * @typedef {object} ComponentRefLine
 * @property {string} type Name of the component
 * @example
 * {
 *  type: 'ref-line',
 *  lines: {
 *    y: [{
 *      scale: 'y',
 *      value: 5000,
 *      label: {
 *        text: 'value label'
 *      }
 *    }]
 *  }
 * }
 */

export default function refLine(picasso) {
  picasso.component('ref-line', refLineComponent);
}
