const settings = {
  scales: {
    t: {
      data: {
        extract: {
          field: 'Month',
        },
      },
    },
    y: {
      data: { field: 'Sales' },
      invert: true,
      expand: 0.1,
    },
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
      type: 'axis',
      scale: 'y',
      layout: { dock: 'left' },
    },
    {
      type: 'axis',
      scale: 't',
      layout: { dock: 'bottom' },
    },
    {
      type: 'line',
      data: {
        extract: {
          field: 'Category',
          props: {
            x: { field: 'Month' },
            y: { field: 'Sales' },
            category: { field: 'Category' },
          },
        },
        stack: {
          stackKey: (d) => d.x.value,
          value: (d) => d.y.value,
        },
      },
      settings: {
        coordinates: {
          major: { scale: 't', ref: 'x' },
          minor: { scale: 'y', ref: 'y' },
        },
        layers: {
          area: {
            fill: {
              scale: 'color',
              ref: 'category',
            },
            opacity: 0.65,
          },
          line: {
            strokeWidth: 1,
            stroke: '#ffffff',
          },
          curve: 'monotone',
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
