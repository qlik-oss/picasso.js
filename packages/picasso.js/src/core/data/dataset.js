import extend from 'extend';
import field from './field';
import extract from './extractor-matrix';

import { findField, getPropsInfo, collect, track } from './util';

const filters = {
  numeric: (values) => values.filter((v) => typeof v === 'number' && !isNaN(v)),
};

function createFields({ source, data, cache, config }) {
  let headers;
  let content = data;
  const parse = config && config.parse;
  if (Array.isArray(data[0])) {
    // assume 2d matrix of data
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
    flds = headers.map((h) => ({
      key: h,
      title: h,
    }));
  }

  let fieldValues;
  if (Array.isArray(data[0])) {
    fieldValues = flds.map(() => []);
  } else {
    fieldValues = {};
    flds.forEach((f) => {
      fieldValues[f.key] = [];
    });
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
  const fv = Array.isArray(fieldValues) ? (i) => fieldValues[i] : (i) => fieldValues[flds[i].key];
  for (let c = 0; c < flds.length; c++) {
    const values = fv(c);
    const numericValues = filters.numeric(values);
    const isMeasure = numericValues.length > 0;
    const type = isMeasure ? 'measure' : 'dimension';
    const min = isMeasure ? Math.min(...numericValues) : NaN;
    const max = isMeasure ? Math.max(...numericValues) : NaN;

    cache.fields.push(
      field(
        extend(
          {
            source,
            key: c,
            title: flds[c].title,
            values,
            min,
            max,
            type,
          },
          flds[c]
        ),
        {
          value: flds[c].value,
          label: flds[c].label,
        }
      )
    );
  }
}

const dsv = ({ data, config }) => {
  const rows = data.split('\n');
  const row0 = rows[0];
  const row1 = rows[1];
  let delimiter = ',';
  if (config && config.parse && config.parse.delimiter) {
    delimiter = config.parse.delimiter;
  } else if (row0) {
    // guess delimiter
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
  return rows.map((row) => row.split(delimiter));
};

const parseData = ({ key, data, cache, config }) => {
  if (!data) {
    return;
  }
  let dd = data;

  if (typeof dd === 'string') {
    // assume dsv
    dd = dsv({ data, config });
  }

  if (!Array.isArray(dd)) {
    return; // warn?
  }

  createFields({
    data: dd,
    cache,
    source: key,
    config,
  });
};

/**
 * Create a new dataset with default settings
 * @private
 * @return {Dataset}
 */
function ds({ key, data, config } = {}) {
  const cache = {
    fields: [],
  };

  /**
   * @alias Dataset
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
     * @returns {Field}
     */
    field: (query) =>
      findField(query, {
        cache,
        matrix: data,
      }),

    /**
     * Get all fields within this dataset
     * @returns {Array<Field>}
     */
    fields: () => cache.fields.slice(),

    /**
     * Extract data items from this dataset
     * @param {DataExtraction~Extract|DataFieldExtraction} config
     * @returns {Array<DatumExtract>}
     */
    extract: (cfg) => extract(cfg, dataset, cache),

    /**
     * @returns {null}
     */
    hierarchy: () => null,
  };

  parseData({
    key,
    data,
    config,
    cache,
  });

  return dataset;
}

ds.util = {
  normalizeConfig: getPropsInfo,
  collect,
  track,
};

export { ds as default };

/**
 * Callback function. Should return the key to stack by
 * @callback
 * @typedef {function} DataExtraction~StackKeyCallback
 * @param {DatumExtract} datum The extracted datum
 * @returns {any} The data value to stack by
 */

/**
 * Callback function. Should return the data value to stack with
 * @callback
 * @typedef {function} DataExtraction~StackValueCallback
 * @param {DatumExtract} datum The extracted datum
 * @returns {any} The data value to stack with
 */

/**
 * Callback function to filter the extracted data items
 * @callback
 * @typedef {function} DataExtraction~FilterCallback
 * @param {DatumExtract} datum The extracted datum
 * @returns {boolean} Return true if the datum should be included in the final data set
 */

/**
 * Callback function to sort the extracted data items
 * @callback
 * @typedef {function} DataExtraction~SortCallback
 * @param {DatumExtract} a The extracted datum
 * @param {DatumExtract} b The extracted datum
 * @returns {number} If less than 0, sort a before b. If greater than 0, sort b before a
 */

/**
 * Used to extract data from a `DataSource`
 * @typedef {object} DataExtraction
 * @property {DataExtraction~Extract|DataExtraction~Extract[]} extract Extract definition
 * @property {object} [stack] If provided, defines how the data should be stacked
 * @property {DataExtraction~StackKeyCallback} stack.stackKey Callback function. Should return the key to stack by
 * @property {DataExtraction~StackValueCallback} stack.value Callback function. Should return the data value to stack with
 * @property {DataExtraction~FilterCallback} [filter] Callback function to filter the extracted data items
 * @property {DataExtraction~SortCallback} [sort] Callback function to sort the extracted data items
 * @example
{
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
 */

/**
 * @typedef {object} DataFieldExtraction
 * @property {string} source - Which data source to extract from
 * @property {string} field - The field to extract data from
 * @property {DataExtraction~Extract~ValueFn|string|number|boolean} [value] - The field value accessor
 * @property {DataExtraction~Extract~LabelFn|string|number|boolean} [label] - The field label accessor
 * @example
 * {
 *  source: 'Products',
 *  field: 'Sales',
 *  value: (val) => Math.round(val),
 *  label: (val) => `<${val}>`
 * }
 */

/**
 * Data extraction definition. Define how and what kind of data should be extracted from a `DataSource`.
 * @typedef {object} DataExtraction~Extract
 * @property {string} source - Which data source to extract from
 * @property {string} field - The field to extract data from
 * @property {DataExtraction~Extract~ValueFn|string|number|boolean} [value] - The field value accessor
 * @property {DataExtraction~Extract~LabelFn|string|number|boolean} [label] - The field label accessor
 * @property {DataExtraction~Extract~TrackByFn} [trackBy] - Track by value accessor
 * @property {DataExtraction~Extract~ReduceFn|string} [reduce] - Reducer function
 * @property {DataExtraction~Extract~ReduceLabelFn|string} [reduceLabel] - Label reducer function
 * @property {DataExtraction~Extract~FilterFn} [filter] - Filter function
 * @property {object.<string, DataExtraction~Extract~Props>} [props] - Additional properties to add to the extracted item
 * @example
 * {
    source: 'Products',
    field: 'Product',
    value: (val) => val,
    label: (val) => `<${val}>`
    props: {
      year: { field: 'Year' }
      num: { field: 'Sales' }
    }
  }
 */

/**
 * @typedef {object} DataExtraction~Extract~Props
 * @property {string} field - The field to extract data from
 * @property {DataExtraction~Extract~ValueFn|string|number|boolean} [value] - The field value accessor
 * @property {DataExtraction~Extract~LabelFn|string|number|boolean} [label] - The field label accessor
 * @example
 * {
 *  field: 'Sales',
 *  value: (val) => Math.round(val),
 *  label: (val) => `<${val}>`
 * }
 */

/**
 * Value callback function
 * @callback DataExtraction~Extract~ValueFn
 * @param {any} cell The field cell
 * @returns {any}
 */

/**
 * Label callback function
 * @callback DataExtraction~Extract~LabelFn
 * @param {any} cell The field cell
 * @returns {string}
 */

/**
 * Filter callback function
 * @callback DataExtraction~Extract~FilterFn
 * @param {any} cell The field cell
 * @returns {boolean}
 */

/**
 * TrackBy callback function
 * @callback DataExtraction~Extract~TrackByFn
 * @param {any} cell The field cell
 * @returns {any}
 */

/**
 * Reduce callback function
 * @callback DataExtraction~Extract~ReduceFn
 * @param {any[]} values The collected values to reduce
 * @returns {any}
 */

/**
 * ReduceLabel callback function
 * @callback DataExtraction~Extract~ReduceLabelFn
 * @param {any[]} labels The collected labels to reduce
 * @param {any} value Reduced value
 * @returns {string}
 */

/**
 * @typedef {object} DatumExtract
 * @property {any} value - The extracted value
 * @property {string} label - The extracted value as a string
 * @property {object} source - The data source of the extracted data
 * @property {string} source.key - The data-source key
 * @property {string} source.field - The source field
 */
