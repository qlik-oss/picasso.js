import renderer from './dom-renderer';

export default renderer;

export function rendererComponent(picasso) {
  picasso.renderer('dom', renderer);
}

