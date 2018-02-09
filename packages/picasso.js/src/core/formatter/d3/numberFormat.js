import { formatLocale } from 'd3-format';

export default function formatter(pattern, thousand, decimal) {
  let locale,
    d3format;

  /**
   * Format a value according to the specified pattern created at construct
   * @private
   *
   * @param  {Number} value   The number to be formatted
   * @return {String}         [description]
   */
  function format(value) {
    return d3format(value);
  }

   /**
    * Set the locale for the formatter
    *
    * @param  {Object} args   Locale object for formatting
    * @return {Undefined}      Returns nothing
    */
  format.locale = function localeFn(settings) {
    locale = formatLocale(settings);
    d3format = locale.format(pattern);

    return this;
  };

  /**
   * Resets the formatter using format.locale
   * @ignore
   */
  function reset() {
    format.locale({
      decimal: decimal || '.',
      thousands: thousand || ',',
      grouping: [3],
      currency: ['$', '']
    });
  }
  reset();

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
    if (t || d) {
      thousand = t;
      decimal = d;
      reset();
    }
    return locale.format(p)(v);
  };

   /**
   * Change the pattern on existing formatter
   *
   * @param  {String} p     Pattern (optional)
   * @return {String}       Returns the pattern
   */
  format.pattern = function patternFn(p) {
    if (p) {
      pattern = p;
      d3format = locale.format(p);
    }
    return pattern;
  };

  return format;
}
