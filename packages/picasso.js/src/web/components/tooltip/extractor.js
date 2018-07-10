export default function extractor(nodes, {
  chart,
  scale,
  props,
  h,
}) {
  const itemContext = {
    resources: {
      dataset: chart.dataset,
      scale: chart.scale,
      formatter: chart.formatter,
    },
    scale,
    h,
  };

  const items = [];
  nodes.forEach((node) => {
    if (typeof props.extract === 'function') {
      const ctx = Object.assign({ node }, itemContext);
      items.push(props.extract(ctx));
    }
  });

  return items;
}
