
import componentFactory from '../../../../../src/core/component/component-factory';
import refLineComponent from '../../../../../src/core/chart-components/ref-line/refline';

describe('reference lines', () => {
  let rendererOutput;
  let chart;
  let renderer = {
    appendTo: () => {},
    render: p => (rendererOutput = p),
    size: () => {},
    measureText: ({ text, fontSize }) => ({ width: text.length * parseInt(fontSize.replace('px', ''), 10) * 0.6, height: parseInt(fontSize.replace('px', ''), 10) * 1.2 })
  };
  let shapeFn;

  beforeEach(() => {
    const table = {
      findField: sinon.stub()
    };
    const dataset = {
      map: sinon.stub()
    };
    shapeFn = (type, p) => { p.type = type; return p; };
    chart = {
      brush: () => ({
        on: () => {}
      }),
      container: () => ({}),
      table: () => table,
      dataset: () => dataset,
      scale: sinon.stub()
    };
  });

  function createAndRenderComponent(opts) {
    const {
      config,
      inner
    } = opts;
    const instance = componentFactory(refLineComponent, {
      settings: config,
      chart,
      renderer,
      theme: {
        style: sinon.stub(),
        palette: sinon.stub()
      }
    });
    instance.beforeMount();
    instance.resize(inner);
    instance.beforeRender();
    instance.render();
    instance.mounted();
    return instance;
  }

  it('should not render lines with default settings and no scales', () => {
    const config = {
      shapeFn
    };

    createAndRenderComponent({
      inner: {
        x: 37, y: 0, width: 870, height: 813
      },
      config
    });

    expect(rendererOutput).to.deep.equal([]);
  });

  it('should not render lines without value', () => {
    const config = {
      shapeFn,
      lines: {
        x: [
          {
            line: { stroke: 'green' },
            label: { text: 'Oops' }
          }
        ],
        y: [
          {
            line: { stroke: 'green' },
            label: { text: 'Oops' }
          }
        ]
      }
    };

    createAndRenderComponent({
      inner: {
        x: 37, y: 0, width: 870, height: 813
      },
      config
    });

    expect(rendererOutput).to.deep.equal([]);
  });

  it('should render basic line with RTL label on X with scale', () => {
    const config = {
      shapeFn,
      lines: {
        x: [
          {
            value: 0.3,
            scale: { scale: 'x' },
            line: {
              stroke: 'green',
              strokeWidth: 2
            },
            label: {
              text: 'اسم عربي',
              padding: 10,
              fontSize: '20px',
              vAlign: 1,
              align: 0
            }
          }
        ]
      }
    };

    const xScale = v => v;
    chart.scale.withArgs({ scale: 'x' }).returns(xScale);

    const yScale = v => v;
    chart.scale.withArgs({ scale: 'y' }).returns(yScale);

    createAndRenderComponent({
      inner: {
        x: 37, y: 0, width: 870, height: 813
      },
      config
    });

    expect(rendererOutput).to.deep.equal([
      {
        flipXY: false,
        stroke: 'green',
        strokeWidth: 2,
        type: 'line',
        x1: 261,
        x2: 261,
        y1: 0,
        y2: 813
      },
      {
        fill: '#fff',
        height: 44,
        opacity: 0.5,
        stroke: 'transparent',
        strokeWidth: 0,
        type: 'rect',
        width: 189,
        x: 72,
        y: 769
      },
      {
        anchor: 'start',
        fill: 'green',
        fontFamily: 'Arial',
        fontSize: '20px',
        maxWidth: 97,
        opacity: 1,
        text: 'اسم عربي',
        type: 'text',
        x: 82,
        y: 799
      },
      {
        fill: 'green',
        fontFamily: 'Arial',
        fontSize: '20px',
        opacity: 1,
        text: ' (0.3)',
        type: 'text',
        x: 182,
        y: 799
      }
    ]);
  });

  it('should render basic line with label on Y without scale', () => {
    const config = {
      shapeFn,
      lines: {
        y: [
          {
            value: 0.3,
            line: {
              stroke: 'green',
              strokeWidth: 2
            },
            label: {
              text: 'asdftest',
              padding: 10,
              fontSize: '20px',
              vAlign: 1,
              align: 0
            }
          }
        ]
      }
    };

    const xScale = v => v;
    chart.scale.withArgs({ scale: 'x' }).returns(xScale);

    const yScale = v => v;
    chart.scale.withArgs({ scale: 'y' }).returns(yScale);

    createAndRenderComponent({
      inner: {
        x: 37, y: 0, width: 870, height: 813
      },
      config
    });

    expect(rendererOutput).to.deep.equal([
      {
        flipXY: true,
        stroke: 'green',
        strokeWidth: 2,
        type: 'line',
        x1: 0,
        x2: 870,
        y1: 244,
        y2: 244
      },
      {
        fill: '#fff',
        height: 44,
        opacity: 0.5,
        stroke: 'transparent',
        strokeWidth: 0,
        type: 'rect',
        width: 117,
        x: 0,
        y: 244
      },
      {
        anchor: 'start',
        fill: 'green',
        fontFamily: 'Arial',
        fontSize: '20px',
        maxWidth: 97,
        opacity: 1,
        text: 'asdftest',
        type: 'text',
        x: 10,
        y: 274
      }
    ]);
  });

  it('vAlign 0, align 1, default values and different text test', () => {
    const config = {
      shapeFn,
      lines: {
        y: [
          {
            value: 0.3,
            label: {
              text: 'QwErTy',
              vAlign: 0,
              align: 1
            }
          }
        ]
      }
    };

    const xScale = v => v;
    chart.scale.withArgs({ scale: 'x' }).returns(xScale);

    const yScale = v => v;
    chart.scale.withArgs({ scale: 'y' }).returns(yScale);

    createAndRenderComponent({
      inner: {
        x: 37, y: 0, width: 870, height: 813
      },
      config
    });

    expect(rendererOutput).to.deep.equal([
      {
        flipXY: true,
        stroke: '#000',
        strokeWidth: 1,
        type: 'line',
        x1: -0.5,
        x2: 869.5,
        y1: 243.5,
        y2: 243.5
      },
      {
        fill: '#fff',
        height: 24,
        opacity: 0.5,
        stroke: 'transparent',
        strokeWidth: 0,
        type: 'rect',
        width: 54,
        x: 816,
        y: 219
      },
      {
        anchor: 'start',
        fill: '#000',
        fontFamily: 'Arial',
        fontSize: '12px',
        maxWidth: 44,
        opacity: 1,
        text: 'QwErTy',
        type: 'text',
        x: 821,
        y: 235.8
      }
    ]);
  });

  it('should bind data for oob values', () => {
    const config = {
      shapeFn,
      lines: {
        y: [
          {
            value: 10,
            label: {
              text: 'QwErTy'
            }
          },
          {
            value: 20,
            label: {
              text: 'Oops.. I did it again'
            }
          }
        ]
      }
    };

    const yScale = v => v;
    chart.scale.withArgs({ scale: 'y' }).returns(yScale);

    createAndRenderComponent({
      inner: {
        x: 0, y: 0, width: 100, height: 200
      },
      config
    });

    expect(rendererOutput).to.deep.equal([
      {
        type: 'circle',
        cy: 162,
        cx: 15,
        r: 10,
        stroke: 'transparent',
        fill: '#1A1A1A',
        strokeWidth: 0,
        opacity: 1,
        data: [
          {
            label: 'QwErTy',
            value: 10
          },
          {
            label: 'Oops.. I did it again',
            value: 20
          }
        ]
      },
      {
        type: 'text',
        text: 2,
        x: 11,
        y: 166,
        fontFamily: 'Arial',
        fontSize: '13px',
        stroke: 'transparent',
        fill: '#fff',
        strokeWidth: 0,
        opacity: 1
      },
      {
        type: 'path',
        d: '\n    M 7.5 173.25\n    L 22.5 173.25\n    L 15 180.75 Z\n  ',
        x: 15,
        y: 162,
        stroke: 'transparent',
        fill: '#4D4D4D',
        strokeWidth: 0,
        opacity: 1
      }
    ]);
  });

  it('should bind data for oob values without a label', () => {
    const config = {
      shapeFn,
      lines: {
        y: [
          {
            value: 10
          }
        ]
      }
    };

    const yScale = v => v;
    chart.scale.withArgs({ scale: 'y' }).returns(yScale);

    createAndRenderComponent({
      inner: {
        x: 0, y: 0, width: 100, height: 200
      },
      config
    });

    expect(rendererOutput).to.deep.equal([
      {
        type: 'circle',
        cy: 162,
        cx: 15,
        r: 10,
        stroke: 'transparent',
        fill: '#1A1A1A',
        strokeWidth: 0,
        opacity: 1,
        data: [
          {
            value: 10
          }
        ]
      },
      {
        type: 'text',
        text: 1,
        x: 11,
        y: 166,
        fontFamily: 'Arial',
        fontSize: '13px',
        stroke: 'transparent',
        fill: '#fff',
        strokeWidth: 0,
        opacity: 1
      },
      {
        type: 'path',
        d: '\n    M 7.5 173.25\n    L 22.5 173.25\n    L 15 180.75 Z\n  ',
        x: 15,
        y: 162,
        stroke: 'transparent',
        fill: '#4D4D4D',
        strokeWidth: 0,
        opacity: 1
      }
    ]);
  });
});
