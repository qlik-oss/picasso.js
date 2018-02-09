import { create } from './display-objects';
import Matrix from '../math/matrix';
import resolveTransform from './transform-resolver';
import contextFactory from './context';

const styleContext = contextFactory(
  [
    'stroke',
    'fill',
    'strokeWidth',
    'opacity',
    'fontFamily',
    'fontSize',
    'baseline'
  ]
);

function doEvent(state, listeners) {
  if (!Array.isArray(listeners)) {
    return;
  }

  for (let i = 0, len = listeners.length; i < len; i++) {
    listeners[i](state);
  }
}

function updateState(state, index, nodes) {
  state.node = nodes[index];
  state.index = index;
}

function traverse(items, parent, matrix, on) {
  let disabled = false;
  const state = {
    siblings: items,
    node: null,
    index: 0
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
        displayNode.modelViewMatrix = matrix.clone();
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

export default function scene({
  items,
  stage,
  dpi,
  on = {}
}) {
  if (!stage) {
    stage = create('stage', dpi);
  }

  traverse(items, stage, new Matrix(), on);

  return stage;
}
