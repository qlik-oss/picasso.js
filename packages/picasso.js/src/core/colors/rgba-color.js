function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

/**
 * Converts RGB to HSL
 * @ignore
 * @param r Red
 * @param g Green
 * @param b Blue
 * @return { String } In format 0, 0%, 0%
 */
function toHSL(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
    }
    h /= 6;
  }

  return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
}

class RgbaColor {
  /**
   * Class representing a RGBA Color
   * @private
   * @param { Number } r The red value
   * @param { Number } g The green value
   * @param { Number } b The blue value
   * @param { Number } [ a=1 ] The alpha value
   */
  constructor(r, g, b, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /**
   * Returns a hsl string representation of this color.
   * @return { String } In format hsl(0,0,0)
   */
  toHSL() {
    const value = toHSL(this.r, this.g, this.b);
    return `hsl(${value})`;
  }

  /**
   * Returns a hsla string representation of this color
   * @return { String } In format hsla(0,0,0,0)
   */
  toHSLA() {
    const value = toHSL(this.r, this.g, this.b);
    return `hsla(${value}, ${this.a})`;
  }

  /**
   * Returns an rgb string representation of this color.
   * @return { String } In format rgb(0, 0, 0)
   */
  toRGB() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  /**
   * Returns an rgba string representation of this color.
   * @return { String } In format rgb(0, 0, 0, 0)
   */
  toRGBA() {
    return this.toString();
  }

  /**
   * Returns a hex string representation of this color.
   * @return { String } In format #000000
   */
  toHex() {
    return `#${componentToHex(this.r)}${componentToHex(this.g)}${componentToHex(this.b)}`;
  }

  /**
   * Returns an number representation of the color
   * @return { Number } Unsigned integer in the range 0-16 777 216
   */
  toNumber() {
    let r = this.r & 0xff,
      g = this.g & 0xff,
      b = this.b & 0xff,
      rgb = (r << 16) + (g << 8) + b;
    return rgb;
  }

  /**
   * Compares two colors.
   * @param { RgbaColor } c The color to compare with.
   * @return { Boolean } True if the rgb channels are the same, false otherwise
   */
  isEqual(c) {
    return this.r === c.r && this.g === c.g && this.b === c.b && this.a === c.a;
  }

  /**
   * convert rgba color to string
   * @returns { String } In format rgba(0, 0, 0, 0)
   */
  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
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
    const luminance = Math.sqrt(0.299 * this.r ** 2 + 0.587 * this.g ** 2 + 0.114 * this.b ** 2); // Using Weighted Euclidean Distance in 3D RGB Space
    return luminance / 255;
  }
}

export default RgbaColor;
