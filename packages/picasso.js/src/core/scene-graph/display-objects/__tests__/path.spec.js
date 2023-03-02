import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import lineMarkerComponent from '../../../chart-components/line/line';
import Path, { create } from '../path';

describe('Path', () => {
  let path;

  describe('Constructor', () => {
    it('should instantiate a new Path', () => {
      path = create();
      expect(path).to.be.an.instanceof(Path);
      expect(path.attrs.d).to.be.equal(undefined);
      expect(path.collider).to.be.equal(null);
    });

    it('should accept arguments - case 1: svg path', () => {
      path = create({ d: 'M10 15' });
      expect(path).to.be.an.instanceof(Path);
      expect(path.attrs.d).to.be.equal('M10 15');
    });

    it('should accept arguments - case 2: pie arc datum', () => {
      path = create({
        arcDatum: { startAngle: (Math.PI * 4) / 3, endAngle: Math.PI * 2 },
        padAngle: 0,
        desc: { slice: { innerRadius: 0, cornerRadius: 0, outerRadius: 40 } },
      });
      expect(path).to.be.an.instanceof(Path);
      const strokes = path.attrs.d.split(/[MALZ]/).map((arr) => (arr ? arr.split(',').map(Math.round) : []));
      expect(strokes[1]).to.eql([-35, 20]); // move to
      expect(strokes[2]).to.eql([40, 40, 0, 0, 1, -0, -40]); // arc
      expect(strokes[3]).to.eql([0, 0]); // line to
    });

    describe('path for line', () => {
      let sandbox;
      let componentFixture;
      let opts;
      let lineNodes;

      beforeEach(() => {
        sandbox = sinon.createSandbox();
        opts = {
          inner: {
            x: 10,
            y: 20,
            width: 200,
            height: 100,
          },
        };
        componentFixture = componentFactoryFixture();
        componentFixture.mocks().theme.style.returns({});
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should render path for horizontal (default) line', () => {
        const config = {
          data: [1, 1, 1, 1],
        };

        componentFixture.simulateCreate(lineMarkerComponent, config);
        lineNodes = componentFixture.simulateRender(opts);
        path = create(lineNodes[0]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M100,50L100,50L100,50L100,50');
      });

      it('should render path for vertical line', () => {
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

        componentFixture.simulateCreate(lineMarkerComponent, config);
        lineNodes = componentFixture.simulateRender(opts);
        path = create(lineNodes[0]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M400,0L600,100L200,200');
      });

      it('should render disconnected path for line with minor null value', () => {
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

        componentFixture.simulateCreate(lineMarkerComponent, config);
        lineNodes = componentFixture.simulateRender(opts);
        path = create(lineNodes[0]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M0,200L200,300M600,100L800,200');
      });

      it('should render disconnected path for line with custom defined null values', () => {
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

        componentFixture.simulateCreate(lineMarkerComponent, config);
        lineNodes = componentFixture.simulateRender(opts);
        path = create(lineNodes[0]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M0,200L200,300M600,100L800,200');
      });

      it('should render connected path for line with custom defined null values, when connect is true', () => {
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

        componentFixture.simulateCreate(lineMarkerComponent, config);
        lineNodes = componentFixture.simulateRender(opts);
        path = create(lineNodes[0]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M0,200L200,300L600,100L800,200');
      });

      it('should render disconnected path for disconnected lines with unordered domain', () => {
        const domain = ['A', 'B', 'C', 'D', 'E'];
        const domainScale = (v) => domain.indexOf(v) / 4;
        domainScale.domain = () => domain;
        domainScale.range = () => [0, 1];
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

        componentFixture.simulateCreate(lineMarkerComponent, config);
        lineNodes = componentFixture.simulateRender(opts);
        path = create(lineNodes[0]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M0,300L50,200M150,100L200,0');
      });

      it('should render disconnected path for disconnected lines with unordered domain based on major data', () => {
        const domain = ['A', 'B', 'C', 'D', 'E'];
        const domainScale = (v) => domain.indexOf(v) / 4;
        domainScale.domain = () => domain;
        domainScale.range = () => [0, 1];
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

        componentFixture.simulateCreate(lineMarkerComponent, config);
        lineNodes = componentFixture.simulateRender(opts);
        path = create(lineNodes[0]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M0,300L50,200M150,100L200,0');
      });

      it('should render close path for area with default minor 0', () => {
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

        componentFixture.simulateCreate(lineMarkerComponent, config);
        lineNodes = componentFixture.simulateRender(opts);
        path = create(lineNodes[0]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M0,100L200,200L400,300L400,0L200,0L0,0Z');
      });

      it('should render close path for area with explicit minor0', () => {
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

        componentFixture.simulateCreate(lineMarkerComponent, config);
        lineNodes = componentFixture.simulateRender(opts);
        path = create(lineNodes[0]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M0,100L200,200L400,300L400,150L200,100L0,50Z');
        path = create(lineNodes[1]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M0,100L200,200L400,300');
        path = create(lineNodes[2]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M0,50L200,100L400,150');
      });

      it('should not render minor0 line when having minor0 but showMinor0 is false', () => {
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

        componentFixture.simulateCreate(lineMarkerComponent, config);
        lineNodes = componentFixture.simulateRender(opts);
        path = create(lineNodes[0]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M0,100L200,200L400,300L400,150L200,100L0,50Z');
        path = create(lineNodes[1]);
        expect(path).to.be.an.instanceof(Path);
        expect(path.attrs.d).to.equal('M0,100L200,200L400,300');
      });
    });
  });

  describe('Collider', () => {
    it('should require data path', () => {
      path = create({ d: null });
      expect(path.colliderType).to.equal(null);
    });

    it('should be able to disable collider', () => {
      path = create({ d: 'M10 15', collider: { type: null } });
      expect(path.colliderType).to.equal(null);
    });

    it('should disable collider if path only contains a single point', () => {
      path = create({ d: 'M10 15' });
      expect(path.colliderType).to.equal(null);
    });

    it('set explicit collider', () => {
      path = create({
        d: 'M10 15',
        collider: {
          type: 'rect',
          x: 0,
          y: 0,
          width: 1,
          height: 2,
        },
      });
      expect(path.colliderType).to.equal('rect');
    });

    it('deduce polygon collider from data path', () => {
      path = create({
        d: 'M0 0 L10 0, 10 10, 0 10 Z',
      });
      expect(path.colliderType).to.equal('polygon');
    });

    it('deduce polyline collider from data path', () => {
      path = create({
        d: 'M0 0 L10 0, 10 10, 0 10',
      });
      expect(path.colliderType).to.equal('polyline');
    });

    it('deduce visual polyline collider from data path', () => {
      path = create({
        d: 'M0 0 L10 0, 10 10, 0 10',
        collider: {
          visual: true,
        },
      });
      expect(path.colliderType).to.equal('polygon'); // Polyline is transform to polygon
    });
  });

  describe('BoundingRect', () => {
    let d;

    it('should handle default values', () => {
      path = create();
      expect(path.boundingRect()).to.deep.equal({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
    });

    it('without transform', () => {
      d = 'M0 0 L100 0 L100 150 L0 150';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({
        x: 0,
        y: 0,
        width: 100,
        height: 150,
      });
    });

    it('with transform', () => {
      d = 'M0 0 L100 0 L100 150 L0 150';
      const transform = 'translate(10, 15)';
      path = create({ d, transform });
      path.resolveLocalTransform();
      expect(path.boundingRect(true)).to.deep.equal({
        x: 10,
        y: 15,
        width: 100,
        height: 150,
      });
    });

    it('with close command', () => {
      d = 'M0 0 L100 0 L100 150 L0 150 Z';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({
        x: 0,
        y: 0,
        width: 100,
        height: 150,
      });

      d = 'M0 0 L100 0 L100 150 L0 150 z';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({
        x: 0,
        y: 0,
        width: 100,
        height: 150,
      });
    });

    it('with lineTo delta command', () => {
      d = 'M0 0 l 100 0 l 0 150 l -100 0';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({
        x: 0,
        y: 0,
        width: 100,
        height: 150,
      });
    });

    it('with moveTo delta command', () => {
      d = 'M0 0 L 100 0 m 0 150 L 100 150';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({
        x: 0,
        y: 0,
        width: 100,
        height: 150,
      });
    });

    it('should use cached path to points', () => {
      path = create();
      path.points = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 150 },
        { x: 0, y: 150 },
      ];
      expect(path.boundingRect()).to.deep.equal({
        x: 0,
        y: 0,
        width: 100,
        height: 150,
      });
    });

    it('should handle unknown commands', () => {
      d = 'M0 0 L100 0 L100 150 K150 150 L0 150'; // Ignore K and threat it as 4 L arguments
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({
        x: 0,
        y: 0,
        width: 150,
        height: 150,
      });
    });

    it('should ignore bogus commands', () => {
      d = 'M0 0 L100 0 L100 150 well hello there L0 150';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({
        x: 0,
        y: 0,
        width: 100,
        height: 150,
      });
    });

    it('should handle decimal characters', () => {
      d = 'M0 0 L100.1 0 L100.1 150.2 L0 150.2';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({
        x: 0,
        y: 0,
        width: 100.1,
        height: 150.2,
      });
    });
  });

  describe('Bounds', () => {
    let d;

    it('should handle default values', () => {
      path = create();
      expect(path.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ]);
    });

    it('without transform', () => {
      d = 'M0 0 L100 0 L100 150 L0 150';
      path = create({ d });
      expect(path.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 150 },
        { x: 0, y: 150 },
      ]);
    });

    it('with transform', () => {
      d = 'M0 0 L100 0 L100 150 L0 150';
      const transform = 'translate(10, 15)';
      path = create({ d, transform });
      path.resolveLocalTransform();
      expect(path.bounds(true)).to.deep.equal([
        { x: 10, y: 15 },
        { x: 110, y: 15 },
        { x: 110, y: 165 },
        { x: 10, y: 165 },
      ]);
    });

    it('with close command', () => {
      d = 'M0 0 L100 0 L100 150 L0 150 Z';
      path = create({ d });
      expect(path.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 150 },
        { x: 0, y: 150 },
      ]);
    });

    it('with lineTo delta command', () => {
      d = 'M0 0 l 100 0 l 0 150 l -100 0';
      path = create({ d });
      expect(path.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 150 },
        { x: 0, y: 150 },
      ]);
    });

    it('with moveTo delta command', () => {
      d = 'M0 0 L 100 0 m 0 150 L 100 150';
      path = create({ d });
      expect(path.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 150 },
        { x: 0, y: 150 },
      ]);
    });
  });
});
