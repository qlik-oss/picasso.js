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

  const strAry = ary as string[];
  const [r, g, b, a] = strAry.slice(1, 5).map((val: string) => {
    // Last value is the Alpha which may or may not be present
    if (strAry.indexOf(val) === 4) {
      let num = parseFloat(val);
      num = num > 1 ? 1 : num;
      num = num < 0 ? 0 : num;
      return num;
    }

    let num: number;
    if (val.indexOf('%') >= 0) {
      num = parseFloat(val);
      num = num > 100 ? 100 : num;
      num = num < 0 ? 0 : num;
      num = Math.round(255 * (num / 100));
    } else {
      num = parseInt(val, 10);
      num = num > 255 ? 255 : num;
      num = num < 0 ? 0 : num;
    }

    return num;
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
rgb.test = (colStr) =>
  typeof colStr === 'string' &&
  (rRgb.test(colStr) || rRgba.test(colStr) || rRgbPer.test(colStr) || rRgbaPer.test(colStr));
