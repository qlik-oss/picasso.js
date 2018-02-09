import { createFromMetaInfo } from '../formatter';

// const tagsFn = d => d.qTags;
const elemNoFn = cube => (cube.qMode === 'S' ? (d => d.qElemNumber) : (d => d.qElemNo));
const measureValue = cube => (cube.qMode === 'S' ? (d => d.qNum) : (d => d.qValue));

export default function qField({
  meta,
  id,
  key,
  cube,
  localeInfo,
  fieldExtractor,
  value
 } = {}) {
  let values;

  const type = ('qStateCounts' in meta || 'qSize' in meta) ? 'dimension' : 'measure';
  const valueFn = value || (type === 'dimension' ? elemNoFn(cube) : measureValue(cube));
  const labelFn = d => d.qText || '';
  const reduce = type === 'dimension' ? 'first' : 'avg';
  const formatter = createFromMetaInfo(meta, localeInfo);

  const f = {
    id: () => id,
    key: () => key,
    raw: () => meta,
    title: () => meta.qFallbackTitle || meta.label,
    type: () => type,
    items: () => {
      if (!values) {
        values = fieldExtractor(f);
      }
      return values;
    },
    min: () => meta.qMin,
    max: () => meta.qMax,
    value: valueFn,
    label: labelFn,
    reduce,
    formatter: () => formatter,
    tags: () => meta.qTags
  };

  return f;
}
