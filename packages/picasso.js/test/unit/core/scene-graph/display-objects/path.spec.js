import Path, { create } from '../../../../../src/core/scene-graph/display-objects/path';
import GeometryCollection from '../../../../../src/core/geometry/geometry-collection';

describe('Path', () => {
  let path;
  let d;

  describe('Constructor', () => {
    it('should instantiate a new Path', () => {
      path = create();
      expect(path).to.be.an.instanceof(Path);
      expect(path.attrs.d).to.be.equal(undefined);
      expect(path.collider()).to.be.equal(null);
    });

    it('should accept arguments', () => {
      path = create({ d: 'M10 15' });
      expect(path).to.be.an.instanceof(Path);
      expect(path.attrs.d).to.be.equal('M10 15');
      expect(path.collider()).to.be.a('object');
      expect(path.collider().fn).to.be.an.instanceof(GeometryCollection);
      expect(path.collider().type).to.equal('collection');
    });
  });

  describe('BoundingRect', () => {
    it('should handle default values', () => {
      path = create();
      expect(path.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('without transform', () => {
      d = 'M0 0 L100 0 L100 150 L0 150';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 100, height: 150 });
    });

    it('with transform', () => {
      d = 'M0 0 L100 0 L100 150 L0 150';
      const transform = 'translate(10, 15)';
      path = create({ d, transform });
      path.resolveLocalTransform();
      expect(path.boundingRect(true)).to.deep.equal({ x: 10, y: 15, width: 100, height: 150 });
    });

    it('with close command', () => {
      d = 'M0 0 L100 0 L100 150 L0 150 Z';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 100, height: 150 });

      d = 'M0 0 L100 0 L100 150 L0 150 z';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 100, height: 150 });
    });

    it('with lineTo delta command', () => {
      d = 'M0 0 l 100 0 l 0 150 l -100 0';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 100, height: 150 });
    });

    it('with moveTo delta command', () => {
      d = 'M0 0 L 100 0 m 0 150 L 100 150';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 100, height: 150 });
    });

    it('should use cached path to points', () => {
      path = create();
      path.points = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 150 },
        { x: 0, y: 150 }
      ];
      expect(path.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 100, height: 150 });
    });

    it('should handle unknown commands', () => {
      d = 'M0 0 L100 0 L100 150 K150 150 L0 150'; // Ignore K and threat it as 4 L arguments
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 150, height: 150 });
    });

    it('should ignore bogus commands', () => {
      d = 'M0 0 L100 0 L100 150 well hello there L0 150';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 100, height: 150 });
    });

    it('should handle decimal characters', () => {
      d = 'M0 0 L100.1 0 L100.1 150.2 L0 150.2';
      path = create({ d });
      expect(path.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 100.1, height: 150.2 });
    });
  });

  describe('Bounds', () => {
    it('should handle default values', () => {
      path = create();
      expect(path.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ]);
    });

    it('without transform', () => {
      d = 'M0 0 L100 0 L100 150 L0 150';
      path = create({ d });
      expect(path.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 150 },
        { x: 0, y: 150 }
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
        { x: 10, y: 165 }
      ]);
    });

    it('with close command', () => {
      d = 'M0 0 L100 0 L100 150 L0 150 Z';
      path = create({ d });
      expect(path.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 150 },
        { x: 0, y: 150 }
      ]);
    });

    it('with lineTo delta command', () => {
      d = 'M0 0 l 100 0 l 0 150 l -100 0';
      path = create({ d });
      expect(path.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 150 },
        { x: 0, y: 150 }
      ]);
    });

    it('with moveTo delta command', () => {
      d = 'M0 0 L 100 0 m 0 150 L 100 150';
      path = create({ d });
      expect(path.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 150 },
        { x: 0, y: 150 }
      ]);
    });
  });
});
