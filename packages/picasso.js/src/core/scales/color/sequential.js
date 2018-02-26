import { interpolateRgb } from 'd3-interpolate';
import extend from 'extend';
import minmax from '../../utils/min-max';
import linear from '../linear';
import resolveSettings from '../settings-resolver';

const DEFAULT_SETTINGS = {
  domain: [],
  range: [],
  invert: false,
  min: NaN,
  max: NaN
};

function generateDomain(range, min, max) {
  const len = range.length;
  if (len === 2) {
    return [min, max];
  }
  const domain = [];
  const part = (max - min) / (len - 1);

  domain.push(min);
  for (let i = 1; i < len - 1; i++) {
    domain.push(min + (part * i));
  }
  domain.push(max);

  return domain;
}

/**
 * @typedef {object} scale--sequential-color
 * @property {string} [type='sequential-color']
 * @property {string[]} [range] - CSS color values of the output range
 * @property {boolean} [invert=false] - Invert range
 * @property {number} [min] - Set an explicit minimum value
 * @property {number} [max] - Set an explicit maximum value
 */

/**
 * @alias scaleSequentialColor
 * @private
 * @param { Object } [settings] Settings for this scale. If both range and domain are specified, they have to fulfill range.length === domain.length, otherwise they will be overriden.
 * @param { number[] } [settings.domain] Numeric values indicating stop limits between start and end values.
 * @param { color[] } [settings.range] CSS color values indicating stop colors between start and end values.
 * @param { field[] } [fields] Fields to dynamically calculate the domain extent.
 * @return { sequentialColor }
 *
 * @example
 * picasso.scaleSequentialColor({
 *  range: ['red', '#fc6', 'green'],
 *  domain: [-40, 0, 100]
 * });
 */

export default function scaleSequentialColor(settings = {}, data = {}, resources = {}) {
  const s = linear(settings, data, resources).clamp(true).interpolate(interpolateRgb);
  const stgns = resolveSettings(settings, DEFAULT_SETTINGS, { data, resources });
  const isDomain = Array.isArray(stgns.domain) && stgns.domain.length;
  const isRange = Array.isArray(stgns.range) && stgns.range.length;

  /**
   * @alias sequentialColor
   * @private
   * @kind function
   * @param { Object } v Object containing a 'value' property
   * @return { string } The blended color
   */
  const fn = s;

  extend(true, fn, s);
  const [min, max] = minmax(stgns, data ? data.fields : []);
  const num = isDomain ? stgns.domain.length : -1;
  const DEFAULT_COLORS = resources.theme ? resources.theme.palette('sequential', num > 0 ? num : 2) : [];

  const range = isRange ? stgns.range : DEFAULT_COLORS;
  fn.range(stgns.invert ? range.slice().reverse() : range.slice());
  fn.domain(isDomain ? stgns.domain : generateDomain(fn.range(), min, max));

  return fn;
}
