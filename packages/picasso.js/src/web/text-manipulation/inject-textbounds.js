function hasData(data) {
  return typeof data !== 'undefined' && data !== null;
}

export default function injectTextBoundsFn(renderer) {
  return ({ node }) => {
    if (node.type === 'text' && hasData(node.data) && !node.textBoundsFn) {
      node.textBoundsFn = renderer.textBounds;
    }
  };
}
