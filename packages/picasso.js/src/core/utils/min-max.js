import { isNumber as numericFilter } from './is-number';

const minAccessor = v => v.min();
const maxAccessor = v => v.max();

/**
 * Calculate the min/max value based on various inputs.
 *
 * Provided min/max setting takes presedence over all other inputs. If not provided, the respective values are calculated
 * from the given arr input, where each item in the array is expected to have a min/max accessor.
 *
 * @private
 * @param {object} [settings]
 * @param {number} [settings.min] The minimum value. Defaults to 0 if not provided.
 * @param {number} [settings.max] The maximum value. Defaults to 1 if not provided.
 * @param {object} [arr]
 * @returns { object[] } An array containing the min and max values.
 *
 * @example
 * minmax(); // [0, 1]
 *
 * minmax({}, [
 * { min: () => 13, max: () => 15 },
 * { min: () => NaN, max: () => 17 },
 * ]); // [13, 17]
 *
 * minmax({ min: -5, max: 4 }, [
 * { min: () => -20, max: () => 15 },
 * ]); // [-5, 4]
 */
export default function minmax(settings, arr) {
  const definedMin = settings && typeof settings.min !== 'undefined';
  const definedMax = settings && typeof settings.max !== 'undefined';

  let min = definedMin ? +settings.min : 0;
  let max = definedMax ? +settings.max : 1;

  if (arr && arr.length) {
    if (!definedMin) {
      const arrMin = arr.map(minAccessor).filter(numericFilter);
      min = arrMin.length ? Math.min(...arrMin) : min;
    }

    if (!definedMax) {
      const arrMax = arr.map(maxAccessor).filter(numericFilter);
      max = arrMax.length ? Math.max(...arrMax) : max;
    }
  }

  return [min, max];
}
