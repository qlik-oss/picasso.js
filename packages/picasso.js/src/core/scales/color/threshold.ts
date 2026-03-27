import type { ScaleSettings, ScaleData, ScaleResources } from '../settings-resolver';
import { scaleThreshold, scaleLinear } from 'd3-scale';
import { notNumber } from '../../utils/is-number';
import minmax from '../../utils/min-max';
import sequential from './sequential';
import resolveSettings from '../settings-resolver';

// const DEFAULT_COLORS = ['rgb(180,221,212)', 'rgb(34, 83, 90)'];

const DEFAULT_SETTINGS = {
  domain: [],
  range: [],
  invert: false,
  min: NaN,
  max: NaN,
  nice: false,
};

function generateDomain(range, min, max) {
  const len = range.length;
  if (len === 2) {
    return [min + (max - min) / 2];
  }
  const domain = [];
  const part = (max - min) / len;

  for (let i = 1; i < len; i++) {
    domain.push(min + part * i);
  }
  return domain;
}

function getBreaks(domain) {
  const ret = [];
  for (let i = 0; i < domain.length - 1; i++) {
    ret.push((domain[i] + domain[i + 1]) / 2);
  }
  return ret;
}

function generateRange(domain, colors, min, max) {
  min = domain[0];
  max = domain && domain.length >= 2 ? domain[domain.length - 1] : max;
  const seq = sequential().domain([min, max]).range(colors);
  const values = [min, ...getBreaks(domain), max];
  return values.map((v) => seq(v));
}

function generateNiceDomain(range, min, max) {
  const numPoints = range.length === 2 ? 10 : Math.max(1, range.length);
  const lin = scaleLinear().domain([min, max]).nice(numPoints);
  const domain = lin.ticks(numPoints);

  if (!range || !range.length) {
    return domain;
  }

  // remove values from endpoints
  const num = Math.max(0, range.length - 1);
  while (domain.length > num) {
    if (domain[0] - min <= max - domain[domain.length - 1]) {
      domain.shift();
    } else {
      domain.pop();
    }
  }

  return domain;
}

/**
 * @typedef {object} ScaleThresholdColor
 * @property {string} [type='threshold-color']
 * @property {number[]} [domain] Values defining the thresholds
 * @property {string[]} [range] - CSS color values of the output range
 * @property {boolean} [invert=false] - Invert range
 * @property {number} [min] - Set an explicit minimum value
 * @property {number} [max] - Set an explicit maximum value
 * @property {boolean} [nice=false] If set to true, will generate 'nice' domain values. Ignored if domain is set.
 */

/**
 * @alias scaleThresholdColor
 * @private
 * @param { object } [settings] Settings for this scale. If both domain and range are specified, they have to fulfill domain.length === range.length + 1,  otherwise they will be overriden.
 * @param { number[] } [settings.domain] Values defining the thresholds.
 * @param { color[] } [settings.range] CSS color values of the output range.
 * @param { boolean } [settings.nice=false] If set to true, will generate 'nice' domain values. Ignored if domain is set.
 * @param { number } [settings.min] Minimum value to generate domain extent from. Ignored if domain is set.
 * @param { number } [settings.max] Maximum value to generate domain extend from. Ignored if domain is set.
 * @param { field[] } [fields] Fields to dynamically calculate the domain extent from. Ignored if min/max are set.
 * @return { thresholdColor }
 *
 * @example
 * let t = threshold({
 *   range: ['black', 'white'],
 *   domain: [25,50,75],
 *   max: 100,
 *   min: 0
 * });
 * t.domain(); // [25,50,75]
 * t.range(); // Generates from colors and domain: ['rgb(0,0,0)','rgb(85,85,85)','rgb(170,170,170)','rgb(255,255,255)']
 */

export default function scaleThresholdColor(
  settings: ScaleSettings = {},
  data: ScaleData = {},
  resources: ScaleResources = {}
) {
  const d3Scale = scaleThreshold();
  const stgns = resolveSettings(settings, DEFAULT_SETTINGS, { data, resources }) as typeof DEFAULT_SETTINGS &
    Record<string, unknown>;
  const isDomain = Array.isArray(stgns.domain) && (stgns.domain as unknown[]).length;
  const isRange = Array.isArray(stgns.range) && (stgns.range as unknown[]).length;

  /**
   * @alias thresholdColor
   * @private
   * @param { object } v Object literal containing a 'value' property.
   * @return { string } A CSS color from the scale's range.
   */
  function fn(v) {
    if (notNumber(v)) {
      return NaN;
    }
    return d3Scale(v);
  }

  Object.keys(d3Scale).forEach((key) => (fn[key] = d3Scale[key]));

  const fields = data.fields;

  const [min, max] = minmax(stgns, fields);
  const num = isDomain ? (stgns.domain as unknown[]).length : -1;
  const DEFAULT_COLORS = resources.theme
    ? (resources.theme as Record<string, (...args: unknown[]) => unknown>).palette('sequential', num > 0 ? num : 2)
    : [];

  let range: unknown = isRange ? stgns.range : DEFAULT_COLORS;
  let domain: unknown[] = [];

  if (isDomain) {
    domain = stgns.domain as unknown[];
  } else if (stgns.nice) {
    domain = generateNiceDomain(range as unknown[], min, max);
  } else {
    domain = [min + (max - min) / 2];
  }

  if ((range as unknown[]).length > domain.length + 1) {
    // Generate limits from range
    domain = generateDomain(range as unknown[], min, max);
  } else if ((range as unknown[]).length < domain.length + 1) {
    // Generate additional colors
    range = generateRange(domain as number[], range as string[], min, max);
  }

  fn.data = () => data;

  (fn as typeof d3Scale).range(stgns.invert ? (range as unknown[]).slice().reverse() : (range as unknown[]));
  (fn as typeof d3Scale).domain(domain as number[]);

  return fn;
}
