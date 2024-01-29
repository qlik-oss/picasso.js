/* eslint no-nested-ternary: 0 */

import extend from 'extend';

export function getFieldAccessor(field, page, deps, columnOrder) {
  if (!field) {
    return -1;
  }
  const cache = deps.cache;
  const origin = field.origin ? field.origin() : null;
  if (origin) {
    field = origin;
  }
  let fieldIdx = cache.fields.indexOf(field);
  let attrIdx = -1;
  let attrDimIdx = -1;
  if (fieldIdx === -1) {
    for (let i = 0; i < cache.wrappedFields.length; i++) {
      attrDimIdx = cache.wrappedFields[i].attrDims.map((v) => v.instance).indexOf(field);
      attrIdx = cache.wrappedFields[i].attrExps.map((v) => v.instance).indexOf(field);
      if (attrDimIdx !== -1 || attrIdx !== -1) {
        fieldIdx = i;
        break;
      }
    }
  }

  if (Array.isArray(columnOrder) && columnOrder.some((el, i) => el !== i)) {
    const correctIndex = columnOrder.indexOf(fieldIdx);
    if (correctIndex !== -1) {
      fieldIdx = correctIndex;
    }
  }

  fieldIdx -= page.qArea.qLeft;

  if (fieldIdx < 0 || fieldIdx >= page.qArea.qWidth) {
    // throw new Error('Field out of range');
    return -1;
  }

  if (attrDimIdx >= 0) {
    return (row) => row[fieldIdx].qAttrDims.qValues[attrDimIdx];
  }
  if (attrIdx >= 0) {
    return (row) => row[fieldIdx].qAttrExps.qValues[attrIdx];
  }

  return (row) => row[fieldIdx];
}

// TODO - handle 'other' value
// const specialTextValues = {
//   '-3': (meta) => {
//     if ('othersLabel' in meta) {
//       return meta.othersLabel;
//     }
//     return '';
//   }
// };

function datumExtract(propCfg, cell, { key }) {
  const datum = {
    value:
      typeof propCfg.value === 'function'
        ? propCfg.value(cell)
        : typeof propCfg.value !== 'undefined'
          ? propCfg.value
          : cell, // eslint-disable-line no-nested-ternary
  };

  datum.label =
    typeof propCfg.label === 'function'
      ? propCfg.label(cell)
      : typeof propCfg.label !== 'undefined'
        ? String(propCfg.label)
        : String(datum.value); // eslint-disable-line no-nested-ternary

  if (propCfg.field) {
    datum.source = {
      key,
      field: propCfg.field.key(),
    };
  }

  return datum;
}

function cellToValue({ cache, f, mainCell, p, prop, page, rowIdx, row, sourceKey, target, targetProp, columnOrder }) {
  let propCell = mainCell;
  if (p.field && p.field !== f) {
    const propCellFn = getFieldAccessor(p.field, page, { cache }, columnOrder);
    if (propCellFn === -1) {
      return;
    }
    propCell = extend({ qRow: rowIdx }, propCellFn(row));
  }
  target[targetProp] = datumExtract(p, propCell, { key: sourceKey }, prop);
}

export default function extract(config, dataset, cache, util) {
  const cfgs = Array.isArray(config) ? config : [config];
  let dataItems = [];
  for (let i = 0; i < cfgs.length; i++) {
    if (typeof cfgs[i].field !== 'undefined') {
      const cube = dataset.raw();
      const sourceKey = dataset.key();
      const f = typeof cfgs[i].field === 'object' ? cfgs[i].field : dataset.field(cfgs[i].field);
      const { props, main } = util.normalizeConfig(cfgs[i], dataset);
      const propsArr = Object.keys(props);

      const track = !!cfgs[i].trackBy;
      const trackType = typeof cfgs[i].trackBy;
      const tracker = {};
      const trackedItems = [];
      const items = [];

      for (let j = 0; j < cube.qDataPages.length; j++) {
        const fn = getFieldAccessor(f, cube.qDataPages[j], { cache }, cube.qColumnOrder);
        if (fn === -1) {
          continue;
        }
        for (let k = 0; k < cube.qDataPages[j].qMatrix.length; k++) {
          const rowIdx = cube.qDataPages[j].qArea.qTop + k;
          const mainCell = extend({ qRow: rowIdx }, fn(cube.qDataPages[j].qMatrix[k]));
          const ret = datumExtract(main, mainCell, { key: sourceKey });
          const exclude = main.filter && !main.filter(mainCell);
          if (exclude) {
            continue;
          }

          for (let l = 0; l < propsArr.length; l++) {
            const p = props[propsArr[l]];
            let arr = p.fields || [p];

            if (p.fields) {
              ret[propsArr[l]] = [];
            }

            // loop through all props that need to be mapped and
            // assign 'value' and 'source' to each property
            for (let m = 0; m < arr.length; m++) {
              cellToValue({
                cache,
                f,
                mainCell,
                p: arr[m],
                prop: propsArr[l],
                props,
                page: cube.qDataPages[j],
                rowIdx,
                row: cube.qDataPages[j].qMatrix[k],
                sourceKey,
                target: p.fields ? ret[propsArr[l]] : ret,
                targetProp: p.fields ? m : propsArr[l],
                columnOrder: cube.qColumnOrder,
              });
            }

            if (p.fields) {
              const fieldValues = ret[propsArr[l]].map((v) => v.value);
              const fieldLabels = ret[propsArr[l]].map((v) => v.label);
              ret[propsArr[l]] = {
                value:
                  typeof p.value === 'function'
                    ? p.value(fieldValues)
                    : typeof p.value !== 'undefined'
                      ? p.value
                      : fieldValues,
                label:
                  typeof p.label === 'function'
                    ? p.label(fieldLabels)
                    : typeof p.label !== 'undefined'
                      ? String(p.label)
                      : String(ret[propsArr[l]].value),
              };
            }
          }

          // collect items based on the trackBy value
          // items with the same trackBy value are placed in an array and reduced later
          if (track) {
            util.track({
              cfg: cfgs[i],
              itemData: mainCell,
              obj: ret,
              target: trackedItems,
              tracker,
              trackType,
            });
          }

          items.push(ret);
        }
      }

      // reduce if items have been grouped
      const tmp = track
        ? util.collect(trackedItems, {
            main,
            propsArr,
            props,
          })
        : items;
      dataItems = [...dataItems, ...tmp];
    }
  }
  return dataItems;
}
