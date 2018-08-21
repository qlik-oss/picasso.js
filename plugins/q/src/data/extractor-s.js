import extend from 'extend';

export function getFieldAccessor(field, page, deps) {
  if (!field) {
    return -1;
  }
  const cache = deps.cache;
  let fieldIdx = cache.fields.indexOf(field);
  let attrIdx = -1;
  let attrDimIdx = -1;
  if (fieldIdx === -1) {
    for (let i = 0; i < cache.wrappedFields.length; i++) {
      attrDimIdx = cache.wrappedFields[i].attrDims.map(v => v.instance).indexOf(field);
      attrIdx = cache.wrappedFields[i].attrExps.map(v => v.instance).indexOf(field);
      if (attrDimIdx !== -1 || attrIdx !== -1) {
        fieldIdx = i;
        break;
      }
    }
  }

  fieldIdx -= page.qArea.qLeft;
  if (fieldIdx < 0 || fieldIdx >= page.qArea.qWidth) {
    // throw new Error('Field out of range');
    return -1;
  }

  let path = `row[${fieldIdx}]`;

  if (attrDimIdx >= 0) {
    return Function('row', `return ${path}.qAttrDims.qValues[${attrDimIdx}];`); // eslint-disable-line no-new-func
  }
  if (attrIdx >= 0) {
    return Function('row', `return ${path}.qAttrExps.qValues[${attrIdx}];`); // eslint-disable-line no-new-func
  }

  return Function('row', `return ${path};`); // eslint-disable-line no-new-func
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

function cellToValue({
  cache,
  f,
  mainCell,
  p,
  prop,
  page,
  rowIdx,
  row,
  sourceKey,
  target,
  targetProp
}) {
  let propCell = mainCell;
  if (p.field && p.field !== f) {
    const propCellFn = getFieldAccessor(p.field, page, { cache });
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
  cfgs.forEach((cfg) => {
    if (typeof cfg.field !== 'undefined') {
      const cube = dataset.raw();
      const sourceKey = dataset.key();
      const f = typeof cfg.field === 'object' ? cfg.field : dataset.field(cfg.field);
      const { props, main } = util.normalizeConfig(cfg, dataset);
      const propsArr = Object.keys(props);

      const track = !!cfg.trackBy;
      const trackType = typeof cfg.trackBy;
      const tracker = {};
      const trackedItems = [];
      const items = [];

      cube.qDataPages.forEach((page) => {
        const fn = getFieldAccessor(f, page, { cache });
        if (fn === -1) {
          return;
        }
        page.qMatrix.forEach((row, i) => {
          const rowIdx = page.qArea.qTop + i;
          const mainCell = extend({ qRow: rowIdx }, fn(row));
          const ret = datumExtract(main, mainCell, { key: sourceKey });
          const exclude = main.filter && !main.filter(mainCell);
          if (exclude) {
            return;
          }

          // loop through all props that need to be mapped and
          // assign 'value' and 'source' to each property
          propsArr.forEach((prop) => {
            const p = props[prop];
            let arr = p.fields || [p];

            if (p.fields) {
              ret[prop] = [];
            }
            arr.forEach((pp, fidx) => {
              cellToValue({
                cache,
                f,
                mainCell,
                p: pp,
                prop,
                props,
                page,
                rowIdx,
                row,
                sourceKey,
                target: p.fields ? ret[prop] : ret,
                targetProp: p.fields ? fidx : prop
              });
            });
            // if (!track && p.fields) {
            //   const fieldValues = ret[prop].map(v => v.value);
            //   ret[prop] = {
            //     value: typeof p.reduce === 'function' ? p.reduce(fieldValues) : fieldValues
            //   };
            // }
            if (p.fields) {
              const fieldValues = ret[prop].map(v => v.value);
              const fieldLabels = ret[prop].map(v => v.label);
              ret[prop] = {
                value: typeof p.value === 'function' ? p.value(fieldValues) : typeof p.value !== 'undefined' ? p.value : fieldValues // eslint-disable-line no-nested-ternary
              };
              ret[prop].label = typeof p.label === 'function' ? p.label(fieldLabels) : typeof p.label !== 'undefined' ? String(p.label) : String(ret[prop].value); // eslint-disable-line no-nested-ternary
            }
          });

          // collect items based on the trackBy value
          // items with the same trackBy value are placed in an array and reduced later
          if (track) {
            util.track({
              cfg,
              itemData: mainCell,
              obj: ret,
              target: trackedItems,
              tracker,
              trackType
            });
          }

          items.push(ret);
        });
      });

      // reduce if items have been grouped
      if (track) {
        dataItems.push(...util.collect(trackedItems, {
          main,
          propsArr,
          props
        }));
      } else {
        dataItems.push(...items);
      }
    }
  });
  return dataItems;
}
