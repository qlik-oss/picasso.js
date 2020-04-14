const code = `
return {
  scales: {
    x: {
      data: { extract: { field: 'qDimensionInfo/0', value: function value(v) {
            return v.qText;
          } } }
    },
    y: {
      invert: true,
      data: { fields: ['qMeasureInfo/0', 'qMeasureInfo/1', 'qMeasureInfo/2', 'qMeasureInfo/3', 'qMeasureInfo/4'] },
      ticks: {
        tight: false, // True if generated ticks should attempt to be at the bounds of the scale
        forceBounds: false // Force ticks to be rendered at the bounds of the scale, only applicable when count or values properties are not set
        // count: 10, // By default the number of ticks is auto generated, set this property to override that and explicly specify the number of ticks
        // values: [0, 1, 2], // Explicity set the ticks values
      },
      minorTicks: {
        // count: 3, // By default how many minor ticks to be generated
      }
    }
  },
  components: [
  // Default continoues axis, dock at left
  {
    type: 'axis',
    scale: 'y',
    layout: { dock: 'left' }
  },
  // Default discrete axis, dock at bottom
  {
    type: 'axis',
    scale: 'x',
    layout: { dock: 'bottom' }
  },
  // continoues axis settings example 1, default values are being shown
  {
    type: 'axis',
    scale: 'y',
    layout: {
        dock: 'left' // Where to attach on the dock layout, supports "left, right, bottom, top" and an empty string to attach on main area
    },
    settings: {
      align: 'left', // Optional, how to align the axis, by default align is the same as the dock property
      labels: {
        show: true, // Toggle labels
        fontFamily: 'Arial',
        fontSize: '12px',
        fill: '#595959',
        margin: 6, // margin value in pixels, apply to nearest neighbor, typically ticks
        mode: 'auto', // how labels should arrange themself
        tiltAngle: 40, // Angle in degrees
        maxSize: 250
      },
      line: {
        show: true, // Toggle line
        strokeWidth: 1,
        stroke: '#cccccc'
      },
      ticks: {
        show: true, // Toggle ticks
        margin: 0, // margin value in pixels, apply to nearest neighbor, typically the line
        tickSize: 8, // Size of the ticks in pixels
        stroke: '#cccccc',
        strokeWidth: 1
      },
      minorTicks: {
        show: false, // Toggle minor ticks
        margin: 0, // margin value in pixels, apply to nearest neighbor, typically the line
        tickSize: 3, // Size of the ticks in pixels
        stroke: '#999',
        strokeWidth: 1,
        count: 3 // Number of minor ticks between each tick
      }
    }
  },
  // Discrete axis settings example 1, default values are being shown
  {
    type: 'axis',
    scale: 'x',
    layout: {
        dock: 'bottom' // Where to attach on the dock layout, supports "left, right, bottom, top" and an empty string to attach on main area
    },
    settings: {
      align: 'bottom', // Optional, how to align the axis, by default align is the same as the dock property
      labels: {
        show: true, // Toggle labels
        fontFamily: 'Arial',
        fontSize: '12px',
        fill: '#595959',
        margin: 6, // margin value in pixels, apply to nearest neighbor, typically ticks or the line
        mode: 'auto', // how labels should arrange themself
        tiltAngle: 40, // Angle in degrees
        maxSize: 250
      },
      line: {
        show: false, // Toggle line
        strokeWidth: 1,
        stroke: '#cccccc'
      },
      ticks: {
        show: false, // Toggle ticks
        margin: 0, // margin value in pixels, apply to nearest neighbor, typically the line
        tickSize: 4, // Size of the ticks in pixels
        stroke: '#cccccc',
        strokeWidth: 1
      }
    }
  }]
};
`;

const data = `
const teamData = customGenerator.generateTeamNameData({
  dimensions: 1,
  measures: 5,
  rows: 15,
  dataRange: [0, 1000],
  sorted: true,
  sortAlphabetically: true
});

const randomStringsData = customGenerator.generateRandomStringData({
  dimensions: 1,
  measures: 5,
  rows: 15,
  dataRange: [0, 1000],
  sorted: true,
  sortAlphabetically: true,
  chars: 3,
  joinChar: '',
  upperCase: true
});

const qLayout = generator.generateDataFromArray(randomStringsData);

return [{
  type: 'q',
  key: 'qHyperCube',
  data: qLayout.qHyperCube
}];
`;

const item = {
  id: 'axis',
  title: 'Axis',
  code,
  data,
};

export default item;
