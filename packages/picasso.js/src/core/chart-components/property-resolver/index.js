import extend from 'extend';

const GLOBAL_DEFAULTS = {
  fontFamily: 'Arial',
  fontSize: '13px',
  color: '#595959',
  backgroundColor: '#ffffff',
  stroke: '#000000',
  strokeWidth: 0,
  $fill: '#333333',
};

const REF_RX = /^\$/;

function isPrimitive(x) {
  const type = typeof x;
  return type !== 'object' && type !== 'function' && type !== 'undefined';
}

/**
 * Callback function
 * @callback datumAccessor
 * @param {DatumExtract} d datum
 * @example
 * (d) => Math.min(0, d.value);
 */

/**
 * @typedef {object} DatumConfig
 * @property {string} [scale] - Name of a scale
 * @property {datumAccessor} [fn]
 * @property {string} [ref] - A reference to a DatumExtract property
 * @example
 * // Implicitly resolve the datum by passing a referenced data through the scale
 * {
 *  scale: '<name-of-scale>',
 *  ref: '<data-property>'
 * }
 *
 * // or explictly resolve the datum using callback function
 * {
 *  fn: (d) => Math.min(0, d.datum.x.value);
 * }
 */

/**
 * Custom type that is either a string, DatumConfig or a datumAccessor
 * @typedef {string|DatumConfig|datumAccessor} DatumString
 */

/**
 * Custom type that is either a number, DatumConfig or a datumAccessor
 * @typedef {number|DatumConfig|datumAccessor} DatumNumber
 */

/**
 * Custom type that is either a boolean, DatumConfig or a datumAccessor
 * @typedef {boolean|DatumConfig|datumAccessor} DatumBoolean
 */

/**
 * Normalizes property settings
 *
 * @ignore
 * @export
 * @param {any} settings
 * @param {any} defaults
 * @param {any} chart
 * @returns {any}
 */
export function normalizeSettings(settings, defaults, chart) {
  const composition = extend({}, settings);
  const defs = extend({}, defaults);
  Object.keys(composition).forEach((key) => {
    defs[key] = {};
    const v = composition[key];
    const vType = typeof v;
    if (typeof v === 'function') {
      defs[key].fn = v;
    } else if (isPrimitive(v)) {
      let defaultValue = defaults[key];
      if (typeof defaultValue === 'string' && REF_RX.test(defaultValue)) {
        defaultValue = GLOBAL_DEFAULTS[defaultValue];
      }
      const defaultType = typeof defaultValue;
      if (defaultType === 'undefined') {
        // if property has no default, assign provided value
        defs[key] = v;
      } else {
        // assign provided value if it's of same type as default, otherwise use default
        defs[key] = defaultType === vType ? v : defaultValue;
      }
    } else if (v && typeof v === 'object') {
      if (typeof v.fn === 'function') {
        defs[key].fn = v.fn;
      }
      if (typeof v.scale !== 'undefined') {
        defs[key].scale = chart.scale(v.scale);
      }
      if (typeof v.ref === 'string') {
        defs[key].ref = v.ref;
      }
    }
  });

  Object.keys(defaults).forEach((key) => {
    if (key in composition) {
      // don't process same props again
      return;
    }
    const v = defaults[key];
    const defaultType = typeof v;
    if (defaultType === 'string' && REF_RX.test(v)) {
      defs[key] = GLOBAL_DEFAULTS[v];
    } else {
      defs[key] = v;
    }
  });

  return defs;
}

export function resolveForItem(context, normalized, idx) {
  const ret = {};
  const keys = Object.keys(normalized);
  const len = keys.length;
  const fallbackData = context.datum;
  const datum = context.datum;
  for (let i = 0; i < len; i++) {
    const key = keys[i];
    const normalizedProp = normalized[key];
    const exists = typeof datum === 'object' && typeof normalizedProp !== 'undefined';
    const hasExplicitDataProp = exists && typeof normalizedProp.ref === 'string';
    const hasImplicitDataProp = exists && key in datum;
    const propData = hasExplicitDataProp ? datum[normalizedProp.ref] : hasImplicitDataProp ? datum[key] : fallbackData; // eslint-disable-line
    if (isPrimitive(normalizedProp)) {
      ret[key] = normalizedProp;
    } else if (exists && normalizedProp.fn) {
      // callback function
      if (normalizedProp.scale) {
        context.scale = normalizedProp.scale;
      }
      ret[key] = normalizedProp.fn.call(null, context, idx);
    } else if (exists && normalizedProp.scale && propData) {
      ret[key] = normalizedProp.scale(propData.value);
      if (normalizedProp.scale.bandwidth) {
        ret[key] += normalizedProp.scale.bandwidth() / 2;
      }
    } else if (hasExplicitDataProp && propData) {
      ret[key] = propData.value;
    } else if (normalizedProp.fn) {
      ret[key] = normalizedProp.fn.call(null, context, idx);
    } else {
      ret[key] = normalizedProp;
    }
  }
  return ret;
}
