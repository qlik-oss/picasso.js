import RgbaColor from '../rgba-color';

const rHex = /^\s*#([A-Fa-f0-9]{2})([A-f0-A-Fa-f0-9]{2})([A-Fa-f0-9]{2})\s*$/i,
  rHexShort = /^\s*#([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])\s*$/i;

/**
 * Instanciate a new color object
 * @ignore
 * @param { String } colStr HEX representation of a Color.
 * Supports HEX defintion at {@link https://www.w3.org/TR/css3-color/#svg-color}
 * @return { RgbaColor } Color instance
 * @example
 * hex( "#fff" );
 * hex( "#ffffff" );
 */
export default function hex(colStr) {
  const [r, g, b] = (rHex.exec(colStr) || rHexShort.exec(colStr) || [])
    .slice(1)
    .map(v => parseInt(v.length === 1 ? v + v : v, 16));

  return new RgbaColor(r, g, b, 1);
}

/**
 * Test if the object is a color instance
 * @ignore
 * @function test
 * @param  { String } colStr HEX representation of a Color.
 * @return { Boolean } TRUE if colrStr matches HEX notation defined at {@link https://www.w3.org/TR/css3-color/#svg-color}
 * @example
 * hex.test( "#fff" );
 */
hex.test = colStr => typeof colStr === 'string' && (rHex.test(colStr) || rHexShort.test(colStr));
