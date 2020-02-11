import stack from './stack';

export default function extract(dataConfig, data = {}, opts = {}) {
  let extracted = {
    // items: [],
    // fields: [],
    // source: null,
    // value: null,
    // label: null,
    // children: null,
    // root: null,
    // graph: null
  };

  const logger = opts.logger;

  if (Array.isArray(dataConfig)) {
    // if data is an array, assume it's manual data input -> normalize
    extracted.items = dataConfig.map(v => ({ value: v, label: String(v) }));
  } else if (dataConfig) {
    if ('collection' in dataConfig) {
      extracted = { ...data.collection(dataConfig.collection) };
    } else {
      const source = data.dataset ? data.dataset(dataConfig.source) : null;
      let valueFn = dataConfig.value || (d => d);
      let labelFn = dataConfig.label || (d => d);
      if (dataConfig.groupBy || dataConfig.mapTo) {
        // DEPRECATION
        logger.warn('Deprecated "data" configuration', dataConfig);
        extracted.items = [];
      } else if (dataConfig.hierarchy) {
        extracted.root = source.hierarchy ? source.hierarchy(dataConfig.hierarchy) : null;
        extracted.fields = source.fields();
      } else if (dataConfig.items) {
        extracted.items = dataConfig.items.map(v => ({ value: valueFn(v), label: String(labelFn(v)) }));
      } else if (dataConfig.extract) {
        const extractionsConfigs = Array.isArray(dataConfig.extract) ? dataConfig.extract : [dataConfig.extract];
        extracted.items = [];
        const sourceFields = [];
        extractionsConfigs.forEach(cfg => {
          const s = cfg.source ? data.dataset(cfg.source) : source;
          if (!s) {
            return;
          }
          extracted.items.push(...s.extract(cfg));
          if (typeof cfg.field !== 'undefined') {
            sourceFields.push(s.field(cfg.field));
          }
        });
        if (sourceFields.length) {
          extracted.fields = sourceFields;
        }
        if (dataConfig.amend && Array.isArray(dataConfig.amend)) {
          extracted.items.push(...dataConfig.amend);
        }
      } else if (typeof dataConfig.field !== 'undefined' && source) {
        const f = source.field(dataConfig.field);
        if (f) {
          if (!extracted.fields) {
            extracted.fields = [];
          }
          extracted.fields.push(f);
          if (!('value' in dataConfig)) {
            valueFn = f.value || (v => v);
            labelFn = f.label || (v => v);
            extracted.value = valueFn;
          }
          extracted.items = f
            .items()
            .map(v => ({ value: valueFn(v), label: String(labelFn(v)), source: { field: dataConfig.field } }));
          // TODO - add source: { key: dataConfig.source, field: dataConfig.field, data: v }
        }
      } else if (dataConfig.fields) {
        dataConfig.fields.forEach(obj => {
          const s = typeof obj === 'object' && obj.source ? data.dataset(obj.source) : source;
          if (!s) {
            return;
          }
          let f;
          if (typeof obj === 'object' && typeof obj.field !== 'undefined') {
            f = s.field(obj.field);
          } else {
            f = s.field(obj);
          }
          if (f) {
            if (!extracted.fields) {
              extracted.fields = [];
            }
            extracted.fields.push(f);
          }
        });
      }

      if (extracted.items && dataConfig.map) {
        extracted.items = extracted.items.map(dataConfig.map);
      }
    }

    if (dataConfig && dataConfig.stack) {
      stack(extracted, dataConfig.stack, data.dataset);
    }
  }
  if (dataConfig && !Array.isArray(dataConfig) && typeof dataConfig.filter === 'function' && extracted.items) {
    extracted.items = extracted.items.filter(dataConfig.filter);
  }
  if (dataConfig && !Array.isArray(dataConfig) && typeof dataConfig.sort === 'function' && extracted.items) {
    extracted.items = extracted.items.sort(dataConfig.sort);
  }
  return extracted;
}
