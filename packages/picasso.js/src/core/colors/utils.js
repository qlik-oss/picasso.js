import color from './color';

/**
 * @memberof picasso.color
 * @namespace
 * @private
 * @type {Object}
 */
const utils = {
  /**
   * Takes a collection of colors and constructs a linear-gradient CSS property
   * @param { String } direction Allowed values are top, bottom, left or right
   * @param { LinearScale | RgbaColor[] | HslaColor[] | String[] } colors Color scale or Array of colors
   * @param { Boolean } percentage TRUE if the representation should be in percentage
     * @returns { String } Full CSS string representation of the linear-gradient property
     */
  linearGradient: (direction, colors, percentage) => {
    let cssColors;
    if (typeof colors === 'function' && colors.domain) {
      const inputDomain = colors.domain();

      cssColors = inputDomain.map(d =>
   colors(d)
).join();
    } else if (colors.constructor === Array) {
      cssColors = colors;
    }

    if (percentage) {
      let result = '',
        interval = 100 / colors.length,
        percent = 0;

      for (let i = 0; i < cssColors.length; i++) {
        result += `${cssColors[i]} ${percent}%, ${cssColors[i]} ${percent + interval}%, `;
        percent += interval;
      }

      cssColors = result.slice(0, -2);
    }

    return `linear-gradient(to ${direction}, ${cssColors})`;
  },

  /**
   * According to the Web Content Accessibility Guidelines the contrast between background and small text should be at least 4.5 : 1.
   * @param { RgbaColor | HslaColor | String } c1 Color to be compered
   * @param { RgbaColor | HslaColor | String } c2 Color to compare with
   * @return { Number } Contrast ratio between two colors
   */
  getContrast: (c1, c2) => {
    c1 = color(c1);
    c2 = color(c2);

    let l1 = c1.luminance(),
      l2 = c2.luminance();

    if (l1 > l2) {
      return (l1 + 0.05) / (l2 + 0.05);
    }
    return (l2 + 0.05) / (l1 + 0.05);
  }
};

export default utils;
