import extend from 'extend';

// Should consist of attributes that does not allow for null values
const GLOBAL_DEFAULTS = {
  fontFamily: 'Arial',
  fontSize: '13px',
  color: '#595959',
  fill: '#333333',
  backgroundColor: '#ffffff',
  stroke: '#000000',
  strokeWidth: 0,
};

function getObject(root, steps) {
  let obj = root;
  for (let i = 0; i < steps.length; i++) {
    if (obj[steps[i]]) {
      obj = obj[steps[i]];
    } else {
      return undefined;
    }
  }
  return obj;
}

function validateValue(globalFallback, value) {
  // This attribute does not allow for null values
  return value === null && globalFallback ? globalFallback : value;
}

function wrapper(globalFallback, fallbackVal, fn, fnContext, ...args) {
  const value = fn ? fn.call(fnContext, ...args) : null;
  if (typeof value !== 'undefined') {
    // Custom accessor returned a proper value
    return validateValue(globalFallback, value);
  }
  if (fallbackVal && typeof fallbackVal.fn === 'function') {
    // fallback has a custom function, run it
    return fallbackVal.fn(fnContext, ...args);
  }
  // fallback is a value, return it
  return fallbackVal;
}

function attr(targets, attribute, defaultVal, index) {
  const target = targets[index];
  const globalDefault = GLOBAL_DEFAULTS[attribute];
  if (!target) {
    return defaultVal;
  }
  const type = typeof target[attribute];

  if (type === 'undefined') {
    // undefined value
    if (index < targets.length - 1) {
      // check inheritance
      return attr(targets, attribute, defaultVal, index + 1);
    }
    // end of the chain, return default
    return defaultVal;
  }
  if (typeof target[attribute] === typeof defaultVal || target[attribute] === null) {
    // constant value of same type as default or explicitly set to null
    return validateValue(globalDefault, target[attribute]);
  }

  // custom accessor function
  if (type === 'function') {
    // Return function with fallback attribute value
    const inner = attr(targets, attribute, defaultVal, index + 1);
    target[attribute].fn = (...args) => wrapper(globalDefault, inner, target[attribute], ...args);
    return target[attribute];
  }
  if (type === 'object') {
    return target[attribute];
  }

  return defaultVal;
}

function resolveAttribute(root, steps, attribute, defaultVal) {
  let i = steps.length;
  const targets = [];
  while (i >= 0) {
    targets.push(getObject(root, steps));
    steps.pop();
    i--;
  }

  return attr(targets, attribute, defaultVal, 0);
}
/**
 * Resolves styles from multiple sources
 * @private
 * @param {object} defaults Default settings of the target property
 * @param {object} settings Externally defined style root
 * @param {string} propertyName Name of child property to access
 * @returns {object} combined styles
 * @example
 * // returns { stroke: "#00f", strokeWidth: 2, fill: "red",
 *     width: function(999, widthResolve, ...args) }
 * resolveSettings(
 *    {
 *    stroke: "#000",
 *    strokeWidth: 1,
 *       fill: "red",
 *       width: 999
 *  },
 *   {
 *        stroke: "#f00",
 *        strokeWidth: 2,
 *        parts: {
 *            rect: {
 *                stroke: "#00f",
 *                width: function widthResolve ( dataVal, index, dataValues ) {
 *                  return dataVal.value;
 *                }
 *            },
 *            label: { }
 *        }
 *    },
 *    "parts.rect" );
 */
export function resolveStyle(defaults, styleRoot, path) {
  const steps = path ? path.split('.') : [];
  const ret = {};
  Object.keys(defaults).forEach((s) => {
    const def = defaults[s] === null && typeof GLOBAL_DEFAULTS[s] !== 'undefined' ? GLOBAL_DEFAULTS[s] : defaults[s];
    ret[s] = resolveAttribute(styleRoot, steps.concat(), s, def);
  });
  return ret;
}
/**
 * Resolves styles for individual data values
 * @private
 * @param {object} styles for the target
 * @param {array} dataValues Calculated values for the target
 * @param {int} index Current index in dataValues array to resolve
 * @returns {object} resolved styles for each attribute as appropriate type
 */
export function resolveForDataValues(styles, dataValues, index) {
  const ret = {};
  if (dataValues) {
    Object.keys(styles).forEach((s) => {
      ret[s] =
        styles[s] && typeof styles[s].fn === 'function'
          ? styles[s].fn(undefined, dataValues[s][index], index, dataValues[s])
          : styles[s];
    });
  } else {
    Object.keys(styles).forEach((s) => {
      ret[s] = styles[s] && typeof styles[s].fn === 'function' ? styles[s].fn() : styles[s];
    });
  }
  return ret;
}

function isPrimitive(v) {
  return typeof v !== 'object';
}

export function resolveForDataObject(props, dataObj, index, allData, contextProps) {
  const ret = {};
  Object.keys(props).forEach((s) => {
    const exists = typeof props[s] !== 'undefined';
    const hasScale = exists && typeof props[s].scale === 'function';
    const hasExplicitDataProp = exists && !!props[s].ref;
    // const hasImplicitDataProp = typeof props[s] === 'object' ? s in dataObj : false;
    const propData = exists && props[s].ref ? dataObj[props[s].ref] : dataObj;
    if (typeof props[s] === 'function') {
      // custom accessor function, not scale!
      const fnContext = extend({}, { data: dataObj }, contextProps);
      if (hasScale) {
        fnContext.scale = props[s].scale;
      }
      if (typeof props[s].fn === 'function') {
        ret[s] = props[s].fn(fnContext, hasExplicitDataProp ? dataObj[props[s].ref] : undefined, index, allData);
      } else {
        ret[s] = props[s].call(fnContext, hasExplicitDataProp ? dataObj[props[s].ref] : undefined, index, allData);
      }
    } else if (hasScale) {
      // } && (hasImplicitDataProp || hasExplicitDataProp)) {
      ret[s] = props[s].scale(isPrimitive(propData) ? propData : propData.value);
      if (props[s].scale.bandwidth) {
        ret[s] += props[s].scale.bandwidth() / 2;
      }
    } else if (hasExplicitDataProp) {
      ret[s] = propData;
    } else {
      ret[s] = props[s];
    }
  });
  return ret;
}
