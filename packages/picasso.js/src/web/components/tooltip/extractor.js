import extend from 'extend';

export default function extractor(nodes, { chart, scale, props, h }) {
  const dataCtx = {
    resources: {
      dataset: chart.dataset,
      scale: chart.scale,
      formatter: chart.formatter,
    },
    scale,
    h,
  };

  const data = [];
  nodes.forEach(node => {
    if (typeof props.extract === 'function') {
      const ctx = extend({ node }, dataCtx);
      data.push(props.extract(ctx));
    }
  });

  return data;
}
