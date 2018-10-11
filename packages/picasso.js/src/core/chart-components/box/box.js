import { buildShapes } from './box-shapes';
import complexResolver from './box-resolver';

const DEFAULT_DATA_SETTINGS = {
  line: {
    show: true,
    stroke: '#000',
    strokeWidth: 1
  },
  median: {
    show: true,
    stroke: '#000',
    strokeWidth: 1
  },
  whisker: {
    show: true,
    stroke: '#000',
    strokeWidth: 1,
    fill: '',
    type: 'line',
    width: 1
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
    minHeightPx: 1
  },
  oob: {
    show: true,
    fill: 'red'
  }
};

const dataKeys = Object.keys(DEFAULT_DATA_SETTINGS);

const component = {
  require: ['chart', 'resolver'],
  defaultSettings: {
    settings: {},
    data: {},
    style: {
      box: '$shape',
      line: '$shape-guide',
      whisker: '$shape-guide',
      median: '$shape-guide--inverted'
    }
  },
  created() {
    this.rect = {
      x: 0, y: 0, width: 0, height: 0
    };
    this.state = {};
  },
  beforeRender(opts) {
    this.rect = opts.size;
  },
  render({ data }) {
    const { width, height } = this.rect;

    const flipXY = this.settings.settings.orientation === 'horizontal';

    const { style, resolver } = this;

    const resolved = complexResolver({
      keys: dataKeys,
      data,
      defaultSettings: DEFAULT_DATA_SETTINGS,
      style,
      settings: this.settings.settings,
      width,
      height,
      resolver
    });

    const { settings, items } = resolved;

    const shapes = buildShapes({
      items,
      settings,
      width,
      height,
      flipXY,
      resolved,
      keys: dataKeys
    });

    return shapes;
  }
};

export default component;
