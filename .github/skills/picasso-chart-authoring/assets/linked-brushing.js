const baseData = [
  {
    type: 'matrix',
    data: [],
  },
];

const scatter = picasso.chart({
  element: document.querySelector('#scatter'),
  data: baseData,
  settings: {
    scales: {
      x: { data: { field: 'Margin' }, expand: 0.1 },
      y: { data: { field: 'Sales' }, invert: true, expand: 0.1 },
    },
    components: [
      { type: 'axis', scale: 'y', layout: { dock: 'left' } },
      { type: 'axis', scale: 'x', layout: { dock: 'bottom' } },
      {
        type: 'point',
        data: {
          extract: {
            field: 'Product',
            props: {
              x: { field: 'Margin' },
              y: { field: 'Sales' },
            },
          },
        },
        settings: {
          x: { scale: 'x' },
          y: { scale: 'y' },
          fill: '#4f8db8',
        },
        brush: {
          trigger: [{ on: 'tap', contexts: ['select'] }],
          consume: [{ context: 'highlight', style: { inactive: { opacity: 0.2 } } }],
        },
      },
    ],
  },
});

const bars = picasso.chart({
  element: document.querySelector('#bars'),
  data: baseData,
  settings: {
    scales: {
      category: { data: { extract: { field: 'Product' } } },
      value: { data: { field: 'Sales' }, invert: true, expand: 0.05 },
    },
    components: [
      { type: 'axis', scale: 'value', layout: { dock: 'left' } },
      { type: 'axis', scale: 'category', layout: { dock: 'bottom' } },
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
          box: { fill: '#63a35c' },
        },
        brush: {
          consume: [
            {
              context: 'highlight',
              style: { inactive: { opacity: 0.2 } },
            },
          ],
        },
      },
    ],
  },
});

scatter.brush('select').link(bars.brush('highlight'));
