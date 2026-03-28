import { create } from './display-objects';
import Matrix from '../math/matrix';
import resolveTransform from './transform-resolver';
import contextFactory from './context';

const styleContext = contextFactory(['stroke', 'fill', 'strokeWidth', 'opacity', 'fontFamily', 'fontSize', 'baseline'] as any);

function doEvent(state: any, listeners: any[]): void {
  if (!Array.isArray(listeners)) {
    return;
  }

  for (let i = 0, len = listeners.length; i < len; i++) {
    listeners[i](state);
  }
}

function updateState(state: any, index: number, nodes: any[]): void {
  state.node = nodes[index];
  state.index = index;
}

function traverse(items: any[], parent: any, matrix: Matrix, on: any): void {
  let disabled = false;
  const state = {
    siblings: items,
    node: null as any,
    index: 0,
  };
  for (let i = 0, len = items.length; i < len; i++) {
    updateState(state, i, items);
    doEvent(state, on.create);

    disabled = typeof state.node.disabled === 'function' ? state.node.disabled() : state.node.disabled;
    if (disabled) {
      continue;
    }

    // Save the current style context to be able to inherit styles
    state.node = styleContext.save(state.node);

    const displayNode = create(state.node.type, state.node);
    if (displayNode) {
      if (state.node.transform) {
        matrix.save();
        resolveTransform(state.node.transform, matrix);
      }

      if (!matrix.isIdentity()) {
        (displayNode as Record<string, unknown>).modelViewMatrix = matrix.clone();
      }

      parent.addChild(displayNode);
      if (state.node.children) {
        traverse(state.node.children, displayNode, matrix, on);
      }

      if (state.node.transform) {
        matrix.restore();
      }
    }

    // Revert to previous style context
    styleContext.restore();
  }
}

export default function scene({ items, stage, dpi, on = {} }: { items: any[]; stage?: any; dpi: any; on?: any }): any {
  if (!stage) {
    stage = create('stage', dpi);
  }

  traverse(items, stage, new Matrix(), on);

  return stage;
}
