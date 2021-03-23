const code = `
const layoutFn = (rect, components) => {
  // just a simpel grid layout engine
  let rows = Math.ceil(Math.sqrt(components.length));
  let cols = rows;
  let dx = rect.width / cols;
  let dy = rect.height / cols;
  // special case
  if (components.length <= 2) {
    rows = 1;
    cols = components.length;
    dy = rect.height;
  }
  let handled = 0;
  let subRect = {
    x: rect.x,
    y: rect.y,
    width: dx,
    height: dy,
  };
  // implement colspan
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      if (handled >= components.length) {
        break;
      }
      components[handled++].instance.resize(subRect, rect);
      subRect.x += dx;
    }
    subRect.x = 0;
    subRect.y += dy;
  }
  return { visible: components, hidden: [], order: components };
};

return {
  scales: {
    y: {
      data: { field: 'Sales' },
      invert: true,
      include: [0]
    },
    c: {
      data: { field: 'Sales' },
      type: 'color'
    },
    t: { data: { extract: { field: 'Month' } }, padding: 0.3 },
  },
  collections: [
    {
      key: 'mydata',
      data: {
        extract: {
          field: 'Month',
          props: {
            group: { field: 'Year' },
            start: 0,
            end: { field: 'Sales' } 
          }
        }
      }
    }
  ],
  strategy: layoutFn,
  components: [
    {
      type: 'container',
      components: [
        {
          type: 'text',
          text: '2014',
          layout: {
            dock: 'top'
          }
        },
        {
          type: 'axis',
          layout: {
            dock: 'left'
          },
          scale: 'y'
        },{
          type: 'axis',
          layout: {
            dock: 'bottom'
          },
          scale: 't'
        },{
          key: 'bars', 
          type: 'box',
          data: {
            collection: 'mydata',
            filter: d => d.group.label === '2014'
          },
          settings: {
            major: { scale: 't' },
            minor: { scale: 'y' },
            box: {
              fill: { scale: 'c', ref: 'end' }
            }
          }
        }
      ]
    },
    {
      type: 'container',
      components: [
        {
          type: 'text',
          text: '2015',
          layout: {
            dock: 'top'
          }
        },
        {
          type: 'axis',
          layout: {
            dock: 'left'
          },
          scale: 'y'
        },{
          type: 'axis',
          layout: {
            dock: 'bottom'
          },
          scale: 't'
        },{
          key: 'bars', 
          type: 'box',
          data: {
            collection: 'mydata',
            filter: d => d.group.label === '2015'
          },
          settings: {
            major: { scale: 't' },
            minor: { scale: 'y' },
            box: {
              fill: { scale: 'c', ref: 'end' }
            }
          }
        }
      ]
    },
    {
      type: 'container',
      components: [
        {
          type: 'text',
          text: '2016',
          layout: {
            dock: 'top'
          }
        },
        {
          type: 'axis',
          layout: {
            dock: 'left'
          },
          scale: 'y'
        },{
          type: 'axis',
          layout: {
            dock: 'bottom'
          },
          scale: 't'
        },{
          key: 'bars', 
          type: 'box',
          data: {
            collection: 'mydata',
            filter: d => d.group.label === '2016'
          },
          settings: {
            major: { scale: 't' },
            minor: { scale: 'y' },
            box: {
              fill: { scale: 'c', ref: 'end' }
            }
          }
        }
      ]
    },
    {
      type: 'container',
      components: [
        {
          type: 'text',
          text: '2017',
          layout: {
            dock: 'top'
          }
        },
        {
          type: 'axis',
          layout: {
            dock: 'left'
          },
          scale: 'y'
        },{
          type: 'axis',
          layout: {
            dock: 'bottom'
          },
          scale: 't'
        },{
          key: 'bars', 
          type: 'box',
          data: {
            collection: 'mydata',
            filter: d => d.group.label === '2017'
          },
          settings: {
            major: { scale: 't' },
            minor: { scale: 'y' },
            box: {
              fill: { scale: 'c', ref: 'end' }
            }
          }
        }
      ]
    }
  ]
};
`;

const data = `
var arr = [
  ['Year', 'Month', 'Sales']
];
var years = ['2014', '2015', '2016', '2017'];
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
for (var y = 0; y < years.length; ++y) {
  for (var m = 0; m < months.length; m++) {
    arr.push([
      years[y],
      months[m],
      parseFloat((Math.random() * 10000).toFixed(0))
    ]);
  }
}
return [{
  type: 'matrix',
  data: arr
}];
`;

const item = {
  id: 'trellis',
  title: 'Trellis',
  code,
  data,
};

export default item;
