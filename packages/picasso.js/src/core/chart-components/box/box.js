import buildShapes from './box-shapes';
import complexResolver from './box-resolver';

const DEFAULT_DATA_SETTINGS = {
  oob: {
    show: true,
    type: 'n-polygon',
    fill: '#999',
    stroke: '#000',
    strokeWidth: 0,
    size: 10,
    sides: 3,
    startAngle: -90,
  },
  box: {
    show: true,
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 1,
    strokeLinejoin: 'miter',
    width: 1,
    maxWidthPx: undefined,
    minWidthPx: 1,
    minHeightPx: 1,
  },
  line: {
    show: true,
    stroke: '#000',
    strokeWidth: 1,
  },
  median: {
    show: true,
    stroke: '#000',
    strokeWidth: 1,
  },
  whisker: {
    show: true,
    stroke: '#000',
    strokeWidth: 1,
    fill: '',
    type: 'line',
    width: 1,
  },
};

const dataKeys = Object.keys(DEFAULT_DATA_SETTINGS);

const component = {
  require: ['chart', 'resolver', 'symbol'],
  defaultSettings: {
    settings: {},
    data: {},
    style: {
      box: '$shape',
      line: '$shape-guide',
      whisker: '$shape-guide',
      median: '$shape-guide--inverted',
    },
  },
  created() {
    this.state = {};
  },
  render({ data }) {
    const { width, height } = this.rect;

    const flipXY = this.settings.settings.orientation === 'horizontal';

    const { style, resolver, symbol } = this;

    const keys = dataKeys.filter((key) => !this.settings.settings[key] || this.settings.settings[key].show !== false);
    const defaultSettings = {};

    keys.forEach((key) => (defaultSettings[key] = DEFAULT_DATA_SETTINGS[key]));

    const resolved = complexResolver({
      keys,
      data,
      defaultSettings,
      style,
      settings: this.settings.settings,
      width,
      height,
      resolver,
    });

    const { settings, items } = resolved;

    const shapes = buildShapes({
      items,
      settings,
      width,
      height,
      flipXY,
      resolved,
      keys,
      symbol,
    });

    return shapes;
  },
};

export default component;
