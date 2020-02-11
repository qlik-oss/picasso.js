import extend from 'extend';

import EventEmitter from '../utils/event-emitter';

import rangeCollection from './range-collection';
import valueCollection from './value-collection';

/**
 * @typedef {object} brush-config
 * @property {Array<brush-config--ranges>} [ranges] - Range configurations
 */

/**
 * @typedef {object}
 * @alias brush-config--ranges
 */
const DEFAULT_RANGE_CONFIG = {
  /**
   * An identifier that represents the data source of the value
   * @type {string=}
   */
  key: undefined,
  /**
   * Whether or not the minimum value of a range should be included when determening if a value is brushed.
   * @type {boolean=} */
  includeMin: true,
  /**
   * Whether or not the maximum value of a range should be included when determening if a value is brushed.
   * @type {boolean=} */
  includeMax: true,
};

function add({ items, collection, vc }) {
  const changedMap = {};
  const changed = [];
  let key;
  let values;

  for (let i = 0, num = items.length; i < num; i++) {
    key = items[i].key;
    if (!collection[key]) {
      collection[key] = vc();
    }
    values = items[i].values || [items[i].value];
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

function remove({ items, collection }) {
  const changedMap = {};
  const changed = [];
  let key;
  let values;

  for (let i = 0, num = items.length; i < num; i++) {
    key = items[i].key;
    if (!collection[key]) {
      continue;
    }
    values = items[i].values || [items[i].value];
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

function collectUnique(items) {
  const filteredSet = {};
  let key;
  let values;

  for (let i = 0, num = items.length; i < num; i++) {
    key = items[i].key;
    values = items[i].values || [items[i].value];
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

function createValueCollection({ key, collection, obj, fn, value }) {
  if (!collection[key]) {
    collection[key] = fn();
  }
  obj[key] = obj[key] || [];
  obj[key].push(value);
  collection[key].add(value);
}

export function toggle({ items, values, vc }) {
  const addedMap = {};
  const removedMap = {};
  const added = [];
  const removed = [];
  const filteredSet = collectUnique(items);
  let key;
  let value;
  let fs;

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

function diff(old, current) {
  const changed = [];
  const keys = Object.keys(old);
  let key;
  let changedValues;
  const filterFn = v => current[key].indexOf(v) === -1;

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

export function set({ items, vCollection, vc }) {
  const addedMap = {};
  const filteredSet = collectUnique(items);
  let added = [];
  let removed = [];
  let key;

  const oldMap = {};
  const vcKeys = Object.keys(vCollection);
  for (let i = 0, num = vcKeys.length; i < num; i++) {
    key = vcKeys[i];
    oldMap[key] = vCollection[key].values().slice();
    delete vCollection[key];
  }

  const createValueCollectionFn = value => {
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

function applyAliases(items, aliases) {
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

function intercept(handlers, items, aliases) {
  const its = applyAliases(items, aliases);
  return handlers && handlers.length ? handlers.reduce((value, interceptor) => interceptor(value), its) : its;
}

function toCamelCase(s) {
  return s.replace(/(-[a-z])/g, $1 => $1.toUpperCase().replace('-', ''));
}

function toSnakeCase(s) {
  return s.replace(/([A-Z])/g, $1 => `-${$1.toLowerCase()}`);
}

function updateRange(items, action, { ranges, interceptors, rc, aliases, rangeConfig }) {
  const inter = `${action}Ranges`;
  const its = intercept(interceptors[inter], items, aliases);
  let changed = false;
  its.forEach(item => {
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

export default function brush({ vc = valueCollection, rc = rangeCollection } = {}) {
  let activated = false;
  let ranges = {};
  let values = {};
  let aliases = {};
  let rangeConfig = {
    sources: {},
    default: extend({}, DEFAULT_RANGE_CONFIG),
  };
  const interceptors = {
    addValues: [],
    removeValues: [],
    toggleValues: [],
    setValues: [],
    addRanges: [],
    setRanges: [],
    removeRanges: [],
    toggleRanges: [],
  };

  const getState = () => {
    const state = {
      values: {},
      ranges: {},
    };
    Object.keys(values).forEach(key => {
      state.values[key] = values[key].values();
    });
    Object.keys(ranges).forEach(key => {
      state.ranges[key] = ranges[key].ranges();
    });
    return state;
  };

  const links = {
    ls: [],
    clear() {
      this.ls.forEach(b => b.clear());
    },
    start() {
      this.ls.forEach(b => b.start());
    },
    end() {
      this.ls.forEach(b => b.end());
    },
    update() {
      const s = getState();
      this.ls.forEach(b => b._state(s));
    },
    updateValues() {
      const s = getState();
      this.ls.forEach(b =>
        b._state({
          values: s.values,
        })
      );
    },
    updateRanges() {
      const s = getState();
      this.ls.forEach(b =>
        b._state({
          ranges: s.ranges,
        })
      );
    },
  };

  /**
   * A brush context
   * @alias brush
   * @interface
   */
  const fn = {};

  /**
   * Triggered when this brush is activated
   * @event brush#start
   * @type {string}
   */

  /**
   * Triggered when this brush is updated
   * @event brush#update
   * @type {string}
   * @param {Array<object>} added - The added items
   * @param {Array<object>} removed - The removed items
   */

  /**
   * Triggered when this brush is deactivated
   * @event brush#end
   * @type {string}
   */

  /**
   * Configure the brush instance.
   *
   * @param {brush-config} config
   * @example
   * brushInstance.configure({
   *   ranges: [
   *     { key: 'some key', includeMax: false },
   *     { includeMax: true, includeMin: true },
   *   ]
   * })
   */
  fn.configure = (config = {}) => {
    if (Array.isArray(config.ranges) && config.ranges.length) {
      rangeConfig = {
        sources: {},
        default: extend({}, DEFAULT_RANGE_CONFIG),
      };

      config.ranges.forEach(cfg => {
        const c = {};
        Object.keys(DEFAULT_RANGE_CONFIG)
          .filter(attr => attr !== 'key')
          .forEach(attr => {
            c[attr] = typeof cfg[attr] !== 'undefined' ? cfg[attr] : DEFAULT_RANGE_CONFIG[attr];
          });

        if (typeof cfg.key !== 'undefined') {
          rangeConfig.sources[cfg.key] = c;
        } else {
          rangeConfig.default = c;
        }
      });

      Object.keys(ranges).forEach(key => ranges[key].configure(rangeConfig.sources[key] || rangeConfig.default));

      // TODO only emit update if config has changed
      fn.emit('update', [], []);
    }
  };

  /**
   * Link this brush to another brush instance.
   *
   * When linked, the `target` will receive updates whenever this brush changes.
   * @param {brush} target - The brush instance to link to
   */
  fn.link = target => {
    if (fn === target) {
      throw new Error("Can't link to self");
    }
    links.ls.push(target);
    target._state(getState());
  };

  fn._state = s => {
    if (!s) {
      return getState();
    }
    if (s.values) {
      const arr = [];
      Object.keys(s.values).forEach(key => {
        if (!values[key] || s.values[key].join(';') !== values[key].toString()) {
          arr.push({
            key,
            values: s.values[key],
          });
        }
      });
      Object.keys(values).forEach(key => {
        if (!s.values[key]) {
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
      const arr = [];
      Object.keys(s.ranges).forEach(key => {
        if (!ranges[key] || s.ranges[key].join(';') !== ranges[key].toString()) {
          arr.push({
            key,
            ranges: s.ranges[key],
          });
        }
      });
      Object.keys(ranges).forEach(key => {
        if (!s.ranges[key]) {
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
    return undefined;
  };

  /**
   * Starts this brush context
   *
   * Starts this brush context and emits a 'start' event if it is not already started.
   * @emits brush#start
   */
  fn.start = () => {
    if (!activated) {
      activated = true;
      fn.emit('start');
      links.start();
    }
  };

  /**
   * Ends this brush context
   *
   * Ends this brush context and emits an 'end' event if it is not already ended.
   * @emits brush#end
   */
  fn.end = () => {
    if (!activated) {
      return;
    }
    activated = false;
    ranges = {};
    values = {};
    fn.emit('end');
    links.end();
  };

  /**
   * Checks if this brush is activated
   *
   * Returns true if started, false otherwise
   * @return {boolean}
   */
  fn.isActive = () => activated;

  /**
   * Clears this brush context
   */
  fn.clear = () => {
    const removed = fn
      .brushes()
      .filter(b => b.type === 'value' && b.brush.values().length)
      .map(b => ({ id: b.id, values: b.brush.values() }));
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
  fn.brushes = () => {
    let result = [];
    result = result.concat(
      Object.keys(ranges).map(key => ({
        type: 'range',
        id: key,
        brush: ranges[key],
      }))
    );

    result = result.concat(
      Object.keys(values).map(key => ({
        type: 'value',
        id: key,
        brush: values[key],
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
   * @emits brush#start
   * @emits brush#update
   * @example
   * brush.addValue('countries', 'Sweden');
   * brush.addValue('/qHyperCube/qDimensionInfo/0', 3);
   */
  fn.addValue = (key, value) => {
    fn.addValues([{ key, value }]);
  };

  /**
   * @param {object[]} items Items to add
   */
  fn.addValues = items => {
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
  fn.setValues = items => {
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
  fn.removeValue = (key, value) => {
    fn.removeValues([{ key, value }]);
  };

  /**
   * @param {object[]} items Items to remove
   */
  fn.removeValues = items => {
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
  fn.addAndRemoveValues = (addItems, removeItems) => {
    const addIts = intercept(interceptors.addValues, addItems, aliases);
    const removeIts = intercept(interceptors.removeValues, removeItems, aliases);
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
   * If the given value exist in this brush context, it will be removed. If it does not exist it will be added.
   *
   * @param  {string} key  An identifier that represents the data source of the value
   * @param  {string|number} value The value to toggle
   * @example
   * brush.toggleValue('countries', 'Sweden');
   */
  fn.toggleValue = (key, value) => {
    fn.toggleValues([{ key, value }]);
  };

  /**
   * @param {object[]} items Items to toggle
   */
  fn.toggleValues = items => {
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
  fn.containsValue = (key, value) => {
    let k = aliases[key] || key;
    if (!values[k]) {
      return false;
    }
    return values[k].contains(value);
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
  fn.addRange = (key, range) => {
    fn.addRanges([{ key, range }]);
  };

  /**
   * @see {brush.addRange}
   * @param {object[]} items - Items containing the ranges to remove
   * @param {string} items[].key
   * @param {object} items[].range
   */
  fn.addRanges = items => {
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
  fn.removeRange = (key, range) => {
    fn.removeRanges([{ key, range }]);
  };

  /**
   * @see {brush.removeRange}
   * @param {object[]} items - Items containing the ranges to remove
   */
  fn.removeRanges = items => {
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
  fn.setRange = (key, range) => {
    fn.setRanges([{ key, range }]);
  };

  /**
   * @see {brush.setRange}
   * @param {object[]} items - Items containing the ranges to set
   */
  fn.setRanges = items => {
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
  fn.toggleRange = (key, range) => {
    fn.toggleRanges([{ key, range }]);
  };

  /**
   * @see {brush.toggleRange}
   * @param {object[]} items - Items containing the ranges to toggle
   */
  fn.toggleRanges = items => {
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
  fn.containsRangeValue = (key, value) => {
    let k = aliases[key] || key;
    if (!ranges[k]) {
      return false;
    }
    return ranges[k].containsValue(value);
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
  fn.containsRange = (key, range) => {
    let k = aliases[key] || key;
    if (!ranges[k]) {
      return false;
    }
    return ranges[k].containsRange(range);
  };

  fn.containsMappedData = (d, props, mode) => {
    let status = [];
    const keys = Object.keys(d);
    let key;
    let item;
    let source;
    let value;

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
      status = status.filter(b => props.indexOf(b.key) !== -1);
      if (mode === 'and') {
        return !!status.length && !status.some(s => s.bool === false);
      }
      if (mode === 'xor') {
        return !!status.length && status.some(s => s.bool) && status.some(s => s.bool === false);
      }
      // !mode || mode === 'or'
      return status.some(s => s.bool);
    }
    return status.some(s => s.bool);
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
  fn.intercept = (name, ic) => {
    const s = toCamelCase(name);
    if (!interceptors[s]) {
      return;
    }
    interceptors[s].push(ic);
  };

  /**
   * Removes an interceptor
   *
   * @param {string} name Name of the event to intercept
   * @param {function} ic Handler to remove
   */
  fn.removeInterceptor = (name, ic) => {
    const s = toCamelCase(name);
    if (!interceptors[s]) {
      return;
    }
    const idx = interceptors[s].indexOf(ic);
    if (idx !== -1) {
      interceptors[s].splice(idx, 1);
    }
  };

  /**
   * Removes all interceptors
   *
   * @param {string} [name] Name of the event to remove interceptors for. If not provided, removes all interceptors.
   */
  fn.removeAllInterceptors = name => {
    const toRemove = [];
    if (name) {
      const s = toCamelCase(name);
      if (interceptors[s] && interceptors[s].length) {
        toRemove.push({ name, handlers: interceptors[s] });
      }
    } else {
      Object.keys(interceptors).forEach(n => {
        if (interceptors[n].length) {
          toRemove.push({ name: toSnakeCase(n), handlers: interceptors[n] });
        }
      });
    }

    toRemove.forEach(ic => {
      const interceptorHandlers = ic.handlers.slice();
      interceptorHandlers.forEach(handler => fn.removeInterceptor(ic.name, handler));
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
  fn.addKeyAlias = (key, alias) => {
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
  fn.removeKeyAlias = key => {
    delete aliases[key];
  };

  EventEmitter.mixin(fn);

  return fn;
}
