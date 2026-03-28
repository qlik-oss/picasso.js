import { createFromMetaInfo } from '../formatter';

export default function qField({
  meta,
  id,
  key,
  localeInfo,
  fieldExtractor,
  value,
  type,
  sourceField,
}: {
  meta?: {
    qFallbackTitle?: string;
    label?: string;
    qMin?: number;
    qMax?: number;
    qTags?: string[];
    [key: string]: unknown;
  };
  id?: unknown;
  key?: unknown;
  localeInfo?: unknown;
  fieldExtractor?: (f: unknown) => unknown;
  value?: unknown;
  type?: unknown;
  sourceField?: unknown;
  [key: string]: unknown;
} = {}): Record<string, unknown> {
  let values: unknown;

  const valueFn = value || (type === 'dimension' ? (d: unknown) => (d as Record<string, unknown>)?.qElemNo : (d: unknown) => (d as Record<string, unknown>)?.qValue);
  const labelFn = (d: unknown) => (d as Record<string, unknown>)?.qText || '';
  const reduce = type === 'dimension' ? 'first' : 'avg';
  const formatter = createFromMetaInfo(meta, localeInfo);
  const reduceLabel = type === 'dimension' ? 'first' : (labels: unknown, v: unknown) => formatter(v);

  const f: Record<string, unknown> = {
    id: () => id,
    key: () => key,
    raw: () => meta,
    title: () => (meta?.qFallbackTitle || meta?.label),
    type: () => type,
    origin: () => sourceField,
    items: () => {
      if (!values) {
        values = fieldExtractor?.(f);
      }
      return values;
    },
    min: () => meta?.qMin,
    max: () => meta?.qMax,
    value: valueFn,
    label: labelFn,
    reduce,
    reduceLabel,
    formatter: () => formatter,
    tags: () => meta?.qTags,
  };

  return f;
}
