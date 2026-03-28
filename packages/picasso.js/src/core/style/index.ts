import extend from 'extend';

// Should consist of attributes that does not allow for null values
const GLOBAL_DEFAULTS: Record<string, unknown> = {
  fontFamily: 'Arial',
  fontSize: '13px',
  color: '#595959',
  fill: '#333333',
  backgroundColor: '#ffffff',
  stroke: '#000000',
  strokeWidth: 0,
};

interface CustomAccessor {
  fn?: ((context?: Record<string, unknown>, ...args: unknown[]) => unknown) | (() => unknown);
  scale?: (value: unknown) => unknown;
  ref?: string;
}

function getObject(root: Record<string, unknown>, steps: string[]): unknown {
  let obj: unknown = root;
  for (let i = 0; i < steps.length; i++) {
    if (typeof obj === 'object' && obj !== null && steps[i] in (obj as Record<string, unknown>)) {
      obj = (obj as Record<string, unknown>)[steps[i]];
    } else {
      return undefined;
    }
  }
  return obj;
}

function validateValue(globalFallback: unknown, value: unknown): unknown {
  // This attribute does not allow for null values
  return value === null && globalFallback ? globalFallback : value;
}

function wrapper(
  globalFallback: unknown,
  fallbackVal: CustomAccessor | unknown,
  fn: ((...args: unknown[]) => unknown) | null,
  fnContext: Record<string, unknown>,
  ...args: unknown[]
): unknown {
  const value = fn ? fn.call(fnContext, ...args) : null;
  if (typeof value !== 'undefined') {
    // Custom accessor returned a proper value
    return validateValue(globalFallback, value);
  }
  if (fallbackVal && typeof (fallbackVal as CustomAccessor).fn === 'function') {
    // fallback has a custom function, run it
    return (fallbackVal as CustomAccessor).fn!(fnContext, ...args);
  }
  // fallback is a value, return it
  return fallbackVal;
}

function attr(targets: Record<string, unknown>[], attribute: string, defaultVal: unknown, index: number): unknown {
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
    const targetFn = target[attribute] as unknown as ((this: Record<string, unknown>, ...args: unknown[]) => unknown);
    (target[attribute] as unknown as CustomAccessor).fn = (...args: unknown[]) =>
      wrapper(globalDefault, inner, targetFn, target as Record<string, unknown>, ...args);
    return target[attribute];
  }
  if (type === 'object') {
    return target[attribute];
  }

  return defaultVal;
}

function resolveAttribute(root: Record<string, unknown>, steps: string[], attribute: string, defaultVal: unknown): unknown {
  let i = steps.length;
  const targets: Record<string, unknown>[] = [];
  while (i >= 0) {
    const obj = getObject(root, steps) as Record<string, unknown> | undefined;
    targets.push(obj || {});
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
export function resolveStyle(defaults: Record<string, unknown>, styleRoot: Record<string, unknown>, path?: string): Record<string, unknown> {
  const steps = path ? path.split('.') : [];
  const ret: Record<string, unknown> = {};
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
export function resolveForDataValues(styles: Record<string, unknown>, dataValues: Record<string, unknown[]> | null | undefined, index: number): Record<string, unknown> {
  const ret: Record<string, unknown> = {};
  if (dataValues) {
    Object.keys(styles).forEach((s) => {
      ret[s] =
        styles[s] && typeof (styles[s] as CustomAccessor).fn === 'function'
          ? ((styles[s] as CustomAccessor).fn as (context: Record<string, unknown>, ...args: unknown[]) => unknown)(undefined as unknown as Record<string, unknown>, (dataValues[s] as unknown[])[index], index, dataValues[s])
          : styles[s];
    });
  } else {
    Object.keys(styles).forEach((s) => {
      ret[s] = styles[s] && typeof (styles[s] as CustomAccessor).fn === 'function' ? ((styles[s] as CustomAccessor).fn as () => unknown)() : styles[s];
    });
  }
  return ret;
}

function isPrimitive(v: unknown): boolean {
  return typeof v !== 'object';
}

interface DataObject {
  value?: unknown;
}

export function resolveForDataObject(
  props: Record<string, unknown>,
  dataObj: DataObject,
  index: number,
  allData: unknown,
  contextProps: Record<string, unknown>
): Record<string, unknown> {
  const ret: Record<string, unknown> = {};
  Object.keys(props).forEach((s) => {
    const exists = typeof props[s] !== 'undefined';
    const hasScale = exists && typeof (props[s] as CustomAccessor).scale === 'function';
    const hasExplicitDataProp = exists && !!(props[s] as CustomAccessor).ref;
    // const hasImplicitDataProp = typeof props[s] === 'object' ? s in dataObj : false;
    const propData = exists && (props[s] as CustomAccessor).ref ? (dataObj as unknown as Record<string, unknown>)[(props[s] as CustomAccessor).ref!] : dataObj;
    if (typeof props[s] === 'function') {
      // custom accessor function, not scale!
      const fnContext: Record<string, unknown> = extend({}, { data: dataObj }, contextProps);
      if (hasScale) {
        fnContext.scale = (props[s] as CustomAccessor).scale;
      }
      if (typeof (props[s] as CustomAccessor).fn === 'function') {
        ret[s] = (props[s] as CustomAccessor).fn!(fnContext, hasExplicitDataProp ? (dataObj as unknown as Record<string, unknown>)[(props[s] as CustomAccessor).ref!] : undefined, index, allData);
      } else {
        ret[s] = (props[s] as (this: Record<string, unknown>, val: unknown, index: number, allData: unknown) => unknown).call(fnContext, hasExplicitDataProp ? (dataObj as unknown as Record<string, unknown>)[(props[s] as CustomAccessor).ref!] : undefined, index, allData);
      }
    } else if (hasScale) {
      // } && (hasImplicitDataProp || hasExplicitDataProp)) {
      ret[s] = (props[s] as CustomAccessor).scale!(isPrimitive(propData) ? propData : (propData as DataObject).value);
      if ((props[s] as unknown as { scale: { bandwidth?: () => number } }).scale.bandwidth) {
        ret[s] = (ret[s] as number) + ((props[s] as unknown as { scale: { bandwidth?: () => number } }).scale.bandwidth!() / 2);
      }
    } else if (hasExplicitDataProp) {
      ret[s] = propData;
    } else {
      ret[s] = props[s];
    }
  });
  return ret;
}
