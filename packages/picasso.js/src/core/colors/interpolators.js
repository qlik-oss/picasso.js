import numeric from '../scales/interpolators/numeric';
import colorObject from './instantiator/color-object';
import color from './color';

export default {
  /**
   * Interpolate two colors
   * @private
   * @param  { Object } from The color to interpolate from
   * @param  { Object } to   The color to interpolate to
   * @param  { Number } t  A number between [0-1]
   * @return { RgbaColor | HslaColor } Color instance, the type returned is the same as the type of the "to" color
   * @example
   * interpolate( "blue", "red", 0.5 );
   */
  interpolate: (from, to, t) => {
    let fromC = color(from),
      toC = color(to),
      colorObj = {};

    if (typeof fromC === 'object' && typeof toC === 'object') {
      const targetType = colorObject.getColorType(toC);

      if (targetType === 'rgb') {
        if (colorObject.getColorType(fromC) === 'hsl') {
          fromC = color(fromC.toRGB());
        }

        colorObj.r = Math.round(numeric.interpolate(fromC.r, toC.r, t));
        colorObj.g = Math.round(numeric.interpolate(fromC.g, toC.g, t));
        colorObj.b = Math.round(numeric.interpolate(fromC.b, toC.b, t));
      } else if (targetType === 'hsl') {
        if (colorObject.getColorType(fromC) === 'rgb') {
          fromC = color(fromC.toHSL());
        }

        colorObj.h = Math.round(numeric.interpolate(fromC.h, toC.h, t));
        colorObj.s = numeric.interpolate(fromC.s, toC.s, t);
        colorObj.l = numeric.interpolate(fromC.l, toC.l, t);
      }
    }

    return color(colorObj);
  },
};
