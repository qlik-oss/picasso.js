export default function adjustTweenedNodes({ tweenedNodes, formatter }) {
  tweenedNodes.forEach((node) => {
    const { type, data } = node;
    if (type === 'text' && data && data.value && data.formatterKey) {
      const { value, formatterKey } = data;
      node.text = formatter(formatterKey)(value);
    }
  });
}
