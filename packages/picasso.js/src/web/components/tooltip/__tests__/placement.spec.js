import placement, { calcOffset } from '../placement';

class Rect {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 100;
    this.height = 100;
    this.margin = { left: 0, top: 0 };
    this.scaleRatio = { x: 1, y: 1 };
  }

  get computed() {
    return {
      x: this.margin.left + (this.x * this.scaleRatio.x),
      y: this.margin.top + (this.y * this.scaleRatio.y),
      width: this.width * this.scaleRatio.x,
      height: this.height * this.scaleRatio.y
    };
  }
}

describe('placement', () => {
  let context;
  let size;
  let componentMock;

  beforeEach(() => {
    componentMock = {
      key: 'aKey',
      rect: new Rect()
    };

    size = {
      width: 100,
      height: 100
    };
    context = {
      chart: {
        scale: 0,
        formatter: 1,
        component: sinon.stub().returns(componentMock)
      },
      props: {},
      state: {
        activeNodes: [{ key: 'aKey' }],
        pointer: {
          x: 10,
          y: 20,
          dx: 3,
          dy: 4,
          clientX: 6,
          clientY: 7,
          targetBounds: { left: 8, top: 9 }
        },
        targetElement: {
          getBoundingClientRect: () => ({
            x: 0,
            y: 0,
            width: 100,
            height: 100
          })
        }
      }
    };

    global.window = {
      innerWidth: 500,
      innerHeight: 500
    };
  });

  afterEach(() => {
    delete global.window;
  });

  it('should return best possible placement strategy on unsupported placement property', () => {
    const r = placement(size, context);

    expect(r).to.deep.equal({
      computedArrowStyle: {
        borderWidth: '8px',
        left: '-16px',
        top: 'calc(50% - 8px)'
      },
      computedTooltipStyle: {
        left: '10px',
        top: '20px',
        transform: 'translate(8px, -50%)'
      },
      offset: {
        x: 0,
        y: 21
      },
      rect: size,
      dock: 'right'
    });
  });

  it('should return placement strategy based on string definition', () => {
    context.props.placement = 'pointer';
    context.state.pointer.x = 103;
    context.state.pointer.y = 102;
    const r = placement(size, context);

    expect(r).to.deep.equal({
      computedArrowStyle: {
        borderWidth: '8px',
        left: 'calc(50% - 8px)',
        top: '100%'
      },
      computedTooltipStyle: {
        left: '103px',
        top: '102px',
        transform: 'translate(-50%, -100%) translateY(-8px)'
      },
      rect: size,
      dock: 'top'
    });
  });

  it('should return placement strategy based on object definition', () => {
    context.props.placement = {
      type: 'pointer',
      dock: 'top',
      offset: 5
    };
    const r = placement(size, context);

    expect(r).to.deep.equal({
      computedArrowStyle: {
        borderWidth: '5px',
        left: 'calc(50% - 5px)',
        top: '100%'
      },
      computedTooltipStyle: {
        left: '10px',
        top: '20px',
        transform: 'translate(-50%, -100%) translateY(-5px)'
      },
      dock: 'top'
    });
  });

  it('should resolve placement strategy as a function', () => {
    context.props.placement = () => ({
      type: 'pointer',
      dock: 'top',
      offset: 5
    });
    const r = placement(size, context);

    expect(r).to.deep.equal({
      computedArrowStyle: {
        borderWidth: '5px',
        left: 'calc(50% - 5px)',
        top: '100%'
      },
      computedTooltipStyle: {
        left: '10px',
        top: '20px',
        transform: 'translate(-50%, -100%) translateY(-5px)'
      },
      dock: 'top'
    });
  });

  it('should return custom placement strategy', () => {
    context.props.placement = { fn: () => ({ testing: 'test' }) };
    const r = placement(size, context);

    expect(r).to.deep.equal({ testing: 'test' });
  });

  describe('strategies', () => {
    describe('pointer', () => {
      it('dock - auto, right', () => {
        size.width = 10;
        size.height = 10;
        context.state.pointer.x = 1;
        context.state.pointer.y = 2;
        context.state.pointer.clientX = 10;
        context.state.pointer.clientY = 10;
        context.props.placement = {
          type: 'pointer',
          dock: 'auto',
          offset: 5
        };
        const r = placement(size, context);

        expect(r).to.deep.equal({
          computedArrowStyle: {
            borderWidth: '5px',
            left: '-10px',
            top: 'calc(50% - 5px)'
          },
          computedTooltipStyle: {
            left: '3px', // Min x is pointer.dx
            top: '4px', // Min y is pointer.dy
            transform: 'translate(5px, -50%)'
          },
          dock: 'right',
          rect: size
        });
      });

      it('dock - fallback dock', () => {
        // Unable to fit in this viewport, should choose best possible option and clamp left/top position
        context.state.pointer.x = 1;
        context.state.pointer.y = 2;
        global.window.innerWidth = 10;
        global.window.innerHeight = 10;
        context.props.placement = {
          type: 'pointer',
          dock: 'auto',
          offset: 5
        };
        const r = placement(size, context);

        expect(r).to.deep.equal({
          computedArrowStyle: {
            borderWidth: '5px',
            left: 'calc(50% + 8px)',
            top: '100%'
          },
          computedTooltipStyle: {
            left: '3px',
            top: '4px',
            transform: 'translate(-50%, -100%) translateY(-5px)',
            width: '72px'
          },
          offset: {
            x: -8,
            y: 94
          },
          dock: 'top',
          rect: size
        });
      });
    });

    describe('bounds', () => {
      it('dock - top', () => {
        context.state.activeNodes = [{
          bounds: {
            x: 10, y: 20, width: 11, height: 22
          },
          key: 'aKey'
        }];

        context.props.placement = {
          type: 'bounds',
          dock: 'top',
          offset: 5
        };
        const r = placement(size, context);

        expect(r).to.deep.equal({
          computedArrowStyle: {
            borderWidth: '5px',
            left: 'calc(50% - 5px)',
            top: '100%'
          },
          computedTooltipStyle: {
            left: '18.5px',
            top: '24px',
            transform: 'translate(-50%, -100%) translateY(-5px)'
          },
          dock: 'top'
        });
      });

      it('dock - auto, top', () => {
        context.state.activeNodes = [{
          bounds: {
            x: 10, y: 20, width: 11, height: 22
          },
          key: 'aKey'
        }];

        context.props.placement = {
          type: 'bounds',
          dock: 'auto',
          offset: 5
        };
        const r = placement(size, context);

        expect(r).to.deep.equal({
          computedArrowStyle: {
            borderWidth: '5px',
            left: 'calc(50% - 5px)',
            top: '100%'
          },
          computedTooltipStyle: {
            left: '18.5px',
            top: '24px',
            transform: 'translate(-50%, -100%) translateY(-5px)'
          },
          dock: 'top'
        });
      });

      it('dock - fallback dock', () => {
        // Unable to fit in this viewport, should fallback to top dock
        global.window.innerWidth = 10;
        global.window.innerHeight = 10;
        context.state.activeNodes = [{
          bounds: {
            x: 10, y: 20, width: 11, height: 22
          },
          key: 'aKey'
        }];

        context.props.placement = {
          type: 'bounds'
        };
        const r = placement(size, context);

        expect(r).to.deep.equal({
          computedArrowStyle: {
            borderWidth: '8px',
            left: 'calc(50% - 8px)',
            top: '100%'
          },
          computedTooltipStyle: {
            left: '18.5px',
            top: '24px',
            transform: 'translate(-50%, -100%) translateY(-8px)'
          },
          dock: 'top'
        });
      });

      it('should use scaleRatio in placement', () => {
        componentMock.rect.x = 20;
        componentMock.rect.y = 30;
        componentMock.rect.scaleRatio.x = 2;
        componentMock.rect.scaleRatio.y = 0.5;
        context.state.activeNodes = [{
          bounds: {
            x: 10, y: 20, width: 15, height: 25
          },
          key: 'aKey'
        }];

        context.props.placement = {
          type: 'bounds',
          dock: 'top'
        };
        const r = placement(size, context);

        expect(r).to.deep.equal({
          computedArrowStyle: {
            borderWidth: '8px',
            left: 'calc(50% - 8px)',
            top: '100%'
          },
          computedTooltipStyle: {
            left: '60.5px',
            top: '39px',
            transform: 'translate(-50%, -100%) translateY(-8px)'
          },
          dock: 'top'
        });
      });

      it('should clamp position to node component bounds', () => {
        context.state.pointer.dx = 1;
        context.state.pointer.dy = 2;
        componentMock.rect.x = 10;
        componentMock.rect.y = 20;
        componentMock.rect.width = 50;
        componentMock.rect.height = 80;
        context.state.activeNodes = [{ // This node is OOB in both x and y, not a real scenario but allows us to cover two cases at once
          bounds: {
            x: -10, y: -20, width: 11, height: 22
          },
          key: 'aKey'
        }];

        context.props.placement = {
          type: 'bounds',
          dock: 'top',
          offset: 5
        };
        const r = placement(size, context);

        expect(r).to.deep.equal({
          computedArrowStyle: {
            borderWidth: '5px',
            left: 'calc(50% - 5px)',
            top: '100%'
          },
          computedTooltipStyle: {
            left: '11px', // Component bounds + pointer delta
            top: '22px',
            transform: 'translate(-50%, -100%) translateY(-5px)'
          },
          dock: 'top'
        });
      });
    });

    describe('slice', () => {
      it('dock - auto, bottom', () => {
        size.width = 10;
        size.height = 10;
        context.state.pointer.dx = 0;
        context.state.pointer.dy = 0;
        context.chart.component = sinon.stub().returns(componentMock);
        context.state.activeNodes = [{
          desc: {
            slice: {
              start: (Math.PI * 5) / 6, // slice, at 180 angle
              end: (Math.PI * 7) / 6,
              outerRadius: 20
            }
          },
          key: 'aKey'
        }];
        context.props.placement = {
          type: 'slice',
          dock: 'auto',
          offset: 5
        };
        const r = placement(size, context);

        expect(r).to.deep.equal({
          computedArrowStyle: {
            borderWidth: '5px',
            left: 'calc(50% - 5px)',
            top: '-10px'
          },
          computedTooltipStyle: {
            left: '50px',
            top: '70px',
            transform: 'translate(-50%, 5px)'
          },
          dock: 'bottom',
          rect: size
        });
      });

      it('dock - explicit, bottom', () => {
        size.width = 10;
        size.height = 10;
        context.state.pointer.dx = 0;
        context.state.pointer.dy = 0;
        context.chart.component = sinon.stub().returns(componentMock);
        context.state.activeNodes = [{
          desc: {
            slice: {
              start: (Math.PI * 5) / 6, // slice, at 180 angle
              end: (Math.PI * 7) / 6,
              outerRadius: 20
            }
          },
          key: 'aKey'
        }];
        context.props.placement = {
          type: 'slice',
          dock: 'bottom',
          offset: 5
        };
        const r = placement(size, context);

        expect(r).to.deep.equal({
          computedArrowStyle: {
            borderWidth: '5px',
            left: 'calc(50% - 5px)',
            top: '-10px'
          },
          computedTooltipStyle: {
            left: '50px',
            top: '70px',
            transform: 'translate(-50%, 5px)'
          },
          dock: 'bottom'
        });
      });

      it('should use scaleRatio in placement', () => {
        componentMock.rect.scaleRatio.x = 0.4;
        componentMock.rect.scaleRatio.y = 0.5;
        size.width = 10;
        size.height = 10;
        context.state.pointer.dx = 0;
        context.state.pointer.dy = 0;
        context.chart.component = sinon.stub().returns(componentMock);
        context.state.activeNodes = [{
          desc: {
            slice: {
              start: (Math.PI * 5) / 6, // slice, at 180 angle
              end: (Math.PI * 7) / 6,
              outerRadius: 20
            }
          },
          key: 'aKey'
        }];
        context.props.placement = {
          type: 'slice',
          dock: 'auto',
          offset: 5
        };
        const r = placement(size, context);

        expect(r).to.deep.equal({
          computedArrowStyle: {
            borderWidth: '5px',
            left: 'calc(50% - 5px)',
            top: '-10px'
          },
          computedTooltipStyle: {
            left: '20px',
            top: '35px',
            transform: 'translate(-50%, 5px)'
          },
          dock: 'bottom',
          rect: size
        });
      });

      it('should use margin in placement', () => {
        componentMock.rect.margin.left = 10;
        componentMock.rect.margin.top = 5;
        size.width = 10;
        size.height = 10;
        context.state.pointer.dx = 0;
        context.state.pointer.dy = 0;
        context.chart.component = sinon.stub().returns(componentMock);
        context.state.activeNodes = [{
          desc: {
            slice: {
              start: (Math.PI * 5) / 6, // slice, at 180 angle
              end: (Math.PI * 7) / 6,
              outerRadius: 20
            }
          },
          key: 'aKey'
        }];
        context.props.placement = {
          type: 'slice',
          dock: 'auto',
          offset: 5
        };
        const r = placement(size, context);

        expect(r).to.deep.equal({
          computedArrowStyle: {
            borderWidth: '5px',
            left: 'calc(50% - 5px)',
            top: '-10px'
          },
          computedTooltipStyle: {
            left: '60px',
            top: '75px',
            transform: 'translate(-50%, 5px)'
          },
          dock: 'bottom',
          rect: size
        });
      });
    });
  });
});


describe('calcOffset', () => {
  it('should calculate the right offset', () => {
    const area = {
      width: 800,
      height: 600
    };

    const vx = 300;
    const vy = 200;

    const offset = {
      x: 25,
      y: 50
    };

    const width = 600;
    const height = 500;

    const result = calcOffset({
      area, vx, vy, width, height, offset
    });

    const expectedResult = {
      x: -125,
      y: -150
    };

    expect(result).to.be.eql(expectedResult);
  });
});
