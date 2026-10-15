const settings = {
  scales: {
    color: {
      data: {
        extract: {
          field: 'Category',
        },
      },
      type: 'categorical-color',
    },
  },
  components: [
    {
      type: 'pie',
      data: {
        extract: {
          field: 'Category',
          props: {
            num: { field: 'Sales', reduce: 'sum' },
            category: { field: 'Category' },
          },
        },
      },
      settings: {
        padAngle: 0.01,
        outerRadius: 0.88,
        innerRadius: 0.35,
        slice: {
          arc: {
            ref: 'num',
          },
          fill: {
            scale: 'color',
            ref: 'category',
          },
          stroke: '#ffffff',
          strokeWidth: 1,
        },
      },
      brush: {
        trigger: [
          {
            on: 'tap',
            action: 'toggle',
            contexts: ['selection'],
          },
        ],
        consume: [
          {
            context: 'selection',
            style: {
              inactive: { opacity: 0.35 },
            },
          },
        ],
      },
    },
    {
      type: 'legend-cat',
      scale: 'color',
      layout: {
        dock: 'right',
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
