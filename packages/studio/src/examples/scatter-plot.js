const code = `
return {
  scales: {
    s: {
      data: {
        field: 'Sales'
      },
      expand: 0.2,
      invert: true
    },
    m: {
      data: {
        field: 'Margin'
      },
      expand: 0.1
    },
    col: {
      data: { extract: { field: 'Year' } },
      type: 'color'
    }
  },
  components: [{
    key: 'y-axis',
    type: 'axis',
    scale: 's',
    dock: 'left'
  }, {
    type: 'legend-cat',
    dock: 'right',
    scale: 'col'
  }, {
    key: 'x-axis',
    type: 'axis',
    scale: 'm',
    dock: 'bottom'
  }, {
    key: 'p',
    type: 'point',
    data: {
      extract: {
        field: 'Month',
        props: {
          y: { field: 'Sales' },
          x: { field: 'Margin' },
          group: { field: 'Year' }
        }
      }
    },
    settings: {
      x: { scale: 'm' },
      y: { scale: 's' },
      shape: 'circle',
      size: () => Math.random(),
      strokeWidth: 2,
      stroke: '#fff',
      opacity: 0.8,
      fill: { scale: 'col', ref: 'group' }
    }
  }]
};
`;

const data = `
const arr = [
  ['Year', 'Month', 'Sales', 'Margin']
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
for (let i = 0; i < 10; i++) {
  for (let m = 0; m < months.length; m++) {
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
  id: 'scatter-plot',
  title: 'Scatter Plot',
  code,
  data,
};

export default item;
