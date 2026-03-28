import component from '../debug-collider';
import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';

describe('debug-collider', () => {
  let componentFixture: any;
  let opts: any;
  let shapes: any;

  beforeEach(() => {
    componentFixture = componentFactoryFixture();
    opts = {
      inner: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      outer: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    };

    componentFixture.mocks().chart.findShapes = () => shapes;
    componentFixture.simulateCreate(component, {});
  });

  it('should render matching colliders', () => {
    shapes = [
      {
        key: '',
        collider: {
          someProperty: 'black',
        },
      },
    ];
    const out = componentFixture.simulateRender(opts);

    expect(out).to.eql([
      {
        someProperty: 'black',
        fill: 'rgba(0, 255, 0, 0.1)',
        stroke: 'lime',
        opacity: 1,
        collider: { type: null },
      },
    ]);
  });
});
