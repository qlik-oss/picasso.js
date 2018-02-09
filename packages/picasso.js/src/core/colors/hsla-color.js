function toPercentage(val) {
  return val * 100;
}

function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function hue2rgb(p, q, t) {
  if (t < 0) { t += 1; }
  if (t > 1) { t -= 1; }
  if (t < 1 / 6) { return p + ((q - p) * 6 * t); }
  if (t < 1 / 2) { return q; }
  if (t < 2 / 3) { return p + ((q - p) * ((2 / 3) - t) * 6); }
  return p;
}

/**
 * Converts HSL to RGB.
 * @ignore
 * @param h - The hue
 * @param s - The saturation
 * @param l - The lightness
 * @returns {string} - In format 0, 0, 0
 */
function toRgb(h, s, l) {
  let r,
    g,
    b;

  h /= 360;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : (l + s) - (l * s);
    const p = (2 * l) - q;
    r = hue2rgb(p, q, h + (1 / 3));
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - (1 / 3));
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function toByte(h, s, l) {
  return {
    h: parseInt((h * 255) / 359, 10) & 0xFF,
    s: parseInt(s * 255, 10) & 0xFF,
    l: parseInt(l * 255, 10) & 0xFF
  };
}

class HslaColor {
  /**
   * Create a HSLA Color
   * @private
   * @param { Number } h The hue value
   * @param { Number } s The saturation value
   * @param { Number } l The lightness value
   * @param { Number } [ a=1 ] The alpha value
   */
  constructor(h, s, l, a = 1) {
    this.h = h;
    this.s = s;
    this.l = l;
    this.a = a;
  }

  /**
  * Returns a hsl string representation of this color.
  * @returns { String } In format hsl(0, 0%, 0%)
  */
  toHSL() {
    return `hsl(${this.h}, ${toPercentage(this.s)}%, ${toPercentage(this.l)}%)`;
  }

  /**
   * Returns a hsla string representation of this color.
   * @return { String } In format hsla(0, 0%, 0%, 0)
   */
  toHSLA() {
    return this.toString();
  }

  /**
   * Returns an rgb string representation of this color.
   * @return { String } In format rgb(0, 0, 0)
   */
  toRGB() {
    const rgb = toRgb(this.h, this.s, this.l);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  /**
   * Returns an rgba string representation of this color.
   * @return { String } In format rgba(0, 0, 0, 0)
   */
  toRGBA() {
    const rgb = toRgb(this.h, this.s, this.l);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.a})`;
  }

  /**
   * Returns a hex string representation of this color.
   * @return { String } In format #000000
   */
  toHex() {
    const rgb = toRgb(this.h, this.s, this.l);
    return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`;
  }

  /**
   * Returns an number representation of the color
   * @return { Number } Unsigned 24 bt integer in the range 0-16 777 216
   */
  toNumber() {
    const hex = toByte(this.h, this.s, this.l);

    return (hex.h << 16) + (hex.s << 8) + hex.l;
  }

  /**
   * Returns a string representation of this color.
   * @returns { String } In format hsla(0, 0%, 0%, 0)
   */
  toString() {
    return `hsla(${this.h}, ${toPercentage(this.s)}%, ${toPercentage(this.l)}%, ${this.a})`;
  }

  /**
   * Compares two colors.
   * @param { HslaColor } c The color to compare with.
   * @return { Boolean } True if the hsl channels are the same, false otherwise
   */
  isEqual(c) {
    return ((this.h === c.h) && (this.s === c.s) && (this.l === c.l) && (this.a === c.a));
  }

  /**
   * Checks if this color is perceived as dark.
   * @return { Boolean } True if the luminance is below 125, false otherwise.
   */
  isDark() {
    return this.luminance() < 0.49;
  }

  /**
   * Calculates the perceived luminance of the color.
   * @return { Number } A value in the range 0-1 where a low value is considered dark and vice versa.
   */
  luminance() {
    let rgb = toRgb(this.h, this.s, this.l),
      luminance = Math.sqrt((0.299 * Math.pow(rgb.r, 2)) + (0.587 * Math.pow(rgb.g, 2)) + (0.114 * Math.pow(rgb.b, 2)));

    return luminance / 255;
  }
}

export default HslaColor;
