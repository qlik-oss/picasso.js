import elementMock from 'test-utils/mocks/element-mock';
import patternizer from '../canvas-pattern';

describe('canvas-gradient', () => {
  let z;
  let el;
  let document;

  beforeEach(() => {
    el = elementMock('canvas');
    document = {
      createElement: vi.fn().mockReturnValue(el),
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

      expect(ctx.createPattern.mock.calls.length).to.equal(2);
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

      expect(ctx.save.mock.invocationCallOrder[0] < ctx.rect.mock.invocationCallOrder[0]).to.equal(true);
      expect(ctx.rect.mock.invocationCallOrder[0] < ctx.fill.mock.invocationCallOrder[0]).to.equal(true);
      expect(ctx.fill.mock.invocationCallOrder[0] < ctx.restore.mock.invocationCallOrder[0]).to.equal(true);
      expect(ctx.createPattern.mock.invocationCallOrder[0] > ctx.restore.mock.invocationCallOrder[0]).to.equal(true);

      expect(ctx.rect).toHaveBeenCalledWith(0, 1, 2, 3);
      expect(ctx.createPattern).toHaveBeenCalledWith(el, 'repeat');
      expect(ctx.fillStyle).to.equal('red');
      expect(el.width).to.equal(4);
      expect(el.height).to.equal(7);
    });
  });
});
