import augmentH from './augment-hierarchy';
import kExtractor from './extractor-k';
import SExtractor from './extractor-s';
import { findField } from './util';
import field from './field';

function hierarchy(config = {}, dataset, cache, deps) {
  const cube = dataset.raw();
  if (cube.qMode !== 'K') {
    return null;
  }
  return augmentH(config, dataset, cache, deps);
}

function extractData(cfg, dataset, cache, deps) {
  const cube = dataset.raw();
  if (cube.qMode === 'K') {
    return kExtractor(cfg, dataset, cache, deps);
  } else if (cube.qMode === 'S') {
    return SExtractor(cfg, dataset, cache, deps);
  }
  return [];
}

function createAttrFields(idx, d, {
  cache,
  cube,
  pages,
  fieldExtractor,
  key,
  fieldKey,
  localeInfo
}) {
  if (d.qAttrDimInfo) {
    cache.attributeDimensionFields[idx] = d.qAttrDimInfo.map((attrDim, i) => (attrDim ? field({
      meta: attrDim,
      id: `${key}/${fieldKey}/qAttrDimInfo/${i}`,
      key: `${fieldKey}/qAttrDimInfo/${i}`,
      cube,
      pages,
      fieldExtractor,
      value: v => v.qElemNo,
      localeInfo
    }) : undefined));
  }
  if (d.qAttrExprInfo) {
    cache.attributeExpressionFields[idx] = d.qAttrExprInfo.map((attrExpr, i) => (attrExpr ? field({
      meta: attrExpr,
      id: `${key}/${fieldKey}/qAttrExprInfo/${i}`,
      key: `${fieldKey}/qAttrExprInfo/${i}`,
      cube,
      pages,
      fieldExtractor,
      localeInfo
    }) : undefined));
  }
}

export default function q({
  key,
  data,
  config = {}
} = {}) {
  const cache = {
    attributeDimensionFields: [],
    attributeExpressionFields: [],
    fields: []
  };

  const cube = data;

  if (!cube.qDimensionInfo) { // assume old data format
    throw new Error('The data input is not recognized as a hypercube');
  }

  const pages = cube.qMode === 'K' ? cube.qStackedDataPages : cube.qDataPages;

  const deps = q.util;

  const dataset = {
    key: () => key,
    raw: () => cube,
    field: query => findField(query, {
      cache,
      cube,
      pages
    }),
    fields: () => cache.fields.slice(),
    extract: extractionConfig => extractData(extractionConfig, dataset, cache, deps),
    hierarchy: hierarchyConfig => hierarchy(hierarchyConfig, dataset, cache, deps)
  };

  let fieldExtractor;

  if (cube.qMode === 'K') {
    fieldExtractor = f => kExtractor({ field: f }, dataset, cache, deps);
  } else if (cube.qMode === 'S') {
    fieldExtractor = f => SExtractor({ field: f }, dataset, cache, deps);
  } else {
    fieldExtractor = () => []; // TODO - throw unsupported error?
  }

  const dimensions = cube.qDimensionInfo;
  dimensions.forEach((d, i) => {
    const fieldKey = `qDimensionInfo/${i}`;
    cache.fields.push(field({
      meta: d,
      id: `${key}/${fieldKey}`,
      key: fieldKey,
      cube,
      pages,
      fieldExtractor,
      localeInfo: config.localeInfo
    }));
    createAttrFields(i, d, { cache, cube, pages, fieldExtractor, key, fieldKey, localeInfo: config.localeInfo });
  });

  cube.qMeasureInfo.forEach((d, i) => {
    const fieldKey = `qMeasureInfo/${i}`;
    cache.fields.push(field({
      meta: d,
      id: `${key}/${fieldKey}`,
      key: fieldKey,
      cube,
      pages,
      fieldExtractor,
      localeInfo: config.localeInfo
    }));
    createAttrFields(dimensions.length + i, d, { cache, cube, pages, fieldExtractor, key, fieldKey, localeInfo: config.localeInfo });
  });

  return dataset;
}
