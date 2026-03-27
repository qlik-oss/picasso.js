export default {
  /**
   * Linearly interpolate two numbers
   * @private
   * @param  {Number} from Start value
   * @param  {Number} to   End value
   * @param  {Number} t    The weight
   * @return {Number}      The interpolated value
   * @example
   * interpolate( 10, 20, 0.2 ); // 12
   */
  interpolate(from, to, t) {
    return from * (1 - t) + to * t;
  },
};
