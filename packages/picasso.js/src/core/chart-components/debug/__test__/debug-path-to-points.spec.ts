import component from '../debug-path-to-points';
import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';

describe('debug-path-to-points', () => {
  let componentFixture;
  let opts;
  let shapes;

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

  it('should render transformed path', () => {
    shapes = [
      {
        key: '',
        attrs: {
          d: 'M0 0, L10 10',
        },
      },
    ];
    const out = componentFixture.simulateRender(opts);

    expect(out).to.eql([
      {
        type: 'circle',
        cx: 0,
        cy: 0,
        r: 2,
        fill: 'transparent',
        stroke: 'lime',
        opacity: 1,
        collider: { type: null },
      },
      {
        type: 'circle',
        cx: 10,
        cy: 10,
        r: 2,
        fill: 'transparent',
        stroke: 'lime',
        opacity: 1,
        collider: { type: null },
      },
    ]);
  });
});
