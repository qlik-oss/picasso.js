import refLineComponent from './refline';

/**
 * @typedef {object} ComponentRefLine
 * @extends ComponentSettings
 * @property {'ref-line'} type component type
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
 *      slope: {
 *        value: 0.5,
 *        label: '0.5'
 *      }
 *    }]
 *  }
 * }
 */

export default function refLine(picasso) {
  picasso.component('ref-line', refLineComponent);
}
