const settings = {
  scales: {
    task: {
      data: {
        extract: {
          field: 'Task',
        },
      },
    },
    time: {
      data: {
        field: 'End',
      },
      invert: false,
      expand: 0.05,
    },
  },
  components: [
    {
      type: 'axis',
      scale: 'task',
      layout: { dock: 'left' },
    },
    {
      type: 'axis',
      scale: 'time',
      layout: { dock: 'bottom' },
    },
    {
      type: 'box',
      data: {
        extract: {
          field: 'Task',
          props: {
            start: { field: 'Start' },
            end: { field: 'End' },
            owner: { field: 'Owner' },
          },
        },
      },
      settings: {
        major: {
          scale: 'task',
        },
        minor: {
          scale: 'time',
        },
        box: {
          fill: '#4f8db8',
          opacity: 0.85,
        },
      },
      brush: {
        trigger: [
          {
            on: 'tap',
            contexts: ['selection'],
          },
        ],
        consume: [
          {
            context: 'selection',
            style: {
              inactive: { opacity: 0.25 },
            },
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
