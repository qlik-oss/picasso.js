const settings = {
  scales: {
    t: { data: { extract: { field: 'Year' } } },
    y: { data: { field: 'Sales' }, invert: true, expand: 0.2 },
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
      key: 'sales-line',
      type: 'line',
      data: {
        extract: {
          field: 'Year',
          props: {
            v: { field: 'Sales' },
          },
        },
      },
      settings: {
        coordinates: {
          major: { scale: 't' },
          minor: { scale: 'y', ref: 'v' },
        },
        orientation: 'horizontal',
        layers: {
          line: {
            stroke: '#4f8db8',
            strokeWidth: 2,
          },
          area: {
            fill: '#9fc7df',
            opacity: 0.45,
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
