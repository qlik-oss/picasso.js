import extend from 'extend';
import field from './field';
import extract from './extractor-matrix';

import {
  findField,
  getPropsInfo,
  collect,
  track
} from './util';

const filters = {
  numeric: values => values.filter(v => typeof v === 'number' && !isNaN(v))
};

function createFields({
  source, data, cache, config
}) {
  let headers;
  let content = data;
  const parse = config && config.parse;
  if (Array.isArray(data[0])) { // assume 2d matrix of data
    if (parse && parse.headers === false) {
      headers = data[0].map((v, i) => i);
    } else {
      headers = data[0];
      content = data.slice(1);
    }
  } else {
    headers = Object.keys(data[0]);
  }

  const rowFn = !!parse && typeof parse.row === 'function' && parse.row;
  let flds = headers;

  if (parse && typeof parse.fields === 'function') {
    flds = parse.fields(flds.slice());
  } else {
    flds = headers.map(h => ({
      key: h,
      title: h
    }));
  }

  let fieldValues;
  if (Array.isArray(data[0])) {
    fieldValues = flds.map(() => []);
  } else {
    fieldValues = {};
    flds.forEach((f) => { fieldValues[f.key] = []; });
  }

  for (let r = 0; r < content.length; r++) {
    const row = rowFn ? rowFn(content[r], r, flds) : content[r];
    if (!row) {
      continue;
    }
    if (Array.isArray(row)) {
      for (let c = 0; c < flds.length; c++) {
        fieldValues[c].push(row[c]);
      }
    } else {
      for (let c = 0; c < flds.length; c++) {
        fieldValues[flds[c].key].push(row[flds[c].key]);
      }
    }
  }
  const fv = Array.isArray(fieldValues) ? (i => fieldValues[i]) : (i => fieldValues[flds[i].key]);
  for (let c = 0; c < flds.length; c++) {
    const values = fv(c);
    const numericValues = filters.numeric(values);
    const isMeasure = numericValues.length > 0;
    const type = isMeasure ? 'measure' : 'dimension';
    const min = isMeasure ? Math.min(...numericValues) : NaN;
    const max = isMeasure ? Math.max(...numericValues) : NaN;

    cache.fields.push(field(extend({
      source,
      key: c,
      title: flds[c].title,
      values,
      min,
      max,
      type
    }, flds[c]), {
      value: flds[c].value,
      label: flds[c].label
    }));
  }
}

const dsv = ({ data, config }) => {
  const rows = data.split('\n');
  const row0 = rows[0];
  const row1 = rows[1];
  let delimiter = ',';
  if (config && config.parse && config.parse.delimiter) {
    delimiter = config.parse.delimiter;
  } else if (row0) { // guess delimiter
    const guesses = [/,/, /\t/, /;/];
    for (let i = 0; i < guesses.length; i++) {
      const d = guesses[i];
      if (row0 && row1) {
        if (d.test(row0) && d.test(row1) && row0.split(d).length === row1.split(d).length) {
          delimiter = d;
          break;
        }
      } else if (d.test(row0)) {
        delimiter = d;
      }
    }
  }
  return rows.map(row => row.split(delimiter));
};

const parseData = ({
  key, data, cache, config
}) => {
  if (!data) {
    return;
  }
  let dd = data;

  if (typeof dd === 'string') { // assume dsv
    dd = dsv({ data, config });
  }

  if (!Array.isArray(dd)) {
    return; // warn?
  }

  createFields({
    data: dd,
    cache,
    source: key,
    config
  });
};

/**
 * Create a new dataset with default settings
 * @private
 * @return {dataset}
 */
function ds({
  key,
  data,
  config
} = {}) {
  const cache = {
    fields: []
  };

  /**
   * @alias dataset
   * @interface
   */
  const dataset = {
    /**
     * Get the key identifying this dataset
     * @returns {string}
     */
    key: () => key,

    /**
     * Get the raw data
     * @returns {any}
     */
    raw: () => data,

    /**
     * Find a field within this dataset
     * @param {string} query - The field to find
     * @returns {field}
     */
    field: query => findField(query, {
      cache,
      matrix: data
    }),

    /**
     * Get all fields within this dataset
     * @returns {Array<field>}
     */
    fields: () => cache.fields.slice(),

    /**
     * Extract data items from this dataset
     * @param {data-extract-config} config
     * @returns {Array<datum-extract>}
     */
    extract: cfg => extract(cfg, dataset, cache),

    /**
     * @returns {null}
     */
    hierarchy: () => null
  };

  parseData({
    key, data, config, cache
  });

  return dataset;
}

ds.util = {
  normalizeConfig: getPropsInfo,
  collect,
  track
};

export { ds as default };

/**
 * @typedef {object} data-extract-config
 * @property {string} field - The field to extract data from
 * @property {data-extract-config~valueFn} [value] - The field value accessor
 * @property {data-extract-config~labelFn} [label] - The field label accessor
 * @property {data-extract-config~trackByFn} [trackBy] - Track by value accessor
 * @property {data-extract-config~reduceFn} [reduce] - Reducer function
 * @property {data-extract-config~filterFn} [filter] - Filter function
 * @property {object} [props] - Additional properties to add to the extracted item
 */

/**
 * @callback data-extract-config~valueFn
 * @param {any} cell The field cell
 * @returns {any}
 */

/**
 * @callback data-extract-config~labelFn
 * @param {any} cell The field cell
 * @returns {string}
 */

/**
 * @callback data-extract-config~filterFn
 * @param {any} cell The field cell
 * @returns {boolean}
 */

/**
 * @callback data-extract-config~trackByFn
 * @param {any} cell The field cell
 * @returns {any}
 */

/**
 * @callback data-extract-config~reduceFn
 * @param {any} cell The field cell
 * @returns {any}
 */

/**
 * @typedef {object} datum-extract
 * @property {any} value - The extracted value
 * @property {string} label - The extracted value as a string
 * @property {object} source - The data source of the extracted data
 * @property {string} source.key - The data-source key
 * @property {string} source.field - The source field
 */
