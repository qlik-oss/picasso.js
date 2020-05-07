const code = `
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
  components: [{
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
      extract: {
        field: 'Month',
        props: {
          start: 0,
          end: { field: 'Sales' }
        }
      }
    },
    settings: {
      major: { scale: 't' },
      minor: { scale: 'y' },
      box: {
        fill: { scale: 'c', ref: 'end' }
      }
    }
  }]
};
`;

const data = `
var arr = [
  ['Month', 'Sales']
];

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
for (var m = 0; m < months.length; m++) {
  arr.push([
    months[m],
    parseFloat((Math.random() * 10000).toFixed(0))
  ]);
}
return [{
  type: 'matrix',
  data: arr
}];
`;

const item = {
  id: 'bar-chart',
  title: 'Bar chart',
  code,
  data,
};

export default item;
