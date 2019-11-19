import {
  stack,
  stackOrderAscending,
  stackOrderInsideOut,
  stackOrderNone,
  stackOrderReverse,
  stackOffsetDiverging,
  stackOffsetNone,
  stackOffsetSilhouette,
  stackOffsetExpand,
  stackOffsetWiggle
} from 'd3-shape';
import fieldFn from './field';

const OFFSETS = {
  diverging: stackOffsetDiverging,
  none: stackOffsetNone,
  silhouette: stackOffsetSilhouette,
  expand: stackOffsetExpand,
  wiggle: stackOffsetWiggle
};

const ORDERS = {
  ascending: stackOrderAscending,
  insideout: stackOrderInsideOut,
  none: stackOrderNone,
  reverse: stackOrderReverse
};

function stacked(data, config, ds) {
  const stackIds = {};
  const stackFn = config.stackKey;
  const valueFn = config.value;
  const startProp = config.startProp || 'start';
  const endProp = config.endProp || 'end';
  const offset = config.offset || 'none';
  const order = config.order || 'none';
  const valueRef = config.valueRef || '';
  const itemOrderKeyFn = config.itemOrderKey;

  let count = 0;
  let maxStackCount = 0;
  let valueFields = {};
  let idList = {};
  let id;

  if (typeof itemOrderKeyFn === 'function') {
    for (let i = 0; i < data.items.length; i++) {
      let p = data.items[i];
      let sourceField = valueRef ? p[valueRef] : null;
      id = itemOrderKeyFn(p);
      if (!(id in idList)) {
        idList[id] = count++;
      }
      if (sourceField && sourceField.source) {
        let ff = `${sourceField.source.key || ''}/${sourceField.source.field}`;
        if (!valueFields[ff]) {
          valueFields[ff] = sourceField.source;
        }
      }
      let sid = stackFn(p);
      stackIds[sid] = stackIds[sid] || { items: [] };
      stackIds[sid].items[idList[id]] = p;

      maxStackCount = Math.max(maxStackCount, stackIds[sid].items.length);
    }
  } else {
    for (let i = 0; i < data.items.length; i++) {
      let p = data.items[i];
      let sourceField = valueRef ? p[valueRef] : null;
      if (sourceField && sourceField.source) {
        let ff = `${sourceField.source.key || ''}/${sourceField.source.field}`;
        if (!valueFields[ff]) {
          valueFields[ff] = sourceField.source;
        }
      }
      let sid = stackFn(p);
      stackIds[sid] = stackIds[sid] || { items: [] };
      stackIds[sid].items.push(p);

      maxStackCount = Math.max(maxStackCount, stackIds[sid].items.length);
    }
  }

  const keys = Array.apply(null, { length: maxStackCount }).map(Number.call, Number); // eslint-disable-line
  const matrix = Object.keys(stackIds).map((sid) => stackIds[sid].items);

  const d3Stack = stack()
    .keys(keys)
    .value((s, key) => (s[key] ? valueFn(s[key]) : 0))
    .order(ORDERS[order])
    .offset(OFFSETS[offset]);

  let series = d3Stack(matrix);
  let values = [];

  for (let i = 0; i < series.length; i++) {
    let serie = series[i];
    for (let s = 0; s < serie.length; s++) {
      let range = serie[s];
      let item = serie[s].data[serie.key];
      if (!item) {
        continue;
      }
      item[startProp] = { value: range[0] };
      item[endProp] = { value: range[1] };
      values.push(range[0], range[1]);
    }
  }

  let stackedFields = Object.keys(valueFields).map((f) => {
    let dSource = ds(valueFields[f].key);
    return dSource ? dSource.field(valueFields[f].field) : null;
  }).filter((f) => !!f);

  const field = fieldFn({
    title: stackedFields.map((f) => f.title()).join(', '),
    min: Math.min(...values),
    max: Math.max(...values),
    type: 'measure',
    formatter: stackedFields[0] ? stackedFields[0].formatter : undefined
  });
  data.fields.push(field);
}

export { stacked as default };
