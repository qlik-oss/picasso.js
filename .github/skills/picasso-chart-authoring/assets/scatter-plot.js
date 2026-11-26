const settings = {
  scales: {
    x: { data: { field: 'Margin' }, expand: 0.1 },
    y: { data: { field: 'Sales' }, invert: true, expand: 0.1 },
    size: { data: { field: '# Customers' } },
    color: { data: { extract: { field: 'Product group' } }, type: 'categorical-color' },
  },
  components: [
    {
      type: 'axis',
      scale: 'y',
      layout: { dock: 'left' },
    },
    {
      type: 'axis',
      scale: 'x',
      layout: { dock: 'bottom' },
    },
    {
      type: 'point',
      data: {
        extract: {
          field: 'Product sub group',
          props: {
            x: { field: 'Margin' },
            y: { field: 'Sales' },
            size: { field: '# Customers' },
            category: { field: 'Product group' },
          },
        },
      },
      settings: {
        x: { scale: 'x' },
        y: { scale: 'y' },
        size: { scale: 'size' },
        fill: { scale: 'color', ref: 'category' },
        opacity: 0.85,
        stroke: '#fff',
        strokeWidth: 1,
      },
      brush: {
        trigger: [{ on: 'tap', contexts: ['selection'] }],
        consume: [
          {
            context: 'selection',
            style: { inactive: { opacity: 0.25 } },
          },
        ],
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
