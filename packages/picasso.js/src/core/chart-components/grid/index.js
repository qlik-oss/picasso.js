import gridLineComponent from './line';

/**
 * @typedef {object} ComponentGridLineSettings
 * @property {object} x
 * @property {string} x.scale - The scale to use along x
 * @property {object} y
 * @property {string} y.scale - The scale to use along y
 * @property {object} [ticks]
 * @property {boolean} [ticks.show=true]
 * @property {string} [ticks.stroke='black']
 * @property {number} [ticks.strokeWidth='1']
 * @property {string} [ticks.strokeDasharray]
 * @property {object} [minorTicks]
 * @property {boolean} [minorTicks.show=true]
 * @property {string} [minorTicks.stroke='black']
 * @property {number} [minorTicks.strokeWidth='1']
 * @property {string} [minorTicks.strokeDasharray]
 */

export default function gridLine(picasso) {
  picasso.component('grid-line', gridLineComponent);
}
