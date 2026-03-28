import dateFormatFactory from './parts/qs-date-formatter';
import { TYPES } from './constants';
import memoize from './memoize';

const MS_PER_DAY = 86400000;

export function QlikTimeToDate(value: any) {
  return new Date(
    Date.UTC(1899, 11, 30 + Math.floor(value), 0, 0, 0, Math.round(MS_PER_DAY * (value - Math.floor(value))))
  );
}

export default function formatter(pattern: any, qtype: any = 'TS', localeInfo: any = null) {
  let qformat = dateFormatFactory(localeInfo, pattern, qtype);
  let memoized = memoize(qformat.format.bind(qformat), {
    toKey: (date: any) => (date instanceof Date ? date.getTime() : date),
  });

  /**
   * Prepare a value according to the specified qtype
   *
   * @param  {Number} value The value to be formatted
   * @return {Number}       The converted value (if applied)
   */
  function prepare(value: any) {
    if (qtype !== TYPES.INTERVAL) {
      return QlikTimeToDate(value);
    }
    return value;
  }

  /**
   * Format a value according to the specified pattern created at construct
   *
   * @param  {Date} value   The number to be formatted
   * @return {String}         [description]
   */
  function format(value: any) {
    value = prepare(value);
    return memoized(value);
  }

  /**
   * Format a value according to a specific pattern
   * that is not the one specified in the constructor
   *
   * @param  {String} p   Pattern
   * @param  {Date} v   Value
   * @return {String}     Formatted value
   */
  format.format = function formatFn(p: any, v: any) {
    memoized.clear();
    v = prepare(v);
    return qformat.format(v, p);
  };

  /**
   * Set the locale for the formatter
   *
   * @param  {Object} args   Locale object for formatting
   * @return {Undefined}      Returns nothing
   */
  format.locale = function locale(li: any) {
    qformat = dateFormatFactory(li, pattern, qtype);
    memoized = memoize(qformat.format.bind(qformat), {
      toKey: (date: any) => (date instanceof Date ? date.getTime() : date),
    });
    return this;
  };

  /**
   * Get or set the QType
   *
   * @param  {String} nqt New qType (optional)
   * @return {String}     Current qtype
   */
  format.qtype = function qtypeFn(nqt: any) {
    if (nqt !== undefined) {
      qtype = nqt;
      memoized.clear();
    }
    return qtype;
  };

  return format;
}
