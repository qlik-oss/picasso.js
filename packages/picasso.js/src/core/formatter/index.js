import registry from '../utils/registry';

import { numberFormat as d3NumberFormatter, timeFormat as d3TimeFormatter } from './d3';

const formatterRegistry = registry();

formatterRegistry('d3-number', d3NumberFormatter);
formatterRegistry('d3-time', d3TimeFormatter);

export { formatterRegistry as default };
