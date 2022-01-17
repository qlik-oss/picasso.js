import tooltip from './tooltip';

/**
 * @typedef {object} ComponentTooltip
 * @extends ComponentSettings
 * @property {'tooltip'} type component type
 * @example
 * picasso.chart({
  settings: {
    interactions: [{
      type: 'native',
      events: {
        mousemove(e) {
          const tooltip = this.chart.component('<tooltip-key>');
          tooltip.emit('show', e);
        },
        mouseleave(e) {
          const tooltip = this.chart.component('<tooltip-key>');
          tooltip.emit('hide');
        }
      }
    }],
    components: [
      {
        key: '<tooltip-key>',
        type: 'tooltip'
      }
    ]
  },
  ...
});
 */

export default function addTooltip(picasso) {
  picasso.component('tooltip', tooltip);
}
