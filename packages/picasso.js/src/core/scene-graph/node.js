class Node {
  /**
   * @private
   */
  constructor(type) {
    this._parent = null;
    this._children = [];
    this._ancestors = null;
    this.type = type;
    this.data = null;
  }

  /**
   * Detaches this node from its parent, if such exists.
   * @returns {Node}
   */
  detach() {
    if (this._parent) {
      this._parent.removeChild(this);
    }
    return this;
  }

  /**
   * Parent of this node.
   * @readonly
   * @type {Node}
   */
  get parent() {
    return this._parent;
  }

  /**
   * Checks whether this node is a branch.
   *
   * True if this node has children, false otherwise.
   * @readonly
   * @type {Boolean}
   */
  get isBranch() {
    return this._children && this._children.length;
  }

  /**
   * Children of this node.
   * @readonly
   * @type {Node[]}
   */
  get children() {
    return this._children;
  }

  /**
   * Ancestors of this node, including parent.
   * @readonly
   * @type {Node[]}
   */
  get ancestors() {
    if (!this._ancestors) {
      this._ancestors = [];
      if (this.parent) {
        this._ancestors.push(this.parent, ...this.parent.ancestors);
      }
    }

    return this._ancestors;
  }

  /**
   * Descendants of this node.
   * @readonly
   * @type {Node[]}
   */
  get descendants() {
    const r = [];
    const len = this.children.length;
    let i;
    let c;

    for (i = 0, len; i < len; i++) {
      c = this.children[i];
      r.push(c);

      if (c.children.length) {
        r.push(...c.descendants);
      }
    }
    return r;
  }

  /**
   *
   * @returns {Boolean}
   */
  equals(n) {
    const children = this.children;
    const nChildren = n.children;
    if (children.length !== nChildren.length) {
      return false;
    }
    // Requires deterministic child order
    for (let i = 0; i < children.length; i++) {
      if (!children[i].equals(nChildren[i])) {
        return false;
      }
    }
    return true;
  }

  toJSON() {
    return {
      type: this.type,
      children: this.children.map((ch) => ch.toJSON())
    };
  }
}

export default Node;
