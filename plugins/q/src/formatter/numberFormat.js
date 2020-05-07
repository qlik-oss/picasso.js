import numberFormatFactory from './parts/qs-number-formatter';
import memoize from './memoize';

export default function formatter(pattern, thousand, decimal, qType, localeInfo) {
  const qformat = numberFormatFactory(localeInfo, pattern, thousand, decimal, qType);
  const memoized = memoize(qformat.formatValue.bind(qformat), {
    // Handle NaN and cases where toString yields different result than +operator. Ex. a Date.
    toKey: (value) => (isNaN(value) ? value : +value),
  });

  /**
   * Format a value according to the specified pattern created at construct
   *
   * @param  {Number} value   The number to be formatted
   * @return {String}         [description]
   */
  function format(value) {
    return memoized(value);
  }

  /**
   * Format a value according to a specific pattern
   * that is not the one specified in the constructor
   *
   * @param  {String} p   Pattern
   * @param  {Number} v   Value
   * @param  {String} t   Thousand
   * @param  {String} d   Decimal
   * @return {String}     Formatted value
   */
  format.format = function formatFn(p, v, t, d) {
    memoized.clear();
    return qformat.format(v, p, t, d);
  };

  /**
   * Change the pattern on existing formatter
   *
   * @param  {String} p     Pattern (optional)
   * @return {String}       Returns the pattern
   */
  format.pattern = function patternFn(p) {
    if (p) {
      memoized.clear();
      qformat.pattern = p;
      qformat.prepare();
    }
    return qformat.pattern;
  };

  /**
   * Set the locale for the formatter
   *
   * @param  {Object} args   Locale object for formatting
   * @return {Undefined}      Returns nothing
   */
  /* format.locale = function( ...args ) {
    locale = formatLocale( ...args );
    d3format = locale.format( pattern );

    return this;
  }; */

  return format;
}
