import componentFactoryFixture from '../../../helpers/component-factory-fixture';
import component, { arcValue } from '../../../../src/core/chart-components/pie/pie';

describe('pie', () => {
  let rendered;
  let componentFixture;
  let opts;

  beforeEach(() => {
    opts = {
      inner: {
        x: 10, y: 20, width: 100, height: 200
      }
    };
    componentFixture = componentFactoryFixture();
  });

  it('should render slices with default settings', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [1]
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    const d = rendered[0].d.split('A');
    const m = d[0].replace('M', '').split(',').map(Math.round);
    const a1 = d[1].split(',').map(Math.round);
    const a2 = d[2].replace('Z', '').split(',').map(Math.round);

    expect(m).to.eql([0, -40]);
    expect(a1).to.eql([40, 40, 0, 1, 1, -0, 40]);
    expect(a2).to.eql([40, 40, 0, 1, 1, 0, -40]);

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
        share: 1
      }
    });
  });

  it('should set share metadata', () => {
    componentFixture.mocks().theme.style.returns({});
    const config = {
      data: [1, 2, 3, 4]
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
      data: [1, NaN, 2, -1, 3, 4]
    };

    componentFixture.simulateCreate(component, config);
    rendered = componentFixture.simulateRender(opts);

    expect(rendered.map(r => r.data.value)).to.deep.equal([1, 2, 3, 4]);
  });

  describe('arcValue', () => {
    it('should default to data.value', () => {
      expect(arcValue({}, {
        data: { value: 4 }
      })).to.equal(4);
    });

    it('should prioritize .arc', () => {
      expect(arcValue({
        slice: {
          arc: ''
        }
      }, {
        arc: 9,
        data: { value: 4 }
      })).to.equal(9);
    });
  });

  describe('configured slices', () => {
    let d;
    before(() => {
      componentFixture.mocks().theme.style.returns({
        slice: {
          fill: 'red',
          stroke: 'blue'
        }
      });
      const config = {
        data: [1, 1, 1],
        settings: {
          slice: {
            offset: 0.2
          }
        }
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
        data: { value: 1, label: '1' }
      });
    });

    it('should render first slice', () => {
      d = rendered[0].d.split(/[MALZ]/).map(arr => (arr ? arr.split(',').map(Math.round) : []));
      expect(d[1]).to.eql([0, -40]); // move to
      expect(d[2]).to.eql([40, 40, 0, 0, 1, 35, 20]); // arc
      expect(d[3]).to.eql([0, 0]); // line to

      const t = rendered[0].transform.split(') ').map(arr => (arr.replace(/translate\(|\)/g, '').split(', ').map(Math.round)));
      expect(t[0]).to.eql([7, -4]);
      expect(t[1]).to.eql([50, 100]);
    });

    it('should render second slice', () => {
      d = rendered[1].d.split(/[MALZ]/).map(arr => (arr ? arr.split(',').map(Math.round) : []));
      expect(d[1]).to.eql([35, 20]); // move to
      expect(d[2]).to.eql([40, 40, 0, 0, 1, -35, 20]); // arc
      expect(d[3]).to.eql([0, 0]); // line to
    });

    it('should render third slice', () => {
      d = rendered[2].d.split(/[MALZ]/).map(arr => (arr ? arr.split(',').map(Math.round) : []));
      expect(d[1]).to.eql([-35, 20]); // move to
      expect(d[2]).to.eql([40, 40, 0, 0, 1, -0, -40]); // arc
      expect(d[3]).to.eql([0, 0]); // line to
    });
  });
});
