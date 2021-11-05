import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import lineComponent from '../line';

describe('line component', () => {
  let rendererOutput;
  let chart;
  let shapeFn;
  let componentFixture;
  let opts;
  let xScale;
  let yScale;
  let xTick;
  let yTick;

  beforeEach(() => {
    xTick = {
      position: 0.5,
      value: 1.23,
    };
    yTick = {
      position: 0.5,
      value: 4.56,
      isMinor: false,
    };
    xScale = {
      cachedTicks: () => [xTick],
    };
    yScale = {
      cachedTicks: () => [yTick],
    };

    opts = {
      inner: {
        x: 10,
        y: 20,
        width: 100,
        height: 200,
      },
    };

    componentFixture = componentFactoryFixture();

    chart = componentFixture.mocks().chart;
    componentFixture.mocks().theme.style.returns({
      ticks: {
        stroke: 'red',
      },
      minorTicks: {
        stroke: 'blue',
      },
    });
    // chart.dataset = () => ({
    //   extract: componentFixture.sandbox().stub()
    // });
    // chart.dataset().extract.returns([{}]);
    chart.scale.withArgs({ scale: 'x' }).returns(xScale);
    chart.scale.withArgs({ scale: 'y' }).returns(yScale);
  });

  it('should not render lines with default settings and no scales', () => {
    const config = {
      shapeFn,
    };

    componentFixture.simulateCreate(lineComponent, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([]);
  });

  it('should render lines with default settings and scales', () => {
    const config = {
      shapeFn,
      x: { scale: 'x' },
      y: { scale: 'y' },
    };

    componentFixture.simulateCreate(lineComponent, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([
      {
        stroke: 'red',
        strokeWidth: 1,
        strokeDasharray: undefined,
        type: 'line',
        flipXY: false,
        x1: 49.5,
        x2: 49.5,
        y1: -0.5,
        y2: 199.5,
        value: 1.23,
        dir: 'x',
      },
      {
        stroke: 'red',
        strokeWidth: 1,
        strokeDasharray: undefined,
        type: 'line',
        flipXY: true,
        x1: -0.5,
        x2: 99.5,
        y1: 99.5,
        y2: 99.5,
        value: 4.56,
        dir: 'y',
      },
    ]);
  });

  it('should render X scale lines only', () => {
    const config = {
      shapeFn,
      x: { scale: 'x' },
    };

    componentFixture.simulateCreate(lineComponent, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([
      {
        stroke: 'red',
        strokeWidth: 1,
        strokeDasharray: undefined,
        type: 'line',
        flipXY: false,
        x1: 49.5,
        x2: 49.5,
        y1: -0.5,
        y2: 199.5,
        value: 1.23,
        dir: 'x',
      },
    ]);
  });

  it('should render Y scale lines only', () => {
    const config = {
      shapeFn,
      y: { scale: 'y' },
    };

    componentFixture.simulateCreate(lineComponent, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([
      {
        stroke: 'red',
        strokeWidth: 1,
        strokeDasharray: undefined,
        type: 'line',
        flipXY: true,
        x1: -0.5,
        x2: 99.5,
        y1: 99.5,
        y2: 99.5,
        value: 4.56,
        dir: 'y',
      },
    ]);
  });

  it('should render minorTicks', () => {
    const config = {
      shapeFn,
      x: { scale: 'x' },
      y: { scale: 'y' },
      minorTicks: {
        show: true,
      },
    };

    xTick.isMinor = true;
    yTick.isMinor = true;

    componentFixture.simulateCreate(lineComponent, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([
      {
        stroke: 'blue',
        strokeWidth: 1,
        strokeDasharray: undefined,
        type: 'line',
        flipXY: false,
        x1: 49.5,
        x2: 49.5,
        y1: -0.5,
        y2: 199.5,
        value: 1.23,
        dir: 'x',
      },
      {
        stroke: 'blue',
        strokeWidth: 1,
        strokeDasharray: undefined,
        type: 'line',
        flipXY: true,
        x1: -0.5,
        x2: 99.5,
        y1: 99.5,
        y2: 99.5,
        value: 4.56,
        dir: 'y',
      },
    ]);
  });

  it('should not render disabled ticks', () => {
    const config = {
      shapeFn,
      x: { scale: 'x' },
      y: { scale: 'y' },
      minorTicks: {
        show: false,
      },
      ticks: {
        show: false,
      },
    };

    xTick.isMinor = true;

    componentFixture.simulateCreate(lineComponent, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([]);
  });

  it('should render minorTicks with correct color', () => {
    const config = {
      shapeFn,
      x: { scale: 'x' },
      y: { scale: 'y' },
      ticks: {
        stroke: (t) => (t.data.dir === 'x' ? 'red' : 'blue'),
      },
    };

    componentFixture.simulateCreate(lineComponent, config);
    rendererOutput = componentFixture.simulateRender(opts);

    expect(rendererOutput).to.deep.equal([
      {
        stroke: 'red',
        strokeWidth: 1,
        strokeDasharray: undefined,
        type: 'line',
        flipXY: false,
        x1: 49.5,
        x2: 49.5,
        y1: -0.5,
        y2: 199.5,
        value: 1.23,
        dir: 'x',
      },
      {
        stroke: 'blue',
        strokeWidth: 1,
        strokeDasharray: undefined,
        type: 'line',
        flipXY: true,
        x1: -0.5,
        x2: 99.5,
        y1: 99.5,
        y2: 99.5,
        value: 4.56,
        dir: 'y',
      },
    ]);
  });
});
