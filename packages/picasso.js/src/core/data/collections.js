import extend from 'extend';
import extract from './extractor';

function create(config, d, opts, extractor = extract) {
  const collections = {};

  (config || []).forEach((cfg) => {
    if (!cfg.key) {
      throw new Error('Data collection is missing "key" property');
    }
    if (typeof cfg.data === 'object' && 'collection' in cfg.data) {
      throw new Error('Data config for collections may not reference other collections');
    }
    collections[cfg.key] = extractor(cfg.data, d, opts);
  });

  const fn = (key) => {
    let k;
    let cfg;
    if (typeof key === 'string') {
      k = key;
    } else if (typeof key === 'object') {
      k = key.key;
      cfg = key;
    }
    if (!(k in collections)) {
      throw new Error(`Unknown data collection: ${k}`);
    }
    let coll = collections[k];
    if (cfg) {
      if (cfg.fields && cfg.fields.filter) {
        let filtered = coll.fields.filter(cfg.fields.filter);
        if (coll.fields.length !== filtered.length) {
          coll = extend(coll, { fields: filtered });
        }
      }
    }

    return coll;
  };

  return fn;
}

export {
  create as default
};
