import styleResolver from '../style/resolver';

function themeFn(style = {}, palettes = []) {
  const pals = {};
  palettes.forEach((palette) => {
    pals[palette.key] = {
      colors: palette.colors,
      sizes: palette.colors.map(colors => colors.length)
    };
  });

  const getPalette = (key, num) => {
    const palette = pals[key];
    if (!palette) {
      return [];
    }
    const sizes = palette.sizes;
    // find the first color set containing at least 'num' colors
    for (let i = 0; i < sizes.length; i++) {
      if (num <= sizes[i]) {
        return palette.colors[i];
      }
    }
    return palette.colors[sizes.length - 1];
  };

  /**
   * Theme API
   * @private
   * @experimental
   */
  const theme = {
    /**
     * Get an array of colors
     * @param {string} name - Name of the color palette
     * @param {number} [num] - The minimum number of colors to get from the palette
     */
    palette: (name, num) => getPalette(name, num),

    /**
     * Resolve style references
     * @param {style-object} s - Object containing
     */
    style: s => styleResolver(s, style)
  };

  return theme;
}

export {
  themeFn as default
};
