import canvascontext from 'test-utils/mocks/canvas-context';
import createCanvasGradient from '../canvas-gradient';

describe('canvas-gradient', () => {
  let shape;

  const dummyRectObject = (type = 'radial') => ({
    type: 'rect',
    width: 300,
    height: 500,
    x: 50,
    y: 130,
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

  const dummyCircleObject = (type = 'radial') => ({
    type: 'circle',
    r: 350,
    cx: 70,
    cy: 100,
    fill: {
      type: 'gradient',
      degree: 90,
      orientation: type,
      stops: [
        {
          offset: 0.2,
          color: 'blue'
        },
        {
          offset: 0.7,
          color: 'green'
        }
      ]
    }
  });

  beforeEach(() => {
    shape = [];
  });

  describe('rect', () => {
    describe('radial', () => {
      it('should create rect radial gradients properly', () => {
        shape = dummyRectObject('radial');

        shape.fill = createCanvasGradient(canvascontext(), shape, shape.fill);

        expect(shape.fill).to.be.a('function');
        expect(shape.fill()).to.be.equal('dummyGradient-radial');
      });

      it('should have been called with proper arguments', () => {
        shape = dummyRectObject('radial');

        shape.fill = createCanvasGradient(canvascontext(), shape, shape.fill);

        expect(shape.fill.args[0]).to.be.equal(shape.x + (shape.width / 2));
        expect(shape.fill.args[1]).to.be.equal(shape.y + (shape.height / 2));
        expect(shape.fill.args[2]).to.be.equal(1);
        expect(shape.fill.args[3]).to.be.equal(shape.x + (shape.width / 2));
        expect(shape.fill.args[4]).to.be.equal(shape.y + (shape.height / 2));
        expect(shape.fill.args[5]).to.be.equal(Math.max(shape.width, shape.height) / 2);
      });
    });

    describe('linear', () => {
      it('should create rect linear gradients properly', () => {
        shape = dummyRectObject('linear');

        shape.fill = createCanvasGradient(canvascontext(), shape, shape.fill);

        expect(shape.fill).to.be.a('function');
        expect(shape.fill()).to.be.equal('dummyGradient-linear');
      });

      it('should have been called with proper arguments', () => {
        shape = dummyRectObject('linear');

        shape.fill = createCanvasGradient(canvascontext(), shape, shape.fill);

        expect(shape.fill.args[0]).to.be.a('number');
        expect(shape.fill.args[1]).to.be.a('number');
        expect(shape.fill.args[2]).to.be.a('number');
        expect(shape.fill.args[3]).to.be.a('number');
      });
    });
  });

  describe('circle', () => {
    describe('radial', () => {
      it('should create circle radial gradients properly', () => {
        shape = dummyCircleObject('radial');

        shape.fill = createCanvasGradient(canvascontext(), shape, shape.fill);

        expect(shape.fill).to.be.a('function');
        expect(shape.fill()).to.be.equal('dummyGradient-radial');
      });

      it('should have been called with proper arguments', () => {
        shape = dummyCircleObject('radial');

        shape.fill = createCanvasGradient(canvascontext(), shape, shape.fill);

        expect(shape.fill.args[0]).to.be.equal(shape.cx);
        expect(shape.fill.args[1]).to.be.equal(shape.cy);
        expect(shape.fill.args[2]).to.be.equal(1);
        expect(shape.fill.args[3]).to.be.equal(shape.cx);
        expect(shape.fill.args[4]).to.be.equal(shape.cy);
        expect(shape.fill.args[5]).to.be.equal(shape.r);
      });
    });

    describe('linear', () => {
      it('should create circle linear gradients properly', () => {
        shape = dummyCircleObject('linear');

        shape.fill = createCanvasGradient(canvascontext(), shape, shape.fill);

        expect(shape.fill).to.be.a('function');
        expect(shape.fill()).to.be.equal('dummyGradient-linear');
      });

      it('should have been called with proper arguments', () => {
        shape = dummyCircleObject('linear');

        shape.fill = createCanvasGradient(canvascontext(), shape, shape.fill);

        expect(shape.fill.args[0]).to.be.a('number');
        expect(shape.fill.args[1]).to.be.a('number');
        expect(shape.fill.args[2]).to.be.a('number');
        expect(shape.fill.args[3]).to.be.a('number');
      });
    });
  });
});
