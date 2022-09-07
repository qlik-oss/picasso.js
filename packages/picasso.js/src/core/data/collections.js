import extend from 'extend';
import extract from './extractor';

/**
 * @interface CollectionSettings
 * @property {string} key Unique key for the collection
 * @property {DataExtraction} data Data configuration
 * @example
 * {
    key: 'my-collection',
    data: {
      extract: [{
        source: 'Products',
        field: 'Product',
        value: d => d.name,
        label: d => `<${d.name}>`
        props: {
          year: { field: 'Year' }
          num: { field: 'Sales' }
        }
      }],
      filter: d => d.label !== 'Sneakers', // extract everything except Sneakers
      sort: (a, b) => a.label > b.label ? -1 : 1, // sort descending
    }
 * }
 */

export default function create(config, d, opts, extractor = extract) {
  const collections = {};

  (config || []).forEach((cfg) => {
    if (!cfg.key) {
      throw new Error('Data collection is missing "key" property');
    }
    if (typeof cfg.data === 'object' && 'collection' in cfg.data) {
      throw new Error('Data config for collections may not reference other collections');
    }
    collections[cfg.key] = () => extractor(cfg.data, d, opts);
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
    if (typeof collections[k] === 'function') {
      collections[k] = collections[k]();
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
