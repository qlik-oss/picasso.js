import extend from 'extend';
import Node from '../node';
import { create as geometry } from '../../geometry';
import { create as geometryCollection } from '../../geometry/geometry-collection';
import Matrix from '../../math/matrix';
import resolveTransform from '../transform-resolver';
import nodeSelector from '../node-selector';
import createSceneNode from '../scene-node';
import { resolveCollionsOnNode, hasCollisionOnNode } from '../collision-resolver';
import { assignMappedAttribute } from '../attributes';

/**
 * @typedef {object} node-def
 * @property {string} type
 * @property {string|gradient-def} [fill] - {@link https://www.w3.org/TR/fill-stroke-3/#fill-shorthand}
 * @property {string|gradient-def} [stroke] - {@link https://www.w3.org/TR/fill-stroke-3/#propdef-stroke}
 * @property {number} [strokeWidth] - {@link https://www.w3.org/TR/fill-stroke-3/#propdef-stroke-width}
 * @property {string|number[]} [strokeDasharray] - {@link https://www.w3.org/TR/fill-stroke-3/#propdef-stroke-dasharray}
 * @property {number} [opacity] - {@link https://www.w3.org/TR/css-color-4/#propdef-opacity}
 * @property {string} [transform] - {@link https://www.w3.org/TR/SVG/coords.html#TransformAttribute}
 * @property {object} [data] - Data object, may contain any properties
 * @property {object} [desc] - Meta-data object, may contain any properties
 * @property {string} [tag] - White-space seperated list of tags
 * @property {string} [id] - Unique identifier of the node
 * @property {object} [collider]
 */

class DisplayObject extends Node {
  constructor(type) {
    super(type);
    this._stage = null;
    this._collider = {
      type: null,
      definition: null,
      fn: null
    };
    this._attrs = {};
    this._node = null;
  }

  set(v = {}) {
    this.node = v;

    const {
      data,
      desc,
      tag
    } = v;

    assignMappedAttribute(this.attrs, v);

    if (typeof data !== 'undefined') {
      this.data = data;
    }

    if (typeof desc === 'object') {
      this.desc = extend(true, {}, desc);
    }

    if (typeof tag === 'string') {
      this.tag = tag;
    }
  }

  findShapes(selector) {
    return nodeSelector.find(selector, this).map(node => createSceneNode(node));
  }

  getItemsFrom(shape) {
    return resolveCollionsOnNode(this, shape);
  }

  containsPoint(p) {
    return hasCollisionOnNode(this, p);
  }

  intersectsLine(line) {
    return hasCollisionOnNode(this, line);
  }

  intersectsRect(rect) {
    return hasCollisionOnNode(this, rect);
  }

  intersectsCircle(circle) {
    return hasCollisionOnNode(this, circle);
  }

  intersectsPolygon(polygon) {
    return hasCollisionOnNode(this, polygon);
  }

  resolveLocalTransform(m = new Matrix()) {
    if (typeof this.attrs.transform !== 'undefined') { resolveTransform(this.attrs.transform, m); }
    this.modelViewMatrix = m.clone();
  }

  resolveGlobalTransform(m = new Matrix()) {
    const a = this.ancestors;

    if (a.length > 0) {
      for (let i = a.length - 1; i >= 0; i--) {
        a[i].resolveLocalTransform(m);
        m = a[i].modelViewMatrix;
      }
    }

    this.resolveLocalTransform(m);
  }

  /**
   * Returns the value of attribute a.
   * @private
   * @param a
   * @returns {*} The value of attribute a.
   */
  attr(a) {
    return this.attrs[a];
  }

  equals(d) {
    const attrs = this.attrs;
    const attrKeys = Object.keys(attrs);
    const dAttrs = d.attrs;
    const dAttrKeys = Object.keys(dAttrs);
    if (attrKeys.length !== dAttrKeys.length) {
      return false;
    }
    for (let i = 0; i < attrKeys.length; i++) {
      const key = attrKeys[i];
      if (!Object.hasOwnProperty.call(dAttrs, key)) {
        return false;
      }
      if (attrs[key] !== dAttrs[key]) {
        return false;
      }
    }

    return super.equals(d);
  }

  toJSON() {
    const json = super.toJSON();
    json.attrs = this.attrs;
    return json;
  }

  get attrs() {
    return this._attrs;
  }

  get stage() {
    if (this._parent && !this._stage) { // lazy evaluation
      this._stage = this._parent.stage;
    } else if (!this._parent && this._stage !== this) {
      this._stage = null;
    }
    return this._stage;
  }

  set modelViewMatrix(m) {
    this._mvm = m;
    this._imvm = null;
  }

  get modelViewMatrix() {
    return this._mvm;
  }

  get inverseModelViewMatrix() {
    this._imvm = this._imvm ? this._imvm : this._mvm.clone().invert();
    return this._imvm;
  }

  set node(n) {
    this._node = n;
  }

  get node() {
    return this._node;
  }

  set collider(definition) {
    const type = Array.isArray(definition) ? 'collection' : (definition && definition.type);
    if (typeof type !== 'string') {
      // Non string type definition resets the collider
      this._collider.type = null;
      this._collider.definition = null;
      this._collider.fn = null;
      return;
    }

    // Check if a collider of the same type is already defined, if so, do an update
    if (this._collider !== null && this._collider.type === type && this._collider.fn !== null) {
      this._collider.fn.set(definition);
      this._collider.definition = definition;
      return;
    }

    // Store the definition so that it can be lazy evaluated
    this._collider.type = type;
    this._collider.definition = definition;
  }

  get collider() {
    // Resolve geometry function from cache
    if (this._collider.fn !== null) {
      return this._collider.fn;
    }

    // Resolve geometry function and store it in cache
    switch (this._collider.type) {
      case 'collection':
        this._collider.fn = geometryCollection(this._collider.definition);
        break;
      case 'frontChild': // TODO Deprecate
        // Front child is not resolved by a function on this node, but instead on one of its child nodes
        return true;
      case 'bounds':
        this._collider.fn = geometry('rect', this.boundingRect());
        break;
      case 'line':
      case 'rect':
      case 'circle':
      case 'polygon':
      case 'polyline':
        this._collider.fn = geometry(this._collider.type, this._collider.definition);
        break;
      default:
        return null;
    }

    return this._collider.fn;
  }

  get colliderType() {
    return this._collider.type;
  }
}

export default DisplayObject;
