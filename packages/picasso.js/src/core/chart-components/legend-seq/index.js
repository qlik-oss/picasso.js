import legendSeq from './legend-seq';

/**
 * @typedef {object} ComponentLegendSeq
 * @property {string} type Name of the component
 * @property {string} scale Reference to sequential color scale
 */

export default function sequentialLegend(picasso) {
  picasso.component('legend-seq', legendSeq);
}
