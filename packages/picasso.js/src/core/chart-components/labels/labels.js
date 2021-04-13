import strategies from './strategies';

/**
 * @typedef {object} ComponentLabels
 * @extends ComponentSettings
 */

/**
 * Component settings
 * @typedef {object} ComponentLabels.settings
 * @property {Array<ComponentLabels~source>} sources Source settings
 */

/**
 * @typedef {object} ComponentLabels~source
 * @property {string} component Key of target component
 * @property {string} selector Shape selector
 * @property {ComponentLabels~barsLabelStrategy|ComponentLabels~rowsLabelStrategy|ComponentLabels~slicesLabelStrategy} strategy Strategy settings
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
