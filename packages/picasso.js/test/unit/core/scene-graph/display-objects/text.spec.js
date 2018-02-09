import Text, { create as createText } from '../../../../../src/core/scene-graph/display-objects/text';

describe('Text', () => {
  let node;
  let def;
  const mockedBounds = { x: 0, y: 0, width: 50, height: 100 };
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
      dy: 0
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
      expect(node.collider()).to.be.null;
    });

    it('should accept arguments', () => {
      node = createText({
        text: 'testing',
        x: 1,
        y: 2,
        dx: 3,
        dy: 4
      });
      expect(node).to.be.an.instanceof(Text);
      expect(node.attrs.text).to.equal('testing');
      expect(node.attrs.x).to.equal(1);
      expect(node.attrs.y).to.equal(2);
      expect(node.attrs.dx).to.equal(3);
      expect(node.attrs.dy).to.equal(4);
      expect(node.collider()).to.be.null;
    });
  });

  describe('BoundingRect', () => {
    it('should handle default values', () => {
      node = createText();
      expect(node.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('should use textBounds function if supplied', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.textBoundsFn = textBoundsMock;
      node = createText(def);
      expect(node.boundingRect()).to.deep.equal({ x: 4, y: 6, width: 50, height: 100 });
    });

    it('should use boundingRect attribute if supplied', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.boundingRect = { x: 1, y: 2, width: 3, height: 4 };
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
      expect(node.boundingRect(true)).to.deep.equal({ x: 8, y: 18, width: 100, height: 300 });
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
      expect(node.boundingRect(true)).to.deep.equal({ x: 5, y: 8, width: 50, height: 100 });
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
      expect(node.boundingRect()).to.deep.equal({ x: -4, y: -6, width: 50, height: 100 });
    });
  });

  describe('Bounds', () => {
    it('should handle default values', () => {
      node = createText();
      expect(node.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
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
        { x: 4, y: 106 }
      ]);
    });

    it('should use boundingRect attribute if supplied', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.boundingRect = { x: 4, y: 6, width: 50, height: 100 };
      node = createText(def);
      expect(node.bounds()).to.deep.equal([
        { x: 4, y: 6 },
        { x: 54, y: 6 },
        { x: 54, y: 106 },
        { x: 4, y: 106 }
      ]);
    });

    it('should return correct value with a scale transform', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.boundingRect = { x: 4, y: 6, width: 50, height: 100 };
      def.transform = 'scale(2, 3)';
      node = createText(def);
      node.resolveLocalTransform();
      expect(node.bounds(true)).to.deep.equal([
        { x: 8, y: 18 },
        { x: 108, y: 18 },
        { x: 108, y: 318 },
        { x: 8, y: 318 }
      ]);
    });

    it('should return correct value with a translate transform', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.boundingRect = { x: 4, y: 6, width: 50, height: 100 };
      def.transform = 'translate(1, 2)';
      node = createText(def);
      node.resolveLocalTransform();
      expect(node.bounds(true)).to.deep.equal([
        { x: 5, y: 8 },
        { x: 55, y: 8 },
        { x: 55, y: 108 },
        { x: 5, y: 108 }
      ]);
    });

    it('should return correct value with a rotate transformation', () => {
      def.x = 1;
      def.y = 2;
      def.dx = 3;
      def.dy = 4;
      def.boundingRect = { x: 4, y: 6, width: 50, height: 100 };
      def.transform = 'rotate(90)';
      node = createText(def);
      node.resolveLocalTransform();
      expect(node.bounds(true)).to.deep.equal([
        { x: -106, y: 4 },
        { x: -6, y: 4 },
        { x: -6, y: 54.00000000000001 },
        { x: -106, y: 54.00000000000001 }
      ]);
    });
  });
});
