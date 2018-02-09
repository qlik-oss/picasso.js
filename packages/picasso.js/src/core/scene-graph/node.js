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
      const p = this._parent;
      this._ancestors = p ? [p].concat(p.ancestors) : [];
    }

    return this._ancestors;
  }

  /**
   * Descendants of this node.
   * @readonly
   * @type {Node[]}
   */
  get descendants() {
    let r = [],
      i,
      len,
      c;

    for (i = 0, len = this._children.length; i < len; i++) {
      c = this._children[i];
      r.push(c);

      if (c._children.length) {
        r = r.concat(c.descendants);
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
      children: this.children.map(ch => ch.toJSON())
    };
  }
}

export default Node;
