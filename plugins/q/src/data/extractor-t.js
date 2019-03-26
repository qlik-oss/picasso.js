/* eslint no-nested-ternary: 0 */

import { hierarchy, stratify } from 'd3-hierarchy';

import picker from '../json-path-resolver';

import { treeAccessor } from './util';

const DIM_RX = /^qDimensionInfo(?:\/(\d+))?/;
const M_RX = /^\/?qMeasureInfo\/(\d+)/;
const ATTR_EXPR_RX = /\/qAttrExprInfo\/(\d+)/;
const ATTR_DIM_RX = /\/qAttrDimInfo\/(\d+)/;

function getColumnOrder(dataset) {
  const qColumnOrder = dataset.raw().qColumnOrder;
  const fields = dataset.fields();

  return qColumnOrder && (qColumnOrder.length === fields.length) ? qColumnOrder : fields.map((f, i) => i);
}

function getDimensionColumnOrder(cube) {
  const order = cube.qColumnOrder && cube.qColumnOrder.length ? cube.qColumnOrder : cube.qDimensionInfo.map((d, ii) => ii);

  return order.filter(ii => ii < cube.qDimensionInfo.length);
}

export function getFieldDepth(field, { cube }) {
  if (!field) {
    return -1;
  }

  let key = field.origin && field.origin() ? field.origin().key() : field.key();
  let isFieldDimension = false;
  let fieldIdx = -1; // cache.fields.indexOf(field);
  let attrIdx = -1;
  let attrDimIdx = -1;
  let fieldDepth = -1;
  let pseudoMeasureIndex = -1;
  let measureIdx = -1;
  let remainder = key;

  const treeOrder = cube.qEffectiveInterColumnSortOrder;
  const columnOrder = getDimensionColumnOrder(cube);

  if (DIM_RX.test(remainder)) {
    isFieldDimension = true;
    fieldIdx = +DIM_RX.exec(remainder)[1];
    remainder = key.replace(DIM_RX, '');
  }

  if (M_RX.test(remainder)) {
    if (cube.qMode === 'K') {
      pseudoMeasureIndex = +M_RX.exec(remainder)[1];
    } else if (treeOrder && treeOrder.indexOf(-1) !== -1) {
      pseudoMeasureIndex = +M_RX.exec(remainder)[1];
      measureIdx = 0;
    } else {
      measureIdx = +M_RX.exec(remainder)[1];
    }
    remainder = remainder.replace(M_RX, '');
  }

  if (remainder) {
    if (ATTR_DIM_RX.exec(remainder)) {
      attrDimIdx = +ATTR_DIM_RX.exec(remainder)[1];
    } else if (ATTR_EXPR_RX.exec(remainder)) {
      attrIdx = +ATTR_EXPR_RX.exec(remainder)[1];
    }
  }

  if (isFieldDimension) {
    if (cube.qMode === 'S') {
      fieldDepth = columnOrder[fieldIdx];
    } else {
      fieldDepth = treeOrder ? treeOrder.indexOf(fieldIdx) : fieldIdx;
    }
  } else if (treeOrder && treeOrder.indexOf(-1) !== -1) { // if pseudo dimension exists in sort order
    fieldDepth = treeOrder.indexOf(-1); // depth of pesudodimension
  } else { // assume measure is at the bottom of the tree
    fieldDepth = cube.qDimensionInfo.length - (cube.qMode === 'K' ? 0 : 1);
  }

  return {
    fieldDepth: fieldDepth + 1, // +1 due to root node
    pseudoMeasureIndex,
    measureIdx,
    attrDimIdx,
    attrIdx
  };
}

function getFieldAccessor(sourceDepthObject, targetDepthObject) {
  let nodeFn = treeAccessor(sourceDepthObject.fieldDepth, targetDepthObject.fieldDepth, targetDepthObject.pseudoMeasureIndex);
  let valueFn;

  if (targetDepthObject.measureIdx >= 0) {
    valueFn = node => node.data.qValues[targetDepthObject.measureIdx];
  } else {
    valueFn = node => node.data;
  }
  let attrFn;

  if (targetDepthObject.attrDimIdx >= 0) {
    attrFn = data => data.qAttrDims.qValues[targetDepthObject.attrDimIdx];
  } else if (targetDepthObject.attrIdx >= 0) {
    attrFn = data => data.qAttrExps.qValues[targetDepthObject.attrIdx];
  }

  return {
    nodeFn,
    attrFn,
    valueFn
  };
}

function datumExtract(propCfg, cell, {
  key
}) {
  const datum = {
    value: typeof propCfg.value === 'function' ? propCfg.value(cell) : typeof propCfg.value !== 'undefined' ? propCfg.value : cell // eslint-disable-line no-nested-ternary
  };

  datum.label = typeof propCfg.label === 'function' ? propCfg.label(cell) : typeof propCfg.label !== 'undefined' ? String(propCfg.label) : String(datum.value); // eslint-disable-line no-nested-ternary

  if (propCfg.field) {
    datum.source = {
      key,
      field: propCfg.field.key()
    };
  }

  return datum;
}

function doIt({
  propsArr,
  props,
  item,
  itemData,
  ret,
  sourceKey
}) {
  for (let i = 0; i < propsArr.length; i++) {
    const pCfg = props[propsArr[i]];
    const arr = pCfg.fields || [pCfg];
    let coll;
    let collStr;
    if (pCfg.fields) {
      coll = [];
      collStr = [];
    }

    for (let j = 0; j < arr.length; j++) {
      const p = arr[j];
      let fn;
      let str;
      let value;
      let nodes;
      let cells;
      let label;
      if (p.type === 'primitive') {
        value = p.value;
        label = String(p.value);
      } else {
        if (typeof p.value === 'function') {
          fn = v => p.value(v, item);
        }
        if (typeof p.label === 'function') {
          str = v => p.label(v, item);
        }
        if (p.accessor) {
          nodes = p.accessor(item);
          if (Array.isArray(nodes)) { // propably descendants
            cells = nodes.map(p.valueAccessor);
            if (p.attrAccessor) {
              cells = cells.map(p.attrAccessor);
            }
            if (fn) {
              value = cells.map(fn);
              fn = null;
            }
            if (str) {
              label = cells.map(str);
              str = null;
            }
            value = p.reduce ? p.reduce(value) : value;
            label = p.reduceLabel ? p.reduceLabel(label, value) : String(value);
          } else {
            value = p.attrAccessor ? p.attrAccessor(p.valueAccessor(nodes)) : p.valueAccessor(nodes);
            label = value;
          }
        } else {
          value = itemData;
          label = itemData;
        }
      }
      if (pCfg.fields) {
        const v = fn ? fn(value) : value;
        coll.push(v);
        collStr.push(str && label != null ? str(label) : (label != null ? label : String(v)));
      } else {
        const v = fn ? fn(value) : value;
        ret[propsArr[i]] = {
          value: v,
          label: str ? str(label) : (label != null ? label : String(v))
        };
        if (p.field) {
          ret[propsArr[i]].source = { field: p.field.key(), key: sourceKey };
        }
      }
    }
    if (coll) {
      ret[propsArr[i]] = {
        value: typeof pCfg.value === 'function' ? pCfg.value(coll, item) : coll,
        label: typeof pCfg.label === 'function' ? pCfg.label(collStr, item) : collStr
      };
    }
  }
}

const getHierarchy = (cube, cache, config) => {
  const rootPath = cube.qMode === 'K' ? '/qStackedDataPages/*/qData' : '/qTreeDataPages/*';
  const childNodes = cube.qMode === 'K' ? 'qSubNodes' : 'qNodes';
  const root = picker(rootPath, cube);
  if (!root || !root[0]) {
    return null;
  }
  cache.tree = hierarchy(root[0], config.children || (node => node[childNodes]));
  return cache.tree;
};

function getHierarchyForSMode(dataset) {
  const matrix = dataset.raw().qDataPages.length ? dataset.raw().qDataPages[0].qMatrix : [];
  const order = getColumnOrder(dataset);
  const fields = dataset.fields();
  const dimensions = dataset.fields().filter(f => f.type() === 'dimension')
    .map(f => order.indexOf(fields.indexOf(f)));
  const measures = dataset.fields().filter(f => f.type() === 'measure')
    .map(f => order.indexOf(fields.indexOf(f)));

  const root = {
    __id: '__root',
    qValues: []
  };

  const keys = {
    __root: root
  };

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    let id = '__root';
    // let parent = root;
    let isNew = false;
    for (let c = 0; c < dimensions.length; c++) {
      const cell = row[dimensions[c]];
      const key = `${id}__${cell.qText}`;
      if (!keys[key]) {
        keys[key] = Object.assign({ __id: key, __parent: id, qValues: [] }, cell);
        isNew = true;
      }
      id = key;
    }
    if (isNew) {
      for (let c = 0; c < measures.length; c++) {
        const cell = row[measures[c]];
        keys[id].qValues.push(cell);
      }
    }
  }

  const nodes = Object.keys(keys).map(key => keys[key]);

  const h = stratify()
    .id(d => d.__id)
    .parentId(d => d.__parent)(nodes);

  return h;
}

const attachPropsAccessors = ({
  propsArr,
  props,
  cube,
  cache,
  itemDepthObject,
  f
}) => {
  for (let i = 0; i < propsArr.length; i++) {
    const pCfg = props[propsArr[i]];
    const arr = pCfg.fields ? pCfg.fields : [pCfg];
    for (let j = 0; j < arr.length; j++) {
      const p = arr[j];
      if (p.field !== f) {
        const depthObject = getFieldDepth(p.field, { cube, cache });
        const accessors = getFieldAccessor(itemDepthObject, depthObject);
        p.accessor = accessors.nodeFn; // nodes accessor
        p.valueAccessor = accessors.valueFn; // cell accessor
        p.attrAccessor = accessors.attrFn; // attr cell accessor
      }
    }
  }
};

export function augment(config = {}, dataset, cache, util) {
  const cube = dataset.raw();
  const sourceKey = dataset.key();
  const h = cube.qMode === 'S' ? getHierarchyForSMode(dataset) : getHierarchy(cube, cache, config);
  if (!h) {
    return null;
  }

  const height = h.height;
  const propDefs = [];
  for (let i = 0; i <= height; i++) {
    let f = null;
    if (i > 0) {
      if (cube.qMode === 'S') {
        const order = getDimensionColumnOrder(cube);
        let idx = order[i - 1];
        f = cache.fields[idx];
      } else {
        let idx = cube.qEffectiveInterColumnSortOrder[i - 1];
        // if (idx === -1) { // pseudo
        //   let childIdx = node.parent.children.indexOf(node);
        //   idx = cube.qDimensionInfo.length + childIdx; // measure field
        // }
        if (i > cube.qEffectiveInterColumnSortOrder.length) {
          idx = cube.qDimensionInfo.length;
        }

        f = cache.fields[idx];
      }
    }

    const { props, main } = util.normalizeConfig(Object.assign({}, config, { field: f ? f.key() : undefined }), dataset);
    const propsArr = Object.keys(props);
    propDefs[i] = { propsArr, props, main };

    const itemDepthObject = f ? getFieldDepth(f, { cube, cache }) : { fieldDepth: 0 };

    attachPropsAccessors({
      propsArr,
      props,
      cube,
      cache,
      itemDepthObject,
      f
    });
  }

  const replica = h.copy();
  const replicaDescendants = replica.descendants();
  const descendants = h.descendants();

  for (let i = 0; i < descendants.length; i++) {
    const propsArr = propDefs[descendants[i].depth].propsArr;
    const props = propDefs[descendants[i].depth].props;
    const main = propDefs[descendants[i].depth].main;

    const item = replicaDescendants[i];
    const itemData = item.data; // main.valueAccessor(currentOriginal);

    const ret = datumExtract(main, itemData, { key: sourceKey });
    doIt({
      propsArr,
      props,
      item,
      itemData,
      ret,
      sourceKey,
      isTree: true
    });
    descendants[i].data = ret;
  }
  return h;
}

export function extract(config, dataset, cache, util) {
  const cfgs = Array.isArray(config) ? config : [config];
  let dataItems = [];
  for (let g = 0; g < cfgs.length; g++) {
    if (typeof cfgs[g].field !== 'undefined') {
      const cube = dataset.raw();
      const sourceKey = dataset.key();
      const h = getHierarchy(cube, cache, config);
      if (!h) {
        continue;
      }

      const f = typeof cfgs[g].field === 'object' ? cfgs[g].field : dataset.field(cfgs[g].field);
      const { props, main } = util.normalizeConfig(cfgs[g], dataset);
      const propsArr = Object.keys(props);

      const itemDepthObject = getFieldDepth(f, { cube, cache });
      const { nodeFn, attrFn, valueFn } = getFieldAccessor({ fieldDepth: 0 }, itemDepthObject);

      attachPropsAccessors({
        propsArr,
        props,
        cube,
        cache,
        itemDepthObject,
        f
      });

      const track = !!cfgs[g].trackBy;
      const trackType = typeof cfgs[g].trackBy;
      const tracker = {};
      const trackedItems = [];

      const items = nodeFn(cache.tree);
      const mapped = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemData = attrFn ? attrFn(valueFn(item)) : valueFn(item);
        const exclude = main.filter && !main.filter(itemData);
        if (exclude) {
          continue;
        }
        const ret = datumExtract(main, itemData, { key: sourceKey });
        doIt({
          propsArr,
          props,
          item,
          itemData,
          ret,
          sourceKey
        });
        // collect items based on the trackBy value
        // items with the same trackBy value are placed in an array and reduced later
        if (track) {
          util.track({
            cfg: cfgs[g],
            itemData,
            obj: ret,
            target: trackedItems,
            tracker,
            trackType
          });
        }
        mapped.push(ret);
      }
      // reduce if items have been grouped
      if (track) {
        dataItems.push(...util.collect(trackedItems, {
          main,
          propsArr,
          props
        }));
      } else {
        dataItems.push(...mapped);
      }
    }
  }
  return dataItems;
}
