(function () {
  picasso.use(picassoQ); // register q plugin

  var settings = {
    scales: {
      x: { data: { field: 'qMeasureInfo/0' }, expand: 0.1 },
      y: { data: { field: 'qMeasureInfo/1' }, expand: 0.1, invert: true },
    },
    components: [
      {
        type: 'axis',
        scale: 'y',
        layout: {
          dock: 'left',
        },
      },
      {
        type: 'axis',
        scale: 'x',
        layout: {
          dock: 'bottom',
        },
      },
      {
        type: 'point',
        data: {
          extract: {
            field: 'qDimensionInfo/0',
            props: {
              x: { field: 'qMeasureInfo/0' },
              y: { field: 'qMeasureInfo/1' },
              size: { field: 'qMeasureInfo/2' },
            },
          },
        },
        settings: {
          x: { scale: 'x' }, // use values from first measure
          y: { scale: 'y' }, // use values from second measure
          size: {
            scale: {
              data: { field: 'qMeasureInfo/2' },
            },
          },
          fill: {
            ref: 'size',
            scale: {
              data: { field: 'qMeasureInfo/2' },
              type: 'color',
            },
          },
        },
      },
    ],
  };

  picasso.chart({
    element: document.querySelector('#container'),
    data: picData.qProducts,
    settings: settings,
  });
})();
