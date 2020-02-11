// import types from './types';

/**
 * @ignore
 * @param {Array<data-source>} dataSources
 * @param {any} { logger }
 * @returns {function}
 */
export default function datasets(dataSources, { types, logger }) {
  const data = {};

  const sets = [];
  if (!Array.isArray(dataSources)) {
    logger.warn('Deprecated: "data-source" configuration"');
    sets.push(dataSources);
  } else {
    sets.push(...dataSources);
  }

  sets.forEach((d, i) => {
    let datasetFactory = types(d.type);
    if (datasetFactory) {
      let key = d.key;
      if (typeof d.key === 'undefined') {
        logger.warn(`Missing key for dataset. Using index '${i}' as key.`);
        key = i;
      }
      let dataset = datasetFactory({
        key,
        data: d.data,
        config: d.config,
      });
      data[key] = dataset;
    }
  });

  /**
   * Returns the `dataset` which has `key` as identifier
   * @ignore
   * @param {string} key - The dataset identifier
   * @returns {dataset}
   */
  const fn = key => {
    if (key) {
      return data[key];
    }
    return data[Object.keys(data)[0]];
  };
  return fn;
}

/**
 * @typedef {object} data-source
 * @property {string} key - Unique identifier for this data source
 * @property {string} type - The dataset type
 * @property {any} data
 */
