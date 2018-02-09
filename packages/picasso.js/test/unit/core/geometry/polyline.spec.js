import { create } from '../../../../src/core/geometry/polyline';
import { create as createPolygon } from '../../../../src/core/geometry/polygon';
import { rectToPoints, lineToPoints } from '../../../../src/core/geometry/util';

describe('Polyline', () => {
  let p;
  let points;

  beforeEach(() => {
    points = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 }
    ];
  });

  it('should omit duplicate points', () => {
    points.push({ x: 5, y: 6 }); // Add a 3rd segment
    p = create({ points });
    expect(p.segments).to.be.of.length(2);
  });

  describe('constructor', () => {
    it('should set correct default values', () => {
      p = create();
      expect(p.points()).to.be.empty;
      expect(p.segments).to.be.empty;
    });

    it('should set correct values', () => {
      p = create({ points });
      expect(p.points()).to.deep.equal(points);
      expect(p.segments).to.deep.equal([
        { x1: 1, y1: 2, x2: 3, y2: 4 },
        { x1: 3, y1: 4, x2: 5, y2: 6 }
      ]);
    });
  });

  describe('set', () => {
    it('should set correct values', () => {
      p = create();
      p.set({ points });

      expect(p.points()).to.deep.equal(points);
      expect(p.segments).to.deep.equal([
        { x1: 1, y1: 2, x2: 3, y2: 4 },
        { x1: 3, y1: 4, x2: 5, y2: 6 }
      ]);
    });
  });

  describe('containsPoint', () => {
    it('should return true if intersection', () => {
      p = create({ points });

      expect(p.containsPoint({ x: 3, y: 4 })).to.be.true;
    });

    it('should return false if no intersection', () => {
      p = create({ points });

      expect(p.containsPoint({ x: 30, y: 14 })).to.be.false;
    });
  });

  describe('intersectsCircle', () => {
    it('should return true if intersection', () => {
      p = create({ points });

      expect(p.intersectsCircle({ cx: 5, cy: 5, r: 5 })).to.be.true;
    });

    it('should return false if no intersection', () => {
      p = create({ points });

      expect(p.intersectsCircle({ cx: 30, cy: 14, r: 1 })).to.be.false;
    });
  });

  describe('intersectsLine', () => {
    it('should return true if intersection', () => {
      p = create({ points });

      expect(p.intersectsLine(lineToPoints({ x1: 3, y1: 2, x2: 1, y2: 4 }))).to.be.true;
    });

    it('should return false if no intersection', () => {
      p = create({ points });

      expect(p.intersectsLine(lineToPoints({ x1: 30, y1: 20, x2: 10, y2: 40 }))).to.be.false;
    });
  });

  describe('intersectsRect', () => {
    it('should return true if intersection', () => {
      p = create({ points });

      expect(p.intersectsRect(rectToPoints({ x: 1, y: 4, width: 10, height: 10 }))).to.be.true;
    });

    it('should return false if no intersection', () => {
      p = create({ points });

      expect(p.intersectsRect(rectToPoints({ x: 10, y: 40, width: 10, height: 10 }))).to.be.false;
    });
  });

  describe('intersectsPolygon', () => {
    it('should return true if intersection', () => {
      p = create({ points });
      const pgon = createPolygon({ vertices: [
        { x: 3, y: 2 },
        { x: 1, y: 4 },
        { x: 0, y: 0 }
      ] });

      expect(p.intersectsPolygon(pgon)).to.be.true;
    });

    it('should return false if no intersection', () => {
      p = create({ points });
      const pgon = createPolygon({
        vertices: [
          { x: 30, y: 20 },
          { x: 10, y: 40 },
          { x: 10, y: 10 }
        ]
      });

      expect(p.intersectsPolygon(pgon)).to.be.false;
    });
  });
});
