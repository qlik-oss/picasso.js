import canvascontext from 'test-utils/mocks/canvas-context';
import createCanvasGradient from '../canvas-gradient';

describe('canvas-gradient', () => {
  let shape;

  const dummyRectObject = (type = 'radial', bounds = {}) => ({
    type: 'rect',
    boundingRect: sinon.stub().returns(bounds),
    fill: {
      type: 'gradient',
      degree: 90,
      orientation: type,
      stops: [
        {
          offset: 0,
          color: 'blue'
        },
        {
          offset: 0.5,
          color: 'green'
        }
      ]
    }
  });

  beforeEach(() => {
    shape = [];
  });

  describe('radial', () => {
    it('should create radial gradients properly', () => {
      shape = dummyRectObject('radial');

      const fill = createCanvasGradient(canvascontext(), shape, shape.fill);

      expect(fill).to.be.a('function');
      expect(fill()).to.be.equal('dummyGradient-radial');
    });

    it('should have been called with proper arguments', () => {
      const bounds = {
        x: 0,
        y: 30,
        width: 20,
        height: 10
      };
      shape = dummyRectObject('radial', bounds);

      const fill = createCanvasGradient(canvascontext(), shape, shape.fill);

      expect(fill.args[0]).to.be.equal(bounds.x + (bounds.width / 2));
      expect(fill.args[1]).to.be.equal(bounds.y + (bounds.height / 2));
      expect(fill.args[2]).to.be.equal(1e-5);
      expect(fill.args[3]).to.be.equal(bounds.x + (bounds.width / 2));
      expect(fill.args[4]).to.be.equal(bounds.y + (bounds.height / 2));
      expect(fill.args[5]).to.be.equal(Math.max(bounds.width, bounds.height) / 2);
    });
  });

  describe('linear', () => {
    it('should create linear gradients properly', () => {
      shape = dummyRectObject('linear');

      const fill = createCanvasGradient(canvascontext(), shape, shape.fill);

      expect(fill).to.be.a('function');
      expect(fill()).to.be.equal('dummyGradient-linear');
    });

    it('should create linear gradient with custom gradient bounds', () => {
      const bounds = {
        x: 50,
        y: 30,
        width: 20,
        height: 10
      };
      shape = dummyRectObject('linear', bounds);
      shape.fill = {
        ...shape.fill,
        x1: 1,
        x2: 2,
        y1: 4,
        y2: 5
      };

      const fill = createCanvasGradient(canvascontext(), shape, shape.fill);

      expect(fill.args[0]).to.be.equal(bounds.x + bounds.width * shape.fill.x1);
      expect(fill.args[1]).to.be.equal(bounds.y + bounds.height * shape.fill.y1);
      expect(fill.args[2]).to.be.equal(bounds.x + bounds.width * shape.fill.x2);
      expect(fill.args[3]).to.be.equal(bounds.y + bounds.height * shape.fill.y2);
    });

    it('should have been called with proper arguments', () => {
      const bounds = {
        x: 0,
        y: 30,
        width: 20,
        height: 10
      };
      shape = dummyRectObject('linear', bounds);

      const grad = createCanvasGradient(canvascontext(), shape, shape.fill);

      expect(grad.args[0]).to.equal(20);
      expect(grad.args[1]).to.equal(30);
      expect(grad.args[2]).to.closeTo(20, 1e-12);
      expect(grad.args[3]).to.equal(40);
    });

    it('should have stops and colors', () => {
      shape = dummyRectObject('linear');

      const grad = createCanvasGradient(canvascontext(), shape, shape.fill);

      expect(grad.stops).to.eql([
        [0, 'blue'],
        [0.5, 'green']
      ]);
    });
  });
});
