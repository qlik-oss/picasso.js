import resolveTransform from '../../../../src/core/scene-graph/transform-resolver';

describe('Transform resolver', () => {
  let g,
    transform,
    sandbox = sinon.createSandbox();

  beforeEach(() => {
    g = {
      translate: sandbox.spy(),
      rotate: sandbox.spy(),
      scale: sandbox.spy(),
      transform: sandbox.spy()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Notations', () => {
    it('should support scientific exponent notation', () => {
      transform = 'translate(1.123e3, 2.321E-3)';
      resolveTransform(transform, g);
      expect(g.translate).to.have.been.calledWithExactly(1123, 0.002321);
    });

    it('should support fractional-constant notation', () => {
      transform = 'translate(1.2, 0.5)';
      resolveTransform(transform, g);
      expect(g.translate).to.have.been.calledWithExactly(1.2, 0.5);
    });

    it('should support x/- sign notation', () => {
      transform = 'translate(-10, +20)';
      resolveTransform(transform, g);
      expect(g.translate).to.have.been.calledWithExactly(-10, 20);
    });
  });

  describe('Parameter format', () => {
    it('should support comma seperated values', () => {
      transform = 'matrix(1, 2, 3, 4, 5, 6)';
      resolveTransform(transform, g);
      expect(g.transform).to.have.been.calledWithExactly(1, 2, 3, 4, 5, 6);
    });

    it('should support space seperated values', () => {
      transform = 'matrix(1 2 3 4 5 6)';
      resolveTransform(transform, g);
      expect(g.transform).to.have.been.calledWithExactly(1, 2, 3, 4, 5, 6);
    });

    it('should handle multiple spaces between parameters', () => {
      transform = 'matrix(   1  2  3  4     5    6 )';
      resolveTransform(transform, g);
      expect(g.transform).to.have.been.calledWithExactly(1, 2, 3, 4, 5, 6);

      sandbox.restore();

      transform = 'matrix(   1,  2 , 3,  4,   5,    6 )';
      resolveTransform(transform, g);
      expect(g.transform).to.have.been.calledWithExactly(1, 2, 3, 4, 5, 6);
    });

    it('should handle multiple tabs between parameters', () => {
      transform = 'matrix(  1   2   3   4   5   6  )';
      resolveTransform(transform, g);
      expect(g.transform).to.have.been.calledWithExactly(1, 2, 3, 4, 5, 6);

      sandbox.restore();

      transform = 'matrix(1,  2,  3,  4,  5,  6)';
      resolveTransform(transform, g);
      expect(g.transform).to.have.been.calledWithExactly(1, 2, 3, 4, 5, 6);
    });
  });

  describe('Transforms', () => {
    describe('Translate', () => {
      it('should support translate', () => {
        transform = 'translate(5, 10)';
        resolveTransform(transform, g);
        expect(g.translate).to.have.been.calledWithExactly(5, 10);
      });

      it('should translate y to zero if parameter is omitted', () => {
        transform = 'translate(5)';
        resolveTransform(transform, g);
        expect(g.translate).to.have.been.calledWithExactly(5, 0);
      });

      it('should not translate if parameters are omitted', () => {
        transform = 'translate()';
        resolveTransform(transform, g);
        expect(g.translate.callCount).to.equal(0);
      });
    });

    describe('Scale', () => {
      it('should support scale', () => {
        transform = 'scale(5, 10)';
        resolveTransform(transform, g);
        expect(g.scale).to.have.been.calledWithExactly(5, 10);
      });

      it('should scale y to x if y parameter is omitted', () => {
        transform = 'scale(5)';
        resolveTransform(transform, g);
        expect(g.scale).to.have.been.calledWithExactly(5, 5);
      });

      it('should not scale if parameters are omitted', () => {
        transform = 'scale()';
        resolveTransform(transform, g);
        expect(g.scale.callCount).to.equal(0);
      });
    });

    describe('Rotate', () => {
      it('should support rotate', () => {
        transform = 'rotate(45)';
        resolveTransform(transform, g);
        expect(g.rotate).to.have.been.calledWithExactly(0.7853981633974483);
        expect(g.translate.callCount).to.equal(0);
      });

      it('should allow optional parameters x and y', () => {
        transform = 'rotate(45, 10, 20)';
        resolveTransform(transform, g);
        expect(g.translate.args[0]).to.deep.equal([10, 20]);
        expect(g.rotate).to.have.been.calledWithExactly(0.7853981633974483);
        expect(g.translate.args[1]).to.deep.equal([-10, -20]);
      });

      it('should not apply rotation if x or y is omitted', () => {
        transform = 'rotate(45, 10)';
        resolveTransform(transform, g);
        expect(g.rotate.callCount).to.equal(0);
      });

      it('should not rotate if parameters are omitted', () => {
        transform = 'rotate()';
        resolveTransform(transform, g);
        expect(g.rotate.callCount).to.equal(0);
      });
    });

    describe('Matrix', () => {
      it('should support matrix', () => {
        transform = 'matrix(1, 2, 3, 4, 5, 6)';
        resolveTransform(transform, g);
        expect(g.transform).to.have.been.calledWithExactly(1, 2, 3, 4, 5, 6);
      });

      it('should not apply transform if a parameter is omitted', () => {
        transform = 'matrix(1, 2, 3, 4)';
        resolveTransform(transform, g);
        expect(g.transform.callCount).to.equal(0);
      });

      it('should not apply transform if parameters is omitted', () => {
        transform = 'matrix()';
        resolveTransform(transform, g);
        expect(g.transform.callCount).to.equal(0);
      });
    });

    describe('Stack transform operations', () => {
      it('should support stacking transform operations', () => {
        transform = 'scale(1, 2) rotate(45) translate(3, 4)';
        resolveTransform(transform, g);
        expect(g.scale).to.have.been.calledWithExactly(1, 2);
        expect(g.rotate).to.have.been.calledWithExactly(0.7853981633974483);
        expect(g.translate).to.have.been.calledWithExactly(3, 4);
      });
    });
  });
});
