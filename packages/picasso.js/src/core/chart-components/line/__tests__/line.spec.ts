import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import component from '../line';

describe('line component', () => {
  let rendered;
  let componentFixture;
  let opts;

  beforeEach(() => {
    opts = {
      inner: {
        x: 10,
        y: 20,
        width: 200,
        height: 100,
      },
    };
    componentFixture = componentFactoryFixture();
  });

  it('should render lines with default settings', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [1, 1, 1, 1],
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered).to.containSubset([
      {
        type: 'path',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: {
          value: 1,
          label: '1',
          points: config.data.map((p) => ({ label: `${p}`, value: p })),
        },
      },
    ]);
  });

  it('should render lines with custom settings', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [1, 1, 1, 1],
      settings: {
        coordinates: {},
        layers: {
          line: {
            fill: 'red',
            stroke: 'green',
            strokeLinejoin: 'round',
            strokeWidth: 4,
            strokeDasharray: '8 4',
          },
        },
      },
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered).to.containSubset([
      {
        type: 'path',
        fill: 'none',
        stroke: 'green',
        strokeLinejoin: 'round',
        strokeWidth: 4,
        strokeDasharray: '8 4',
        opacity: 1,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should update settings', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [1, 1, 1, 1],
    };

    componentFixture.simulateCreate(component, config);
    componentFixture.simulateRender(opts);
    rendered = componentFixture.simulateUpdate({
      ...config,
      settings: {
        layers: {
          line: {
            stroke: 'red',
          },
        },
      },
    });

    expect(rendered).to.containSubset([
      {
        type: 'path',
        fill: 'none',
        stroke: 'red',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should render area', () => {
    componentFixture.mocks().theme.style.returns({
      line: {},
      area: {
        fill: 'red',
        opacity: 0.3,
      },
    });

    const config = {
      data: [1, 2, 3],
      settings: {
        coordinates: {
          major(a, i) {
            return i % 3;
          },
          minor(b) {
            return b.datum.value;
          },
        },
        layers: {
          line: { show: false },
          area: {
            fill: 'blue',
          },
        },
      },
    };

    componentFixture.simulateCreate(component, config);

    rendered = componentFixture.simulateRender(opts);
    expect(rendered.length).to.equal(1);
    expect(rendered).to.containSubset([
      {
        type: 'path',
        fill: 'blue',
        stroke: undefined,
        strokeLinejoin: undefined,
        strokeWidth: undefined,
        opacity: 0.3,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should render area, minor, and minor0 lines (3 lines) when show is true and has minor0', () => {
    componentFixture.mocks().theme.style.returns({
      line: {},
      area: {
        fill: 'red',
        opacity: 0.3,
      },
    });

    const config = {
      data: [1, 2, 3],
      settings: {
        coordinates: {
          major(a, i) {
            return i % 3;
          },
          minor(b) {
            return b.datum.value;
          },
          minor0(c) {
            return c.datum.value / 2;
          },
        },
        layers: {
          line: {
            show: true,
          },
          area: {
            fill: 'blue',
          },
        },
      },
    };

    componentFixture.simulateCreate(component, config);

    rendered = componentFixture.simulateRender(opts);
    expect(rendered.length).to.equal(3);
    expect(rendered).to.containSubset([
      {
        type: 'path',
        fill: 'blue',
        stroke: undefined,
        strokeLinejoin: undefined,
        strokeWidth: undefined,
        opacity: 0.3,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
      {
        type: 'path',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should not render minor0 line when has minor0 but showMinor0 is false', () => {
    componentFixture.mocks().theme.style.returns({
      line: {},
      area: {
        fill: 'red',
        opacity: 0.3,
      },
    });

    const config = {
      data: [1, 2, 3],
      settings: {
        coordinates: {
          major(a, i) {
            return i % 3;
          },
          minor(b) {
            return b.datum.value;
          },
          minor0(c) {
            return c.datum.value / 2;
          },
        },
        layers: {
          line: {
            show: true,
            showMinor0: false,
          },
          area: {
            fill: 'blue',
          },
        },
      },
    };

    componentFixture.simulateCreate(component, config);

    rendered = componentFixture.simulateRender(opts);
    expect(rendered.length).to.equal(2);
    expect(rendered).to.containSubset([
      {
        type: 'path',
        fill: 'blue',
        stroke: undefined,
        strokeLinejoin: undefined,
        strokeWidth: undefined,
        opacity: 0.3,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
      {
        type: 'path',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  describe('layer order', () => {
    let config;
    beforeEach(() => {
      config = {
        data: [2.1, 2.2, 2.3, 1.1, 1.2, 1.3, 3.1, 3.2, 3.3],
        settings: {
          coordinates: {
            major(d, i) {
              return i;
            },
            minor(d) {
              return d.datum.value;
            },
            layerId(d) {
              return 10 - Math.round(d.datum.value);
            },
          },
          layers: {
            line: {
              stroke: (d) => ['red', 'green', 'blue'][Math.round(d.datum.value) - 1],
            },
          },
        },
      };

      componentFixture.mocks().theme.style.returns({});
    });

    it('should be sorted by median by default', () => {
      componentFixture.simulateCreate(component, config);
      rendered = componentFixture.simulateRender(opts);
      const order = rendered.map((layer) => layer.stroke);
      expect(order).to.eql(['red', 'green', 'blue']);
    });

    it('should be sorted by custom sorting function', () => {
      config.settings.layers.sort = (a, b) => b.data[0].value - a.data[0].value;

      componentFixture.simulateCreate(component, config);
      rendered = componentFixture.simulateRender(opts);
      const order = rendered.map((layer) => layer.stroke);
      expect(order).to.eql(['blue', 'green', 'red']);
    });
  });
});
