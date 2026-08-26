import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import component from '../legend-cat';

describe('legend-cat', () => {
  let renderedItems;
  let chart;
  let componentFixture;
  let opts;
  let domRenderer;
  const sandbox = vi;
  let h;

  beforeEach(() => {
    opts = {
      inner: {
        x: 10,
        y: 20,
        width: 100,
        height: 200,
      },
    };
    componentFixture = componentFactoryFixture();
    componentFixture.mocks().theme.style.mockReturnValue({
      item: {
        label: {},
      },
      title: {},
    });
    const renderer = {
      size: () => {},
      render: () => {},
    };
    componentFixture
      .mocks()
      .registries.renderer.mockImplementation((type) => (type === 'dom' ? () => domRenderer : () => renderer));
    h = vi.fn();
    domRenderer = {
      size: () => {},
      render: vi.fn(),
      renderArgs: [h],
    };
    chart = componentFixture.mocks().chart;
    const scale = (d) => `-${d}-`;
    scale.domain = () => [1];
    scale.data = () => [1];
    scale.labels = () => ['first'];
    chart.scale.mockReturnValue(scale);
  });

  it('should render items with default settings', () => {
    const config = {
      scale: 's',
    };

    componentFixture.simulateCreate(component, config);
    renderedItems = componentFixture.simulateRender(opts);

    const d = { value: 1, label: 'first' };

    expect(renderedItems[0]).toMatchObject({
      type: 'container',
      data: d,
      children: expect.arrayContaining([
        {
          type: 'rect',
          fill: '-1-',
          x: 0,
          y: 0,
          width: 12,
          height: 12,
          data: d,
        },
      ]),
      collider: {
        x: 0,
        y: 0,
        width: 25,
        height: 12,
        type: 'rect',
      },
    });

    expect(renderedItems[0].children[1]).toMatchObject({
      // label
      text: 'first',
      data: d,
    });
  });

  it('should calculate preferredSize', () => {
    const config = {
      scale: 's',
    };

    componentFixture.simulateCreate(component, config);
    const size = componentFixture.simulateLayout({
      inner: {
        width: 100,
        height: 200,
        x: 10,
        y: 20,
      },
      outer: {
        width: 101,
        height: 201,
        x: 11,
        y: 21,
      },
    });

    expect(size).to.equal(25 + 16);
  });

  it('should render with nagivation', () => {
    const config = {
      scale: 'long',
      layout: {
        dock: 'top',
      },
      settings: {
        layout: {
          direction: 'rtl',
        },
      },
    };

    chart = componentFixture.mocks().chart;
    const scale = (d) => `-${d}-`;
    scale.domain = () => [1];
    scale.data = () => [1];
    scale.labels = () => ['fidfd fg dt'];
    chart.scale.mockReturnValue(scale);

    componentFixture.simulateCreate(component, config);
    componentFixture.simulateRender({
      inner: {
        x: 10,
        y: 20,
        width: 30,
        height: 200,
      },
    });

    expect(h.mock.calls.length).to.equal(10);
  });
});
