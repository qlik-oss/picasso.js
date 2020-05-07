const code = `
return {
  scales: {
    y: {
      data: {
        extract: { field: 'Year' }
      }
    },
    m: {
      data: {
        field: 'Margin'
      },
      expand: 0.1
    },
    s: {
      data: {
        field: 'Sales'
      }
    },
    col: {
      data: { extract: { field: 'Year' } },
      type: 'color'
    }
  },
  components: [{
    key: 'y-axis',
    type: 'axis',
    scale: 'y',
    layout: {
      dock: 'left'
    }
  }, {
    key: 'x-axis',
    type: 'axis',
    scale: 'm',
    layout: {
      dock: 'bottom'
    }
  }, {
    type: 'grid-line',
    y: 'y',
    x: 'm'
  },{
    key: 'p',
    type: 'point',
    data: {
      extract: {
        field: 'Month',
        props: {
          size: { field: 'Sales' },
          x: { field: 'Margin' },
          group: { field: 'Year' }
        }
      }
    },
    settings: {
      x: { scale: 'm' },
      y: { scale: 'y', ref: 'group' },
      shape: 'circle',
      size: { scale: 's' },
      strokeWidth: 2,
      stroke: '#fff',
      opacity: 0.8,
      fill: { scale: 'col', ref: 'group' }
    }
  }]
};
`;

const data = `
var arr = [
  ['Year', 'Month', 'Sales', 'Margin']
];

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
for (var i = 0; i < 10; i++) {
  for (var m = 0; m < months.length; m++) {
    arr.push([
      String(2010 + i),
      months[m],
      parseFloat((Math.random() * 10000).toFixed(0)),
      parseFloat((Math.random() * 100).toFixed(0))]);
  }
}
return [{
  type: 'matrix',
  data: arr
}];
`;

const item = {
  id: 'point-distribution',
  title: 'Point distribution',
  code,
  data,
};

export default item;
