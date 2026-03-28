import extend from 'extend';

import EventEmitter from '../utils/event-emitter';

import rangeCollection from './range-collection';
import valueCollection from './value-collection';
import type { BrushRangeConfig } from './range-collection';

/** Brush configuration */
export interface BrushConfig {
  ranges?: BrushRangeConfig[];
}

/** A brush value item */
export interface BrushItem {
  key: string;
  value?: string | number;
  values?: Array<string | number>;
}

/** A brush range item (used in addRanges, removeRanges, setRanges, toggleRanges) */
export interface BrushRangeItem {
  key: string;
  /** Single range object */
  range?: { min: number; max: number };
  /** Multiple ranges */
  ranges?: Array<{ min: number; max: number }>;
}

interface ValueCollection {
  add(value: string | number): boolean;
  remove(value: string | number): boolean;
  contains(value: string | number): boolean;
  values(): Array<string | number>;
  toString(): string;
}

/**
 * @typedef {object} BrushConfig
 * @property {Array<BrushConfig~Ranges>} [ranges] - Range configurations
 */

/**
 * @typedef {object}
 * @alias BrushConfig~Ranges
 */
const DEFAULT_RANGE_CONFIG = {
  /**
   * An identifier that represents the data source of the value
   * @type {string=}
   */
  key: undefined,
  /**
   * Whether or not the minimum value of a range should be included when determining if a value is brushed.
   * @type {boolean=} */
  includeMin: true,
  /**
   * Whether or not the maximum value of a range should be included when determining if a value is brushed.
   * @type {boolean=} */
  includeMax: true,
};

interface AddCollectionParams {
  items: BrushItem[];
  collection: Record<string, ValueCollection>;
  vc: () => ValueCollection;
}

interface ChangedItem {
  id: string;
  values: Array<string | number>;
}

function add({ items, collection, vc }: AddCollectionParams): ChangedItem[] {
  const changedMap: Record<string, Array<string | number>> = {};
  const changed: ChangedItem[] = [];
  let key: string;
  let values: Array<string | number> = [];

  for (let i = 0, num = items.length; i < num; i++) {
    key = items[i].key;
    if (!collection[key]) {
      collection[key] = vc();
    }
    if (items[i].values !== undefined) {
      values = items[i].values || [];
    } else if (items[i].value !== undefined) {
      values = [items[i].value!];
    } else {
      values = [];
    }
    for (let vi = 0; vi < values.length; vi++) {
      if (collection[key].add(values[vi])) {
        changedMap[key] = changedMap[key] || [];
        changedMap[key].push(values[vi]);
      }
    }
  }

  const keys = Object.keys(changedMap);
  for (let i = 0, num = keys.length; i < num; i++) {
    key = keys[i];
    changed.push({ id: key, values: changedMap[key] });
  }

  return changed;
}

interface RemoveCollectionParams {
  items: BrushItem[];
  collection: Record<string, ValueCollection>;
}

function remove({ items, collection }: RemoveCollectionParams): ChangedItem[] {
  const changedMap: Record<string, Array<string | number>> = {};
  const changed: ChangedItem[] = [];
  let key: string;
  let values: Array<string | number> = [];

  for (let i = 0, num = items.length; i < num; i++) {
    key = items[i].key;
    if (!collection[key]) {
      continue;
    }
    if (items[i].values !== undefined) {
      values = items[i].values || [];
    } else if (items[i].value !== undefined) {
      values = [items[i].value!];
    } else {
      values = [];
    }
    for (let vi = 0; vi < values.length; vi++) {
      if (collection[key].remove(values[vi])) {
        changedMap[key] = changedMap[key] || [];
        changedMap[key].push(values[vi]);
      }
    }
  }

  const keys = Object.keys(changedMap);
  for (let i = 0, num = keys.length; i < num; i++) {
    key = keys[i];
    changed.push({ id: key, values: changedMap[key] });
  }

  return changed;
}

interface FilteredSet {
  [key: string]: Array<string | number>;
}

function collectUnique(items: BrushItem[]): FilteredSet {
  const filteredSet: FilteredSet = {};
  let key: string;
  let values: Array<string | number> = [];

  for (let i = 0, num = items.length; i < num; i++) {
    key = items[i].key;
    if (items[i].values !== undefined) {
      values = items[i].values || [];
    } else if (items[i].value !== undefined) {
      values = [items[i].value!];
    } else {
      values = [];
    }
    if (!filteredSet[key]) {
      filteredSet[key] = [];
    }
    for (let vi = 0; vi < values.length; vi++) {
      const idx = filteredSet[key].indexOf(values[vi]);
      if (idx === -1) {
        filteredSet[key].push(values[vi]);
      }
    }
  }

  return filteredSet;
}

interface CreateValueCollectionParams {
  key: string;
  collection: Record<string, ValueCollection>;
  obj: Record<string, Array<string | number>>;
  fn: () => ValueCollection;
  value: string | number;
}

function createValueCollection({ key, collection, obj, fn, value }: CreateValueCollectionParams): void {
  if (!collection[key]) {
    collection[key] = fn();
  }
  obj[key] = obj[key] || [];
  obj[key].push(value);
  collection[key].add(value);
}

interface ToggleParams {
  items: BrushItem[];
  values: Record<string, ValueCollection>;
  vc: () => ValueCollection;
}

export function toggle({ items, values, vc }: ToggleParams): [ChangedItem[], ChangedItem[]] {
  const addedMap: Record<string, Array<string | number>> = {};
  const removedMap: Record<string, Array<string | number>> = {};
  const added: ChangedItem[] = [];
  const removed: ChangedItem[] = [];
  const filteredSet = collectUnique(items);
  let key: string;
  let value: string | number;
  let fs: Array<string | number>;

  const setKeys = Object.keys(filteredSet);
  for (let i = 0, num = setKeys.length; i < num; i++) {
    key = setKeys[i];
    fs = filteredSet[key];

    for (let k = 0, len = fs.length; k < len; k++) {
      value = fs[k];
      if (!values[key] || !values[key].contains(value)) {
        createValueCollection({
          key,
          value,
          collection: values,
          obj: addedMap,
          fn: vc,
        });
      } else if (values[key] && values[key].contains(value)) {
        removedMap[key] = removedMap[key] || [];
        removedMap[key].push(value);
        values[key].remove(value);
      }
    }
  }

  const addedKeys = Object.keys(addedMap);
  for (let i = 0, num = addedKeys.length; i < num; i++) {
    key = addedKeys[i];
    added.push({ id: key, values: addedMap[key] });
  }

  const removedKeys = Object.keys(removedMap);
  for (let i = 0, num = removedKeys.length; i < num; i++) {
    key = removedKeys[i];
    removed.push({ id: key, values: removedMap[key] });
  }

  return [added, removed];
}

function diff(old: Record<string, Array<string | number>>, current: Record<string, Array<string | number>>): ChangedItem[] {
  const changed: ChangedItem[] = [];
  const keys = Object.keys(old);
  let key: string;
  let changedValues: Array<string | number>;
  const filterFn = (v: string | number) => current[key].indexOf(v) === -1;

  for (let i = 0, num = keys.length; i < num; i++) {
    key = keys[i];
    if (!current[key]) {
      changed.push({ id: key, values: old[key] });
    } else {
      changedValues = old[key].filter(filterFn);
      if (changedValues.length) {
        changed.push({ id: key, values: changedValues });
      }
    }
  }

  return changed;
}

interface SetParams {
  items: BrushItem[];
  vCollection: Record<string, ValueCollection>;
  vc: () => ValueCollection;
}

export function set({ items, vCollection, vc }: SetParams): [ChangedItem[], ChangedItem[]] {
  const addedMap: Record<string, Array<string | number>> = {};
  const filteredSet = collectUnique(items);
  let added: ChangedItem[] = [];
  let removed: ChangedItem[] = [];
  let key: string;

  const oldMap: Record<string, Array<string | number>> = {};
  const vcKeys = Object.keys(vCollection);
  for (let i = 0, num = vcKeys.length; i < num; i++) {
    key = vcKeys[i];
    oldMap[key] = vCollection[key].values().slice();
    delete vCollection[key];
  }

  const createValueCollectionFn = (value: string | number) => {
    if (!vCollection[key] || !vCollection[key].contains(value)) {
      createValueCollection({
        key,
        value,
        collection: vCollection,
        obj: addedMap,
        fn: vc,
      });
    }
  };

  const fsKeys = Object.keys(filteredSet);
  for (let i = 0, num = fsKeys.length; i < num; i++) {
    key = fsKeys[i];
    filteredSet[key].forEach(createValueCollectionFn);
  }

  removed = diff(oldMap, addedMap);
  added = diff(addedMap, oldMap);

  return [added, removed];
}

function applyAliases(items: BrushItem[], aliases: Record<string, string>): BrushItem[] {
  if (!Object.keys(aliases).length) {
    return items;
  }
  const len = items.length;
  const its = Array(len);
  for (let i = 0; i < len; i++) {
    its[i] = items[i].key in aliases ? extend({}, items[i], { key: aliases[items[i].key] }) : items[i];
  }
  return its;
}

type InterceptorFn = (items: BrushItem[]) => BrushItem[];

function intercept(handlers: InterceptorFn[] | undefined, items: BrushItem[], aliases: Record<string, string>): BrushItem[] {
  const its = applyAliases(items, aliases);
  return handlers && handlers.length ? handlers.reduce((value: BrushItem[], interceptor: InterceptorFn) => interceptor(value), its) : its;
}

function toCamelCase(s: string): string {
  return s.replace(/(-[a-z])/g, ($1: string) => $1.toUpperCase().replace('-', ''));
}

function toSnakeCase(s: string): string {
  return s.replace(/([A-Z])/g, ($1: string) => `-${$1.toLowerCase()}`);
}

interface RangeCollection {
  add(range: { min: number; max: number }): boolean;
  remove(range: { min: number; max: number }): boolean;
  set(ranges: Array<{ min: number; max: number }>): boolean;
  toggle(range: { min: number; max: number }): boolean;
  configure(config: BrushRangeConfig): void;
  ranges(): Array<{ min: number; max: number }>;
  containsValue(value: number): boolean;
  containsRange(range: { min: number; max: number }): boolean;
}

interface BrushInfo {
  type: 'range' | 'value';
  id: string;
  brush: {
    values(): Array<string | number>;
    ranges(): Array<{ min: number; max: number }>;
  };
}

interface BrushState {
  values?: Record<string, Array<string | number>>;
  ranges?: Record<string, Array<{ min: number; max: number }>>;
}

interface BrushInstance {
  (): void;
  configure(config: BrushConfig): void;
  link(target: BrushInstance): void;
  _state(s?: BrushState): BrushState;
  start(...args: unknown[]): void;
  end(...args: unknown[]): void;
  isActive(): boolean;
  clear(): void;
  brushes(): BrushInfo[];
  addValue(key: string, value?: string | number): void;
  addValues(items: BrushItem[]): void;
  setValues(items: BrushItem[]): void;
  removeValue(key: string, value?: string | number): void;
  removeValues(items: BrushItem[]): void;
  toggleValue(key: string, value?: string | number): void;
  toggleValues(items: BrushItem[]): void;
  containsValue(key: string, value?: string | number): boolean;
  addRange(key: string, range?: { min: number; max: number }): void;
  addRanges(items: BrushRangeItem[]): void;
  removeRange(key: string, range?: { min: number; max: number }): void;
  removeRanges(items: BrushRangeItem[]): void;
  setRange(key: string, range?: { min: number; max: number }): void;
  setRanges(items: BrushRangeItem[]): void;
  toggleRange(key: string, range?: { min: number; max: number }): void;
  toggleRanges(items: BrushRangeItem[]): void;
  containsRange(key: string, range?: { min: number; max: number }): boolean;
  containsRangeValue(key: string, value?: number): boolean;
  addAndRemoveValues(addItems: BrushItem[], removeItems?: BrushItem[]): void;
  intercept(name: string, ic?: InterceptorFn): void;
  removeInterceptor(name: string, ic?: InterceptorFn): void;
  removeAllInterceptors(name?: string): void;
  addKeyAlias(key: string, alias: string): void;
  removeKeyAlias(key: string): void;
  on(event: string, listener: (...args: unknown[]) => void): void;
  emit(event: string, ...args: unknown[]): void;
  containsMappedData(item: unknown, props?: unknown[], mode?: string): boolean;
}

interface UpdateRangeParams {
  ranges: Record<string, RangeCollection>;
  interceptors: Record<string, InterceptorFn[]>;
  rc: (config: BrushRangeConfig) => RangeCollection;
  aliases: Record<string, string>;
  rangeConfig: { sources: Record<string, BrushRangeConfig>; default: BrushRangeConfig };
}

function updateRange(items: BrushRangeItem[], action: 'add' | 'remove' | 'set' | 'toggle', { ranges, interceptors, rc, aliases, rangeConfig }: UpdateRangeParams): boolean {
  const inter = `${action}Ranges` as keyof typeof interceptors;
  const its = intercept(interceptors[inter] as InterceptorFn[], items as unknown as BrushItem[], aliases);
  let changed = false;
  its.forEach((item: any) => {
    const key = item.key;
    if (!ranges[key]) {
      ranges[key] = rc(rangeConfig.sources[key] || rangeConfig.default);
    }
    if (action === 'set') {
      changed = ranges[key][action](item.ranges || item.range) || changed;
    } else {
      const rangeValues = item.ranges || [item.range];
      for (let i = 0; i < rangeValues.length; i++) {
        changed = ranges[key][action](rangeValues[i]) || changed;
      }
    }
  });

  return changed;
}

// @ts-ignore - rangeCollection returns RangeCollectionFn but we treat it as RangeCollection
export default function brush({ vc = valueCollection, rc = rangeCollection }: { vc?: () => ValueCollection; rc?: (config?: BrushRangeConfig) => RangeCollection } = {}): BrushInstance {
  let activated = false;
  let ranges: Record<string, RangeCollection> = {};
  let values: Record<string, ValueCollection> = {};
  let aliases: Record<string, string> = {};
  let rangeConfig: { sources: Record<string, BrushRangeConfig>; default: BrushRangeConfig } = {
    sources: {},
    default: extend({}, DEFAULT_RANGE_CONFIG),
  };
  const interceptors: Record<string, InterceptorFn[]> = {
    addValues: [],
    removeValues: [],
    toggleValues: [],
    setValues: [],
    addRanges: [],
    setRanges: [],
    removeRanges: [],
    toggleRanges: [],
  };

  const getState = (): BrushState => {
    const state: BrushState = {
      values: {},
      ranges: {},
    };
    Object.keys(values).forEach((key) => {
      state.values![key] = values[key].values();
    });
    Object.keys(ranges).forEach((key) => {
      state.ranges![key] = ranges[key].ranges();
    });
    return state;
  };

  interface Links {
    ls: BrushInstance[];
    clear(): void;
    start(): void;
    end(): void;
    update(): void;
    updateValues(): void;
    updateRanges(): void;
  }

  const links: Links = {
    ls: [],
    clear(this: Links) {
      this.ls.forEach((b) => b.clear());
    },
    start(this: Links) {
      this.ls.forEach((b) => b.start());
    },
    end(this: Links) {
      this.ls.forEach((b) => b.end());
    },
    update(this: Links) {
      const s = getState();
      this.ls.forEach((b) => b._state(s));
    },
    updateValues(this: Links) {
      const s = getState();
      this.ls.forEach((b) =>
        b._state({
          values: s.values,
        })
      );
    },
    updateRanges(this: Links) {
      const s = getState();
      this.ls.forEach((b) =>
        b._state({
          ranges: s.ranges,
        })
      );
    },
  };

  const fn: BrushInstance = {} as BrushInstance;

  /**
   * Triggered when this brush is activated
   * @event Brush#start
   * @type {string}
   */

  /**
   * Triggered when this brush is updated
   * @event Brush#update
   * @type {string}
   * @param {Array<object>} added - The added items
   * @param {Array<object>} removed - The removed items
   */

  /**
   * Triggered when this brush is deactivated
   * @event Brush#end
   * @type {string}
   */

  /**
   * Configure the brush instance.
   *
   * @param {BrushConfig} config
   * @example
   * brushInstance.configure({
   *   ranges: [
   *     { key: 'some key', includeMax: false },
   *     { includeMax: true, includeMin: true },
   *   ]
   * })
   */
  fn.configure = (config: BrushConfig = {}): void => {
    if (Array.isArray(config.ranges) && config.ranges.length) {
      rangeConfig = {
        sources: {},
        default: extend({}, DEFAULT_RANGE_CONFIG),
      };

      config.ranges.forEach((cfg: BrushRangeConfig) => {
        const c: Record<string, boolean | undefined> = {};
        Object.keys(DEFAULT_RANGE_CONFIG)
          .filter((attr) => attr !== 'key')
          .forEach((attr) => {
            c[attr] = typeof cfg[attr as keyof BrushRangeConfig] !== 'undefined' ? cfg[attr as keyof BrushRangeConfig] : (DEFAULT_RANGE_CONFIG[attr as keyof typeof DEFAULT_RANGE_CONFIG] as any);
          });

        if (typeof cfg.key !== 'undefined') {
          rangeConfig.sources[cfg.key] = c as unknown as BrushRangeConfig;
        } else {
          rangeConfig.default = c as unknown as BrushRangeConfig;
        }
      });

      Object.keys(ranges).forEach((key) => ranges[key].configure(rangeConfig.sources[key] || rangeConfig.default));

      // TODO only emit update if config has changed
      fn.emit('update', [], []);
    }
  };

  /**
   * Link this brush to another brush instance.
   *
   * When linked, the `target` will receive updates whenever this brush changes.
   * @param {Brush} target - The brush instance to link to
   */
  fn.link = (target: BrushInstance): void => {
    if (fn === target) {
      throw new Error("Can't link to self");
    }
    links.ls.push(target);
    target._state(getState());
  };

  fn._state = (s?: BrushState): BrushState => {
    if (!s) {
      return getState();
    }
    if (s.values) {
      const arr: BrushItem[] = [];
      Object.keys(s.values).forEach((key) => {
        if (!values[key] || s.values![key].join(';') !== values[key].toString()) {
          arr.push({
            key,
            values: s.values![key],
          });
        }
      });
      Object.keys(values).forEach((key) => {
        if (!s.values![key]) {
          arr.push({
            key,
            values: [],
          });
        }
      });
      if (arr.length) {
        fn.setValues(arr);
      }
    }
    if (s.ranges) {
      const arr: BrushRangeItem[] = [];
      Object.keys(s.ranges).forEach((key) => {
        if (!ranges[key] || s.ranges![key].join(';') !== ranges[key].toString()) {
          arr.push({
            key,
            ranges: s.ranges![key],
          });
        }
      });
      Object.keys(ranges).forEach((key) => {
        if (!s.ranges![key]) {
          arr.push({
            key,
            ranges: [],
          });
        }
      });
      if (arr.length) {
        fn.setRanges(arr);
      }
    }
    return undefined as unknown as BrushState;
  };

  /**
   * Starts this brush context
   *
   * Starts this brush context and emits a 'start' event if it is not already started.
   * @param {...any} args - arguments to be passed to 'start' listeners
   * @emits Brush#start
   */
  fn.start = (...args: unknown[]): void => {
    if (!activated) {
      activated = true;
      fn.emit('start', ...args);
      links.start();
    }
  };

  /**
   * Ends this brush context
   *
   * Ends this brush context and emits an 'end' event if it is not already ended.
   * @param {...any} args - arguments to be passed to 'end' listeners
   * @emits Brush#end
   */
  fn.end = (...args: unknown[]): void => {
    if (!activated) {
      return;
    }
    activated = false;
    ranges = {};
    values = {};
    fn.emit('end', ...args);
    links.end();
  };

  /**
   * Checks if this brush is activated
   *
   * Returns true if started, false otherwise
   * @return {boolean}
   */
  fn.isActive = (): boolean => activated;

  /**
   * Clears this brush context
   */
  fn.clear = (): void => {
    const removed = fn
      .brushes()
      .filter((b) => b.type === 'value' && b.brush.values().length)
      .map((b) => ({ id: b.id, values: b.brush.values() }));
    const hasChanged = Object.keys(ranges).length > 0 || removed.length;
    ranges = {};
    values = {};
    if (hasChanged) {
      fn.emit('update', [], removed); // TODO - do not emit update if state hasn't changed
      links.clear();
    }
  };

  /**
   * Returns all brushes within this context
   * @return {object}
   */
  fn.brushes = (): BrushInfo[] => {
    let result: BrushInfo[] = [];
    result = result.concat(
      Object.keys(ranges).map((key) => ({
        type: 'range' as const,
        id: key,
        brush: ranges[key] as any,
      }))
    );

    result = result.concat(
      Object.keys(values).map((key) => ({
        type: 'value' as const,
        id: key,
        brush: values[key] as any,
      }))
    );

    return result;
  };

  /**
   * Adds a primitive value to this brush context
   *
   * If this brush context is not started, a 'start' event is emitted.
   * If the state of the brush changes, ie. if the added value does not already exist, an 'update' event is emitted.
   *
   * @param {string} key  An identifier that represents the data source of the value
   * @param {string|number} value The value to add
   * @emits Brush#start
   * @emits Brush#update
   * @example
   * brush.addValue('countries', 'Sweden');
   * brush.addValue('/qHyperCube/qDimensionInfo/0', 3);
   */
  fn.addValue = (key: string, value?: string | number): void => {
    fn.addValues([{ key, value }]);
  };

  /**
   * @param {object[]} items Items to add
   */
  fn.addValues = (items: BrushItem[]): void => {
    const its = intercept(interceptors.addValues, items, aliases);
    const added = add({
      vc,
      collection: values,
      items: its,
    });

    fn.emit('add-values', its);

    if (added.length) {
      if (!activated) {
        activated = true;
        fn.emit('start');
      }
      fn.emit('update', added, []);
      links.updateValues();
    }
  };

  /**
   * @param {object[]} items Items to set
   */
  fn.setValues = (items: BrushItem[]): void => {
    const its = intercept(interceptors.setValues, items, aliases);
    const changed = set({
      items: its,
      vCollection: values,
      vc,
    });

    fn.emit('set-values', its);

    if (changed[0].length > 0 || changed[1].length > 0) {
      if (!activated) {
        activated = true;
        fn.emit('start');
      }
      fn.emit('update', changed[0], changed[1]);
      links.updateValues();
    }
  };

  /**
   * Removes a primitive values from this brush context
   *
   * If the state of the brush changes, ie. if the removed value does exist, an 'update' event is emitted.
   *
   * @param  {string} key  An identifier that represents the data source of the value
   * @param  {string|number} value The value to remove
   * @example
   * brush.removeValue('countries', 'Sweden');
   */
  fn.removeValue = (key: string, value?: string | number): void => {
    fn.removeValues([{ key, value }]);
  };

  /**
   * @param {object[]} items Items to remove
   */
  fn.removeValues = (items: BrushItem[]): void => {
    const its = intercept(interceptors.removeValues, items, aliases);
    const removed = remove({
      collection: values,
      items: its,
    });

    fn.emit('remove-values', its);

    if (removed.length) {
      fn.emit('update', [], removed);
      links.updateValues();
      // TODO - emit 'end' event if there are no remaining active brushes
    }
  };

  /**
   * Add and remove values in a single operation
   * almost the same as calling addValues and removeValues but only triggers one 'update' event
   *
   * If the state of the brush changes, an 'update' event is emitted.
   *
   * @param {object[]} addItems Items to add
   * @param {object[]} removeItems Items to remove
   */
  fn.addAndRemoveValues = (addItems: BrushItem[], removeItems?: BrushItem[]): void => {
    const addIts = intercept(interceptors.addValues, addItems, aliases);
    const removeIts = intercept(interceptors.removeValues, removeItems || [], aliases);
    const added = add({
      vc,
      collection: values,
      items: addIts,
    });
    const removed = remove({
      collection: values,
      items: removeIts,
    });

    fn.emit('add-values', addIts);
    fn.emit('remove-values', removeIts);

    if (added.length || removed.length) {
      if (!activated) {
        activated = true;
        fn.emit('start');
      }
      fn.emit('update', added, removed);
      links.updateValues();
    }
  };

  /**
   * Toggles a primitive value in this brush context
   *
   * If the given value exists in this brush context, it will be removed. If it does not exist it will be added.
   *
   * @param  {string} key  An identifier that represents the data source of the value
   * @param  {string|number} value The value to toggle
   * @example
   * brush.toggleValue('countries', 'Sweden');
   */
  fn.toggleValue = (key: string, value?: string | number): void => {
    fn.toggleValues([{ key, value }]);
  };

  /**
   * @param {object[]} items Items to toggle
   */
  fn.toggleValues = (items: BrushItem[]): void => {
    const its = intercept(interceptors.toggleValues, items, aliases);
    const toggled = toggle({
      items: its,
      values,
      vc,
    });

    fn.emit('toggle-values', its);

    if (toggled[0].length > 0 || toggled[1].length > 0) {
      if (!activated) {
        activated = true;
        fn.emit('start');
      }
      fn.emit('update', toggled[0], toggled[1]);
      links.updateValues();
    }
  };

  /**
   * Checks if a certain value exists in this brush context
   *
   * Returns true if the values exists for the provided key, returns false otherwise.
   *
   * @param  {string} key  An identifier that represents the data source of the value
   * @param  {string|number} value The value to check for
   * @return {boolean}
   * @example
   * brush.addValue('countries', 'Sweden');
   * brush.containsValue('countries', 'Sweden'); // true
   * brush.toggleValue('countries', 'Sweden'); // remove 'Sweden'
   * brush.containsValue('countries', 'Sweden'); // false
   */
  fn.containsValue = (key: string, value?: string | number): boolean => {
    let k = aliases[key] || key;
    if (!values[k]) {
      return false;
    }
    return values[k].contains(value!);
  };

  /**
   * Adds a numeric range to this brush context
   *
   * @param {string} key - An identifier that represents the data source of the range
   * @param {object} range - The range to add to this brush
   * @param {number} range.min - Min value of the range
   * @param {number} range.max - Max value of the range
   * @example
   * brush.addRange('Sales', { min: 20, max: 50 });
   */
  fn.addRange = (key: string, range?: { min: number; max: number }): void => {
    fn.addRanges([{ key, range }]);
  };

  /**
   * @see {brush.addRange}
   * @param {object[]} items - Items containing the ranges to remove
   * @param {string} items[].key
   * @param {object} items[].range
   */
  fn.addRanges = (items: BrushRangeItem[]): void => {
    const changed = updateRange(items, 'add', {
      ranges,
      rc,
      interceptors,
      aliases,
      rangeConfig,
    });

    if (!changed) {
      return;
    }

    if (!activated) {
      activated = true;
      fn.emit('start');
    }
    fn.emit('update', [], []);
    links.updateRanges();
  };

  /**
   * Removes a numeric range from this brush context
   *
   * @param {string} key - An identifier that represents the data source of the range
   * @param {object} range - The range to remove from this brush
   * @param {number} range.min - Min value of the range
   * @param {number} range.max - Max value of the range
   */
  fn.removeRange = (key: string, range?: { min: number; max: number }): void => {
    fn.removeRanges([{ key, range }]);
  };

  /**
   * @see {brush.removeRange}
   * @param {object[]} items - Items containing the ranges to remove
   */
  fn.removeRanges = (items: BrushRangeItem[]): void => {
    const changed = updateRange(items, 'remove', {
      ranges,
      rc,
      interceptors,
      aliases,
      rangeConfig,
    });

    if (!changed) {
      return;
    }

    if (!activated) {
      activated = true;
      fn.emit('start');
    }
    fn.emit('update', [], []);
    links.updateRanges();
  };

  /**
   * Sets a numeric range to this brush context
   *
   * Overwrites any active ranges identified by `key`
   *
   * @param {string} key - An identifier that represents the data source of the range
   * @param {object} range - The range to set on this brush
   * @param {number} range.min - Min value of the range
   * @param {number} range.max - Max value of the range
   */
  fn.setRange = (key: string, range?: { min: number; max: number }): void => {
    fn.setRanges([{ key, range }]);
  };

  /**
   * @see {brush.setRange}
   * @param {object[]} items - Items containing the ranges to set
   */
  fn.setRanges = (items: BrushRangeItem[]): void => {
    const changed = updateRange(items, 'set', {
      ranges,
      rc,
      interceptors,
      aliases,
      rangeConfig,
    });

    if (!changed) {
      return;
    }

    if (!activated) {
      activated = true;
      fn.emit('start');
    }
    fn.emit('update', [], []);
    links.updateRanges();
  };

  /**
   * Toggles a numeric range in this brush context
   *
   * Removes the range if it's already contained within the given identifier,
   * otherwise the given range is added to the brush.
   *
   * @param {string} key - An identifier that represents the data source of the range
   * @param {object} range - The range to toggle in this brush
   * @param {number} range.min - Min value of the range
   * @param {number} range.max - Max value of the range
   */
  fn.toggleRange = (key: string, range?: { min: number; max: number }): void => {
    fn.toggleRanges([{ key, range }]);
  };

  /**
   * @see {brush.toggleRange}
   * @param {object[]} items - Items containing the ranges to toggle
   */
  fn.toggleRanges = (items: BrushRangeItem[]): void => {
    const changed = updateRange(items, 'toggle', {
      ranges,
      rc,
      interceptors,
      aliases,
      rangeConfig,
    });

    if (!changed) {
      return;
    }

    if (!activated) {
      activated = true;
      fn.emit('start');
    }
    fn.emit('update', [], []);
    links.updateRanges();
  };

  /**
   * Checks if a value is contained within a range in this brush context
   *
   * Returns true if the values exists for the provided key, returns false otherwise.
   *
   * @param  {string} key - An identifier that represents the data source of the value
   * @param  {number} value - The value to check for
   * @return {boolean}
   * @example
   * brush.addRange('Sales', { min: 10, max: 50 });
   * brush.containsRangeValue('Sales', 30); // true
   * brush.containsRangeValue('Sales', 5); // false
   */
  fn.containsRangeValue = (key: string, value?: number): boolean => {
    let k = aliases[key] || key;
    if (!ranges[k]) {
      return false;
    }
    return ranges[k].containsValue(value!);
  };

  /**
   * Checks if a range segment is contained within this brush context
   *
   * Returns true if the range segment exists for the provided key, returns false otherwise.
   *
   * @param {string} key - An identifier that represents the data source of the value
   * @param {object} range - The range to check for
   * @param {number} range.min - Min value of the range
   * @param {number} range.max - Max value of the range
   * @return {boolean}
   * @example
   * brush.addRange('Sales', { min: 10, max: 50 });
   * brush.containsRange('Sales', { min: 15, max: 20 }); // true - the range segment is fully contained within [10, 50]
   * brush.containsRange('Sales', { min: 5, max: 20 }); // false - part of the range segment is outside [10, 50]
   * brush.containsRange('Sales', { min: 30, max: 80 }); // false - part of the range segment is outside [10, 50]
   */
  fn.containsRange = (key: string, range?: { min: number; max: number }): boolean => {
    let k = aliases[key] || key;
    if (!ranges[k]) {
      return false;
    }
    return ranges[k].containsRange(range!);
  };

  fn.containsMappedData = (d: Record<string, any>, props?: string[], mode?: string): boolean => {
    let status: Array<{ key: string; i: number; bool: boolean }> = [];
    const keys = Object.keys(d);
    let key: string;
    let item: any;
    let source: any;
    let value: any;

    for (let i = 0, num = keys.length; i < num; i++) {
      key = keys[i];
      if (key === 'value') {
        item = d;
        status[i] = { key: '', i, bool: false };
      } else if (key === 'source') {
        continue;
      } else {
        item = d[key];
        status[i] = { key, i, bool: false };
      }
      source = item.source && item.source.field;
      if (typeof source === 'undefined') {
        continue;
      }
      if (typeof item.source.key !== 'undefined') {
        source = `${item.source.key}/${source}`;
      }

      if (source in aliases) {
        source = aliases[source];
      }

      value = item.value;
      if (ranges[source]) {
        status[i].bool = Array.isArray(value)
          ? ranges[source].containsRange({ min: value[0], max: value[1] })
          : ranges[source].containsValue(value);
      } else if (values[source] && values[source].contains(value)) {
        status[i].bool = true;
      }
    }

    if (props) {
      status = status.filter((b) => props.indexOf(b.key) !== -1);
      if (mode === 'and') {
        return !!status.length && !status.some((s) => s.bool === false);
      }
      if (mode === 'xor') {
        return !!status.length && status.some((s) => s.bool) && status.some((s) => s.bool === false);
      }
      // !mode || mode === 'or'
      return status.some((s) => s.bool);
    }
    return status.some((s) => s.bool);
  };

  /**
   * Adds an event interceptor
   *
   * @param {string} name Name of the event to intercept
   * @param {function} ic Handler to call before event is triggered
   * @example
   * brush.intercept('add-values', items => {
   *  console.log('about to add the following items', items);
   *  return items;
   * });
   */
  fn.intercept = (name: string, ic?: InterceptorFn): void => {
    const s = toCamelCase(name);
    if (!interceptors[s]) {
      return;
    }
    interceptors[s].push(ic!);
  };

  /**
   * Removes an interceptor
   *
   * @param {string} name Name of the event to intercept
   * @param {function} ic Handler to remove
   */
  fn.removeInterceptor = (name: string, ic?: InterceptorFn): void => {
    const s = toCamelCase(name);
    if (!interceptors[s]) {
      return;
    }
    const idx = interceptors[s].indexOf(ic!);
    if (idx !== -1) {
      interceptors[s].splice(idx, 1);
    }
  };

  /**
   * Removes all interceptors
   *
   * @param {string} [name] Name of the event to remove interceptors for. If not provided, removes all interceptors.
   */
  fn.removeAllInterceptors = (name?: string): void => {
    const toRemove: Array<{ name: string; handlers: InterceptorFn[] }> = [];
    if (name) {
      const s = toCamelCase(name);
      if (interceptors[s] && interceptors[s].length) {
        toRemove.push({ name, handlers: interceptors[s] });
      }
    } else {
      Object.keys(interceptors).forEach((n) => {
        if (interceptors[n].length) {
          toRemove.push({ name: toSnakeCase(n), handlers: interceptors[n] });
        }
      });
    }

    toRemove.forEach((ic) => {
      const interceptorHandlers = ic.handlers.slice();
      interceptorHandlers.forEach((handler) => fn.removeInterceptor(ic.name, handler));
    });
  };

  /**
   * Adds an alias to the given key
   *
   * @param {string} key - Value to be replaced
   * @param {string} alias - Value to replace key with
   * @example
   * brush.addKeyAlias('BadFieldName', 'Region');
   * brush.addValue('BadFieldName', 'Sweden'); // 'BadFieldName' will be stored as 'Region'
   * brush.containsValue('Region', 'Sweden'); // true
   * brush.containsValue('BadFieldName', 'Sweden'); // true
   */
  fn.addKeyAlias = (key: string, alias: string): void => {
    aliases[key] = alias;
  };

  /**
   * Removes an alias
   *
   * This will only remove the key to alias mapping for new manipulations of the brush,
   * no changes will be made to the current state of this brush.
   *
   * @param {string} key - Value to remove as alias
   * @example
   * brush.removeKeyAlias('BadFieldName');
   */
  fn.removeKeyAlias = (key: string): void => {
    delete aliases[key];
  };

  EventEmitter.mixin(fn);

  return fn;
}
