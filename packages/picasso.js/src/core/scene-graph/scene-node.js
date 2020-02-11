import { pointsToRect, pointsToCircle, pointsToLine } from '../geometry/util';
import pointsToPath from '../utils/points-to-path';

function appendDpi(points, dpi) {
  for (let i = 0, len = points.length; i < len; i++) {
    points[i].x /= dpi;
    points[i].y /= dpi;
  }
}

function geometryToDef(geometry, dpi, mvm) {
  const type = geometry.type;
  const points = mvm ? mvm.transformPoints(geometry.points()) : geometry.points();
  appendDpi(points, dpi);
  let def = null;

  if (type === 'rect' || type === 'bounds') {
    def = pointsToRect(points);
    def.type = type;
  } else if (type === 'circle') {
    def = pointsToCircle(points, geometry.r);
    def.type = type;
  } else if (type === 'line') {
    def = pointsToLine(points);
    def.type = type;
  } else if (type === 'polygon' || type === 'polyline') {
    const path = pointsToPath(points, type === 'polygon');
    def = {
      type: 'path',
      d: path,
    };
  }

  return def;
}

/**
 * @ignore
 * @returns {object} Returns a node definition of the collider
 */
function colliderToShape(node, dpi) {
  if (node.collider) {
    const mvm = node.modelViewMatrix;
    const isCollection = node.colliderType === 'collection';

    if (isCollection) {
      const children = node.collider.geometries.map(geometry => geometryToDef(geometry, dpi, mvm));

      return {
        type: 'container',
        children,
      };
    }

    return geometryToDef(node.collider, dpi, mvm);
  }

  return null;
}

/**
 * Read-only object representing a node on the scene.
 */
class SceneNode {
  constructor(node) {
    this._bounds = (includeTransform = true) => {
      const { x, y, width, height } = node.boundingRect
        ? node.boundingRect(includeTransform)
        : {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
          };
      return {
        x,
        y,
        width,
        height,
      };
    };
    this._attrs = node.attrs;
    this._type = node.type;
    this._data = node.data;
    this._dpi = node.stage ? node.stage.dpi : 1;
    this._collider = () => colliderToShape(node, this._dpi);
    this._desc = node.desc;
    this._tag = node.tag;
    this._children = () => node.children.map(n => new SceneNode(n));
    this._parent = () => (node.parent ? new SceneNode(node.parent) : null);

    this._cache = {
      elementBoundingRect: null,
    };
    this._getElementBoundingRect = () => {
      if (!this._cache.elementBoundingRect && this.element) {
        this._cache.elementBoundingRect = this.element.getBoundingClientRect();
      }
      return this._cache.elementBoundingRect || { left: 0, top: 0 };
    };
  }

  /**
   * Get child nodes
   * @type {SceneNode[]}
   */
  get children() {
    return this._children();
  }

  /**
   * Get parent node
   * @type {SceneNode}
   */
  get parent() {
    return this._parent();
  }

  /**
   * Node type
   * @type {string}
   */
  get type() {
    return this._type;
  }

  /**
   * Get the associated data
   * @type {any}
   */
  get data() {
    return this._data;
  }

  /**
   * Node attributes
   * @type {object}
   */
  get attrs() {
    return this._attrs;
  }

  /**
   * Element the scene is attached to
   * @type {HTMLElement}
   * @private
   */
  set element(e) {
    this._cache.elementBoundingRect = null;
    this._element = e;
  }

  /**
   * Element the scene is attached to
   * @type {HTMLElement}
   */
  get element() {
    return this._element;
  }

  /**
   * Key of the component this shape belongs to
   * @type {string}
   * @private
   */
  set key(k) {
    this._key = k;
  }

  /**
   * Key of the component this shape belongs to
   * @type {string}
   */
  get key() {
    return this._key;
  }

  /**
   * Bounding rectangle of the node. After any transform has been applied, if any, but excluding scaling transform related to devicePixelRatio.
   * Origin is in the top-left corner of the scene element.
   * @type {rect}
   */
  get bounds() {
    const bounds = this._bounds();
    bounds.x /= this._dpi;
    bounds.y /= this._dpi;
    bounds.width /= this._dpi;
    bounds.height /= this._dpi;
    return bounds;
  }

  /**
   * Bounding rectangle of the node withing it's local coordinate system.
   * Origin is in the top-left corner of the scene element.
   * @type {rect}
   */
  get localBounds() {
    const bounds = this._bounds(false);
    return bounds;
  }

  /**
   * Bounding rectangle of the node, relative a target.
   *
   * If target is an HTMLElement, the bounds are relative to the HTMLElement.
   * Any other target type will return the bounds relative to the viewport of the browser.
   *
   * @param {HTMLElement|any} target
   * @param {boolean} includeTransform - Whether to include any applied transforms on the node
   * @returns {rect}
   * @example
   *
   * node.boundsRelativeTo($('div'));
   * node.boundsRelativeTo('viewport');
   */
  boundsRelativeTo(target, includeTransform = true) {
    const type = typeof target;
    const bounds = includeTransform ? this.bounds : this.localBounds;
    const selfRect = this._getElementBoundingRect();
    let dx = selfRect.left;
    let dy = selfRect.top;

    if (type === 'object' && target !== null && typeof target.getBoundingClientRect === 'function') {
      const { left = 0, top = 0 } = target.getBoundingClientRect();
      dx -= left;
      dy -= top;
    }

    bounds.x += dx;
    bounds.y += dy;

    return bounds;
  }

  /**
   * Collider of the node. Transform on the node has been applied to the collider shape, if any, but excluding scaling transform related to devicePixelRatio.
   * Origin is in the top-left corner of the scene element.
   *
   * If node has no collider, null is returned.
   * @type {line|rect|circle|path}
   */
  get collider() {
    return this._collider();
  }

  /**
   * Node description
   * @type {object}
   */
  get desc() {
    return this._desc;
  }

  /**
   * Node tag
   * @type {string}
   */
  get tag() {
    return this._tag;
  }
}

function create(...a) {
  return new SceneNode(...a);
}

export { create as default, SceneNode };
