const settings = {
  scales: {
    category: { data: { extract: { field: 'Product' } } },
    value: { data: { field: 'Sales' }, invert: true, expand: 0.05 },
  },
  components: [
    {
      type: 'axis',
      scale: 'value',
      layout: { dock: 'left' },
    },
    {
      type: 'axis',
      scale: 'category',
      layout: { dock: 'bottom' },
      settings: {
        labels: {
          mode: 'auto',
          maxGlyphCount: 14,
        },
      },
    },
    {
      type: 'box',
      data: {
        extract: {
          field: 'Product',
          props: {
            start: 0,
            end: { field: 'Sales' },
          },
        },
      },
      settings: {
        major: { scale: 'category' },
        minor: { scale: 'value' },
        box: {
          fill: '#3f7d8c',
          stroke: '#2f5f6a',
          strokeWidth: 1,
        },
      },
    },
  ],
};

picasso.chart({
  element: document.querySelector('#container'),
  data: [
    {
      type: 'matrix',
      data: [],
    },
  ],
  settings,
});
