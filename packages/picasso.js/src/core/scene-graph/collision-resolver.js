import createCollision from './collision';
import { scalarMultiply } from '../math/vector';
import { create as createPolygon } from '../geometry/polygon';
import {
  lineToPoints,
  rectToPoints,
  getShapeType
} from '../geometry/util';

function appendParentNode(node, collision) {
  const p = node.parent;

  if (p && p.type !== 'stage') {
    collision.parent = createCollision(p);

    const pp = p.parent;
    if (pp && pp.type !== 'stage') {
      appendParentNode(pp, collision.parent);
    }
  }
}

function appendInputShape(shape, collisions) {
  for (let i = 0, len = collisions.length; i < len; i++) {
    collisions[i].input = shape;
  }
}

function resolveFrontChildCollision(node, type, input) {
  const num = node.descendants.length;

  for (let i = num - 1; i >= 0; i--) {
    const desc = node.descendants[i];
    if (desc.collider === null) {
      continue;
    }

    if (desc.collider[type](input)) {
      const collision = createCollision(desc);

      appendParentNode(desc, collision);

      return collision;
    }
  }
  return null;
}

function resolveGeometryCollision(node, type, input) {
  if (node.collider[type](input)) {
    const c = createCollision(node);

    appendParentNode(node, c);

    return c;
  }

  return null;
}

function inverseTransform(node, input) {
  let transformedInput = {};
  if (node.modelViewMatrix) {
    if (Array.isArray(input)) { // Rect or Line
      transformedInput = node.inverseModelViewMatrix.transformPoints(input);
    } else if (!isNaN(input.r)) { // Circle
      const p = { x: input.cx, y: input.cy };
      ({ x: transformedInput.cx, y: transformedInput.cy } = node.inverseModelViewMatrix.transformPoint(p));
      transformedInput.r = input.r;
    } else if (Array.isArray(input.vertices)) { // Polygon
      transformedInput.vertices = node.inverseModelViewMatrix.transformPoints(input.vertices);
    } else { // Point
      transformedInput = node.inverseModelViewMatrix.transformPoint(input);
    }
  } else {
    transformedInput = input;
  }

  if (Array.isArray(transformedInput.vertices)) {
    transformedInput = createPolygon(transformedInput); // TODO Shouldn't have to do this here, currently its beacause a collision algorithm optimization, i.e. caching of polygon bounds
  }

  return transformedInput;
}

function resolveCollision(node, intersectionType, input) {
  if (node.colliderType === null) {
    return null;
  }

  const transformedInput = inverseTransform(node, input);

  if (node.colliderType === 'frontChild') {
    return resolveFrontChildCollision(node, intersectionType, transformedInput);
  }

  return resolveGeometryCollision(node, intersectionType, transformedInput);
}

function findAllCollisions(nodes, intersectionType, ary, input) {
  const num = nodes.length;
  for (let i = 0; i < num; i++) {
    const node = nodes[i];

    const collision = resolveCollision(node, intersectionType, input);

    if (collision) { ary.push(collision); }

    // Only traverse children if no match is found on parent and it doesnt have any custom collider
    if (node.children && !collision && !node.collider) {
      findAllCollisions(node.children, intersectionType, ary, input);
    }
  }
}

function hasCollision(nodes, intersectionType, input) {
  const num = nodes.length;
  for (let i = 0; i < num; i++) {
    const node = nodes[i];

    const collision = resolveCollision(node, intersectionType, input);

    if (collision !== null) { return true; }

    if (node.children && !node.collider) {
      return hasCollision(node.children, intersectionType, input);
    }
  }
  return false;
}

function resolveShape(shape, ratio = 1) {
  const type = getShapeType(shape);
  let _shape = {};

  switch (type) {
    case 'circle':
      _shape.cx = shape.cx * ratio;
      _shape.cy = shape.cy * ratio;
      _shape.r = shape.r;
      return ['intersectsCircle', _shape];
    case 'rect':
      _shape = rectToPoints(shape).map(p => scalarMultiply(p, ratio));
      return ['intersectsRect', _shape];
    case 'line':
      _shape = lineToPoints(shape).map(p => scalarMultiply(p, ratio));
      return ['intersectsLine', _shape];
    case 'point':
      _shape = scalarMultiply(shape, ratio);
      return ['containsPoint', _shape];
    case 'polygon':
      _shape.vertices = shape.vertices.map(vertex => scalarMultiply(vertex, ratio));
      return ['intersectsPolygon', _shape];
    default:
      return [];
  }
}

export function resolveCollionsOnNode(node, shape) {
  const [intersectionType, _shape] = resolveShape(shape, node.dpi);
  const collisions = [];

  if (intersectionType) {
    findAllCollisions([node], intersectionType, collisions, _shape);
    appendInputShape(shape, collisions);
  }
  return collisions;
}

export function hasCollisionOnNode(node, shape) {
  const [intersectionType, _shape] = resolveShape(shape, node.dpi);

  return hasCollision([node], intersectionType, _shape);
}
