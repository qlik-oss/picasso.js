import {
  bars,
  slices
} from './strategies';

const strategies = {
  bar: bars,
  slice: slices
};

/**
 * @typedef {object} component--labels
 * @property {string} [type='labels']
 */

/**
 * @typedef {object} component--labels.settings
 * @property {Array<object>} sources
 * @property {string} sources[].component
 * @property {string} sources[].selector
 * @property {component--labels~label-strategy} sources[].strategy
 */

export function strategy({
  chart,
  source,
  rect,
  renderer,
  style
}, fn) {
  const component = chart.component(source.component);
  if (!component) {
    return [];
  }
  const nodes = chart.findShapes(source.selector).filter(n => n.key === source.component);

  return fn({
    chart,
    settings: source.strategy.settings,
    nodes,
    rect: {
      x: 0,
      y: 0,
      width: rect.width,
      height: rect.height
    },
    renderer,
    style
  });
}

const labelsComponent = {
  require: ['chart', 'renderer', 'settings'],
  defaultSettings: {
    settings: {},
    style: {
      label: '$label'
    }
  },
  created() {
    this.rect = {
      x: 0, y: 0, width: 0, height: 0
    };
  },
  beforeRender(opts) {
    this.rect = opts.size;
  },
  render() {
    const stngs = this.settings.settings;
    const labels = [];

    (stngs.sources || []).forEach((source) => {
      if (source.strategy && strategies[source.strategy.type] && source.component) {
        labels.push(...strategy({
          chart: this.chart,
          rect: this.rect,
          renderer: this.renderer,
          source,
          style: this.style
        }, strategies[source.strategy.type]));
      }
    });

    return labels;
  }
};

export default labelsComponent;
