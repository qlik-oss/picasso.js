import extend from 'extend';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import resolveLevels from './resolve-levels';
import tickGenerator from './tick-generator';

const DEFAULT_SETTINGS = {
  level: 0,
  anchor: null, // start or end, default to middle. TODO remove and always use start
  maxWidth: null,
  measureText: () => ({ width: 0, height: 0 }),
  invert: false,
  clamp: false
};

function calcMinMax(values) { // TODO To remove, just here for easier usage while developing
  const min = values[values.length - 1].qTicks.map(t => t.qStart);
  const max = values[values.length - 1].qTicks.map(t => t.qEnd);
  return { min: Math.min(...min), max: Math.max(...max) };
}

function getMinMax(settings, data, values) {
  const min = +settings.min;
  const max = +settings.max;
  let fieldMin = 0;
  let fieldMax = 1;

  if (data && Array.isArray(data.fields)) {
    fieldMin = Math.min(data.fields.map(f => f.min()));
    fieldMax = Math.min(data.fields.map(f => f.max()));
  } else if (Array.isArray(values)) {
    ({ min: fieldMin, max: fieldMax } = calcMinMax(values));
  }

  return {
    min: isNaN(min) ? fieldMin : min,
    max: isNaN(max) ? fieldMax : max
  };
}

export default function qTime(settings, data) {
  const stgns = extend({}, DEFAULT_SETTINGS, settings);
  const values = Array.isArray(stgns.values) ? stgns.values : [];
  const d3Scale = d3ScaleLinear();

  const { min, max } = getMinMax(stgns, data, values);

  const levels = resolveLevels({ // Resolve levels in ticks fn once component show can be hasLevel is removed
    data: values,
    settings: stgns
  });

  const tickFn = tickGenerator(d3Scale, stgns);

  const fn = function fn(v) {
    if (isNaN(v)) {
      return NaN;
    }
    return d3Scale(v);
  };

  fn.data = () => data;

  fn.ticks = ({ distance } = {}) => { // TODO get measureText and maxwidth here?
    const lvl = levels[stgns.level];
    if (lvl.index !== null) {
      const ticks = tickFn.transformTicks(values[lvl.index].qTicks);
      if (lvl.minor !== null) {
        const mt = tickFn.transformTicks(values[lvl.minor].qTicks).map((m) => {
          m.isMinor = true;
          return m;
        });
        return ticks.concat(mt);
      }
      return ticks;
    } else if (stgns.level === 'inner' && lvl.index === null) { // Use prop as condition instead to allow on any level?
      return tickFn.createTicks(distance);
    }
    return [];
  };

  fn.domain = () => d3Scale.domain();

  fn.range = () => d3Scale.range();

  /**
   * Get the minimum value of the domain
   * @return { number }
   */
  fn.min = () => Math.min(min, max);

  /**
   * Get the maximum value of the domain
   * @return { number }
   */
  fn.max = () => Math.max(min, max);

  fn.hasLevel = lvl => levels[lvl] && levels[lvl].index !== null; // Remove, components like the axis should reqiure 0 size if not ticks are available, and thus "disappear"

  if (settings) {
    d3Scale.range(stgns.invert ? [1, 0] : [0, 1]);
    d3Scale.domain([min, max]);
    d3Scale.clamp(stgns.clamp);
  }

  return fn;
}
