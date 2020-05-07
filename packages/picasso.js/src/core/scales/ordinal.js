import { scaleOrdinal } from 'd3-scale';
import extend from 'extend';
import resolveSettings from './settings-resolver';

const DEFAULT_SETTINGS = {
  domain: [],
  range: [],
};

/**
 * @alias scaleOrdinal
 * @private
 * @param { Object } settings
 * @param { field[] } [fields]
 * @param { dataset } data
 * @return { ordinal }
 */
export default function ordinal(settings = {}, data = {}, resources = {}) {
  /**
   * An augmented {@link https://github.com/d3/d3-scale#_ordinal|d3 ordinal scale}
   * @private
   * @alias ordinal
   * @param { Object }
   * @return { number }
   */
  const fn = scaleOrdinal();

  const ctx = { data, resources };
  const stgns = resolveSettings(settings, DEFAULT_SETTINGS, ctx);

  const valueFn = typeof settings.value === 'function' ? settings.value : (d) => d.datum.value;
  const labelFn = typeof settings.label === 'function' ? settings.label : (d) => d.datum.label;
  const items = data.items || [];
  const domainToDataMapping = {};
  const values = [];
  const labels = [];

  for (let i = 0; i < items.length; i++) {
    const arg = extend({ datum: items[i] }, ctx);
    const v = valueFn(arg, i);
    if (values.indexOf(v) === -1) {
      values.push(v);
      labels.push(labelFn(arg, i));
      domainToDataMapping[v] = i;
    }
  }

  fn.data = () => data;

  fn.labels = () => labels;

  fn.label = (domainValue) => labels[values.indexOf(domainValue)];

  fn.datum = (domainValue) => items[domainToDataMapping[domainValue]];

  fn.range(stgns.range);

  if (Array.isArray(stgns.domain) && stgns.domain.length) {
    fn.domain(stgns.domain);
  } else {
    fn.domain(values);
  }
  return fn;
}
