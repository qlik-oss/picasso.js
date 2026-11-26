import picasso from 'picasso.js';
import picassoQ from 'picasso-plugin-q';

picasso.use(picassoQ);

const chart = picasso.chart({
  element: document.querySelector('#container'),
  data: [
    {
      type: 'q',
      key: 'qHyperCube',
      data: layout.qHyperCube,
    },
  ],
  settings: {
    scales: {
      x: { data: { field: 'Month' } },
      y: { data: { field: '# products' }, invert: true, expand: 0.1 },
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
            field: 'Month',
            trackBy: (value) => value.qElemNumber,
            props: {
              y: { field: '# products' },
              color: { field: 'color', value: (value) => value.qText },
            },
          },
        },
        settings: {
          x: { scale: 'x' },
          y: { scale: 'y' },
          fill: {
            ref: 'color',
          },
        },
        brush: {
          trigger: [{ on: 'tap', contexts: ['selection'] }],
        },
      },
    ],
  },
});

const selection = picassoQ.selections(chart.brush('selection'));
