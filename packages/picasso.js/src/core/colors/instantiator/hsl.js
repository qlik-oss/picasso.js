import HslaColor from './../hsla-color';

const rHsl = /^\s*hsl\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*%{1})\s*,\s*(-?\d+\.?\d*%{1})\s*\)$/i,
  rHsla = /^\s*hsla\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*%{1})\s*,\s*(-?\d+\.?\d*%{1})\s*,\s*(-?\d+\.?\d*)\s*\)\s*$/i;

/**
 * Instanciate a new color object
 * @ignore
 * @param { String } colStr HSL representation of a Color.
 * Supports HSL and HSLA defintion at {@link https://www.w3.org/TR/css3-color/#svg-color}
 * @return { HslaColor } Color instance
 * @example
 * hsl( "hsl(120, 50%, 50%)" );
 * hsl( "hsla(120, 50%, 50%, 0.5)" );
*/
export default function hsl(colStr) {
  const match = (rHsl.exec(colStr) || rHsla.exec(colStr) || []);

  const [h, s, l, a] = match.slice(1).map((v) => {
    let returnVal = parseFloat(v);

    switch (match.indexOf(v)) {
      case 1:
        returnVal = (((returnVal % 360) + 360) % 360);
        return Math.round(returnVal);
      case 2:
      case 3:
        returnVal = returnVal > 100 ? 100 : returnVal;
        returnVal = returnVal < 0 ? 0 : returnVal;
        return Math.round(returnVal) / 100;
      default:
        returnVal = returnVal > 1 ? 1 : returnVal;
        returnVal = returnVal < 0 ? 0 : returnVal;
        return returnVal;
    }
  });

  return new HslaColor(h, s, l, a);
}

/**
 * Test if the object is a color instance
 * @ignore
 * @function test
 * @param  { String } colStr HSL representation of a Color.
 * @return { Boolean } TRUE if colrStr matches HSL and HSLA notation defined at {@link https://www.w3.org/TR/css3-color/#svg-color}
 * @example
 * hsl.test( "hsl(120, 50%, 50%)" );
 */
hsl.test = colStr => typeof colStr === 'string' && (rHsl.test(colStr) || rHsla.test(colStr));
