/* eslint no-nested-ternary: 0 */

import { hierarchy, stratify } from 'd3-hierarchy';

import picker from '../json-path-resolver';

import { treeAccessor } from './util';

interface Cube {
  qMode?: string;
  qEffectiveInterColumnSortOrder?: unknown[];
  qDimensionInfo?: unknown[];
  [key: string]: unknown;
}

interface ExtractDataset {
  raw(): Cube;
  key(): string;
  field(query: unknown): unknown;
  fields?(): unknown[];
}

interface ExtractCache {
  fields: { key(): string }[];
  tree?: unknown;
  [key: string]: unknown;
}

interface ExtractUtil {
  normalizeConfig(config: unknown, dataset: unknown): { props: Record<string, unknown>; main: Record<string, unknown> };
  track?(options: unknown): void;
  collect?(items: unknown[], options: unknown): unknown[];
}

const DIM_RX = /^qDimensionInfo(?:\/(\d+))?/;
const M_RX = /^\/?qMeasureInfo\/(\d+)/;
const ATTR_EXPR_RX = /\/qAttrExprInfo\/(\d+)/;
const ATTR_DIM_RX = /\/qAttrDimInfo\/(\d+)/;

function getColumnOrder(dataset: ExtractDataset): unknown[] {
  const qColumnOrder = (dataset.raw() as Cube & { qColumnOrder?: unknown[] }).qColumnOrder;
  const fields = (dataset as unknown as { fields(): any[] }).fields();

  return qColumnOrder && (qColumnOrder as unknown[]).length === fields.length ? qColumnOrder : fields.map((f: unknown, i: number) => i);
}

function getDimensionColumnOrder(cube: Cube): unknown[] {
  const order =
    (cube.qColumnOrder as unknown[] | undefined) && (cube.qColumnOrder as unknown[]).length ? (cube.qColumnOrder as unknown[]) : (cube.qDimensionInfo || []).map((d: unknown, ii: number) => ii);

  return (order as unknown[]).filter((ii: unknown) => (ii as number) < ((cube.qDimensionInfo || []) as unknown[]).length);
}

export function getFieldDepth(field: unknown, { cube }: { cube: Cube }): {
  fieldDepth: number;
  pseudoMeasureIndex: number;
  measureIdx: number;
  attrDimIdx: number;
  attrIdx: number;
} {
  if (!field) {
    return {
      fieldDepth: -1,
      pseudoMeasureIndex: -1,
      measureIdx: -1,
      attrDimIdx: -1,
      attrIdx: -1,
    };
  }

  const fieldObj = field as Record<string, any>;
  let key = fieldObj.origin && fieldObj.origin() ? (fieldObj.origin() as Record<string, any>).key() : (fieldObj as Record<string, any>).key();
  let isFieldDimension = false;
  let fieldIdx = -1; // cache.fields.indexOf(field);
  let attrIdx = -1;
  let attrDimIdx = -1;
  let fieldDepth = -1;
  let pseudoMeasureIndex = -1;
  let measureIdx = -1;
  let remainder = key as string;

  const treeOrder = cube.qEffectiveInterColumnSortOrder;
  const columnOrder = getDimensionColumnOrder(cube);

  if (DIM_RX.test(remainder)) {
    isFieldDimension = true;
    const match = DIM_RX.exec(remainder);
    fieldIdx = +(match?.[1] ?? -1);
    remainder = key.replace(DIM_RX, '');
  }

  if (M_RX.test(remainder)) {
    if (cube.qMode === 'K') {
      const match = M_RX.exec(remainder);
      pseudoMeasureIndex = +(match?.[1] ?? -1);
    } else if (treeOrder && (treeOrder as unknown[]).indexOf(-1) !== -1) {
      const match = M_RX.exec(remainder);
      pseudoMeasureIndex = +(match?.[1] ?? -1);
      measureIdx = 0;
    } else {
      const match = M_RX.exec(remainder);
      measureIdx = +(match?.[1] ?? -1);
    }
    remainder = remainder.replace(M_RX, '');
  }

  if (remainder) {
    const attrDimMatch = ATTR_DIM_RX.exec(remainder);
    if (attrDimMatch) {
      attrDimIdx = +(attrDimMatch?.[1] ?? -1);
    } else {
      const attrExprMatch = ATTR_EXPR_RX.exec(remainder);
      if (attrExprMatch) {
        attrIdx = +(attrExprMatch?.[1] ?? -1);
      }
    }
  }

  if (isFieldDimension) {
    if (cube.qMode === 'S') {
      fieldDepth = (columnOrder as unknown[])[fieldIdx] as number;
    } else {
      fieldDepth = treeOrder ? (treeOrder as unknown[]).indexOf(fieldIdx) : fieldIdx;
    }
  } else if (treeOrder && (treeOrder as unknown[]).indexOf(-1) !== -1) {
    // if pseudo dimension exists in sort order
    fieldDepth = (treeOrder as unknown[]).indexOf(-1); // depth of pesudodimension
  } else {
    // assume measure is at the bottom of the tree
    fieldDepth = ((cube.qDimensionInfo as unknown[]) || []).length - (cube.qMode === 'K' ? 0 : 1);
  }

  return {
    fieldDepth: fieldDepth + 1, // +1 due to root node
    pseudoMeasureIndex,
    measureIdx,
    attrDimIdx,
    attrIdx,
  };
}

function getFieldAccessor(sourceDepthObject: any, targetDepthObject: any): { nodeFn: any; attrFn?: any; valueFn: any } {
  let nodeFn = treeAccessor(
    sourceDepthObject.fieldDepth,
    targetDepthObject.fieldDepth,
    targetDepthObject.pseudoMeasureIndex
  );
  let valueFn: (node: any) => any;

  if (targetDepthObject.measureIdx >= 0) {
    valueFn = (node: any) => node.data.qValues[targetDepthObject.measureIdx];
  } else {
    valueFn = (node: any) => node.data;
  }
  let attrFn: ((data: any) => any) | undefined;

  if (targetDepthObject.attrDimIdx >= 0) {
    attrFn = (data: any) => data?.qAttrDims?.qValues[targetDepthObject.attrDimIdx];
  } else if (targetDepthObject.attrIdx >= 0) {
    attrFn = (data: any) => data?.qAttrExps?.qValues[targetDepthObject.attrIdx];
  }

  return {
    nodeFn,
    attrFn,
    valueFn,
  };
}

function datumExtract(propCfg: any, cell: any, { key }: { key: unknown }): Record<string, unknown> {
  const datum: Record<string, unknown> = {
    value:
      typeof propCfg.value === 'function'
        ? propCfg.value(cell)
        : typeof propCfg.value !== 'undefined'
          ? propCfg.value
          : cell,
  };

  datum.label =
    typeof propCfg.label === 'function'
      ? propCfg.label(cell)
      : typeof propCfg.label !== 'undefined'
        ? String(propCfg.label)
        : String(datum.value);

  if (propCfg.field) {
    datum.source = {
      key,
      field: propCfg.field.key(),
    };
  }

  return datum;
}

function doIt({ propsArr, props, item, itemData, ret, sourceKey, isTree: _isTree = false }: {
  propsArr: string[];
  props: any;
  item: any;
  itemData: any;
  ret: any;
  sourceKey: unknown;
  isTree?: boolean;
}): void {
  for (let i = 0; i < propsArr.length; i++) {
    const pCfg = props[propsArr[i]];
    const arr = pCfg.fields || [pCfg];
    let coll: unknown[] = [];
    let collStr: unknown[] = [];
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
          fn = (v: any) => p.value(v, item);
        }
        if (typeof p.label === 'function') {
          str = (v: any) => p.label(v, item);
        }
        if (p.accessor) {
          nodes = p.accessor(item);
          if (Array.isArray(nodes)) {
            // propably descendants
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
        collStr.push(str && label != null ? str(label) : label != null ? label : String(v));
      } else {
        const v = fn ? fn(value) : value;
        ret[propsArr[i]] = {
          value: v,
          label: str ? str(label) : label != null ? label : String(v),
        };
        if (p.field) {
          ret[propsArr[i]].source = { field: p.field.key(), key: sourceKey };
        }
      }
    }
    if (coll) {
      ret[propsArr[i]] = {
        value: typeof pCfg.value === 'function' ? pCfg.value(coll, item) : coll,
        label: typeof pCfg.label === 'function' ? pCfg.label(collStr, item) : collStr,
      };
    }
  }
}

const getHierarchy = (cube: Cube, cache: ExtractCache, config: any): any => {
  const rootPath = cube.qMode === 'K' ? '/qStackedDataPages/*/qData' : '/qTreeDataPages/*';
  const childNodes = cube.qMode === 'K' ? 'qSubNodes' : 'qNodes';
  const root = picker(rootPath, cube);
  if (!root || !root[0]) {
    return null;
  }
  cache.tree = hierarchy(root[0], config.children || ((node) => node[childNodes]));
  return cache.tree;
};

function getHierarchyForSMode(dataset: ExtractDataset): any {
  const matrix = (dataset.raw() as any).qDataPages?.length ? (dataset.raw() as any).qDataPages[0].qMatrix : [];
  const order = getColumnOrder(dataset);
  const fields = (dataset.fields?.() || []) as unknown[];
  const dimensions = (dataset.fields?.() || [])
    .filter((f: any) => f.type() === 'dimension')
    .map((f: any) => order.indexOf(fields.indexOf(f)));
  const measures = (dataset.fields?.() || [])
    .filter((f: any) => f.type() === 'measure')
    .map((f: any) => order.indexOf(fields.indexOf(f)));

  const root: any = {
    __id: '__root',
    qValues: [],
  };

  const keys: Record<string, any> = {
    __root: root,
  };

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    let id = '__root';
    // let parent = root;
    let isNew = false;
    for (let c = 0; c < dimensions.length; c++) {
      const cell = row[dimensions[c]];
      const key = `${id}__${cell.qElemNumber ?? cell.qElemNo}`;
      if (!keys[key]) {
        keys[key] = {
          __id: key,
          __parent: id,
          qValues: [],
          ...cell,
        };
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

  const nodes = Object.keys(keys).map((key: string) => keys[key]);

  const h = stratify()
    .id((d: any) => d.__id)
    .parentId((d: any) => d.__parent)(nodes);

  return h;
}

const attachPropsAccessors = ({ propsArr, props, cube, cache: _cache, itemDepthObject, f }: {
  propsArr: string[];
  props: any;
  cube: Cube;
  cache: ExtractCache;
  itemDepthObject: any;
  f: unknown;
}): void => {
  for (let i = 0; i < propsArr.length; i++) {
    const pCfg = props[propsArr[i]];
    const arr = pCfg.fields ? pCfg.fields : [pCfg];
    for (let j = 0; j < arr.length; j++) {
      const p = arr[j];
      if (p.field !== f) {
        const depthObject = getFieldDepth(p.field, { cube });
        const accessors = getFieldAccessor(itemDepthObject, depthObject);
        p.accessor = accessors.nodeFn; // nodes accessor
        p.valueAccessor = accessors.valueFn; // cell accessor
        p.attrAccessor = accessors.attrFn; // attr cell accessor
      }
    }
  }
};

export function augment(
  dataset: ExtractDataset,
  cache: ExtractCache,
  util: ExtractUtil,
  config: Record<string, unknown> = {}
) {
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
        let idx = order[i - 1] as number;
        f = cache.fields[idx];
      } else {
        let idx = cube.qEffectiveInterColumnSortOrder![i - 1] as number;
        // if (idx === -1) { // pseudo
        //   let childIdx = node.parent.children.indexOf(node);
        //   idx = cube.qDimensionInfo.length + childIdx; // measure field
        // }
        if (i > cube.qEffectiveInterColumnSortOrder!.length) {
          idx = cube.qDimensionInfo!.length;
        }

        f = cache.fields[idx];
      }
    }

    const { props, main } = util.normalizeConfig({ ...config, field: f ? f.key() : undefined }, dataset);
    const propsArr = Object.keys(props);
    propDefs[i] = { propsArr, props, main };

    const itemDepthObject = f ? getFieldDepth(f, { cube }) : { fieldDepth: 0 };

    attachPropsAccessors({
      propsArr,
      props,
      cube,
      cache,
      itemDepthObject,
      f,
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
      isTree: true,
    });
    descendants[i].data = ret;
  }
  return h;
}

export function extract(config: any, dataset: ExtractDataset, cache: ExtractCache, util: ExtractUtil): unknown[] {
  const cfgs = Array.isArray(config) ? config : [config];
  let dataItems: unknown[] = [];
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

      const itemDepthObject = getFieldDepth(f, { cube });
      const { nodeFn, attrFn, valueFn } = getFieldAccessor({ fieldDepth: 0 }, itemDepthObject);

      attachPropsAccessors({
        propsArr,
        props,
        cube,
        cache,
        itemDepthObject,
        f,
      });

      const track = !!cfgs[g].trackBy;
      const trackType = typeof cfgs[g].trackBy;
      const tracker: any = {};
      const trackedItems: unknown[] = [];

      const items = (nodeFn as (...args: unknown[]) => unknown[])(cache.tree);
      const mapped: unknown[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemData = attrFn ? attrFn(valueFn(item)) : valueFn(item);
        const exclude = main.filter && !(main.filter as (item: unknown) => unknown)(itemData);
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
          sourceKey,
        });
        // collect items based on the trackBy value
        // items with the same trackBy value are placed in an array and reduced later
        if (track) {
          (util.track as any)?.({
            cfg: cfgs[g],
            itemData,
            obj: ret,
            target: trackedItems,
            tracker,
            trackType,
          });
        }
        mapped.push(ret);
      }
      // reduce if items have been grouped
      const tmp = track
        ? ((util.collect as any)(trackedItems, {
            main,
            propsArr,
            props,
          }) as unknown[])
        : mapped;
      dataItems = [...dataItems, ...tmp];
    }
  }
  return dataItems;
}
