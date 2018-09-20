import Line, { create as createLine } from '../../../../../src/core/scene-graph/display-objects/line';
import GeoRect from '../../../../../src/core/geometry/rect';
import GeoLine from '../../../../../src/core/geometry/line';

describe('Line', () => {
  let line;
  let shape;

  beforeEach(() => {
    shape = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0
    };
  });

  describe('Constructor', () => {
    it('should instantiate a new Line', () => {
      line = createLine();
      expect(line).to.be.an.instanceof(Line);
      expect(line.attrs.x1).to.be.equal(0);
      expect(line.attrs.y1).to.be.equal(0);
      expect(line.attrs.x2).to.be.equal(0);
      expect(line.attrs.y2).to.be.equal(0);
      expect(line.collider).to.be.an.instanceof(GeoLine);
      expect(line.colliderType).to.equal('line');
    });

    it('should accept arguments', () => {
      shape.x1 = 10;
      shape.y1 = 20;
      shape.x2 = 100;
      shape.y2 = 200;
      shape.collider = { type: 'rect' };
      line = createLine(shape);
      expect(line.attrs.x1).to.be.equal(10);
      expect(line.attrs.y1).to.be.equal(20);
      expect(line.attrs.x2).to.be.equal(100);
      expect(line.attrs.y2).to.be.equal(200);
      expect(line.collider).to.be.an.instanceof(GeoRect);
      expect(line.colliderType).to.equal('rect');
    });
  });

  describe('Set', () => {
    it('should set correct values', () => {
      line = createLine(shape);
      line.set({
        x1: 10, y1: 20, x2: 100, y2: 200, collider: { type: 'rect' }
      });
      expect(line.attrs.x1).to.be.equal(10);
      expect(line.attrs.y1).to.be.equal(20);
      expect(line.attrs.x2).to.be.equal(100);
      expect(line.attrs.y2).to.be.equal(200);
      expect(line.collider).to.be.an.instanceof(GeoRect);
      expect(line.colliderType).to.equal('rect');
    });

    it('should handle no arguments', () => {
      line = createLine(shape);
      line.set();
      expect(line.attrs.x1).to.be.equal(0);
      expect(line.attrs.y1).to.be.equal(0);
      expect(line.attrs.x2).to.be.equal(0);
      expect(line.attrs.y2).to.be.equal(0);
      expect(line.collider).to.be.an.instanceof(GeoLine);
      expect(line.colliderType).to.equal('line');
    });

    it('should be able to disable the default collider', () => {
      line = createLine(shape);
      line.set({ collider: { type: null } });
      expect(line.collider).to.equal(null);
    });
  });

  describe('BoundingRect', () => {
    it('should handle default values', () => {
      line = createLine(shape);
      expect(line.boundingRect()).to.deep.equal({
        x: 0, y: 0, width: 0, height: 0
      });
    });

    it('should return correct value without transformation', () => {
      shape.x1 = 10;
      shape.y1 = 20;
      shape.x2 = 100;
      shape.y2 = 200;
      line = createLine(shape);
      expect(line.boundingRect()).to.deep.equal({
        x: 10, y: 20, width: 90, height: 180
      });
    });

    it('should return correct value with a scale transformation', () => {
      shape.x1 = 1;
      shape.y1 = 2;
      shape.x2 = 3;
      shape.y2 = 4;
      shape.transform = 'scale(2, 3)';
      line = createLine(shape);
      line.resolveLocalTransform();
      expect(line.boundingRect(true)).to.deep.equal({
        x: 2, y: 6, width: 4, height: 6
      });
    });

    it('should return correct value with a translate transformation', () => {
      shape.x1 = 1;
      shape.y1 = 2;
      shape.x2 = 3;
      shape.y2 = 4;
      shape.transform = 'translate(1, 2)';
      line = createLine(shape);
      line.resolveLocalTransform();
      expect(line.boundingRect(true)).to.deep.equal({
        x: 2, y: 4, width: 2, height: 2
      });
    });

    it('should return correct value with a rotate transformation', () => {
      shape.x1 = 1;
      shape.y1 = 2;
      shape.x2 = 3;
      shape.y2 = 4;
      shape.transform = 'rotate(-45)';
      line = createLine(shape);
      line.resolveLocalTransform();
      // TODO Should height/width be zero on a axis aligned line? Account for EPSILON?
      expect(line.boundingRect(true)).to.deep.equal({
        x: 2.1213203435596424, y: 0.7071067811865477, width: 2.8284271247461903, height: 1
      });
    });

    it('should return correct value with a negative vector direction', () => {
      shape.x1 = -1;
      shape.y1 = -2;
      shape.x2 = -3;
      shape.y2 = -4;
      line = createLine(shape);
      expect(line.boundingRect()).to.deep.equal({
        x: -3, y: -4, width: 2, height: 2
      });
    });
  });

  describe('Bounds', () => {
    it('should handle default values', () => {
      line = createLine(shape);
      const e = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ];
      expect(line.bounds()).to.deep.equal(e);
    });

    it('should return correct value without transformation', () => {
      shape.x1 = 1;
      shape.y1 = 2;
      shape.x2 = 3;
      shape.y2 = 4;
      line = createLine(shape);
      const e = [
        { x: 1, y: 2 },
        { x: 3, y: 2 },
        { x: 3, y: 4 },
        { x: 1, y: 4 }
      ];
      expect(line.bounds()).to.deep.equal(e);
    });

    it('should return correct value with a scale transformation', () => {
      shape.x1 = 1;
      shape.y1 = 2;
      shape.x2 = 3;
      shape.y2 = 4;
      shape.transform = 'scale(2, 3)';
      line = createLine(shape);
      line.resolveLocalTransform();
      const e = [
        { x: 2, y: 6 },
        { x: 6, y: 6 },
        { x: 6, y: 12 },
        { x: 2, y: 12 }
      ];
      expect(line.bounds(true)).to.deep.equal(e);
    });

    it('should return correct value with a translate transformation', () => {
      shape.x1 = 1;
      shape.y1 = 2;
      shape.x2 = 3;
      shape.y2 = 4;
      shape.transform = 'translate(1, 2)';
      line = createLine(shape);
      line.resolveLocalTransform();
      const e = [
        { x: 2, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 6 },
        { x: 2, y: 6 }
      ];
      expect(line.bounds(true)).to.deep.equal(e);
    });

    it('should return correct value with a rotate transformation', () => {
      shape.x1 = 1;
      shape.y1 = 2;
      shape.x2 = 3;
      shape.y2 = 4;
      shape.transform = 'rotate(-45)';
      line = createLine(shape);
      line.resolveLocalTransform();
      const e = [
        { x: 2.1213203435596424, y: 0.7071067811865477 },
        { x: 4.949747468305833, y: 0.7071067811865477 },
        { x: 4.949747468305833, y: 1.7071067811865477 },
        { x: 2.1213203435596424, y: 1.7071067811865477 }
      ];
      expect(line.bounds(true)).to.deep.equal(e);
    });

    it('should return correct value with a negative vector direction', () => {
      shape.x1 = -1;
      shape.y1 = -2;
      shape.x2 = -3;
      shape.y2 = -4;
      line = createLine(shape);
      const e = [
        { x: -3, y: -4 },
        { x: -1, y: -4 },
        { x: -1, y: -2 },
        { x: -3, y: -2 }
      ];
      expect(line.bounds()).to.deep.equal(e);
    });
  });

  describe('containsPoint', () => {
    it('should include transformation when resolving collision', () => {
      shape.x1 = 0;
      shape.y1 = 0;
      shape.x2 = 0;
      shape.y2 = 4;
      shape.transform = 'translate(1, 2)';
      line = createLine(shape);
      line.resolveLocalTransform();
      const p = { x: 1, y: 5 };

      expect(line.containsPoint(p)).to.equal(true);
    });
  });

  describe('intersectsRect', () => {
    it('should include transformation when resolving collision', () => {
      shape.x1 = 0;
      shape.y1 = 0;
      shape.x2 = 0;
      shape.y2 = 4;
      shape.transform = 'translate(1, 2)';
      line = createLine(shape);
      line.resolveLocalTransform();
      const rect = {
        x: 1, y: 5, width: 1, height: 1
      };

      expect(line.intersectsRect(rect)).to.equal(true);
    });
  });

  describe('intersectsLine', () => {
    it('should include transformation when resolving collision', () => {
      shape.x1 = 0;
      shape.y1 = 0;
      shape.x2 = 0;
      shape.y2 = 4;
      shape.transform = 'translate(1, 2)';
      line = createLine(shape);
      line.resolveLocalTransform();
      const l = {
        x1: 1, y1: 5, x2: 2, y2: 5
      };

      expect(line.intersectsLine(l)).to.equal(true);
    });
  });

  describe('intersectsCircle', () => {
    it('should include transformation when resolving collision', () => {
      shape.x1 = 0;
      shape.y1 = 0;
      shape.x2 = 0;
      shape.y2 = 4;
      shape.transform = 'translate(1, 2)';
      line = createLine(shape);
      line.resolveLocalTransform();
      const c = { cx: 1, cy: 5, r: 1 };

      expect(line.intersectsCircle(c)).to.equal(true);
    });
  });

  describe('intersectsPolygon', () => {
    it('should include transformation when resolving collision', () => {
      shape.x1 = 115;
      shape.y1 = 125;
      shape.x2 = 115;
      shape.y2 = 104;
      shape.transform = 'translate(-100, -100)';
      line = createLine(shape);
      line.resolveLocalTransform();

      const vertices = [
        { x: 0, y: 25 },
        { x: 25, y: 0 },
        { x: 50, y: 25 },
        { x: 0, y: 25 }
      ];

      expect(line.intersectsPolygon({ vertices })).to.equal(true);
    });
  });
});
