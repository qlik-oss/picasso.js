import createDebugCollider from './debug-collider';
import createDebugPathToPoints from './debug-path-to-points';

export function debugCollider(picasso) {
  picasso.component('debug-collider', createDebugCollider);
}

export function debugPathToPoints(picasso) {
  picasso.component('debug-path-to-points', createDebugPathToPoints);
}
