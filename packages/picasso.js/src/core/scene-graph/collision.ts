import createSceneNode, { SceneNode } from './scene-node';

export class Collision {
  declare _input: object | null;
  declare _node: SceneNode;
  declare _parent: Collision | null;
  constructor(node: object) {
    this._node = createSceneNode(node);
    this._parent = null;
    this._input = null;
  }

  get node() {
    return this._node;
  }

  set parent(p: Collision | null) {
    this._parent = p;
  }

  get parent() {
    return this._parent;
  }

  set input(i: object | null) {
    this._input = i;
  }

  get input() {
    return this._input;
  }
}

export default function create(node: object) {
  return new Collision(node);
}
