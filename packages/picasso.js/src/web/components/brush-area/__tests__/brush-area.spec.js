import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import brushAreaDir from '../brush-area';

function nativeEvent(x, y) {
  return {
    clientX: x,
    clientY: y,
  };
}

function hammerEvent(x, y) {
  return {
    center: { x, y },
  };
}

describe('Brush Area', () => {
  let componentFixture;
  let instance;
  let config;
  let out;
  let theme;
  let sandbox;
  let container;
  let rect;
  let rendererSpy;

  beforeEach(() => {
    rect = {
      x: 1,
      y: 2,
      width: 100,
      height: 200,
      computed: {
        x: 1,
        y: 2,
        width: 100,
        height: 200,
      },
    };
    container = {
      inner: rect,
      outer: rect,
    };

    config = {
      settings: {},
    };

    componentFixture = componentFactoryFixture();
    sandbox = vi;
    const chartMock = componentFixture.mocks().chart;
    chartMock.dataset.mockReturnValue({ fields: [] });
    chartMock.shapesAt = vi.fn().mockReturnValue([]);
    chartMock.brushFromShapes = vi.fn();

    rendererSpy = vi.spyOn(componentFixture.mocks().renderer, 'render');

    theme = componentFixture.mocks().theme;
    theme.style.mockReturnValue({
      area: {
        fill: 'green',
        strokeWidth: 0,
        opacity: 0.2,
      },
    });
  });

  it('should render area indicator in component space', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    componentFixture.simulateRender(container);
    instance.def.start(nativeEvent(10, 20));
    instance.def.move(nativeEvent(40, 30));
    out = componentFixture.getRenderOutput();

    expect(out).to.deep.equal([
      {
        type: 'rect',
        x: 10,
        y: 20,
        width: 30,
        height: 10,
        fill: 'green',
        strokeWidth: 0,
        opacity: 0.2,
      },
    ]);
  });

  it('`end` event should clear rendered node', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    componentFixture.simulateRender(container);
    instance.def.start(nativeEvent(10, 20));
    instance.def.move(nativeEvent(40, 30));
    instance.def.end();
    out = componentFixture.getRenderOutput();

    expect(out).to.deep.equal([]);
  });

  it('`cancel` event should end brushes', () => {
    config.settings.brush = {
      components: [
        {
          key: 'test',
          contexts: ['test'],
        },
        {
          key: 'test2',
          contexts: ['test2'],
        },
      ],
    };
    const spy = vi.fn();
    const stub = vi.fn().mockReturnValue({ end: spy });
    componentFixture.mocks().chart.brush = stub;
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    componentFixture.simulateRender(container);
    instance.def.start(nativeEvent(10, 20));
    instance.def.cancel();
    componentFixture.getRenderOutput();

    expect(spy).toHaveBeenCalledTimes(2);
    expect(stub).toHaveBeenNthCalledWith(1, 'test');
    expect(stub).toHaveBeenNthCalledWith(2, 'test2');
  });

  it('should brush in chart coordinate system', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    componentFixture.simulateRender(container);
    instance.def.start(hammerEvent(10, 20));
    instance.def.move(hammerEvent(40, 30));

    expect(componentFixture.mocks().chart.shapesAt).toHaveBeenCalledWith(
      {
        x: 11, // To include renderer position
        y: 22,
        width: 30,
        height: 10,
      },
      { components: [] },
    );
  });

  it('should require `start` event before `move` event', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    rendererSpy.mockClear();
    instance.def.move(nativeEvent(10, 20));

    expect(rendererSpy).not.toHaveBeenCalled();
  });

  it('should require `start` event before `end` event', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    rendererSpy.mockClear();
    instance.def.end(nativeEvent(10, 20)); // If started, would render empty nodes

    expect(rendererSpy).not.toHaveBeenCalled();
  });

  it('should require `start` event before `cancel` event', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    rendererSpy.mockClear();
    instance.def.cancel(nativeEvent(10, 20)); // If started, would render empty nodes

    expect(rendererSpy).not.toHaveBeenCalled();
  });

  it('should require to be inside the component container on `start` event', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    componentFixture.simulateRender(container);
    rendererSpy.mockClear();
    instance.def.start(nativeEvent(1000, 2000));
    instance.def.move(nativeEvent(10, 20)); // If started, would render here

    expect(rendererSpy).not.toHaveBeenCalled();
  });
});
