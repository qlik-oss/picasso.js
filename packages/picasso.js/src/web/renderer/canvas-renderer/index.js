import { renderer, register } from './canvas-renderer';
import rect from './shapes/rect';
import circle from './shapes/circle';
import line from './shapes/line';
import text from './shapes/text';
import path from './shapes/path';
import image from './shapes/image';

register('rect', rect);
register('circle', circle);
register('line', line);
register('path', path);
register('text', text);
register('image', image);

export default renderer;

export function rendererComponent(picasso) {
  picasso.renderer('canvas', renderer);
}
