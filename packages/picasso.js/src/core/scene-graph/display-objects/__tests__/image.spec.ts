import Image, { create as createImage } from '../image';

describe('Image', () => {
  let image;
  let shape;

  beforeEach(() => {
    shape = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  });

  describe('Constructor', () => {
    it('should instantiate a new Image', () => {
      image = createImage();
      expect(image).to.be.an.instanceof(Image);
      expect(image.attrs.x).to.equal(0);
      expect(image.attrs.y).to.equal(0);
      expect(image.attrs.width).to.equal(0);
      expect(image.attrs.height).to.equal(0);
    });

    it('should accept arguments', () => {
      shape.x = 10;
      shape.y = 20;
      shape.width = 50;
      shape.height = 60;
      shape.src = 'img.png';
      shape.rx = 5;
      shape.ry = 10;
      shape.collider = { type: 'rect' };

      image = createImage(shape);
      expect(image.attrs.x).to.equal(10);
      expect(image.attrs.y).to.equal(20);
      expect(image.attrs.width).to.equal(50);
      expect(image.attrs.height).to.equal(60);
      expect(image.attrs.src).to.equal('img.png');
      expect(image.attrs.rx).to.equal(5);
      expect(image.attrs.ry).to.equal(10);
      expect(image.collider).to.deep.include({ type: 'rect' });
    });
  });

  describe('Set', () => {
    it('should update values correctly', () => {
      image = createImage();
      image.set({
        x: 5,
        y: 10,
        width: 20,
        height: 30,
        src: 'test.jpg',
        collider: { type: 'bounds' },
      });

      expect(image.attrs.x).to.equal(5);
      expect(image.attrs.y).to.equal(10);
      expect(image.attrs.width).to.equal(20);
      expect(image.attrs.height).to.equal(30);
      expect(image.attrs.src).to.equal('test.jpg');
      expect(image.collider).to.deep.include({ type: 'rect' });
    });

    it('should flip negative width and height', () => {
      image = createImage();
      image.set({
        x: 50,
        y: 50,
        width: -20,
        height: -40,
      });

      expect(image.attrs.x).to.equal(30); // x + width
      expect(image.attrs.y).to.equal(10); // y + height
      expect(image.attrs.width).to.equal(20);
      expect(image.attrs.height).to.equal(40);
    });

    it('should reset values if called with no arguments', () => {
      shape.x = 20;
      shape.y = 30;
      shape.width = 40;
      shape.height = 50;
      image = createImage(shape);
      image.set();
      expect(image.attrs.x).to.equal(0);
      expect(image.attrs.y).to.equal(0);
      expect(image.attrs.width).to.equal(0);
      expect(image.attrs.height).to.equal(0);
    });
  });

  describe('BoundingRect', () => {
    it('should return correct bounding rect without transformation', () => {
      image = createImage({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      });

      const rect = image.boundingRect();
      expect(rect).to.deep.equal({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      });
    });

    it('should cache the result of boundingRect()', () => {
      image = createImage({ x: 1, y: 2, width: 3, height: 4 });
      const r1 = image.boundingRect();
      const r2 = image.boundingRect();
      expect(r1).to.equal(r2); // Should be same reference due to cache
    });

    it('should compute transformed boundingRect if modelViewMatrix exists', () => {
      image = createImage({ x: 0, y: 0, width: 10, height: 10 });
      image.modelViewMatrix = {
        transformPoints: (pts) => pts.map((p) => ({ x: p.x * 2, y: p.y * 3 })),
      };

      const rect = image.boundingRect(true);
      expect(rect).to.deep.equal({
        x: 0,
        y: 0,
        width: 20,
        height: 30,
      });
    });
  });

  describe('Bounds for rectangle', () => {
    it('should return four corners of bounding rect', () => {
      image = createImage({ x: 10, y: 20, width: 100, height: 50 });

      const expected = [
        { x: 10, y: 20 },
        { x: 110, y: 20 },
        { x: 110, y: 70 },
        { x: 10, y: 70 },
      ];

      expect(image.bounds()).to.deep.equal(expected);
    });
    it('should return transformed bounds if modelViewMatrix exists', () => {
      image = createImage({ x: 0, y: 0, width: 10, height: 10 });
      image.modelViewMatrix = {
        transformPoints: (pts) => pts.map((p) => ({ x: p.x * 2, y: p.y * 3 })),
      };

      const expected = [
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 20, y: 30 },
        { x: 0, y: 30 },
      ];

      expect(image.bounds(true)).to.deep.equal(expected);
    });

    it('should cache the result of bounds()', () => {
      image = createImage({ x: 1, y: 2, width: 3, height: 4 });
      const b1 = image.bounds();
      const b2 = image.bounds();
      expect(b1).to.equal(b2); // Should be same reference
    });
  });
  describe('Bounds for circle', () => {
    it('should return bounds for a circle', () => {
      image = createImage({ x: 50, y: 50, width: 100, height: 100, symbol: 'circle' });

      const expected = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];

      expect(image.bounds()).to.deep.equal(expected);
    });
  });
});
