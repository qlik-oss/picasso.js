const code = `
return {
  interactions: [{
    type: 'hammer',
    gestures: [
      {
        type: 'Pan',
        events: {
          panstart: function onPanStart(e) {
            this.chart.component('lasso').emit('lassoStart', e);
          },
          pan: function onPan(e) {
            this.chart.component('lasso').emit('lassoMove', e);
          },
          panend: function onPanEnd(e) {
            this.chart.component('lasso').emit('lassoEnd', e);
          }
        }
      }
    ]
  }],
  scales: {
    color: {
      data: {
        extract: {
          field: 'qDimensionInfo/0',
          props: {
            label: v => v.qText
          }
        }
      },
      label: v => v.datum.label.value,
      type: 'color'
    }
  },
  components: [
    {
      key: 'pie',
      type: 'pie',
      data: {
        extract: {
          field: 'qDimensionInfo/0',
          props: {
            arc: { field: 'qMeasureInfo/0' },
            color: {}
          }
        }
      },
      brush: {
        trigger: [{
          on: 'tap',
          action: 'toggle',
          contexts: ['highlight']
        }],
        consume: [{
          context: 'highlight',
          style: {
            inactive: {
              opacity: 0.3
            }
          }
        }]
      },
      settings: {
        // startAngle: Math.PI, // If angle is specified, sets the overall start angle of the pie to the specified function or number // Optional
        // endAngle: 0.5 * Math.PI, // If angle is specified, sets the overall end angle of the pie to the specified function or number // Optional
        // padAngle: 0, // The pad angle here means the angular separation between each adjacent arc // Optional
        slice: {  // Optional
          cornerRadius: 3,
          innerRadius: 0.33,
          outerRadius: 1,
          strokeWidth: 0,
          stroke: '#fff',
          fill: { scale: 'color', ref: 'color' }
        }
      }
    },
    {
      type: 'container',
      layout: {
        dock: 'right',
      },
      preferredSize: ({ inner, outer, dock, children }) => {
        const sizes = children.map(c =>
          c.instance.dockConfig().computePreferredSize({ inner, outer, dock }));
        return Math.max(...sizes);
      },
      strategy: (rect, components) => {
        const height = rect.height / components.length;
        components.forEach((c, i) => {
          c.instance.resize({ ...rect, height, y: i * height })
        });
        return { visible: components, hidden: [], order: components };
      },
      components: [
        {
          type: 'legend-cat',
          scale: 'color',
          layout: {
            dock: 'right',
          },
          brush: {
            trigger: [{
              on: 'tap',
              contexts: ['highlight']
            }],
            consume: [{
              context: 'highlight',
              style: {
                inactive: {
                  opacity: 0.3
                }
              }
            }]
          },
          settings: {
            item: {
              shape: {
                type: 'circle',
                size: 14
              }
            },
            title: {
              text: 'Teams'
            }
          }
        },
        {
          type: 'legend-cat',
          scale: 'color',
          layout: {
            dock: 'right',
          },
          brush: {
            trigger: [{
              on: 'tap',
              contexts: ['highlight']
            }],
            consume: [{
              context: 'highlight',
              style: {
                inactive: {
                  opacity: 0.3
                }
              }
            }]
          },
          settings: {
            item: {
              shape: {
                type: 'circle',
                size: 14
              }
            },
            title: {
              text: 'Teams'
            }
          }
        },
      ],
    },
    {
      key: 'lasso',
      type: 'brush-lasso',
      displayOrder: 1000,
      settings: {
        brush: {
          components: [
            {
              key: 'pie',
              contexts: ['highlight'],
              action: 'add'
            }
          ]
        },
        lasso: {
          // strokeWidth: 2,
          // strokeDasharray: '20, 10',
          fill: 'rgba(0, 0, 0, 0.28)'
        },
        snapIndicator: {
          stroke: 'red'
        },
        startPoint: {
          r: 4
        }
      }
    }
  ]
};
`;

const data = `
const teamData = customGenerator.generateTeamNameData({
  dimensions: 1,
  measures: 1,
  rows: 15,
  dataRange: [5, 95],
  sorted: false,
  sortAlphabetically: false
});

const qLayout = generator.generateDataFromArray(teamData);

const data = {
  type: 'q',
  key: 'qHyperCube',
  data: qLayout.qHyperCube
};

return data;
`;

const item = {
  id: 'multi-legend',
  title: 'Multi legend',
  code,
  data,
};

export default item;
