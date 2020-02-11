import RgbaColor from '../rgba-color';

const rRgb = /^\s*rgb\(\s*(-?\d{1,3})\s*,\s*(-?\d{1,3})\s*,\s*(-?\d{1,3})\s*\)\s*$/i,
  rRgbPer = /^\s*rgb\(\s*(-?\d{1,3}%{1})\s*,\s*(-?\d{1,3}%{1})\s*,\s*(-?\d{1,3}%{1})\s*\)\s*$/i,
  rRgba = /^\s*rgba\(\s*(-?\d{1,3})\s*,\s*(-?\d{1,3})\s*,\s*(-?\d{1,3})\s*,\s*(-?\d+\.?\d*?)\s*\)\s*$/i,
  rRgbaPer = /^\s*rgba\(\s*(-?\d{1,3}%{1})\s*,\s*(-?\d{1,3}%{1})\s*,\s*(-?\d{1,3}%{1})\s*,\s*(-?\d+\.?\d*?)\s*\)\s*$/i;

/**
 * Instantiate a new color object
 * @ignore
 * @param { String } colStr RGB representation of a Color.
 * Supports RGB and RGBA defintion at {@link https://www.w3.org/TR/css3-color/#svg-color}
 * @return { RgbaColor } Color instance
 * @example
 * rgb( "rgb(120, 50, 50)" );
 * rgb( "rgb(120, 50, 50, 0.5)" );
 */
export default function rgb(colStr) {
  const ary = rRgb.exec(colStr) || rRgba.exec(colStr) || rRgbPer.exec(colStr) || rRgbaPer.exec(colStr) || [];

  const [r, g, b, a] = ary.slice(1, 5).map(val => {
    // Last value is the Alpha which may or may not be present
    if (ary.indexOf(val) === 4) {
      val = parseFloat(val);
      val = val > 1 ? 1 : val;
      val = val < 0 ? 0 : val;
      return val;
    }

    if (val.indexOf('%') >= 0) {
      val = parseFloat(val);
      val = val > 100 ? 100 : val;
      val = val < 0 ? 0 : val;
      val = Math.round(255 * (val / 100));
    } else {
      val = parseInt(val, 10);
      val = val > 255 ? 255 : val;
      val = val < 0 ? 0 : val;
    }

    return val;
  });

  return new RgbaColor(r, g, b, a);
}

/**
 * Test if the object is a color instance
 * @ignore
 * @function test
 * @param  { String } colStr RGB representation of a Color.
 * @return { Boolean } TRUE if colrStr matches RGB and RGBA notation defined at {@link https://www.w3.org/TR/css3-color/#svg-color}
 * @example
 * rgb.test( "rgb(120, 50, 50)" );
 */
rgb.test = colStr =>
  typeof colStr === 'string' &&
  (rRgb.test(colStr) || rRgba.test(colStr) || rRgbPer.test(colStr) || rRgbaPer.test(colStr));
