export default function adjustTweenedNodes({ tweenedNodes, formatter }) {
  tweenedNodes.forEach((node) => {
    const { type, data } = node;
    if (type === 'text' && data && data.value && data.formatter) {
      node.text = formatter(data.formatter)(data.value);
    }
  });
}
