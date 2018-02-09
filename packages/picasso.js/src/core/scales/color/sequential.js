import { interpolateRgb } from 'd3-interpolate';
import extend from 'extend';
import minmax from '../../utils/min-max';
import linear from '../linear';

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

export default function scaleSequentialColor(settings = {}, data = {}, { theme } = {}) {
  const s = linear(settings, data, {}).clamp(true).interpolate(interpolateRgb);

  /**
   * @alias sequentialColor
   * @private
   * @kind function
   * @param { Object } v Object containing a 'value' property
   * @return { string } The blended color
   */
  const fn = s;

  extend(true, fn, s);
  const [min, max] = minmax(settings, data ? data.fields : []);
  const num = settings.domain ? settings.domain.length : -1;
  const DEFAULT_COLORS = theme ? theme.palette('sequential', num > 0 ? num : 2) : [];
  const range = typeof settings.range === 'function' ? settings.range(data, { theme }) : settings.range || DEFAULT_COLORS;
  fn.range(settings.invert ? range.slice().reverse() : range.slice());
  fn.domain(settings.domain || generateDomain(fn.range(), min, max));

  return fn;
}
