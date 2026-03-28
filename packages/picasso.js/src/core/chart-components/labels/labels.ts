import strategies from './strategies';

/**
 * @typedef {object} ComponentLabels
 * @extends ComponentSettings
 * @property {'labels'} type component type
 * @example
{
  type: 'labels',
  settings: {
    sources: [
      {
        component: 'bars',
        selector: 'rect', // select all 'rect' shapes from the 'bars' component
        strategy: {
          type: 'bar', // the strategy type
          settings: {
            labels: [
              {
                label({ data }) {
                  return data ? data.end.label : '';
                },
                placements: [
                  // label placements in prio order. Label will be placed in the first place it fits into
                  { position: 'inside', fill: '#fff' },
                  { position: 'outside', fill: '#666' },
                ],
              },
            ],
          },
        },
      },
    ],
  },
}
 */

/**
 * Component settings
 * @typedef {object} ComponentLabels.settings
 * @property {Array<ComponentLabels~Source>} sources Source settings
 */

/**
 * @typedef {object} ComponentLabels~Source
 * @property {string} component Key of target component
 * @property {string} selector Shape selector
 * @property {ComponentLabels~BarsLabelStrategy|ComponentLabels~RowsLabelStrategy|ComponentLabels~SlicesLabelStrategy} strategy Strategy settings
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
