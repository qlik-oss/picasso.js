import styleResolver from '../style/resolver';

function themeFn(style = {}, palettes = []) {
  let pals = {};
  const setPalettes = (p) => {
    p.forEach((palette) => {
      const pal = Array.isArray(palette.colors[0]) ? palette.colors : [palette.colors];
      pals[palette.key] = {
        colors: pal,
        sizes: pal.map(colors => (colors ? colors.length : 0))
      };
    });
  };

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

    setPalettes,

    /**
     * Resolve style references
     * @param {style-object} s - Object containing
     */
    style: s => styleResolver(s, style)
  };

  setPalettes(palettes);

  return theme;
}

export { themeFn as default };
