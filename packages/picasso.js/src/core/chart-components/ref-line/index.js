import refLineComponent from './refline';

/**
 * @typedef {object} ComponentRefLine
 * @extends ComponentSettings
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
