import interpolators from '../../colors/interpolators';

export default {
  /**
   * Interpolate two colors
   * @private
   * @param  {object} from The color to interpolate from
   * @param  {object} to   The color to interpolate to
   * @param  {Number} t    A number between [0-1]
   * @return {object}      The interpolated color
   */
  interpolate(from, to, t) {
    return interpolators.interpolate(from, to, t);
  },
};
