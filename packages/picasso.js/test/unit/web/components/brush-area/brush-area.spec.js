import componentFactoryFixture from '../../../../helpers/component-factory-fixture';
import brushAreaDir from '../../../../../src/web/components/brush-area/brush-area';

function nativeEvent(x, y) {
  return {
    clientX: x,
    clientY: y
  };
}

function hammerEvent(x, y) {
  return {
    center: { x, y }
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
    rect = { x: 1, y: 2, width: 100, height: 200 };
    container = {
      inner: rect,
      outer: rect
    };

    config = {
      settings: {}
    };

    componentFixture = componentFactoryFixture();
    sandbox = componentFixture.sandbox();
    const chartMock = componentFixture.mocks().chart;
    chartMock.shapesAt = sandbox.stub().returns([]);
    chartMock.brushFromShapes = sandbox.stub();

    rendererSpy = sandbox.spy(componentFixture.mocks().renderer, 'render');

    theme = componentFixture.mocks().theme;
    theme.style.returns({
      area: {
        fill: 'green',
        strokeWidth: 0,
        opacity: 0.2
      }
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
        opacity: 0.2
      }
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
          contexts: ['test']
        },
        {
          key: 'test2',
          contexts: ['test2']
        }
      ]
    };
    const spy = sandbox.spy();
    const stub = sandbox.stub().returns({ end: spy });
    componentFixture.mocks().chart.brush = stub;
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    componentFixture.simulateRender(container);
    instance.def.start(nativeEvent(10, 20));
    instance.def.cancel();
    componentFixture.getRenderOutput();

    expect(spy).to.have.been.calledTwice;
    expect(stub.firstCall).to.have.been.calledWith('test');
    expect(stub.secondCall).to.have.been.calledWith('test2');
  });

  it('should brush in chart coordinate system', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    componentFixture.simulateRender(container);
    instance.def.start(hammerEvent(10, 20));
    instance.def.move(hammerEvent(40, 30));

    expect(componentFixture.mocks().chart.shapesAt).to.have.been.calledWith({
      x: 11, // To include renderer position
      y: 22,
      width: 30,
      height: 10
    });
  });

  it('should require `start` event before `move` event', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    rendererSpy.reset();
    instance.def.move(nativeEvent(10, 20));

    expect(rendererSpy).to.not.have.been.called;
  });

  it('should require `start` event before `end` event', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    rendererSpy.reset();
    instance.def.end(nativeEvent(10, 20)); // If started, would render empty nodes

    expect(rendererSpy).to.not.have.been.called;
  });

  it('should require `start` event before `cancel` event', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    rendererSpy.reset();
    instance.def.cancel(nativeEvent(10, 20)); // If started, would render empty nodes

    expect(rendererSpy).to.not.have.been.called;
  });

  it('should require to be inside the component container on `start` event', () => {
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    componentFixture.simulateRender(container);
    rendererSpy.reset();
    instance.def.start(nativeEvent(1000, 2000));
    instance.def.move(nativeEvent(10, 20)); // If started, would render here

    expect(rendererSpy).to.not.have.been.called;
  });
});
