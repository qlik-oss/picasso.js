import componentFactoryFixture from '../../../../helpers/component-factory-fixture';
import pointComponent from '../../../../../src/core/chart-components/point/point';

describe('point component', () => {
  let renderedPoints;
  let chart;
  let shapeFn;
  let componentFixture;
  let opts;

  beforeEach(() => {
    opts = {
      inner: { x: 10, y: 20, width: 100, height: 200 }
    };
    shapeFn = p => p;
    componentFixture = componentFactoryFixture();
    chart = componentFixture.mocks().chart;

    componentFixture.mocks().theme.style.returns({});
  });

  it('should render points with default settings', () => {
    const config = {
      shapeFn,
      data: [1]
    };

    componentFixture.simulateCreate(pointComponent, config);
    renderedPoints = componentFixture.simulateRender(opts);

    expect(renderedPoints).to.deep.equal([{
      type: 'circle',
      label: '',
      x: 50,
      y: 100,
      fill: '#333',
      size: 10,
      stroke: '#ccc',
      strokeWidth: 0,
      strokeDasharray: '',
      opacity: 1,
      data: { value: 1, label: '1' }
    }]);
  });

  it('should render points with default settings when settings properties are invalid', () => {
    const config = {
      shapeFn,
      data: [1],
      settings: {
        shape: 1,
        label: true,
        fill: 123,
        size: 'random',
        opacity: 'red',
        x: false,
        y: true
      }
    };

    componentFixture.simulateCreate(pointComponent, config);
    renderedPoints = componentFixture.simulateRender(opts);

    expect(renderedPoints).to.deep.equal([{
      type: 'circle',
      label: '',
      x: 50,
      y: 100,
      fill: '#333',
      size: 10,
      stroke: '#ccc',
      strokeWidth: 0,
      strokeDasharray: '',
      opacity: 1,
      data: { value: 1, label: '1' }
    }]);
  });


  it('should render points with primitive value settings', () => {
    const config = {
      shapeFn,
      data: [1],
      settings: {
        shape: 'rect',
        label: 'etikett',
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 2,
        strokeDasharray: '2 5',
        opacity: 0.7,
        x: 0.8,
        y: 0.3,
        size: 0,
        sizeLimits: {
          minRelExtent: 0.2,
          maxRelExtent: 1
        }
      }
    };

    componentFixture.simulateCreate(pointComponent, config);
    renderedPoints = componentFixture.simulateRender(opts);

    expect(renderedPoints).to.deep.equal([{
      type: 'square',
      label: 'etikett',
      x: 80,
      y: 60,
      fill: 'red',
      size: 20,
      stroke: 'blue',
      strokeWidth: 2,
      strokeDasharray: '2 5',
      opacity: 0.7,
      data: { value: 1, label: '1' }
    }]);
  });

  it('should render points with function settings', () => {
    const config = {
      shapeFn,
      data: ['a'],
      settings: {
        shape(b) { return b.datum.value; },
        label: () => 'etikett',
        fill: () => 'red',
        stroke: () => 'blue',
        strokeWidth: () => 2,
        strokeDasharray: () => '3 5',
        opacity: () => 0.7,
        x: () => 0.8,
        y: () => 0.3,
        size: () => 1,
        sizeLimits: {
          maxRelExtent: 0.5 // 50% of min(width, height)
        }
      }
    };

    componentFixture.simulateCreate(pointComponent, config);
    renderedPoints = componentFixture.simulateRender(opts);

    expect(renderedPoints).to.deep.equal([{
      type: 'a',
      label: 'etikett',
      x: 80,
      y: 60,
      fill: 'red',
      size: 50,
      stroke: 'blue',
      strokeWidth: 2,
      strokeDasharray: '3 5',
      opacity: 0.7,
      data: {
        value: 'a',
        label: 'a'
      }
    }]);
  });

  it('should render points with data settings', () => {
    const config = {
      shapeFn,
      data: [{
        text: 'etta',
        shape: 'circle',
        fill: 'red',
        m1: 5,
        m2: -0.2,
        m3: 0.3
      }, {
        text: 'tvåa',
        shape: 'rect',
        fill: 'green',
        m1: 4,
        m2: 0.7,
        m3: 1.2
      }],
      settings: {
        shape: { ref: 'value', fn: s => s.datum.value.shape },
        label: { ref: 'value', fn: s => s.datum.value.text },
        fill(b) { return b.datum.value.fill; },
        stroke: { ref: 'value', fn: s => `stroke:${s.datum.value.fill}` },
        strokeWidth: { ref: 'value', fn: v => v.datum.value.m1 },
        strokeDasharray: { ref: 'value', fn: s => s.datum.value.text },
        opacity: { ref: 'value', fn: v => v.datum.value.m1 / 10 },
        x: { fn(b) { return b.datum.value.m2; } },
        y: { ref: 'value', fn: v => v.datum.value.m3 },
        size: { ref: 'value', fn: (v, i) => i },
        sizeLimits: {
          minRelExtent: 0.2,
          maxRelExtent: 2
        }
      }
    };

    componentFixture.simulateCreate(pointComponent, config);
    renderedPoints = componentFixture.simulateRender(opts);

    expect(renderedPoints).to.deep.equal([{
      type: 'circle',
      label: 'etta',
      x: -0.2 * 100,
      y: 0.3 * 200,
      fill: 'red',
      size: 20, // value of minRel * min(width, height)
      stroke: 'stroke:red',
      strokeWidth: 5,
      strokeDasharray: 'etta',
      opacity: 0.5,
      data: {
        value: {
          text: 'etta',
          shape: 'circle',
          fill: 'red',
          m1: 5,
          m2: -0.2,
          m3: 0.3
        },
        label: '[object Object]'
      }
    }, {
      type: 'square',
      label: 'tvåa',
      x: 0.7 * 100,
      y: 1.2 * 200,
      fill: 'green',
      size: 200, // value of maxRel * min(width, height)
      stroke: 'stroke:green',
      strokeWidth: 4,
      strokeDasharray: 'tvåa',
      opacity: 0.4,
      data: {
        value: {
          text: 'tvåa',
          shape: 'rect',
          fill: 'green',
          m1: 4,
          m2: 0.7,
          m3: 1.2
        },
        label: '[object Object]'
      }
    }]);
  });

  it('should render points with limited size when using discrete scale', () => {
    const config = {
      shapeFn,
      data: [0, 0.4, 1],
      settings: {
        x: { scale: 'whatever', ref: 'value', fn: v => v.datum.value },
        size: { ref: 'value', fn: v => v.datum.value },
        sizeLimits: {
          maxRelDiscrete: 2,
          minRelDiscrete: 0.5,
          maxRelExtent: 100,
          minRelExtent: 100
        }
      }
    };

    const xScale = v => v;
    xScale.bandwidth = () => 0.2; // max size: width * 0.2 * maxRelDiscrete -> 40, // min size: width * 0.2 * minRelDiscrete -> 10
    chart.scale.onCall(0).returns(xScale);

    componentFixture.simulateCreate(pointComponent, config);
    renderedPoints = componentFixture.simulateRender(opts);

    expect(renderedPoints.map(p => p.size)).to.deep.equal([10, 10 + (30 * 0.4), 40]);
  });
});
