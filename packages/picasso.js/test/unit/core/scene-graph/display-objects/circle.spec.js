import Circle, { create as createCircle } from '../../../../../src/core/scene-graph/display-objects/circle';
import GeoRect from '../../../../../src/core/geometry/rect';
import GeoCircle from '../../../../../src/core/geometry/circle';

describe('Circle', () => {
  let circle;
  let shape;

  beforeEach(() => {
    shape = {
      cx: 0,
      cy: 0,
      r: 0
    };
  });

  describe('Constructor', () => {
    it('should instantiate a new Circle', () => {
      circle = createCircle();
      expect(circle).to.be.an.instanceof(Circle);
      expect(circle.attrs.cx).to.be.equal(0);
      expect(circle.attrs.cy).to.be.equal(0);
      expect(circle.attrs.r).to.be.equal(0);
      expect(circle.collider()).to.be.a('object');
      expect(circle.collider().fn).to.be.an.instanceof(GeoCircle);
      expect(circle.collider().type).to.equal('circle');
    });

    it('should accept arguments', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 5;
      shape.collider = { type: 'rect' };
      circle = createCircle(shape);
      expect(circle.attrs.cx).to.be.equal(10);
      expect(circle.attrs.cy).to.be.equal(20);
      expect(circle.attrs.r).to.be.equal(5);
      expect(circle.collider()).to.be.a('object');
      expect(circle.collider().fn).to.be.an.instanceof(GeoRect);
      expect(circle.collider().type).to.equal('rect');
    });
  });

  describe('Set', () => {
    it('should set correct values', () => {
      circle = createCircle(shape);
      circle.set({ cx: 99, cy: 999, r: 9, collider: { type: 'rect' } });
      expect(circle.attrs.cx).to.be.equal(99);
      expect(circle.attrs.cy).to.be.equal(999);
      expect(circle.attrs.r).to.be.equal(9);
      expect(circle.collider()).to.be.a('object');
      expect(circle.collider().fn).to.be.an.instanceof(GeoRect);
      expect(circle.collider().type).to.equal('rect');
    });

    it('should default to zero cx', () => {
      circle = createCircle();
      circle.set({ cy: 999, r: 9 });
      expect(circle.attrs.cx).to.be.equal(0);
    });

    it('should default to zero cy', () => {
      circle = createCircle();
      circle.set({ cx: 999, r: 9 });
      expect(circle.attrs.cy).to.be.equal(0);
    });

    it('should default to zero radius', () => {
      circle = createCircle();
      circle.set({ cx: 999, cy: 10 });
      expect(circle.attrs.r).to.be.equal(0);
    });

    it('should handle no arguments', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 5;
      circle = createCircle(shape);
      circle.set();
      expect(circle.attrs.cx).to.be.equal(0);
      expect(circle.attrs.cy).to.be.equal(0);
      expect(circle.attrs.r).to.be.equal(0);
      expect(circle.collider().fn).to.be.an.instanceof(GeoCircle);
    });

    it('should be able to disable the default collider', () => {
      circle = createCircle(shape);
      circle.set({ collider: { type: null } });
      expect(circle.collider()).to.equal(null);
    });
  });

  describe('BoundingRect', () => {
    it('should handle default values', () => {
      circle = createCircle(shape);
      expect(circle.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('should return correct value for a circle without transformation', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 5;
      circle = createCircle(shape);
      expect(circle.boundingRect()).to.deep.equal({ x: 5, y: 15, width: 10, height: 10 });
    });

    it('should return correct value for a circle with a scale transformation', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 5;
      shape.transform = 'scale(2, 3)';
      circle = createCircle(shape);
      circle.resolveLocalTransform();
      expect(circle.boundingRect(true)).to.deep.equal({ x: 10, y: 45, width: 20, height: 30 });
    });

    it('should return correct value for a circle with a translate transformation', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 5;
      shape.transform = 'translate(5, 10)';
      circle = createCircle(shape);
      circle.resolveLocalTransform();
      expect(circle.boundingRect(true)).to.deep.equal({ x: 10, y: 25, width: 10, height: 10 });
    });

    it('should return correct value for a circle with a rotate transformation', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 5;
      shape.transform = 'rotate(-45)';
      circle = createCircle(shape);
      circle.resolveLocalTransform();
      expect(circle.boundingRect(true)).to.deep.equal({ x: 14.14213562373095, y: 1.7763568394002505e-15, width: 14.14213562373095, height: 14.14213562373095 });
    });

    it('should return correct value for a circle with a negative vector direction', () => {
      shape.cx = -10;
      shape.cy = -20;
      shape.r = 5;
      circle = createCircle(shape);
      expect(circle.boundingRect()).to.deep.equal({ x: -15, y: -25, width: 10, height: 10 });
    });
  });

  describe('Bounds', () => {
    it('should handle default values', () => {
      circle = createCircle(shape);
      const e = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ];
      expect(circle.bounds()).to.deep.equal(e);
    });

    it('should return correct value for a circle without transformation', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 5;
      circle = createCircle(shape);
      const e = [
        { x: 5, y: 15 },
        { x: 15, y: 15 },
        { x: 15, y: 25 },
        { x: 5, y: 25 }
      ];
      expect(circle.bounds()).to.deep.equal(e);
    });

    it('should return correct value for a circle with a scale transformation', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 5;
      shape.transform = 'scale(2, 3)';
      circle = createCircle(shape);
      circle.resolveLocalTransform();
      const e = [
        { x: 10, y: 45 },
        { x: 30, y: 45 },
        { x: 30, y: 75 },
        { x: 10, y: 75 }
      ];
      expect(circle.bounds(true)).to.deep.equal(e);
    });

    it('should return correct value for a circle with a translate transformation', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 5;
      shape.transform = 'translate(5, 10)';
      circle = createCircle(shape);
      circle.resolveLocalTransform();
      const e = [
        { x: 10, y: 25 },
        { x: 20, y: 25 },
        { x: 20, y: 35 },
        { x: 10, y: 35 }
      ];
      expect(circle.bounds(true)).to.deep.equal(e);
    });

    it('should return correct value for a circle with a rotate transformation', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 5;
      shape.transform = 'rotate(-45)';
      circle = createCircle(shape);
      circle.resolveLocalTransform();
      const e = [
        { x: 14.14213562373095, y: 1.7763568394002505e-15 },
        { x: 28.2842712474619, y: 1.7763568394002505e-15 },
        { x: 28.2842712474619, y: 14.142135623730951 },
        { x: 14.14213562373095, y: 14.142135623730951 }
      ];
      expect(circle.bounds(true)).to.deep.equal(e);
    });

    it('should return correct value for a circle with a negative vector direction', () => {
      shape.cx = -10;
      shape.cy = -20;
      shape.r = 5;
      circle = createCircle(shape);
      const e = [
        { x: -15, y: -25 },
        { x: -5, y: -25 },
        { x: -5, y: -15 },
        { x: -15, y: -15 }
      ];
      expect(circle.bounds()).to.deep.equal(e);
    });
  });

  describe('containsPoint', () => {
    it('should include transformation when resolving point', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 1;
      shape.transform = 'translate(5, 10)';
      circle = createCircle(shape);
      circle.resolveLocalTransform();

      expect(circle.containsPoint({ x: 15, y: 30 })).to.equal(true);
    });
  });

  describe('intersectsLine', () => {
    it('should include transformation when resolving line', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 1;
      shape.transform = 'translate(5, 10)';
      circle = createCircle(shape);
      circle.resolveLocalTransform();

      expect(circle.intersectsLine({ x1: 15, y1: 30, x2: 16, y2: 31 })).to.equal(true);
    });
  });

  describe('intersectsRect', () => {
    it('should include transformation when resolving rect', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 1;
      shape.transform = 'translate(5, 10)';
      circle = createCircle(shape);
      circle.resolveLocalTransform();

      expect(circle.intersectsRect({ x: 15, y: 30, width: 1, height: 1 })).to.equal(true);
    });
  });

  describe('intersectsCircle', () => {
    it('should include transformation when resolving circle', () => {
      shape.cx = 10;
      shape.cy = 20;
      shape.r = 1;
      shape.transform = 'translate(5, 10)';
      circle = createCircle(shape);
      circle.resolveLocalTransform();

      expect(circle.intersectsCircle({ cx: 15, cy: 30, r: 1 })).to.equal(true);
    });
  });

  describe('intersectsPolygon', () => {
    it('should include transformation when resolving polygon', () => {
      shape.cx = 125;
      shape.cy = 115;
      shape.r = 1;
      shape.transform = 'translate(-100, -100)';
      circle = createCircle(shape);
      circle.resolveLocalTransform();

      const vertices = [
        { x: 0, y: 25 },
        { x: 25, y: 0 },
        { x: 50, y: 25 },
        { x: 0, y: 25 }
      ];

      expect(circle.intersectsPolygon({ vertices })).to.equal(true);
    });
  });
});
