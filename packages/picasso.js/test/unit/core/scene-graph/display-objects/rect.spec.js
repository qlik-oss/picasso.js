import Rect, { create as createRect } from '../../../../../src/core/scene-graph/display-objects/rect';
import GeoRect from '../../../../../src/core/geometry/rect';
import GeoCircle from '../../../../../src/core/geometry/circle';

describe('Rect', () => {
  let rect;
  let shape;

  beforeEach(() => {
    shape = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  });

  describe('Constructor', () => {
    it('should instantiate a new Rect', () => {
      rect = createRect();
      expect(rect).to.be.an.instanceof(Rect);
      expect(rect.attrs.x).to.be.equal(0);
      expect(rect.attrs.y).to.be.equal(0);
      expect(rect.attrs.width).to.be.equal(0);
      expect(rect.attrs.height).to.be.equal(0);
      expect(rect.collider()).to.be.a('object');
      expect(rect.collider().fn).to.be.an.instanceof(GeoRect);
      expect(rect.collider().type).to.equal('rect');
    });

    it('should accept arguments', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 15;
      shape.height = 25;
      shape.collider = { type: 'circle' };
      rect = createRect(shape);
      expect(rect.attrs.x).to.be.equal(10);
      expect(rect.attrs.y).to.be.equal(20);
      expect(rect.attrs.width).to.be.equal(15);
      expect(rect.attrs.height).to.be.equal(25);
      expect(rect.collider()).to.be.a('object');
      expect(rect.collider().fn).to.be.an.instanceof(GeoCircle);
      expect(rect.collider().type).to.equal('circle');
    });
  });

  describe('Set', () => {
    it('should set correct values', () => {
      rect = createRect(shape);
      rect.set({
        x: 99, y: 999, width: 1337, height: 101, collider: { type: 'circle' }
      });
      expect(rect.attrs.x).to.be.equal(99);
      expect(rect.attrs.y).to.be.equal(999);
      expect(rect.attrs.width).to.be.equal(1337);
      expect(rect.attrs.height).to.be.equal(101);
      expect(rect.collider()).to.be.a('object');
      expect(rect.collider().fn).to.be.an.instanceof(GeoCircle);
      expect(rect.collider().type).to.equal('circle');
    });

    it('should handle no arguments', () => {
      rect = createRect(shape);
      rect.set();
      expect(rect.attrs.x).to.be.equal(0);
      expect(rect.attrs.y).to.be.equal(0);
      expect(rect.attrs.width).to.be.equal(0);
      expect(rect.attrs.height).to.be.equal(0);
      expect(rect.collider().fn).to.be.an.instanceof(GeoRect);
    });

    it('should be able to disable the default collider', () => {
      rect = createRect(shape);
      rect.set({ collider: { type: null } });
      expect(rect.collider()).to.equal(null);
    });
  });

  describe('BoundingRect', () => {
    it('should handle default values', () => {
      rect = createRect(shape);
      expect(rect.boundingRect()).to.deep.equal({
        x: 0, y: 0, width: 0, height: 0
      });
    });

    it('should return correct value without transformation', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 15;
      shape.height = 25;
      rect = createRect(shape);
      expect(rect.boundingRect()).to.deep.equal({
        x: 10, y: 20, width: 15, height: 25
      });
    });

    it('should return correct value with a scale transformation', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 15;
      shape.height = 25;
      shape.transform = 'scale(2, 3)';
      rect = createRect(shape);
      rect.resolveLocalTransform();
      expect(rect.boundingRect(true)).to.deep.equal({
        x: 20, y: 60, width: 30, height: 75
      });
    });

    it('should return correct value with a translate transformation', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 15;
      shape.height = 25;
      shape.transform = 'translate(1, 2)';
      rect = createRect(shape);
      rect.resolveLocalTransform();
      expect(rect.boundingRect(true)).to.deep.equal({
        x: 11, y: 22, width: 15, height: 25
      });
    });

    it('should return correct value with a rotate transformation', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 15;
      shape.height = 25;
      shape.transform = 'rotate(-45)';
      rect = createRect(shape);
      rect.resolveLocalTransform();
      expect(rect.boundingRect(true)).to.deep.equal({
        x: 21.213203435596427, y: -3.535533905932734, width: 28.284271247461902, height: 28.2842712474619
      });
    });

    it('should return correct value with a negative vector direction', () => {
      shape.x = -10;
      shape.y = -20;
      shape.width = 15;
      shape.height = 25;
      rect = createRect(shape);
      expect(rect.boundingRect()).to.deep.equal({
        x: -10, y: -20, width: 15, height: 25
      });
    });
  });

  describe('Bounds', () => {
    it('should handle default values', () => {
      rect = createRect(shape);
      const e = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ];
      expect(rect.bounds()).to.deep.equal(e);
    });

    it('should return correct value without transformation', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 15;
      shape.height = 25;
      rect = createRect(shape);
      const e = [
        { x: 10, y: 20 },
        { x: 25, y: 20 },
        { x: 25, y: 45 },
        { x: 10, y: 45 }
      ];
      expect(rect.bounds()).to.deep.equal(e);
    });

    it('should return correct value with a scale transformation', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 15;
      shape.height = 25;
      shape.transform = 'scale(2, 3)';
      rect = createRect(shape);
      rect.resolveLocalTransform();
      const e = [
        { x: 20, y: 60 },
        { x: 50, y: 60 },
        { x: 50, y: 135 },
        { x: 20, y: 135 }
      ];
      expect(rect.bounds(true)).to.deep.equal(e);
    });

    it('should return correct value with a translate transformation', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 15;
      shape.height = 25;
      shape.transform = 'translate(5, 10)';
      rect = createRect(shape);
      rect.resolveLocalTransform();
      const e = [
        { x: 15, y: 30 },
        { x: 30, y: 30 },
        { x: 30, y: 55 },
        { x: 15, y: 55 }
      ];
      expect(rect.bounds(true)).to.deep.equal(e);
    });

    it('should return correct value with a rotate transformation', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 15;
      shape.height = 25;
      shape.transform = 'rotate(-45)';
      rect = createRect(shape);
      rect.resolveLocalTransform();
      const e = [
        { x: 21.213203435596427, y: -3.535533905932734 },
        { x: 49.49747468305833, y: -3.535533905932734 },
        { x: 49.49747468305833, y: 24.748737341529164 },
        { x: 21.213203435596427, y: 24.748737341529164 }
      ];
      expect(rect.bounds(true)).to.deep.equal(e);
    });

    it('should return correct value with a negative vector direction', () => {
      shape.x = -10;
      shape.y = -20;
      shape.width = 15;
      shape.height = 25;
      rect = createRect(shape);
      const e = [
        { x: -10, y: -20 },
        { x: 5, y: -20 },
        { x: 5, y: 5 },
        { x: -10, y: 5 }
      ];
      expect(rect.bounds()).to.deep.equal(e);
    });
  });

  describe('containsPoint', () => {
    it('should include transformation when resolving point', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 1;
      shape.height = 1;
      shape.transform = 'translate(5, 10)';
      rect = createRect(shape);
      rect.resolveLocalTransform();

      expect(rect.containsPoint({ x: 15, y: 30 })).to.equal(true);
    });
  });

  describe('intersectsLine', () => {
    it('should include transformation when resolving line', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 1;
      shape.height = 1;
      shape.transform = 'translate(5, 10)';
      rect = createRect(shape);
      rect.resolveLocalTransform();

      expect(rect.intersectsLine({
        x1: 15, y1: 30, x2: 16, y2: 31
      })).to.equal(true);
    });
  });

  describe('intersectsRect', () => {
    it('should include transformation when resolving rect', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 1;
      shape.height = 1;
      shape.transform = 'translate(5, 10)';
      rect = createRect(shape);
      rect.resolveLocalTransform();

      expect(rect.intersectsRect({
        x: 15, y: 30, width: 1, height: 1
      })).to.equal(true);
    });
  });

  describe('intersectsCircle', () => {
    it('should include transformation when resolving rect', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 1;
      shape.height = 1;
      shape.transform = 'translate(5, 10)';
      rect = createRect(shape);
      rect.resolveLocalTransform();

      expect(rect.intersectsCircle({ cx: 15, cy: 30, r: 1 })).to.equal(true);
    });
  });

  describe('intersectsPolygon', () => {
    it('should include transformation when resolving rect', () => {
      shape.x = 110;
      shape.y = 120;
      shape.width = 10;
      shape.height = 10;
      shape.transform = 'translate(-100, -100)';
      rect = createRect(shape);
      rect.resolveLocalTransform();

      const vertices = [
        { x: 0, y: 25 },
        { x: 25, y: 0 },
        { x: 50, y: 25 },
        { x: 0, y: 25 }
      ];

      expect(rect.intersectsPolygon({ vertices })).to.equal(true);
    });
  });
});
