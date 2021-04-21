import legendSeq from './legend-seq';

/**
 * @typedef {object} ComponentLegendSeq
 * @extends ComponentSettings
 * @example
{
  type: 'legend-seq',
  settings: {
    fill: '<sequential-color-scale>',
    major: '<linear-scale>',
  }
}
 */

export default function sequentialLegend(picasso) {
  picasso.component('legend-seq', legendSeq);
}
