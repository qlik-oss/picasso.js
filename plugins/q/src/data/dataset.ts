// import augmentH from './augment-hierarchy';
import extend from 'extend';
import SExtractor from './extractor-s';
import { extract as TExtractor, augment as augmentTree } from './extractor-t';
import { findField } from './util';
import field from './field';

type FieldConfig = { value?: (v: unknown) => unknown; type?: string; [key: string]: unknown };

function createFields(path: string, obj: Record<string, unknown>, prefix: string | undefined, parentKey: string, opts: FieldConfig): Array<{ instance: unknown; attrDims?: unknown[]; attrExps?: unknown[]; measures?: unknown[] }> {
  return ((obj[path] as unknown[]) || []).map((meta: unknown, i: number) => {
    const fieldKey = `${parentKey ? `${parentKey}/` : ''}${path}/${i}`;
    const f: { instance: unknown; attrDims?: unknown[]; attrExps?: unknown[]; measures?: unknown[] } = {
      instance: field(
        extend(
          {
            id: `${prefix ? `${prefix}/` : ''}${fieldKey}`,
            key: fieldKey,
            meta,
          },
          opts
        )
      ),
    };
    f.attrDims = createFields(
      'qAttrDimInfo',
      meta as Record<string, unknown>,
      prefix,
      fieldKey,
      extend({}, opts, { value: (v: unknown) => (v as Record<string, unknown>)?.qElemNo, type: 'dimension' })
    );
    f.attrExps = createFields(
      'qAttrExprInfo',
      meta as Record<string, unknown>,
      prefix,
      fieldKey,
      extend({}, opts, { value: (v: unknown) => (v as Record<string, unknown>)?.qNum, type: 'measure' })
    );
    f.measures = createFields(
      'qMeasureInfo',
      meta as Record<string, unknown>,
      prefix,
      fieldKey,
      extend({}, opts, { value: (v: unknown) => (v as Record<string, unknown>)?.qValue, type: 'measure' })
    );
    return f;
  });
}

export default function q({
  key,
  data,
  config = {},
}: { key?: string; data?: object; config?: Record<string, unknown> } = {}) {
  const cache = {
    fields: [],
    wrappedFields: [],
    allFields: [],
    virtualFields: [],
  };

  const cube = data as Record<string, unknown>;
  if (!cube) {
    throw new Error('Missing "data" input');
  }

  if (!cube.qDimensionInfo) {
    throw new Error('The "data" input is not recognized as a hypercube');
  }

  const deps = (q as unknown as Record<string, unknown>).util;

  const opts: Record<string, unknown> = {
    cache,
    cube,
    localeInfo: config.localeInfo,
    fieldExtractor: null,
    pages: null,
    hierarchy: () => null,
    virtualFields: config.virtualFields,
  };

  const dataset = {
    key: () => key,
    raw: () => cube,
    field: (query) => findField(query, opts as { cache: unknown }),
    fields: () => cache.fields.slice(),
    extract: (extractionConfig) =>
      (opts.extractor as (...args: unknown[]) => unknown)(extractionConfig, dataset, cache, deps),
    hierarchy: (hierarchyConfig) =>
      (opts.hierarchy as (...args: unknown[]) => unknown)(dataset, cache, deps, hierarchyConfig),
    _cache: () => cache,
  };

  if (cube.qMode === 'K' || cube.qMode === 'T' || (!cube.qMode && cube.qNodesOnDim)) {
    opts.extractor = TExtractor;
    opts.hierarchy = augmentTree;
    opts.pages = cube.qMode === 'K' ? cube.qStackedDataPages : cube.qTreeDataPages;
  } else if (cube.qMode === 'S') {
    opts.extractor = SExtractor;
    opts.pages = cube.qDataPages;
    opts.hierarchy = augmentTree;
  } else {
    opts.extractor = () => []; // TODO - throw unsupported error?
  }

  opts.fieldExtractor = (f) => (opts.extractor as (...args: unknown[]) => unknown)({ field: f }, dataset, cache, deps);

  const dimAcc = cube.qMode === 'S' ? (d) => d.qElemNumber : undefined;
  const measAcc = cube.qMode === 'S' ? (d) => d.qNum : undefined;

  cache.wrappedFields.push(
    ...createFields('qDimensionInfo', cube, key, '', extend({}, opts, { value: dimAcc, type: 'dimension' }))
  );
  cache.wrappedFields.push(
    ...createFields('qMeasureInfo', cube, key, '', extend({}, opts, { value: measAcc, type: 'measure' }))
  );

  cache.fields = cache.wrappedFields.map((f) => f.instance);

  const traverse = (arr) => {
    arr.forEach((f) => {
      cache.allFields.push(f.instance);
      traverse(f.measures);
      traverse(f.attrDims);
      traverse(f.attrExps);
    });
  };

  traverse(cache.wrappedFields);

  (
    (config.virtualFields || []) as Array<{
      from: string;
      key: string;
      override?: Record<string, unknown>;
      [key: string]: unknown;
    }>
  ).forEach((v) => {
    // key: 'temporal',
    // from: 'qDimensionInfo/0',
    // override: {
    //   value: v => v.qNum,
    // },
    const sourceField = dataset.field(v.from);
    const f = field({
      meta: sourceField.raw(),
      id: `${key}/${v.key}`,
      sourceField,
      fieldExtractor: (ff) => (opts.extractor as (...args: unknown[]) => unknown)({ field: ff }, dataset, cache, deps),
      key: v.key,
      type: sourceField.type(),
      localeInfo: opts.localeInfo,
      value: sourceField.value,
      ...(v.override || {}),
    });
    cache.virtualFields.push(f);
  });

  cache.allFields.push(...cache.virtualFields);

  return dataset;
}
