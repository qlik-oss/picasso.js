import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import boxMarker from '../box';

describe('box component', () => {
  let rendererOutput;
  let chart;
  let shapeFn;
  let componentFixture;
  let opts;

  beforeEach(() => {
    // const table = {
    //   findField: sinon.stub()
    // };
    const dataset = {
      field: sinon.stub(),
      extract: sinon.stub()
    };
    opts = {
      inner: {
        x: 10, y: 20, width: 100, height: 200
      }
    };

    componentFixture = componentFactoryFixture();

    shapeFn = (type, p) => { p.type = type; return p; };
    chart = componentFixture.mocks().chart;
    chart.dataset.returns(dataset);
    // chart.table.returns(table);
  });

  it('should not render boxes with default settings', () => {
    const config = {
      shapeFn,
      data: []
    };

    componentFixture.simulateCreate(boxMarker, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([]);
  });

  it('should render a single basic box with minor custom settings', () => {
    const config = {
      shapeFn,
      data: {
        extract: {}
      },
      settings: {
        major: { scale: 'x' },
        minor: { scale: 'y' },
        box: {
          width: 1,
          stroke: '#f00',
          strokeLinejoin: 'round'
        },
        whisker: {
          stroke: '#0f0'
        },
        median: {
          stroke: '#00f'
        },
        line: {
          stroke: '#ff0'
        }
      }
    };

    chart.dataset().extract.returns([{
      value: 0.5,
      min: { value: 0.2 },
      start: { value: 0.4 },
      med: { value: 0.5 },
      end: { value: 0.6 },
      max: { value: 0.8 }
    }]);

    const xScale = v => v;
    xScale.bandwidth = () => 0.5;
    const yScale = v => v;
    chart.scale.withArgs('x').returns(xScale);
    chart.scale.withArgs('y').returns(yScale);

    componentFixture.simulateCreate(boxMarker, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([
      {
        type: 'container',
        data: {
          value: 0.5,
          // self: { value: 0.5 },
          min: { value: 0.2 },
          start: { value: 0.4 },
          med: { value: 0.5 },
          end: { value: 0.6 },
          max: { value: 0.8 }
        },
        collider: {
          type: 'bounds'
        },
        children: [
          {
            data: {
              value: 0.5,
              // self: { value: 0.5 },
              min: { value: 0.2 },
              start: { value: 0.4 },
              med: { value: 0.5 },
              end: { value: 0.6 },
              max: { value: 0.8 }
            },
            fill: '#fff',
            height: 40,
            minHeightPx: 1,
            minWidthPx: 1,
            show: true,
            stroke: '#f00',
            strokeLinejoin: 'round',
            strokeWidth: 1,
            type: 'rect',
            width: 50,
            x: 50,
            y: 80,
            collider: {
              type: null
            }
          },
          {
            data: {
              value: 0.5,
              // self: { value: 0.5 },
              min: { value: 0.2 },
              start: { value: 0.4 },
              med: { value: 0.5 },
              end: { value: 0.6 },
              max: { value: 0.8 }
            },
            show: true,
            stroke: '#ff0',
            strokeWidth: 1,
            type: 'line',
            x1: 75,
            x2: 75,
            y1: 80,
            y2: 40,
            collider: {
              type: null
            }
          },
          {
            data: {
              value: 0.5,
              // self: { value: 0.5 },
              min: { value: 0.2 },
              start: { value: 0.4 },
              med: { value: 0.5 },
              end: { value: 0.6 },
              max: { value: 0.8 }
            },
            show: true,
            stroke: '#ff0',
            strokeWidth: 1,
            type: 'line',
            x1: 75,
            x2: 75,
            y1: 120,
            y2: 160,
            collider: {
              type: null
            }
          },
          {
            cx: 75,
            cy: 100,
            data: {
              value: 0.5,
              // self: { value: 0.5 },
              min: { value: 0.2 },
              start: { value: 0.4 },
              med: { value: 0.5 },
              end: { value: 0.6 },
              max: { value: 0.8 }
            },
            show: true,
            stroke: '#00f',
            strokeWidth: 1,
            type: 'line',
            width: 50,
            x1: 50,
            x2: 100,
            y1: 100,
            y2: 100,
            r: 25,
            collider: {
              type: null
            }
          },
          {
            cx: 75,
            cy: 40,
            data: {
              value: 0.5,
              // self: { value: 0.5 },
              min: { value: 0.2 },
              start: { value: 0.4 },
              med: { value: 0.5 },
              end: { value: 0.6 },
              max: { value: 0.8 }
            },
            fill: '',
            r: 25,
            show: true,
            stroke: '#0f0',
            strokeWidth: 1,
            type: 'line',
            width: 50,
            x1: 50,
            x2: 100,
            y1: 40,
            y2: 40,
            collider: {
              type: null
            }
          },
          {
            cx: 75,
            cy: 160,
            data: {
              value: 0.5,
              // self: { value: 0.5 },
              min: { value: 0.2 },
              start: { value: 0.4 },
              med: { value: 0.5 },
              end: { value: 0.6 },
              max: { value: 0.8 }
            },
            fill: '',
            r: 25,
            show: true,
            stroke: '#0f0',
            strokeWidth: 1,
            type: 'line',
            width: 50,
            x1: 50,
            x2: 100,
            y1: 160,
            y2: 160,
            collider: {
              type: null
            }
          }
        ]
      }
    ]);
  });

  it('should render a out of bounds marker', () => {
    const config = {
      shapeFn,
      data: {
        extract: {}
      },
      settings: {
        major: { scale: 'x' },
        minor: { scale: 'y' },
        oob: {
          fill: 'red'
        }
      }
    };

    chart.dataset().extract.returns([{
      value: -0.5,
      min: { value: -0.2 },
      start: { value: -0.4 },
      med: { value: -0.5 },
      end: { value: -0.6 },
      max: { value: -0.8 }
    }]);

    const xScale = v => v;
    xScale.bandwidth = () => 0.5;
    const yScale = v => v;
    chart.scale.withArgs('x').returns(xScale);
    chart.scale.withArgs('y').returns(yScale);

    componentFixture.simulateCreate(boxMarker, config);
    rendererOutput = componentFixture.simulateRender(opts)[0].children;

    expect(rendererOutput).to.containSubset([{
      type: 'path',
      fill: 'red'
    }]);
  });

  it('should accept only end variable and draw a simple bar chart', () => {
    const config = {
      shapeFn,
      data: { extract: {} },
      settings: {
        major: { scale: 'x', ref: 'self' },
        minor: { scale: 'y' },
        box: {
          stroke: '#f00'
        }
      }
    };

    chart.dataset().extract.returns([{
      self: { value: 0.5 },
      start: { value: 0 },
      end: { value: 0.6 }
    }]);

    const xScale = v => v;
    xScale.bandwidth = () => 0.5;
    const yScale = v => v;
    chart.scale.withArgs('x').returns(xScale);
    chart.scale.withArgs('y').returns(yScale);

    componentFixture.simulateCreate(boxMarker, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([
      {
        type: 'container',
        data: {
          self: { value: 0.5 },
          start: { value: 0 },
          end: { value: 0.6 }
        },
        collider: {
          type: 'bounds'
        },
        children: [
          {
            data: {
              self: { value: 0.5 },
              start: { value: 0 },
              end: { value: 0.6 }
            },
            fill: '#fff',
            height: 120,
            minHeightPx: 1,
            minWidthPx: 1,
            show: true,
            stroke: '#f00',
            strokeLinejoin: 'miter',
            strokeWidth: 1,
            type: 'rect',
            width: 50,
            x: 50,
            y: 0,
            collider: {
              type: null
            }
          }
        ]
      }
    ]);
  });

  it('should accept start and end variable to draw a gantt chart', () => {
    const config = {
      shapeFn,
      data: { extract: {} },
      settings: {
        major: { scale: 'x', ref: 'self' },
        minor: { scale: 'y' },
        box: {
          stroke: '#f00'
        }
      }
    };

    chart.dataset().extract.returns([{
      self: { value: 0.5 },
      start: { value: 0.2 },
      end: { value: 0.6 }
    }]);

    const xScale = v => v;
    xScale.bandwidth = () => 0.5;
    const yScale = v => v;
    chart.scale.withArgs('x').returns(xScale);
    chart.scale.withArgs('y').returns(yScale);

    componentFixture.simulateCreate(boxMarker, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([
      {
        type: 'container',
        data: {
          self: { value: 0.5 },
          start: { value: 0.2 },
          end: { value: 0.6 }
        },
        collider: {
          type: 'bounds'
        },
        children: [
          {
            data: {
              self: { value: 0.5 },
              start: { value: 0.2 },
              end: { value: 0.6 }
            },
            fill: '#fff',
            height: 80,
            minHeightPx: 1,
            minWidthPx: 1,
            show: true,
            stroke: '#f00',
            strokeLinejoin: 'miter',
            strokeWidth: 1,
            type: 'rect',
            width: 50,
            x: 50,
            y: 40,
            collider: {
              type: null
            }
          }
        ]
      }
    ]);
  });

  it('should accept start, end, min and max values, without whiskers', () => {
    const config = {
      shapeFn,
      data: { extract: {} },
      settings: {
        major: { scale: 'x', ref: 'self' },
        minor: { scale: 'y' },
        box: {
          stroke: '#f00'
        },
        whisker: {
          show: false
        }
      }
    };

    chart.dataset().extract.returns([{
      self: { value: 0.5 },
      start: { value: 0.4 },
      end: { value: 0.6 },
      min: { value: 0.2 },
      max: { value: 0.8 }
    }]);

    const xScale = v => v;
    xScale.bandwidth = () => 0.5;
    const yScale = v => v;
    chart.scale.withArgs('x').returns(xScale);
    chart.scale.withArgs('y').returns(yScale);

    componentFixture.simulateCreate(boxMarker, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([
      {
        type: 'container',
        data: {
          self: { value: 0.5 },
          start: { value: 0.4 },
          end: { value: 0.6 },
          min: { value: 0.2 },
          max: { value: 0.8 }
        },
        collider: {
          type: 'bounds'
        },
        children: [
          {
            data: {
              self: { value: 0.5 },
              start: { value: 0.4 },
              end: { value: 0.6 },
              min: { value: 0.2 },
              max: { value: 0.8 }
            },
            fill: '#fff',
            height: 40,
            minHeightPx: 1,
            minWidthPx: 1,
            show: true,
            stroke: '#f00',
            strokeLinejoin: 'miter',
            strokeWidth: 1,
            type: 'rect',
            width: 50,
            x: 50,
            y: 80,
            collider: {
              type: null
            }
          },
          {
            data: {
              self: { value: 0.5 },
              start: { value: 0.4 },
              end: { value: 0.6 },
              min: { value: 0.2 },
              max: { value: 0.8 }
            },
            show: true,
            stroke: '#000',
            strokeWidth: 1,
            type: 'line',
            x1: 75,
            x2: 75,
            y1: 80,
            y2: 40,
            collider: {
              type: null
            }
          },
          {
            data: {
              self: { value: 0.5 },
              start: { value: 0.4 },
              end: { value: 0.6 },
              min: { value: 0.2 },
              max: { value: 0.8 }
            },
            show: true,
            stroke: '#000',
            strokeWidth: 1,
            type: 'line',
            x1: 75,
            x2: 75,
            y1: 120,
            y2: 160,
            collider: {
              type: null
            }
          }
        ]
      }
    ]);
  });

  it('should not have the squeeze bug', () => {
    const config = {
      shapeFn,
      data: { extract: {} },
      settings: {
        major: { scale: 'x', ref: 'self' },
        minor: { scale: 'y' },
        box: {
          stroke: '#f00',
          maxWidthPx: 100
        },
        whisker: {
          show: false
        }
      }
    };

    const dataset = [
      {
        self: { value: 1 },
        start: { value: 0.4 },
        end: { value: 0.6 },
        min: { value: 0.2 },
        max: { value: 0.8 }
      },
      {
        self: { value: 2 },
        start: { value: 0.4 },
        end: { value: 0.6 },
        min: { value: 0.2 },
        max: { value: 0.8 }
      },
      {
        self: { value: 3 },
        start: { value: 0.4 },
        end: { value: 0.6 },
        min: { value: 0.2 },
        max: { value: 0.8 }
      },
      {
        self: { value: 4 },
        start: { value: 0.4 },
        end: { value: 0.6 },
        min: { value: 0.2 },
        max: { value: 0.8 }
      },
      {
        self: { value: 5 },
        start: { value: 0.4 },
        end: { value: 0.6 },
        min: { value: 0.2 },
        max: { value: 0.8 }
      }
    ];

    opts = {
      inner: {
        x: 0, y: 0, width: 200, height: 20
      }
    };

    chart.dataset().extract.returns(dataset);

    const xDomain = [1, 2, 3, 4, 5];
    const xScale = v => xDomain.indexOf(v) * 0.2;
    xScale.domain = () => xDomain;
    xScale.bandwidth = () => 0.2;

    const yScale = v => (v - 0.2) / 0.6;
    chart.scale.withArgs('x').returns(xScale);
    chart.scale.withArgs('y').returns(yScale);

    componentFixture.simulateCreate(boxMarker, config);
    rendererOutput = componentFixture.simulateRender(opts);

    const items = [
      {
        type: 'rect',
        x: 0,
        y: 6.666666666666668,
        height: 6.666666666666664,
        width: 40,
        show: true,
        fill: '#fff',
        stroke: '#f00',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        maxWidthPx: 100,
        minHeightPx: 1,
        minWidthPx: 1,
        data: {
          self: { value: 1 },
          start: { value: 0.4 },
          end: { value: 0.6 },
          min: { value: 0.2 },
          max: { value: 0.8 }
        },
        collider: {
          type: null
        }
      },
      {
        type: 'rect',
        x: 40.00000000000001,
        y: 6.666666666666668,
        height: 6.666666666666664,
        width: 40,
        show: true,
        fill: '#fff',
        stroke: '#f00',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        maxWidthPx: 100,
        minHeightPx: 1,
        minWidthPx: 1,
        data: {
          self: { value: 2 },
          start: { value: 0.4 },
          end: { value: 0.6 },
          min: { value: 0.2 },
          max: { value: 0.8 }
        },
        collider: {
          type: null
        }
      },
      {
        type: 'rect',
        x: 80,
        y: 6.666666666666668,
        height: 6.666666666666664,
        width: 40,
        show: true,
        fill: '#fff',
        stroke: '#f00',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        maxWidthPx: 100,
        minHeightPx: 1,
        minWidthPx: 1,
        data: {
          self: { value: 3 },
          start: { value: 0.4 },
          end: { value: 0.6 },
          min: { value: 0.2 },
          max: { value: 0.8 }
        },
        collider: {
          type: null
        }
      },
      {
        type: 'rect',
        x: 120.00000000000001,
        y: 6.666666666666668,
        height: 6.666666666666664,
        width: 40,
        show: true,
        fill: '#fff',
        stroke: '#f00',
        strokeWidth: 1,
        strokeLinejoin: 'miter',
        maxWidthPx: 100,
        minHeightPx: 1,
        minWidthPx: 1,
        data: {
          self: { value: 4 },
          start: { value: 0.4 },
          end: { value: 0.6 },
          min: { value: 0.2 },
          max: { value: 0.8 }
        },
        collider: {
          type: null
        }
      },
      {
        type: 'rect',
        x: 160,
        y: 6.666666666666668,
        height: 6.666666666666664,
        width: 40,
        show: true,
        fill: '#fff',
        stroke: '#f00',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        maxWidthPx: 100,
        minHeightPx: 1,
        minWidthPx: 1,
        data: {
          self: { value: 5 },
          start: { value: 0.4 },
          end: { value: 0.6 },
          min: { value: 0.2 },
          max: { value: 0.8 }
        },
        collider: {
          type: null
        }
      }
    ];

    const children = rendererOutput.map(c => c.children);
    const rects = [].concat(...children).filter(o => o.type === 'rect');
    expect(rects).to.deep.equal(items);
  });
});
