import extend from 'extend';
import augmentH from './augment-hierarchy';
import SExtractor from './extractor-s';
import TExtractor from './extractor-t';
import { findField } from './util';
import field from './field';

function hierarchy(config = {}, dataset, cache, deps) {
  const cube = dataset.raw();
  if (cube.qMode !== 'K') {
    return null;
  }
  return augmentH(config, dataset, cache, deps);
}

function createFields(path, obj, prefix, parentKey, opts) {
  return (obj[path] || []).map((meta, i) => {
    const fieldKey = `${parentKey ? `${parentKey}/` : ''}${path}/${i}`;
    const f = {
      instance: field(extend({
        id: `${prefix ? `${prefix}/` : ''}${fieldKey}`,
        key: fieldKey,
        meta
      }, opts))
    };
    f.attrDims = createFields('qAttrDimInfo', meta, prefix, fieldKey, extend({}, opts, { value: v => v.qElemNo, type: 'dimension' }));
    f.attrExps = createFields('qAttrExprInfo', meta, prefix, fieldKey, extend({}, opts, { value: v => v.qNum, type: 'measure' }));
    f.measures = createFields('qMeasureInfo', meta, prefix, fieldKey, extend({}, opts, { value: v => v.qValue, type: 'measure' }));
    return f;
  });
}

export default function q({
  key,
  data,
  config = {}
} = {}) {
  const cache = {
    fields: [],
    wrappedFields: [],
    allFields: []
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
    pages: null
  };

  const dataset = {
    key: () => key,
    raw: () => cube,
    field: query => findField(query, opts),
    fields: () => cache.fields.slice(),
    extract: extractionConfig => opts.extractor(extractionConfig, dataset, cache, deps),
    hierarchy: hierarchyConfig => hierarchy(hierarchyConfig, dataset, cache, deps),
    _cache: () => cache
  };

  if (cube.qMode === 'K' || cube.qMode === 'T' || (!cube.qMode && cube.qNodesOnDim)) {
    opts.extractor = TExtractor;
    opts.pages = cube.qMode === 'K' ? cube.qStackedDataPages : cube.qTreeDataPages;
  } else if (cube.qMode === 'S') {
    opts.extractor = SExtractor;
    opts.pages = cube.qDataPages;
  } else {
    opts.ectractor = () => []; // TODO - throw unsupported error?
  }

  opts.fieldExtractor = f => opts.extractor({ field: f }, dataset, cache, deps);

  const dimAcc = cube.qMode === 'S' ? (d => d.qElemNumber) : undefined;
  const measAcc = cube.qMode === 'S' ? (d => d.qNum) : undefined;

  cache.wrappedFields.push(...createFields('qDimensionInfo', cube, key, '', extend({}, opts, { value: dimAcc, type: 'dimension' })));
  cache.wrappedFields.push(...createFields('qMeasureInfo', cube, key, '', extend({}, opts, { value: measAcc, type: 'measure' })));

  cache.fields = cache.wrappedFields.map(f => f.instance);

  const traverse = (arr) => {
    arr.forEach((f) => {
      cache.allFields.push(f.instance);
      traverse(f.measures);
      traverse(f.attrDims);
      traverse(f.attrExps);
    });
  };

  traverse(cache.wrappedFields);

  return dataset;
}
