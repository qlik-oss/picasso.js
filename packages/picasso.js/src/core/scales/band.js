import extend from 'extend';
import { scaleBand as d3ScaleBand } from 'd3-scale';
import { generateDiscreteTicks } from './ticks/tick-generators';
import resolveSettings from './settings-resolver';

export const DEFAULT_SETTINGS = {
  padding: 0,
  paddingInner: NaN,
  paddingOuter: NaN,
  align: 0.5,
  invert: false,
  maxPxStep: NaN
};

/**
 * @typedef {object} scale--band
 * @property {string} [type='band']
 * @property {number} [padding] - {@link https://github.com/d3/d3-scale#band_padding}
 * @property {number} [paddingInner] - {@link https://github.com/d3/d3-scale#band_paddingInner}
 * @property {number} [paddingOuter] - {@link https://github.com/d3/d3-scale#band_paddingOuter}
 * @property {number} [align] - {@link https://github.com/d3/d3-scale#band_align}
 * @property {boolean} [invert=false] - Invert the output range
 * @property {number} [maxPxStep] - Explicitly limit the bandwidth to a pixel value
 * @property {function} [label] - Callback label function, applied on each datum
 * @property {function} [value] - Callback value function, applied on each datum
 */

/**
 * @alias scaleBand
 * @memberof picasso
 * @private
 * @param { Object } settings
 * @param { fields[] } [fields]
 * @param { dataset } [dataset]
 * @return { band }
 */

export default function scaleBand(settings = {}, data = {}, resources = {}) {
  /**
   * An augmented {@link https://github.com/d3/d3-scale#_band|d3 band scale}
   * @alias band
   * @private
   * @kind function
   * @param { Object } value
   * @return { number }
   */
  const band = d3ScaleBand();
  const ctx = { data, resources };
  const stgns = resolveSettings(settings, DEFAULT_SETTINGS, ctx);
  const items = data.items || [];
  const domainToDataMapping = {};
  const values = [];
  const labels = [];

  // I would like to define this outside of scaleBand but it cause the documentation to be in the wrong order
  function augmentScaleBand(band, settings) { // eslint-disable-line no-shadow
    band.data = () => data;

    band.datum = domainValue => items[domainToDataMapping[domainValue]];

    /**
     * Get the first value of the domain
     * @return { number }
     */
    band.start = function start() {
      return band.domain()[0];
    };

    /**
     * Get the last value of the domain
     * @return { number }
     */
    band.end = function end() {
      return band.domain()[band.domain().length - 1];
    };

    band.labels = () => labels;

    /**
     * Generate discrete ticks
     * @return {Object[]} Array of ticks
     */
    band.ticks = function ticks(input = {}) {
      input.scale = band;
      return generateDiscreteTicks(input, settings.trackBy || 'label');
    };
  }
  augmentScaleBand(band, settings);

  /**
   * if required creates a new scale with a restricted range
   * so that step size is at most maxPxStep
   * otherwise it returns itself
   * @param { number } size
   * @return { band }
   */
  band.pxScale = function pxScale(size) {
    const max = stgns.maxPxStep;
    if (isNaN(max)) {
      return band;
    }
    const n = band.domain().length;
    const sizeRelativeToStep = Math.max(1, (n - band.paddingInner()) + (2 * band.paddingOuter()));

    if (sizeRelativeToStep * max >= size) {
      return band;
    }

    const newBand = band.copy();
    newBand.type = band.type;
    augmentScaleBand(newBand, settings);
    const t = (sizeRelativeToStep * max) / size;
    const offset = (1 - t) * band.align();
    newBand.range(stgns.invert ? [t + offset, offset] : [offset, t + offset]);

    return newBand;
  };

  const valueFn = typeof settings.value === 'function' ? settings.value : d => d.datum.value;
  const labelFn = typeof settings.label === 'function' ? settings.label : d => d.datum.label;

  for (let i = 0; i < items.length; i++) {
    const arg = extend({ datum: items[i] }, ctx);
    const v = valueFn(arg, i);
    if (values.indexOf(v) === -1) {
      values.push(v);
      labels.push(labelFn(arg, i));
      domainToDataMapping[v] = i;
    }
  }

  band.domain(values);
  band.range(stgns.invert ? [1, 0] : [0, 1]);

  band.padding(isNaN(stgns.padding) ? 0 : stgns.padding);
  if (!isNaN(stgns.paddingInner)) { band.paddingInner(stgns.paddingInner); }
  if (!isNaN(stgns.paddingOuter)) { band.paddingOuter(stgns.paddingOuter); }
  band.align(isNaN(stgns.align) ? 0.5 : stgns.align);

  return band;
}
