import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import extend from 'extend';

import { notNumber } from '../utils/is-number';
import { generateContinuousTicks } from './ticks/tick-generators';
import resolveSettings from './settings-resolver';

export const DEFAULT_SETTINGS = {
  min: NaN,
  max: NaN,
  expand: NaN,
  include: [],
  invert: false,
};

export const DEFAULT_TICKS_SETTINGS = {
  tight: false,
  forceBounds: false,
  values: undefined,
  count: NaN,
  distance: 100,
};

export const DEFAULT_MINORTICKS_SETTINGS = {
  count: NaN,
};

/**
 * @typedef {object} ScaleLinear
 * @property {string} [type='linear']
 * @property {number} [expand] - Expand the output range
 * @property {boolean} [invert=false] - Invert the output range
 * @property {number[]} [include] - Include specified numbers in the output range
 * @property {object} [ticks]
 * @property {boolean} [ticks.tight = false]
 * @property {boolean} [ticks.forceBounds = false]
 * @property {number} [ticks.distance = 100]  - Approximate distance between each tick
 * @property {number[]|object[]} [ticks.values] - If set, ticks are no longer generated but instead equal to this set
 * @property {number} [ticks.count]
 * @property {object} [minorTicks]
 * @property {number} [minorTicks.count = 3]
 * @property {number} [min] - Set an explicit minimum value
 * @property {number} [max] - Set an explicit maximum value
 */

function getMinMax(settings, fields) {
  const min = +settings.min;
  const max = +settings.max;
  let fieldMin = 0;
  let fieldMax = 1;
  if (fields && fields[0]) {
    const minValues = fields.map((m) => m.min()).filter((v) => !isNaN(v));
    const maxValues = fields.map((m) => m.max()).filter((v) => !isNaN(v));
    fieldMin = minValues.length ? Math.min(...minValues) : Number.NaN;
    fieldMax = maxValues.length ? Math.max(...maxValues) : Number.NaN;

    if (isNaN(fieldMin) || isNaN(fieldMax)) {
      fieldMin = -1;
      fieldMax = 1;
    } else if (fieldMin === fieldMax && fieldMin === 0) {
      fieldMin = -1;
      fieldMax = 1;
    } else if (fieldMin === fieldMax && fieldMin) {
      fieldMin -= Math.abs(fieldMin * 0.1);
      fieldMax += Math.abs(fieldMax * 0.1);
    } else if (!isNaN(settings.expand)) {
      const range = fieldMax - fieldMin;
      fieldMin -= range * settings.expand;
      fieldMax += range * settings.expand;
    }

    if (Array.isArray(settings.include)) {
      const i = settings.include.filter((n) => !isNaN(n));
      fieldMin = Math.min(...i, fieldMin);
      fieldMax = Math.max(...i, fieldMax);
    }
  }

  return {
    mini: !isNaN(min) ? min : fieldMin,
    maxi: !isNaN(max) ? max : fieldMax,
  };
}

function initNormScale(normScale, scale) {
  if (normScale.instance) {
    return;
  }
  normScale.instance = scale.copy();
  normScale.instance.domain([scale.start(), scale.end()]);
  normScale.instance.clamp(true);
  normScale.instance.range(normScale.invert ? [1, 0] : [0, 1]);
}
/**
 * @alias scaleLinear
 * @private
 * @param { object } settings
 * @param { field[] } [fields]
 * @return { linear }
 */

export default function scaleLinear(settings = {}, data = {}, resources = {}) {
  const d3Scale = d3ScaleLinear();
  const normScale = { instance: null, invert: false };
  const ctx = { data, resources };
  const stgns = resolveSettings(settings, DEFAULT_SETTINGS, ctx);
  stgns.ticks = resolveSettings(settings.ticks, DEFAULT_TICKS_SETTINGS, ctx);
  stgns.minorTicks = resolveSettings(settings.minorTicks, DEFAULT_MINORTICKS_SETTINGS, ctx);
  let tickCache;

  /**
   * @alias linear
   * @private
   * @param { Object } value
   * @return { number }
   */
  function fn(v) {
    if (notNumber(v)) {
      return NaN;
    }
    return d3Scale(v);
  }

  fn.data = () => data;

  /**
   * {@link https://github.com/d3/d3-scale#continuous_invert }
   * @param { number } value The inverted value
   * @return { number } The inverted scaled value
   */
  fn.invert = function invert(value) {
    return d3Scale.invert(value);
  };

  /**
   * {@link https://github.com/d3/d3-scale#continuous_rangeRound }
   * @param { number[] } values Range values
   * @return { linear } The instance this method was called on
   */
  fn.rangeRound = function rangeRound(values) {
    d3Scale.rangeRound(values);
    return fn;
  };

  /**
   * {@link https://github.com/d3/d3-scale#continuous_clamp }
   * @param { boolean } [ value=true ] TRUE if clamping should be enabled
   * @return { linear } The instance this method was called on
   */
  fn.clamp = function clamp(value = true) {
    d3Scale.clamp(value);
    return fn;
  };

  /**
   * Get cached ticks (if any)
   * @return { number | undefined }
   */
  fn.cachedTicks = function fnCachedTicks() {
    return tickCache;
  };

  /**
   * Clear the tick cache
   * @return {number | undefined}
   */
  fn.clearTicksCache = function fnClearTicks() {
    tickCache = undefined;
    return this;
  };

  /**
   * {@link https://github.com/d3/d3-scale#continuous_ticks }
   * @param { Object } input Number of ticks to generate or an object passed to tick generator
   * @return { number[] | Object } Array of ticks or any type the custom tick generator returns
   */
  fn.ticks = function ticks(input) {
    if (input !== null && typeof input === 'object') {
      input.settings = input.settings || {};
      // TODO Discontinue support for custom ticks settings as argument
      input.settings = extend(true, {}, stgns, input.settings);
      input.scale = fn;
      tickCache = generateContinuousTicks(input);
      return tickCache;
    }

    tickCache = d3Scale.ticks(input);
    return tickCache;
  };

  /**
   * {@link https://github.com/d3/d3-scale#continuous_nice }
   * @param { number } count
   * @return { linear } The instance this method was called on
   */
  fn.nice = function nice(count) {
    d3Scale.nice(count);

    return fn;
  };

  // TODO Support this?
  fn.tickFormat = function tickFormat(count, format) {
    return d3Scale.tickFormat(count, format);
  };

  // TODO Support this?
  fn.interpolate = function interpolate(func) {
    d3Scale.interpolate(func);
    return fn;
  };

  /**
   * @param { number[] } [values] Set or Get domain values
   * @return { linear | Number[] } The instance this method was called on if a parameter is provided, otherwise the current domain is returned
   */
  fn.domain = function domain(values) {
    if (arguments.length) {
      d3Scale.domain(values);
      if (normScale.instance) {
        normScale.instance.domain([fn.start(), fn.end()]);
      }
      return fn;
    }
    return d3Scale.domain();
  };

  /**
   * @param { number[] } [values] Set or Get range values
   * @return { linear | number[] } The instance this method was called on if a parameter is provided, otherwise the current range is returned
   */
  fn.range = function range(values) {
    if (arguments.length) {
      d3Scale.range(values);

      return fn;
    }
    return d3Scale.range();
  };

  /**
   * Get the first value of the domain
   * @return { number }
   */
  fn.start = function start() {
    return fn.domain()[0];
  };

  /**
   * Get the last value of the domain
   * @return { number }
   */
  fn.end = function end() {
    return fn.domain()[this.domain().length - 1];
  };

  /**
   * Get the minimum value of the domain
   * @return { number }
   */
  fn.min = function min() {
    return Math.min(this.start(), this.end());
  };

  /**
   * Get the maximum value of the domain
   * @return { number }
   */
  fn.max = function max() {
    return Math.max(this.start(), this.end());
  };

  /**
   * Divides the domain and range into uniform segments, based on start and end value
   * @param  { number } segments The number of segments
   * @return { function } The instance this method was called on
   * @example
   * let s = linear();
   * s.domain([0, 10]);
   * s.range([0, 1]);
   * s.classify( 2 );
   * s.domain(); // [10, 5, 5, 0]
   * s.range(); // [0.75, 0.75, 0.25, 0.25]
   */
  fn.classify = function classify(segments) {
    let valueRange = (fn.start() - fn.end()) / segments,
      domain = [fn.end()],
      range = [],
      samplePos = valueRange / 2;

    for (let i = 0; i < segments; i++) {
      let lastVal = domain[domain.length - 1] || 0,
        calIntervalPos = lastVal + valueRange,
        calSamplePos = lastVal + samplePos,
        sampleColValue = fn(calSamplePos);

      domain.push(...[calIntervalPos, calIntervalPos]);
      range.push(...[sampleColValue, sampleColValue]);
    }
    domain.pop();
    fn.domain(domain);
    fn.range(range);

    return fn;
  };

  fn.copy = function copy() {
    const cop = scaleLinear(settings, data, resources);
    cop.domain(fn.domain());
    cop.range(fn.range());
    cop.clamp(d3Scale.clamp());
    return cop;
  };

  /**
   * @param {number} d - A domain value
   * @return {number} A normalized range output given in range 0-1
   * @example
   * const scale = scaleLinear().domain([0, 10]).range([0, 10000]);
   * scale.norm(5); // Returns 0.5
   * scale(5); // Returns 5000
   *
   * scale.domain([0, 2, 10]);
   * scale.norm(5); // Returns 0.5
   */
  fn.norm = function norm(d) {
    initNormScale(normScale, fn);

    return normScale.instance(d);
  };

  /**
   * @param {number} d - A normalized value in range 0-1
   * @return {number} A corresponding domain value
   * @example
   * const scale = scaleLinear().domain([0, 10]).range([0, 10000]);
   * scale.normInvert(0.5); // Returns 5
   * scale.invert(5000); // Returns 5
   */
  fn.normInvert = function norm(t) {
    initNormScale(normScale, fn);

    return normScale.instance.invert(t);
  };

  const { mini, maxi } = getMinMax(stgns, data ? data.fields : []);

  fn.domain([mini, maxi]);
  fn.range(stgns.invert ? [1, 0] : [0, 1]);
  normScale.invert = stgns.invert;

  return fn;
}
