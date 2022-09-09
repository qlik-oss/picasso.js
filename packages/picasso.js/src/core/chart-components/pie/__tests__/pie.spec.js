import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import component, { arcValue } from '../pie';

describe('pie', () => {
  let rendered;
  let componentFixture;
  let opts;

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
  });

  it('should render slices with default settings', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [1],
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    const { startAngle, endAngle } = rendered[0].arcDatum;
    expect(startAngle).to.eql(0);
    expect(endAngle).to.eql(Math.PI * 2);

    expect(rendered[0]).to.containSubset({
      arc: 1,
      type: 'path',
      transform: 'translate(0, 0) translate(50, 100)',
      cornerRadius: 0,
      innerRadius: 0,
      outerRadius: 0.8,
      offset: 0,
      label: '',
      fill: '#333',
      stroke: '#ccc',
      strokeWidth: 1,
      opacity: 1,
      data: { value: 1, label: '1' },
      desc: {
        share: 1,
      },
    });
  });

  it('should set share metadata', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [1, 2, 3, 4],
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered[0].desc.share).to.equal(0.1);
    expect(rendered[1].desc.share).to.equal(0.2);
    expect(rendered[2].desc.share).to.equal(0.3);
    expect(rendered[3].desc.share).to.equal(0.4);
  });

  it('should filter negative and NaN values', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [1, NaN, 2, -1, 3, 4],
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered.map((r) => r.data.value)).to.deep.equal([1, 2, 3, 4]);
  });

  it('should filter out outerRadius <= innerRadius', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [1, 2, 3],
      settings: {
        slice: {
          innerRadius: 0,
          outerRadius: {
            fn: (d, index) => (index === 1 ? -1 : 0.8),
          },
        },
      },
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered.map((r) => r.data.value)).to.deep.equal([1, 3]);
  });

  describe('arcValue', () => {
    it('should default to data.value', () => {
      expect(
        arcValue(
          {},
          {
            data: { value: 4 },
          }
        )
      ).to.equal(4);
    });

    it('should prioritize .arc', () => {
      expect(
        arcValue(
          {
            slice: {
              arc: '',
            },
          },
          {
            arc: 9,
            data: { value: 4 },
          }
        )
      ).to.equal(9);
    });
  });

  describe('configured slices', () => {
    before(() => {
      componentFixture.mocks().theme.style.returns({
        slice: {
          fill: 'red',
          stroke: 'blue',
        },
      });
      const config = {
        data: [1, 1, 1],
        settings: {
          slice: {
            offset: 0.2,
          },
        },
      };

      componentFixture.simulateCreate(component, config);
      rendered = componentFixture.simulateRender(opts);
    });

    it('should render with configured settings', () => {
      expect(rendered[0]).to.containSubset({
        arc: 1,
        type: 'path',
        cornerRadius: 0,
        innerRadius: 0,
        outerRadius: 0.8,
        offset: 0.2,
        label: '',
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 1,
        opacity: 1,
        data: { value: 1, label: '1' },
      });
    });

    it('should render first slice', () => {
      const { startAngle, endAngle } = rendered[0].arcDatum;
      expect(startAngle).to.eql(0);
      expect(endAngle).to.eql((Math.PI * 2) / 3);

      const t = rendered[0].transform.split(') ').map((arr) =>
        arr
          .replace(/translate\(|\)/g, '')
          .split(', ')
          .map(Math.round)
      );
      expect(t[0]).to.eql([7, -4]);
      expect(t[1]).to.eql([50, 100]);
    });

    it('should render second slice', () => {
      const { startAngle, endAngle } = rendered[1].arcDatum;
      expect(startAngle).to.eql((Math.PI * 2) / 3);
      expect(endAngle).to.eql((Math.PI * 4) / 3);
    });

    it('should render third slice', () => {
      const { startAngle, endAngle } = rendered[2].arcDatum;
      expect(startAngle).to.eql((Math.PI * 4) / 3);
      expect(endAngle).to.eql(Math.PI * 2);
    });
  });
});
