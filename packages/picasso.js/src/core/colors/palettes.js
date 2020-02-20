import linear from '../scales/linear';
import color from './color';

function rangeCal(min, max, colors) {
  const from = [min];

  const incrementor = (max - min) / (colors.length - 1);

  for (let i = 0; i < colors.length - 2; i++) {
    from.push(from[i] + incrementor);
  }

  from.push(max);

  return from;
}

/**
 * @memberof picasso.color
 * @namespace
 * @private
 * @type {Object}
 */
const palettes = {
  /**
   * Palettet for Cold to Warm colors
   * @param { Number } min Minimum value of the domain
   * @param { Number } max Maximum value of the domain
   * @return { LinearScale } Color scale where the domain is calucated base on min/max and range is a predefined set of colors
   */
  scientific: (min, max) => {
    const colorPalette = [
      '#3d52a1',
      '#3a89c9',
      '#77b7e5',
      '#b4ddf7',
      '#e6f5fe',
      '#ffe3aa',
      '#f9bd7e',
      '#ed875e',
      '#d24d3e',
      '#ae1c3e',
    ];

    const from = rangeCal(min, max, colorPalette);

    return linear()
      .domain(from)
      .range(colorPalette);
  },

  /**
   * Palettet for single hue color
   * @param { Number } min Minimum value of the domain
   * @param { Number } max Maximum value of the domain
   * @return { LinearScale } Color scale where the domain is calucated base on min/max and range is a predefined set of colors
   */
  multiHue1: (min, max) => {
    const colorPalette = ['#fee391', '#fec44f', '#fb9a29', '#ec7014', '#cc4c02', '#993404', '#662506'];

    const from = rangeCal(min, max, colorPalette);

    return linear()
      .domain(from)
      .range(colorPalette);
  },

  /**
   * Palettet for 12 colors
   * @return { RgbaColor[] } A collection of 12 colors
   */
  colors12: () => {
    const colorPalette = [
      '#332288',
      '#6699cc',
      '#88ccee',
      '#44aa99',
      '#117733',
      '#999933',
      '#ddcc77',
      '#661100',
      '#cc6677',
      '#aa4466',
      '#882255',
      '#aa4499',
    ].map(color);

    return colorPalette;
  },

  /**
   * Palettet for 100 colors
   * @return { RgbaColor[] } A collection of 100 colors
   */
  colors100: () => {
    const colorPalette = [
      '#99c867',
      '#e43cd0',
      '#e2402a',
      '#66a8db',
      '#3f1a20',
      '#e5aa87',
      '#3c6b59',
      '#aa2a6b',
      '#e9b02e',
      '#7864dd',
      '#65e93c',
      '#5ce4ba',
      '#d0e0da',
      '#d796dd',
      '#64487b',
      '#e4e72b',
      '#6f7330',
      '#932834',
      '#ae6c7d',
      '#986717',
      '#e3cb70',
      '#408c1d',
      '#dd325f',
      '#533d1c',
      '#2a3c54',
      '#db7127',
      '#72e3e2',
      '#e2c1da',
      '#d47555',
      '#7d7f81',
      '#54ae9b',
      '#e9daa6',
      '#3a8855',
      '#5be66e',
      '#ab39a4',
      '#a6e332',
      '#6c469d',
      '#e39e51',
      '#4f1c42',
      '#273c1c',
      '#aa972e',
      '#8bb32a',
      '#bdeca5',
      '#63ec9b',
      '#9c3519',
      '#aaa484',
      '#72256d',
      '#4d749f',
      '#9884df',
      '#e590b8',
      '#44b62b',
      '#ad5792',
      '#c65dea',
      '#e670ca',
      '#e38783',
      '#29312d',
      '#6a2c1e',
      '#d7b1aa',
      '#b1e7c3',
      '#cdc134',
      '#9ee764',
      '#56b8ce',
      '#2c6323',
      '#65464a',
      '#b1cfea',
      '#3c7481',
      '#3a4e96',
      '#6493e1',
      '#db5656',
      '#747259',
      '#bbabe4',
      '#e33f92',
      '#d0607d',
      '#759f79',
      '#9d6b5e',
      '#8574ae',
      '#7e304c',
      '#ad8fac',
      '#4b77de',
      '#647e17',
      '#b9c379',
      '#8da8b0',
      '#b972d9',
      '#786279',
      '#7ec07d',
      '#916436',
      '#2d274f',
      '#dce680',
      '#759748',
      '#dae65a',
      '#459c49',
      '#b7934a',
      '#51c671',
      '#9ead3f',
      '#969a5c',
      '#b9976a',
      '#46531a',
      '#c0f084',
      '#76c146',
      '#bad0ad',
    ].map(color);

    return colorPalette;
  },
};

export default palettes;
