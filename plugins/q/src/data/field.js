import { createFromMetaInfo } from '../formatter';

export default function qField({ meta, id, key, localeInfo, fieldExtractor, value, type, sourceField } = {}) {
  let values;

  const valueFn = value || (type === 'dimension' ? (d) => d.qElemNo : (d) => d.qValue);
  const labelFn = (d) => d.qText || '';
  const reduce = type === 'dimension' ? 'first' : 'avg';
  const formatter = createFromMetaInfo(meta, localeInfo);
  const reduceLabel = type === 'dimension' ? 'first' : (labels, v) => formatter(v);

  const f = {
    id: () => id,
    key: () => key,
    raw: () => meta,
    title: () => meta.qFallbackTitle || meta.label,
    type: () => type,
    origin: () => sourceField,
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
    reduceLabel,
    formatter: () => formatter,
    tags: () => meta.qTags,
  };

  return f;
}
