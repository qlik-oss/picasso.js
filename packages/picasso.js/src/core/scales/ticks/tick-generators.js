import { notNumber } from '../../utils/is-number';

function applyFormat(formatter) {
  return typeof formatter === 'undefined' ? t => t : t => formatter(t);
}

function clamp(val) {
  return Math.max(0, Math.min(1, val));
}

function isObject(obj) {
  return typeof obj === 'object';
}

function minorTicksGenerator(count, start, end) {
  const r = Math.abs(start - end);
  const interval = r / (count + 1);
  const ticks = [];
  for (let i = 1; i <= count; i++) {
    const v = i * interval;
    ticks.push(start < end ? start + v : start - v);
  }
  return ticks;
}

function appendMinorTicks(majorTicks, minorCount, scale) {
  if (majorTicks.length === 1) { return majorTicks; }

  const ticks = majorTicks.concat([]);

  for (let i = 0; i < majorTicks.length; i++) {
    let start = majorTicks[i];
    let end = majorTicks[i + 1];

    if (i === 0 && start !== scale.start()) { // Before and after first major tick
      ticks.push(...minorTicksGenerator(minorCount, start, end));
      start -= end - start;
      end = majorTicks[i];
      ticks.push(...minorTicksGenerator(minorCount, start, end));
    } else if (i === majorTicks.length - 1 && end !== scale.end()) { // After last major tick
      end = start + (start - majorTicks[i - 1]);
      ticks.push(...minorTicksGenerator(minorCount, start, end));
    } else {
      ticks.push(...minorTicksGenerator(minorCount, start, end));
    }
  }

  return ticks.filter(t => t >= scale.min() && t <= scale.max());
}

/**
* Generate ticks based on a distance, for each 100th unit, one additional tick may be added
* @private
* @param  {Number} distance       Distance between each tick
* @param  {Number} scale         The scale instance
* @param  {Number} [minorCount=0]     Number of tick added between each distance
* @param  {Number} [unitDivider=100]   Number to divide distance with
* @return {Array}               Array of ticks
*/
export function looseDistanceBasedGenerator({
  distance, scale, minorCount = 0, unitDivider = 100, formatter = undefined
}) {
  const step = !notNumber(unitDivider) && !notNumber(distance) ? Math.max(distance / unitDivider, 2) : 2;
  const count = Math.min(1000, Math.round(step)); // safe guard against huge numbers
  let majorTicks = scale.ticks(count);
  if (majorTicks.length <= 1) {
    majorTicks = scale.ticks(count + 1);
  }

  const ticks = minorCount > 0 ? appendMinorTicks(majorTicks, minorCount, scale) : majorTicks;
  ticks.sort((a, b) => a - b);

  const ticksFormatted = ticks.map(applyFormat(formatter));

  return ticks.map((tick, i) => {
    const position = scale(tick);
    return {
      position,
      start: position,
      end: position,
      label: ticksFormatted[i],
      value: tick,
      isMinor: majorTicks.indexOf(tick) === -1
    };
  });
}

/**
* Generate ticks based on a distance, for each 100th unit, one additional tick may be added.
* Will attempt to round the bounds of domain to even values and generate ticks hitting the domain bounds.
* @private
* @param  {Number} distance       Distance between each tick
* @param  {Number} scale         The scale instance
* @param  {Number} [minorCount=0]     Number of tick added between each distance
* @param  {Number} [unitDivider=100]   Number to divide distance with
* @return {Array}               Array of ticks
*/
export function tightDistanceBasedGenerator({
  distance, scale, minorCount = 0, unitDivider = 100, formatter = undefined
}) {
  const step = !notNumber(unitDivider) && !notNumber(distance) ? Math.max(distance / unitDivider, 2) : 2;
  const count = Math.min(1000, Math.round(step)); // safe guard against huge numbers
  const n = count > 10 ? 10 : count;
  scale.nice(n);

  const majorTicks = scale.ticks(count);
  const ticks = minorCount > 0 ? appendMinorTicks(majorTicks, minorCount, scale) : majorTicks;
  ticks.sort((a, b) => a - b);

  const ticksFormatted = ticks.map(applyFormat(formatter));

  return ticks.map((tick, i) => {
    const position = scale(tick);
    return {
      position,
      start: position,
      end: position,
      label: ticksFormatted[i],
      value: tick,
      isMinor: majorTicks.indexOf(tick) === -1
    };
  });
}

function ticksByCount({
  count, minorCount, scale, formatter
}) {
  return scale
    .ticks(((count - 1) * minorCount) + count)
    .map((tick, i) => {
      const position = scale(tick);
      return {
        position,
        start: position,
        end: position,
        label: formatter(tick),
        isMinor: i % (minorCount + 1) !== 0,
        value: tick
      };
    });
}

function ticksByValue({ values, scale, formatter = v => v }) {
  return values
    .sort((a, b) => (isObject(a) ? a.value : a) - (isObject(b) ? b.value : b))
    .filter((v, i, ary) => {
      const val = isObject(v) ? v.value : v;
      return val <= scale.max() && val >= scale.min() && ary.indexOf(v) === i;
    })
    .map((v) => {
      const value = isObject(v) ? v.value : v;
      const position = scale(value);
      return {
        position,
        value,
        label: isObject(v) && typeof v.label !== 'undefined' ? v.label : formatter(value),
        isMinor: false,
        start: isObject(v) && !isNaN(v.start) ? clamp(scale(v.start)) : position, // TODOHandle end < start?
        end: isObject(v) && !isNaN(v.end) ? clamp(scale(v.end)) : position // TODO Handle start > end?
      };
    });
}

function forceTicksAtBounds(ticks, scale, formatter) {
  const ticksP = ticks.map(t => t.position);
  const range = scale.range();

  if (ticksP.indexOf(range[0]) === -1) {
    ticks.splice(0, 0, {
      position: range[0],
      start: range[0],
      end: range[0],
      label: formatter(scale.start()),
      isMinor: false,
      value: scale.start()
    });
  } else if (ticks[0] && ticks[0].isMinor) {
    ticks[0].isMinor = false; // Convert to major tick
  }

  const lastTick = ticks[ticks.length - 1];
  if (ticksP.indexOf(range[1]) === -1) {
    ticks.push({
      position: range[1],
      start: range[1],
      end: range[1],
      label: formatter(scale.end()),
      isMinor: false,
      value: scale.end()
    });
  } else if (lastTick && lastTick.isMinor) {
    lastTick.isMinor = false; // Convert to major tick
  }
}

export function generateContinuousTicks({
  settings,
  scale,
  distance,
  formatter = val => val
}) {
  let ticks;
  const minorCount = settings.minorTicks && !notNumber(settings.minorTicks.count) ? Math.min(100, settings.minorTicks.count) : 0;

  if (Array.isArray(settings.ticks.values)) {
    const values = settings.ticks.values.filter(v => (typeof v === 'object' ? !notNumber(v.value) : !notNumber(v)));
    ticks = ticksByValue({ values, scale: scale.copy(), formatter });
  } else if (!notNumber(settings.ticks.count)) {
    const count = Math.min(1000, settings.ticks.count);
    ticks = ticksByCount({
      count, minorCount, scale: scale.copy(), formatter
    });
  } else {
    const tickGen = settings.ticks.tight ? tightDistanceBasedGenerator : looseDistanceBasedGenerator;
    ticks = tickGen({
      distance,
      minorCount,
      unitDivider: settings.ticks.distance,
      scale,
      formatter
    });

    if (settings.ticks.forceBounds) {
      forceTicksAtBounds(ticks, scale, formatter);
    }
  }

  return ticks;
}

export function generateDiscreteTicks({ scale }) {
  const domain = scale.domain();
  const values = domain;
  const dataItems = scale.data().items;
  const labels = scale.labels ? scale.labels() : values;
  const bandwidth = scale.bandwidth();

  return values.map((d, i) => {
    const start = scale(d);
    return {
      position: start + (bandwidth / 2),
      label: `${labels[i]}`,
      data: dataItems ? dataItems[i] : undefined,
      start,
      end: start + bandwidth
    };
  });
}
