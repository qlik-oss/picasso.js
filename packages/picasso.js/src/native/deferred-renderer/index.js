import renderer from './renderer';

export default renderer;

export function rendererComponent(picasso) {
  picasso.renderer('deferred', renderer);
}
