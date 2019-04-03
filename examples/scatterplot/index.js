(function () {
  var settings = {
    scales: {
      x: { data: { field: 'Sales' }, expand: 0.1 },
      y: { data: { field: 'Margin' }, expand: 0.1 }
    },
    components: [{
      type: 'axis',
      scale: 'y',
      layout: {
        dock: 'left'
      }
    }, {
      type: 'axis',
      scale: 'x',
      layout: {
        dock: 'bottom'
      }
    }, {
      type: 'point',
      data: {
        extract: {
          field: 'Product sub group',
          props: {
            x: { field: 'Sales' },
            y: { field: 'Margin' },
            size: { field: '# Customers' }
          }
        }
      },
      settings: {
        x: { scale: 'x' }, // use values from first measure
        y: { scale: 'y' }, // use values from second measure
        size: {
          scale: {
            data: { field: '# Customers' }
          }
        },
        fill: {
          ref: 'size',
          scale: {
            data: { field: '# Customers' },
            type: 'color'
          }
        }
      }
    }]
  };

  picasso.chart({
    element: document.querySelector('#container'),
    data: picData.products,
    settings: settings
  });
}());
