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

    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M100,50L100,50L100,50L100,50',
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

    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M100,50L100,50L100,50L100,50',
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

    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M100,50L100,50L100,50L100,50',
        fill: 'none',
        stroke: 'red',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should render vertical line', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [2, 3, 1],
      settings: {
        coordinates: {
          major(a, i) {
            return i;
          },
          minor(b) {
            return b.datum.value;
          },
        },
        layers: {},
        orientation: 'vertical',
      },
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M400,0L600,100L200,200',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 2, label: '2', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should handle minor null values', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [2, 3, 'oops', 1, 2],
      settings: {
        coordinates: {
          major(a, i) {
            return i;
          },
          minor(b) {
            return b.datum.value;
          },
        },
        layers: {},
      },
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M0,200L200,300M600,100L800,200',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 2, label: '2', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should handle custom defined null values', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [2, 3, 4, 1, 2],
      settings: {
        coordinates: {
          major(a, i) {
            return i;
          },
          minor(b) {
            return b.datum.value;
          },
          defined(b) {
            return b.datum.value !== 4;
          },
        },
        layers: {},
      },
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M0,200L200,300M600,100L800,200',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 2, label: '2', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should connect points with undefined values', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [2, 3, 4, 1, 2],
      settings: {
        coordinates: {
          major(a, i) {
            return i;
          },
          minor(b) {
            return b.datum.value;
          },
          defined(b) {
            return b.datum.value !== 4;
          },
        },
        connect: true,
        layers: {},
      },
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M0,200L200,300L600,100L800,200',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 2, label: '2', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should disconnect lines with unordered domain', () => {
    const domain = ['A', 'B', 'C', 'D', 'E'];
    const domainScale = (v) => domain.indexOf(v) / 4;
    domainScale.domain = () => domain;
    domainScale.range = () => [0, 1];
    componentFixture.mocks().theme.style.returns({});
    componentFixture.mocks().chart.scale.returns(domainScale);
    const config = {
      data: ['A', 'B', /* skip C */ 'D', 'E'],
      settings: {
        coordinates: {
          major: { scale: 'x' },
          minor(b, i) {
            return 3 - i;
          },
          layerId: () => 0,
        },
        layers: {},
      },
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M0,300L50,200M150,100L200,0',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 'A', label: 'A', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should disconnect lines with unordered domain based on major data', () => {
    const domain = ['A', 'B', 'C', 'D', 'E'];
    const domainScale = (v) => domain.indexOf(v) / 4;
    domainScale.domain = () => domain;
    domainScale.range = () => [0, 1];
    componentFixture.mocks().theme.style.returns({});
    componentFixture.mocks().chart.scale.returns(domainScale);
    const config = {
      data: {
        items: ['A', 'B', /* skip C */ 'D', 'E'],
        map: (d) => ({ value: `-${d.value}-`, major: { value: d.value } }),
      },
      settings: {
        coordinates: {
          major: { scale: 'x' },
          minor(b, i) {
            return 3 - i;
          },
          layerId: () => 0,
        },
        layers: {},
      },
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M0,300L50,200M150,100L200,0',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: {
          value: '-A-',
          major: { value: 'A' },
          points: config.data.items.map((p) => ({ value: `-${p}-`, major: { value: p } })),
        },
      },
    ]);
  });

  it('should render area which defaults to minor 0', () => {
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
    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M0,100L200,200L400,300L400,0L200,0L0,0Z',
        fill: 'blue',
        stroke: undefined,
        strokeLinejoin: undefined,
        strokeWidth: undefined,
        opacity: 0.3,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should default to rendering minor0 line when has minor0', () => {
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
    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M0,100L200,200L400,300L400,150L200,100L0,50Z',
        fill: 'blue',
        stroke: undefined,
        strokeLinejoin: undefined,
        strokeWidth: undefined,
        opacity: 0.3,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
      {
        type: 'path',
        d: 'M0,100L200,200L400,300',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
      {
        type: 'path',
        d: 'M0,50L200,100L400,150',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  it('should not render minor0 line when has minor0 and showMinor0 is false', () => {
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
    expect(rendered).to.eql([
      {
        type: 'path',
        d: 'M0,100L200,200L400,300L400,150L200,100L0,50Z',
        fill: 'blue',
        stroke: undefined,
        strokeLinejoin: undefined,
        strokeWidth: undefined,
        opacity: 0.3,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
      {
        type: 'path',
        d: 'M0,100L200,200L400,300',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 1, label: '1', points: config.data.map((p) => ({ label: `${p}`, value: p })) },
      },
    ]);
  });

  describe('range', () => {
    let forward;
    let backward;
    before(() => {
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
            minor0(b) {
              return b.datum.value - 1;
            },
          },
          layers: {
            line: {},
            area: {},
          },
        },
      };

      componentFixture.simulateCreate(component, config);
      rendered = componentFixture.simulateRender(opts);
      forward = 'M0,100L200,200L400,300';
      backward = 'L400,200L200,100L0,0Z';
    });

    it('should render area range', () => {
      expect(rendered[0]).to.eql({
        type: 'path',
        d: `${forward}${backward}`,
        fill: 'red',
        stroke: undefined,
        strokeLinejoin: undefined,
        strokeWidth: undefined,
        opacity: 0.3,
        data: { value: 1, label: '1', points: [1, 2, 3].map((p) => ({ label: `${p}`, value: p })) },
      });
    });

    it('should render upper line', () => {
      expect(rendered[1]).to.eql({
        type: 'path',
        d: `${forward}`,
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 1, label: '1', points: [1, 2, 3].map((p) => ({ label: `${p}`, value: p })) },
      });
    });

    it('should render lower line', () => {
      expect(rendered[1]).to.eql({
        type: 'path',
        d: 'M0,100L200,200L400,300',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 1, label: '1', points: [1, 2, 3].map((p) => ({ label: `${p}`, value: p })) },
      });
    });
  });

  describe('multiple layers', () => {
    before(() => {
      const config = {
        data: [1, 2, 1, 3, 4, 3],
        settings: {
          coordinates: {
            major(a, i) {
              return i % 3;
            },
            minor(b) {
              return b.datum.value;
            },
            layerId(a, i) {
              return i < 3 ? 1 : 2;
            }, // first 3 points belong to layer 1, the rest to layer 2
          },
          layers: {},
        },
      };

      componentFixture.mocks().theme.style.returns({});
      componentFixture.simulateCreate(component, config);
      rendered = componentFixture.simulateRender(opts);
    });
    it('of which first renders a line', () => {
      expect(rendered[0]).to.eql({
        type: 'path',
        d: 'M0,100L200,200L400,100',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 1, label: '1', points: [1, 2, 1].map((p) => ({ label: `${p}`, value: p })) },
      });
    });

    it('of which second render a line', () => {
      expect(rendered[1]).to.eql({
        type: 'path',
        d: 'M0,300L200,400L400,300',
        fill: 'none',
        stroke: '#ccc',
        strokeLinejoin: 'miter',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 3, label: '3', points: [3, 4, 3].map((p) => ({ label: `${p}`, value: p })) },
      });
    });
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
