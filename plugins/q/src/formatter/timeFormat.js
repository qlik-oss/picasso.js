import dateFormatFactory from './parts/qs-date-formatter';
import { TYPES } from './constants';

export function QlikTimeToDate(value) {
  return new Date(1899, 11, 30 + Math.floor(value), 0, 0, 0, 1000 * 24 * 60 * 60 * (value - Math.floor(value)));
}

export default function formatter(pattern, qtype = 'TS', localeInfo = null) {
  let qformat = dateFormatFactory(localeInfo, pattern, qtype);

  /**
   * Prepare a value according to the specified qtype
   *
   * @param  {Number} value The value to be formatted
   * @return {Number}       The converted value (if applied)
   */
  function prepare(value) {
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
  function format(value) {
    value = prepare(value);
    return qformat.format(value);
  }

  /**
    * Format a value according to a specific pattern
    * that is not the one specified in the constructor
    *
    * @param  {String} p   Pattern
    * @param  {Date} v   Value
    * @return {String}     Formatted value
    */
  format.format = function formatFn(p, v) {
    v = prepare(v);
    return qformat.format(v, p);
  };

  /**
   * Set the locale for the formatter
   *
   * @param  {Object} args   Locale object for formatting
   * @return {Undefined}      Returns nothing
   */
  format.locale = function locale(li) {
    qformat = dateFormatFactory(li, pattern, qtype);

    return this;
  };

  /**
   * Get or set the QType
   *
   * @param  {String} nqt New qType (optional)
   * @return {String}     Current qtype
   */
  format.qtype = function qtypeFn(nqt) {
    if (nqt !== undefined) {
      qtype = nqt;
    }
    return qtype;
  };

  return format;
}
