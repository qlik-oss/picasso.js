import strategies from './strategies';

/**
 * @typedef {object} ComponentLabels
 * @property {string} [type='labels']
 */

/**
 * @typedef {object} ComponentLabels.settings
 * @property {Array<object>} sources
 * @property {string} sources[].component
 * @property {string} sources[].selector
 * @property {ComponentLabels~labelStrategy} sources[].strategy
 */

export function strategy({ chart, source, rect, renderer, style }, fn) {
  const component = chart.component(source.component);
  if (!component) {
    return [];
  }
  const nodes = chart.findShapes(source.selector).filter((n) => n.key === source.component);

  return fn({
    chart,
    settings: source.strategy.settings,
    nodes,
    rect: {
      x: 0,
      y: 0,
      width: rect.width,
      height: rect.height,
    },
    renderer,
    style,
  });
}

const labelsComponent = {
  require: ['chart', 'renderer', 'settings'],
  defaultSettings: {
    settings: {},
    style: {
      label: '$label',
    },
  },
  render() {
    const stngs = this.settings.settings;
    const labels = [];

    (stngs.sources || []).forEach((source) => {
      if (source.strategy && strategies[source.strategy.type] && source.component) {
        labels.push(
          ...strategy(
            {
              chart: this.chart,
              rect: this.rect,
              renderer: this.renderer,
              source,
              style: this.style,
            },
            strategies[source.strategy.type]
          )
        );
      }
    });

    return labels;
  },
};

export default labelsComponent;
