import { getPropsInfo, collect, track as storeTracked } from './util';

function datumExtract(propCfg, cell, { key }) {
  const datum = {
    value:
      typeof propCfg.value === 'function' // eslint-disable-line no-nested-ternary
        ? propCfg.value(cell)
        : typeof propCfg.value !== 'undefined'
        ? propCfg.value
        : cell,
  };

  datum.label =
    typeof propCfg.label === 'function' // eslint-disable-line no-nested-ternary
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

export default function extract(config, dataset) {
  const cfgs = Array.isArray(config) ? config : [config];
  let dataItems = [];
  cfgs.forEach((cfg) => {
    if (typeof cfg.field !== 'undefined') {
      const f = dataset.field(cfg.field);
      const sourceKey = dataset.key();
      if (!f) {
        throw Error(`Field '${cfg.field}' not found`);
      }
      const { props, main } = getPropsInfo(cfg, dataset);
      const propsArr = Object.keys(props);

      const track = !!cfg.trackBy;
      const trackType = typeof cfg.trackBy;
      const tracker = {};
      const trackedItems = [];

      const items = f.items();
      const mapped = [];
      for (let idx = 0; idx < items.length; idx++) {
        const mainCell = items[idx];
        const exclude = main.filter && !main.filter(mainCell);
        if (exclude) {
          continue;
        }
        const ret = datumExtract(main, mainCell, { key: sourceKey });

        // loop through all props that need to be mapped and
        // assign 'value' and 'source' to each property
        propsArr.forEach((prop) => {
          const p = props[prop];
          let propCell = p.field ? p.field.items()[idx] : mainCell;
          ret[prop] = datumExtract(p, propCell, { key: sourceKey });
        });

        // collect items based on the trackBy value
        // items with the same trackBy value are placed in an array and reduced later
        if (track) {
          storeTracked({
            cfg,
            itemData: mainCell,
            obj: ret,
            target: trackedItems,
            tracker,
            trackType,
          });
        }

        mapped.push(ret);
      }

      // reduce if items have been grouped
      if (track) {
        dataItems.push(
          ...collect(trackedItems, {
            main,
            propsArr,
            props,
          })
        );
      } else {
        dataItems.push(...mapped);
      }
    }
  });
  return dataItems;
}
