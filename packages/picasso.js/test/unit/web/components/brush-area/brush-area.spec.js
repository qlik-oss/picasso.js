import componentFactoryFixture from '../../../../helpers/component-factory-fixture';
import brushAreaDir from '../../../../../src/web/components/brush-area/brush-area';

describe('Brush Area', () => {
  let componentFixture;
  let instance;
  let config;
  let out;
  let chartMock;
  let theme;
  let sandbox;

  beforeEach(() => {
    config = {
      settings: {}
    };

    componentFixture = componentFactoryFixture();
    sandbox = componentFixture.sandbox();
    chartMock = componentFixture.mocks().chart;
    chartMock.shapesAt = sandbox.stub().returns([]);
    chartMock.brushFromShapes = sandbox.stub();
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
    componentFixture.mocks().renderer.size = () => ({ x: 1, y: 2 });
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    instance.def.start({ center: { x: 10, y: 20 } });
    instance.def.move({ center: { x: 100, y: 150 } });
    out = componentFixture.getRenderOutput();

    expect(out).to.deep.equal([
      {
        type: 'rect',
        x: 10,
        y: 20,
        width: 90,
        height: 130,
        fill: 'green',
        strokeWidth: 0,
        opacity: 0.2
      }
    ]);
  });

  it('end event should clear rendered node', () => {
    componentFixture.mocks().renderer.size = () => ({ x: 1, y: 2 });
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    instance.def.start({ center: { x: 10, y: 20 } });
    instance.def.move({ center: { x: 100, y: 150 } });
    instance.def.end();
    out = componentFixture.getRenderOutput();

    expect(out).to.deep.equal([]);
  });

  it('cancel event should end brushes', () => {
    config.settings.brush = {
      components: [
        {
          key: 'test',
          context: 'test'
        },
        {
          key: 'test2',
          context: 'test2'
        }
      ]
    };
    const spy = sandbox.spy();
    componentFixture.mocks().renderer.size = () => ({ x: 1, y: 2 });
    componentFixture.mocks().chart.brush = () => ({ end: spy });
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    instance.def.start({ center: { x: 10, y: 20 } });
    instance.def.cancel();
    componentFixture.getRenderOutput();

    expect(spy).to.have.been.calledTwice;
  });

  it('should brush in chart space', () => {
    componentFixture.mocks().renderer.size = () => ({ x: 1, y: 2 }); // Set renderer position
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    instance.def.start({ center: { x: 10, y: 20 } });
    instance.def.move({ center: { x: 100, y: 150 } });

    expect(componentFixture.mocks().chart.shapesAt).to.have.been.calledWith({
      x: 11, // To include renderer position
      y: 22,
      width: 90,
      height: 130
    });
  });

  it('require start before move event', () => {
    const spy = sandbox.spy();
    componentFixture.mocks().renderer.render = spy;
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    instance.def.move({ center: { x: 100, y: 150 } });

    expect(spy).to.not.have.been.called;
  });

  it('require start before end event', () => {
    const spy = sandbox.spy();
    componentFixture.mocks().renderer.render = spy;
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    instance.def.end({ center: { x: 100, y: 150 } });

    expect(spy).to.not.have.been.called;
  });

  it('require start before cancel event', () => {
    const spy = sandbox.spy();
    componentFixture.mocks().renderer.render = spy;
    instance = componentFixture.simulateCreate(brushAreaDir, config);
    instance.def.end({ center: { x: 100, y: 150 } });

    expect(spy).to.not.have.been.called;
  });
});
