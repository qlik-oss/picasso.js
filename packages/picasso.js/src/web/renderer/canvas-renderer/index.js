import { renderer, register } from './canvas-renderer';
import rect from './shapes/rect';
import circle from './shapes/circle';
import line from './shapes/line';
import text from './shapes/text';
import path from './shapes/path';

register('rect', rect);
register('circle', circle);
register('line', line);
register('path', path);
register('text', text);

export default renderer;

export function rendererComponent(picasso) {
  picasso.renderer('canvas', renderer);
}
