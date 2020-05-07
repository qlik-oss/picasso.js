import Text, { create as createText } from '../text';
import GeoRect from '../../../geometry/rect';

describe('Text', () => {
  let node;
  let def;
  const mockedBounds = {
    x: 0,
    y: 0,
    width: 50,
    height: 100,
  };
  const textBoundsMock = (args) => {
    mockedBounds.x = args.x;
    mockedBounds.x += args.dx || 0;
    mockedBounds.y = args.y;
    mockedBounds.y += args.dy || 0;
    return mockedBounds;
  };

  beforeEach(() => {
    def = {
      text: 'testing',
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
    };
  });

  describe('Constructor', () => {
    it('should instantiate a new Text', () => {
      node = createText();
      expect(node).to.be.an.instanceof(Text);
      expect(node.attrs.text).to.be.undefined;
      expect(node.attrs.x).to.be.equal(0);
      expect(node.attrs.y).to.be.equal(0);
      expect(node.attrs.dx).to.be.equal(0);
      expect(node.attrs.dy).to.be.equal(0);
      expect(node.collider).to.be.null;
    });

    it('should accept arguments', () => {
      node = createText({
        text: 'testing',
        title: 'my title',
        x: 1,
        y: 2,
        dx: 3,
        dy: 4,
      });
      expect(node).to.be.an.instanceof(Text);
      expect(node.attrs.text).to.equal('testing');
      expect(node.attrs.title).to.equal('my title');
      expect(node.attrs.x).to.equal(1);
      expect(node.attrs.y).to.equal(2);
      expect(node.attrs.dx).to.equal(3);
      expect(node.attrs.dy).to.equal(4);
      expect(node.collider).to.be.null;
    });

    it('should instantiate collider given data and explicit bounds', () => {
      node = createText({
        text: 'testing',
        x: 1,
        y: 2,
        dx: 3,
        dy: 4,
        data: 0,
        boundingRect: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
      });
      expect(node.collider).to.be.a('object');
      expect(node.collider).to.be.an.instanceof(GeoRect);
      expect(node.colliderType).to.equal('bounds');
    });

    it('should instantiate collider given data and bounds function', () => {
      node = createText({
        text: 'testing',
        x: 1,
        y: 2,
        dx: 3,
        dy: 4,
        data: 0,
        textBoundsFn: () => ({
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        }),
      });
      expect(node.collider).to.be.an.instanceof(GeoRect);
      expect(node.colliderType).to.equal('bounds');
    });
  });

  describe('BoundingRect', () => {
    it('should handle default values', () => {
      node = createText();
      expect(node.boundingRect()).to.deep.equal({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
    });

    it('should use textBounds function if supplied', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.textBoundsFn = textBoundsMock;
      node = createText(def);
      expect(node.boundingRect()).to.deep.equal({
        x: 4,
        y: 6,
        width: 50,
        height: 100,
      });
    });

    it('should cache result from textBounds function', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.textBoundsFn = sinon.stub().returns(mockedBounds);
      node = createText(def);
      node.boundingRect();
      expect(def.textBoundsFn).to.have.been.calledOnce;
      node.boundingRect(); // Should not call fn again
      expect(def.textBoundsFn).to.have.been.calledOnce;
    });

    it('should use boundingRect attribute if supplied', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.boundingRect = {
        x: 1,
        y: 2,
        width: 3,
        height: 4,
      };
      node = createText(def);
      expect(node.boundingRect()).to.deep.equal(def.boundingRect);
    });

    it('should return correct value with a scale transforma', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.textBoundsFn = textBoundsMock;
      def.transform = 'scale(2, 3)';
      node = createText(def);
      node.resolveLocalTransform();
      expect(node.boundingRect(true)).to.deep.equal({
        x: 8,
        y: 18,
        width: 100,
        height: 300,
      });
    });

    it('should return correct value with a translate transform', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.textBoundsFn = textBoundsMock;
      def.transform = 'translate(1, 2)';
      node = createText(def);
      node.resolveLocalTransform();
      expect(node.boundingRect(true)).to.deep.equal({
        x: 5,
        y: 8,
        width: 50,
        height: 100,
      });
    });

    it('should return correct value with a rotate transformation', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.textBoundsFn = textBoundsMock;
      def.transform = 'rotate(90)';
      node = createText(def);
      node.resolveLocalTransform();

      const rect = node.boundingRect(true);
      expect(rect.x).to.equal(-106);
      expect(rect.y).to.equal(4);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.approximately(50, 0.1);
    });

    it('should return correct value with a negative vector direction', () => {
      def.x = -1;
      def.y = -2;
      def.dx = -3;
      def.dy = -4;
      def.textBoundsFn = textBoundsMock;
      node = createText(def);
      expect(node.boundingRect()).to.deep.equal({
        x: -4,
        y: -6,
        width: 50,
        height: 100,
      });
    });
  });

  describe('Bounds', () => {
    it('should handle default values', () => {
      node = createText();
      expect(node.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ]);
    });

    it('should use textBounds function if supplied', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.textBoundsFn = textBoundsMock;
      node = createText(def);
      expect(node.bounds()).to.deep.equal([
        { x: 4, y: 6 },
        { x: 54, y: 6 },
        { x: 54, y: 106 },
        { x: 4, y: 106 },
      ]);
    });

    it('should use boundingRect attribute if supplied', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.boundingRect = {
        x: 4,
        y: 6,
        width: 50,
        height: 100,
      };
      node = createText(def);
      expect(node.bounds()).to.deep.equal([
        { x: 4, y: 6 },
        { x: 54, y: 6 },
        { x: 54, y: 106 },
        { x: 4, y: 106 },
      ]);
    });

    it('should return correct value with a scale transform', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.boundingRect = {
        x: 4,
        y: 6,
        width: 50,
        height: 100,
      };
      def.transform = 'scale(2, 3)';
      node = createText(def);
      node.resolveLocalTransform();
      expect(node.bounds(true)).to.deep.equal([
        { x: 8, y: 18 },
        { x: 108, y: 18 },
        { x: 108, y: 318 },
        { x: 8, y: 318 },
      ]);
    });

    it('should return correct value with a translate transform', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.boundingRect = {
        x: 4,
        y: 6,
        width: 50,
        height: 100,
      };
      def.transform = 'translate(1, 2)';
      node = createText(def);
      node.resolveLocalTransform();
      expect(node.bounds(true)).to.deep.equal([
        { x: 5, y: 8 },
        { x: 55, y: 8 },
        { x: 55, y: 108 },
        { x: 5, y: 108 },
      ]);
    });

    it('should return correct value with a rotate transformation', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.boundingRect = {
        x: 4,
        y: 6,
        width: 50,
        height: 100,
      };
      def.transform = 'rotate(90)';
      node = createText(def);
      node.resolveLocalTransform();
      expect(node.bounds(true)).to.deep.equal([
        { x: -106, y: 4 },
        { x: -6, y: 4 },
        { x: -6, y: 54.00000000000001 },
        { x: -106, y: 54.00000000000001 },
      ]);
    });
  });

  describe('containsPoint', () => {
    it('should include transformation when resolving point', () => {
      node = createText({
        text: 'testing',
        x: 10,
        y: 20,
        data: 0,
        boundingRect: {
          x: 10,
          y: 20,
          width: 1,
          height: 1,
        },
        transform: 'translate(5, 10)',
      });

      node.resolveLocalTransform();

      expect(node.containsPoint({ x: 15, y: 30 })).to.equal(true);
    });
  });

  describe('intersectsLine', () => {
    it('should include transformation when resolving line', () => {
      node = createText({
        text: 'testing',
        x: 10,
        y: 20,
        data: 0,
        boundingRect: {
          x: 10,
          y: 20,
          width: 1,
          height: 1,
        },
        transform: 'translate(5, 10)',
      });

      node.resolveLocalTransform();

      expect(
        node.intersectsLine({
          x1: 15,
          y1: 30,
          x2: 16,
          y2: 31,
        })
      ).to.equal(true);
    });
  });

  describe('intersectsRect', () => {
    it('should include transformation when resolving rect', () => {
      node = createText({
        text: 'testing',
        x: 10,
        y: 20,
        data: 0,
        boundingRect: {
          x: 10,
          y: 20,
          width: 1,
          height: 1,
        },
        transform: 'translate(5, 10)',
      });

      node.resolveLocalTransform();

      expect(
        node.intersectsRect({
          x: 15,
          y: 30,
          width: 1,
          height: 1,
        })
      ).to.equal(true);
    });
  });

  describe('intersectsCircle', () => {
    it('should include transformation when resolving rect', () => {
      node = createText({
        text: 'testing',
        x: 10,
        y: 20,
        data: 0,
        boundingRect: {
          x: 10,
          y: 20,
          width: 1,
          height: 1,
        },
        transform: 'translate(5, 10)',
      });

      node.resolveLocalTransform();

      expect(node.intersectsCircle({ cx: 15, cy: 30, r: 1 })).to.equal(true);
    });
  });

  describe('intersectsPolygon', () => {
    it('should include transformation when resolving rect', () => {
      node = createText({
        text: 'testing',
        x: 110,
        y: 120,
        data: 0,
        boundingRect: {
          x: 110,
          y: 120,
          width: 10,
          height: 10,
        },
        transform: 'translate(-100, -100)',
      });

      node.resolveLocalTransform();

      const vertices = [
        { x: 0, y: 25 },
        { x: 25, y: 0 },
        { x: 50, y: 25 },
        { x: 0, y: 25 },
      ];

      expect(node.intersectsPolygon({ vertices })).to.equal(true);
    });
  });
});
