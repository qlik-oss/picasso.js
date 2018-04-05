import {
  hierarchy
} from 'd3-hierarchy';

import picker from '../json-path-resolver';

import {
  treeAccessor
} from './util';

const DIM_RX = /^qDimensionInfo(?:\/(\d+))?/;
const M_RX = /^qMeasureInfo\/(\d+)/;
const ATTR_EXPR_RX = /\/qAttrExprInfo\/(\d+)/;
const ATTR_DIM_RX = /\/qAttrDimInfo\/(\d+)/;

function getFieldDepth(field, { cube }) {
  if (!field) {
    return -1;
  }
  let key = field.key();
  let isFieldDimension = false;
  let fieldIdx = -1; // cache.fields.indexOf(field);
  let attrIdx = -1;
  let attrDimIdx = -1;
  let fieldDepth = -1;
  let pseudoMeasureIndex = -1;
  let remainder;

  if (DIM_RX.test(key)) {
    isFieldDimension = true;
    fieldIdx = +DIM_RX.exec(key)[1];
    remainder = key.replace(DIM_RX, '');
  } else if (M_RX.test(key)) {
    pseudoMeasureIndex = +M_RX.exec(key)[1];
    remainder = key.replace(M_RX, '');
  }

  if (remainder) {
    if (ATTR_DIM_RX.exec(remainder)) {
      attrDimIdx = +ATTR_DIM_RX.exec(remainder)[1];
    } else if (ATTR_EXPR_RX.exec(remainder)) {
      attrIdx = +ATTR_EXPR_RX.exec(remainder)[1];
    }
  }

  const treeOrder = cube.qEffectiveInterColumnSortOrder;

  if (isFieldDimension) {
    fieldDepth = treeOrder ? treeOrder.indexOf(fieldIdx) : fieldIdx;
  } else if (treeOrder && treeOrder.indexOf(-1) !== -1) { // if pseudo dimension exists in sort order
    fieldDepth = treeOrder.indexOf(-1); // depth of pesudodimension
  } else { // assume measure is at the bottom of the tree
    fieldDepth = cube.qDimensionInfo.length;
  }

  return {
    fieldDepth: fieldDepth + 1, // +1 due to root node
    pseudoMeasureIndex,
    attrDimIdx,
    attrIdx
  };
}

function getFieldAccessor(sourceDepthObject, targetDepthObject, prop) {
  let nodeFn = treeAccessor(sourceDepthObject.fieldDepth, targetDepthObject.fieldDepth, prop, targetDepthObject.pseudoMeasureIndex);
  let attrFn;

  if (targetDepthObject.attrDimIdx >= 0) {
    attrFn = data => data.qAttrDims.qValues[targetDepthObject.attrDimIdx];
  } else if (targetDepthObject.attrIdx >= 0) {
    attrFn = data => data.qAttrExps.qValues[targetDepthObject.attrIdx];
  }

  return {
    nodeFn,
    attrFn
  };
}

function datumExtract(propCfg, cell, {
  key
}) {
  const datum = {
    value: typeof propCfg.value === 'function' ? propCfg.value(cell) : typeof propCfg.value !== 'undefined' ? propCfg.value : cell  // eslint-disable-line no-nested-ternary
  };

  datum.label = typeof propCfg.label === 'function' ? propCfg.label(cell) : typeof propCfg.label !== 'undefined' ? String(propCfg.label) : String(datum.value);  // eslint-disable-line no-nested-ternary

  if (propCfg.field) {
    datum.source = {
      key,
      field: propCfg.field.key()
    };
  }

  return datum;
}

export default function extract(config, dataset, cache, util) {
  const cfgs = Array.isArray(config) ? config : [config];
  let dataItems = [];
  cfgs.forEach((cfg) => {
    if (typeof cfg.field !== 'undefined') {
      const cube = dataset.raw();
      const rootPath = '/qStackedDataPages/*/qData';
      const root = picker(rootPath, cube);
      if (!root || !root[0]) {
        return;
      }
      const sourceKey = dataset.key();
      const f = typeof cfg.field === 'object' ? cfg.field : dataset.field(cfg.field);
      const { props, main } = util.normalizeConfig(cfg, dataset);
      const propsArr = Object.keys(props);
      if (!cache.tree) {
        cache.tree = hierarchy(root[0], node => node.qSubNodes);
      }
      const itemDepthObject = getFieldDepth(f, { cube, cache });
      const { nodeFn, attrFn } = getFieldAccessor({ fieldDepth: 0 }, itemDepthObject);

      const track = !!cfg.trackBy;
      const trackType = typeof cfg.trackBy;
      const tracker = {};
      const trackedItems = [];

      const items = nodeFn(cache.tree);
      propsArr.forEach((prop) => {
        const pCfg = props[prop];
        const arr = pCfg.fields ? pCfg.fields : [pCfg];
        arr.forEach((p) => {
          if (p.field) {
            if (p.field === f) {
              p.isSame = true;
            } else {
              const depthObject = getFieldDepth(p.field, { cube, cache });
              const accessors = getFieldAccessor(itemDepthObject, depthObject, 'data');
              p.accessor = accessors.nodeFn;
              p.attrAccessor = accessors.attrFn;
            }
          }
        });
      });
      const mapped = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemData = attrFn ? attrFn(item.data) : item.data;
        const exclude = main.filter && !main.filter(itemData);
        if (exclude) {
          continue;
        }
        const ret = datumExtract(main, itemData, { key: sourceKey });
        propsArr.forEach((prop) => {
          const pCfg = props[prop];
          const arr = pCfg.fields || [pCfg];
          let coll;
          if (pCfg.fields) {
            coll = [];
          }
          arr.forEach((p) => {
            let fn;
            let value;
            if (p.type === 'primitive') {
              value = p.value;
            } else {
              if (typeof p.value === 'function') { // accessor function
                fn = p.value;
              }
              if (p.accessor) {
                value = p.accessor(item);
                if (Array.isArray(value)) { // propably descendants
                  if (p.attrAccessor) {
                    value = value.map(p.attrAccessor);
                  }
                  if (fn) {
                    value = value.map(fn);
                    fn = null;
                  }
                  value = p.reduce ? p.reduce(value) : value;
                } else {
                  value = p.attrAccessor ? p.attrAccessor(value) : value;
                }
              } else {
                value = itemData;
              }
            }
            if (pCfg.fields) {
              coll.push(fn ? fn(value) : value);
            } else {
              ret[prop] = {
                value: fn ? fn(value) : value
              };
              ret[prop].label = String(ret[prop].value);
              if (p.field) {
                ret[prop].source = { field: p.field.key(), key: sourceKey };
              }
            }
          });
          if (coll) {
            ret[prop] = {
              value: typeof pCfg.value === 'function' ? pCfg.value(coll) : coll
            };
            ret[prop].label = String(ret[prop].value);
          }
        });
        // collect items based on the trackBy value
        // items with the same trackBy value are placed in an array and reduced later
        if (track) {
          util.track({
            cfg,
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
  });
  return dataItems;
}
