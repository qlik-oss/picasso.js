import createSceneNode from './scene-node';

export class Collision {
  constructor(node) {
    this._node = createSceneNode(node);
    this._parent = null;
    this._input = null;
  }

  get node() {
    return this._node;
  }

  set parent(p) {
    this._parent = p;
  }

  get parent() {
    return this._parent;
  }

  set input(i) {
    this._input = i;
  }

  get input() {
    return this._input;
  }
}

export default function create(...a) {
  return new Collision(...a);
}
