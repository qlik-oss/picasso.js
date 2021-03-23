import registry from '../utils/registry';

import { numberFormat as d3NumberFormatter, timeFormat as d3TimeFormatter } from './d3';

/**
 * @typedef {object} FormatterDefinition
 * @property {string} [formatter] Name of the formatter
 * @property {string} [type] Type of formatter
 * @property {string} [format] Format string
 */

const formatterRegistry = registry();

formatterRegistry('d3-number', d3NumberFormatter);
formatterRegistry('d3-time', d3TimeFormatter);

export { formatterRegistry as default };
