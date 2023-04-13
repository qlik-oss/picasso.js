// import augmentH from './augment-hierarchy';
import extend from 'extend';
import SExtractor from './extractor-s';
import { extract as TExtractor, augment as augmentTree } from './extractor-t';
import { findField } from './util';
import field from './field';

function createFields(path, obj, prefix, parentKey, opts) {
  return (obj[path] || []).map((meta, i) => {
    const fieldKey = `${parentKey ? `${parentKey}/` : ''}${path}/${i}`;
    const f = {
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
      meta,
      prefix,
      fieldKey,
      extend({}, opts, { value: (v) => v?.qElemNo, type: 'dimension' })
    );
    f.attrExps = createFields(
      'qAttrExprInfo',
      meta,
      prefix,
      fieldKey,
      extend({}, opts, { value: (v) => v?.qNum, type: 'measure' })
    );
    f.measures = createFields(
      'qMeasureInfo',
      meta,
      prefix,
      fieldKey,
      extend({}, opts, { value: (v) => v?.qValue, type: 'measure' })
    );
    return f;
  });
}

export function handleColumnOrderForSMode(cube) {
  const columnOrder = cube.qColumnOrder || cube.columnOrder;
  const rearrangeToDefaultOrder = (arr, order) => {
    const temp = arr.slice();
    for (let i = 0; i < order.length; i++) {
      arr[order[i]] = temp[i];
    }
  };

  if (Array.isArray(columnOrder) && columnOrder.some((el, i) => el !== i)) {
    const { qDataPages } = cube;
    qDataPages.forEach((dataPage) => {
      const { qMatrix } = dataPage;
      qMatrix.forEach((row) => {
        rearrangeToDefaultOrder(row, columnOrder);
      });
    });

    rearrangeToDefaultOrder(cube.qEffectiveInterColumnSortOrder, columnOrder);
    cube.qColumnOrder = [];
    cube.columnOrder = [];
  }
}

export default function q({ key, data, config = {} } = {}) {
  const cache = {
    fields: [],
    wrappedFields: [],
    allFields: [],
    virtualFields: [],
  };

  const cube = data;
  if (!cube) {
    throw new Error('Missing "data" input');
  }

  if (!cube.qDimensionInfo) {
    throw new Error('The "data" input is not recognized as a hypercube');
  }

  const deps = q.util;

  const opts = {
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
    field: (query) => findField(query, opts),
    fields: () => cache.fields.slice(),
    extract: (extractionConfig) => opts.extractor(extractionConfig, dataset, cache, deps),
    hierarchy: (hierarchyConfig) => opts.hierarchy(hierarchyConfig, dataset, cache, deps),
    _cache: () => cache,
  };

  if (cube.qMode === 'K' || cube.qMode === 'T' || (!cube.qMode && cube.qNodesOnDim)) {
    opts.extractor = TExtractor;
    opts.hierarchy = augmentTree;
    opts.pages = cube.qMode === 'K' ? cube.qStackedDataPages : cube.qTreeDataPages;
  } else if (cube.qMode === 'S') {
    opts.extractor = SExtractor;
    handleColumnOrderForSMode(cube);
    opts.pages = cube.qDataPages;
    opts.hierarchy = augmentTree;
  } else {
    opts.extractor = () => []; // TODO - throw unsupported error?
  }

  opts.fieldExtractor = (f) => opts.extractor({ field: f }, dataset, cache, deps);

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

  (config.virtualFields || []).forEach((v) => {
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
      fieldExtractor: (ff) => opts.extractor({ field: ff }, dataset, cache, deps),
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
