import {
  scaleOrdinal
} from 'd3-scale';

 /**
 * @alias scaleOrdinal
 * @private
 * @param { Object } settings
 * @param { field[] } [fields]
 * @param { dataset } dataset
 * @return { ordinal }
 */
export default function ordinal(settings = {}, dataset) {
  /**
   * An augmented {@link https://github.com/d3/d3-scale#_ordinal|d3 ordinal scale}
   * @private
   * @alias ordinal
   * @param { Object }
   * @return { number }
   */
  const fn = scaleOrdinal();

  const valueFn = typeof settings.value === 'function' ? settings.value : d => d.value;
  const labelFn = typeof settings.label === 'function' ? settings.label : d => d.label;
  const items = dataset.items || [];
  const domainToDataMapping = {};
  let values = [];
  let labels = [];
  for (let i = 0; i < items.length; i++) {
    let v = valueFn(items[i]);
    if (values.indexOf(v) === -1) {
      values.push(v);
      labels.push(labelFn(items[i]));
      domainToDataMapping[v] = i;
    }
  }

  fn.data = () => dataset;

  fn.labels = () => labels;

  fn.label = (domainValue) => {
    const idx = values.indexOf(domainValue);
    return labels[idx];
  };

  fn.datum = domainValue => items[domainToDataMapping[domainValue]];

  if (settings.range) {
    fn.range(settings.range);
  }

  if (settings.domain) {
    fn.domain(settings.domain);
  } else {
    fn.domain(values);
  }
  return fn;
}
