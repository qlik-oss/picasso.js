import type { RegistryFn, Logger } from '../../types';

interface ParentRegistry {
  get(key: string): unknown;
  has(key: string): boolean;
  default(d?: unknown): unknown;
}

export default function registryFactory(
  parentRegistry?: RegistryFn | null,
  registerName = 'unspecified',
  logger?: Logger | null
): RegistryFn {
  let defaultValue: unknown;
  const reg: Record<string, unknown> = {};
  const parent: ParentRegistry = parentRegistry || {
    get: () => undefined,
    has: () => false,
    default: () => undefined,
  };

  defaultValue = parent.default();

  /**
   * @private
   * @param {string} key
   * @param {any} value
   * @throws {TypeError} Key must be a non-empty string
   * @returns {boolean} False if the given key already exists, true otherwise
   * @example
   * var r = registry();
   * r.add( "marker", function(args) {
   *   return new markers[args.type](args);
   * });
   *
   */
  function add(key: string, value: unknown): boolean {
    if (!key || typeof key !== 'string') {
      throw new TypeError('Invalid argument: key must be a non-empty string');
    }
    if (key in reg) {
      return false;
    }
    reg[key] = value;
    return true;
  }

  function get(key: string): unknown {
    return reg[key] || parent.get(key);
  }

  function has(key: string): boolean {
    return !!reg[key] || parent.has(key);
  }

  function remove(key: string): unknown {
    const d = reg[key];
    delete reg[key];
    return d;
  }

  function getKeys() {
    return Object.keys(reg);
  }

  function getValues() {
    return Object.keys(reg).map((key) => reg[key]);
  }

  function deflt(d?: unknown): unknown {
    if (typeof d !== 'undefined') {
      defaultValue = d;
    }
    return defaultValue;
  }

  /**
   * Register a `value` with the given `key`. If `value` is omitted, returns the `value` of `key`.
   * @alias registry
   * @param {string} key Name of the type to register
   * @param {any} [value] Value to store in the registry.
   * @returns {any} Registered value
   */
  function registry(key: string, value?: unknown): unknown {
    if (typeof value !== 'undefined') {
      return add(key, value);
    }
    const ret = get(key);
    if (logger && typeof ret === 'undefined') {
      logger.warn(`${key} does not exist in ${registerName} registry`);
    }
    return ret || get(defaultValue);
  }

  registry.add = add;
  registry.get = get;
  registry.has = has;
  registry.remove = remove;
  registry.getKeys = getKeys;
  registry.getValues = getValues;
  registry.default = deflt;
  registry.register = add; // deprecated

  return registry;
}
