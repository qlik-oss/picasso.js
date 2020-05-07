import { timeFormatLocale } from 'd3-time-format';

export default function formatter(pattern) {
  // eslint-disable-line import/prefer-default-export
  let locale = timeFormatLocale({
    dateTime: '%x, %X',
    date: '%-m/%-d/%Y',
    time: '%-I:%M:%S %p',
    periods: ['AM', 'PM'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  });

  let d3format = locale.format(pattern);

  /**
   * Format a value according to the specified pattern created at construct
   *
   * @param  {Date} value   The number to be formatted
   * @return {String}         [description]
   * @private
   */
  function format(value) {
    return d3format(value);
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
    return locale.format(p)(v);
  };

  /**
   * Set the locale for the formatter
   *
   * @param  {Object} args   Locale object for formatting
   * @return {Undefined}      Returns nothing
   */
  format.locale = function localeFn(...args) {
    locale = timeFormatLocale(...args);
    d3format = locale.format(pattern);

    return this;
  };

  /**
   * Parse a string to a date according to a pattern
   *
   * @param  {String} p   Pattern
   * @param  {String} v   Value
   * @return {Date}     Date
   */
  format.parse = function parse(p, v) {
    return locale.parse(p)(v);
  };

  /**
   * Returns a parser that parses strings to date according to the pattern
   *
   * @param  {String} p   Pattern
   * @return {Function}   Parser
   */
  format.parsePattern = function parsePattern(p) {
    return locale.parse(p);
  };

  return format;
}
