import elementMock from 'test-utils/mocks/element-mock';
import patternizer from '../canvas-pattern';

describe('canvas-gradient', () => {
  let z;
  let el;
  let document;

  beforeEach(() => {
    el = elementMock('canvas');
    document = {
      createElement: sinon.stub().withArgs('canvas').returns(el),
    };
    z = patternizer(document);
  });

  describe('create', () => {
    it('should return a pattern', () => {
      const p = z.create({
        shapes: [],
      });

      expect(p.constructor.name).to.equal('CanvasPattern');
    });

    it('should maintain a cache', () => {
      const ctx = el.getContext('2d');
      z.create({ key: 'a', shapes: [] });
      z.create({ key: 'b', shapes: [] });
      z.create({ key: 'b', shapes: [] });
      z.create({ key: 'a', shapes: [] });

      expect(ctx.createPattern.callCount).to.equal(2);
    });

    it('should draw a pattern', () => {
      const ctx = el.getContext('2d');
      z.create({
        width: 4,
        height: 7,
        fill: 'red',
        shapes: [
          {
            type: 'rect',
            x: 0,
            y: 1,
            width: 2,
            height: 3,
          },
        ],
      });

      expect(ctx.save.calledBefore(ctx.rect)).to.equal(true);
      expect(ctx.rect.calledBefore(ctx.fill)).to.equal(true);
      expect(ctx.fill.calledBefore(ctx.restore)).to.equal(true);
      expect(ctx.createPattern.calledAfter(ctx.restore)).to.equal(true);

      expect(ctx.rect.calledWithExactly(0, 1, 2, 3)).to.equal(true);
      expect(ctx.createPattern.calledWithExactly(el, 'repeat')).to.equal(true);
      expect(ctx.fillStyle).to.equal('red');
      expect(el.width).to.equal(4);
      expect(el.height).to.equal(7);
    });
  });
});
