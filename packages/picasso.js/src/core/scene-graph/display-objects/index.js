import { create as stage } from './stage';
import { create as container } from './container';
import { create as gradientItem } from './gradient-item';
import { create as patternItem } from './pattern-item';
import { create as rect } from './rect';
import { create as circle } from './circle';
import { create as line } from './line';
import { create as path } from './path';
import { create as text } from './text';
import registry from '../../utils/registry';

const reg = registry();

reg.add('rect', rect);
reg.add('circle', circle);
reg.add('text', text);
reg.add('line', line);
reg.add('path', path);
reg.add('stage', stage);
reg.add('container', container);
reg.add('defs', container);
reg.add('linearGradient', gradientItem);
reg.add('radialGradient', gradientItem);
reg.add('stop', gradientItem);
reg.add('pattern', patternItem);

export function create(type, input) { // eslint-disable-line import/prefer-default-export
  return reg.get(type)(input);
}
