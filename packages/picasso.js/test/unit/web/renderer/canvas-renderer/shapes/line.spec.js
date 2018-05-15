import render from '../../../../../../src/web/renderer/canvas-renderer/shapes/line';

describe('line', () => {
  describe('render', () => {
    let sandbox,
      g,
      falsys,
      truthys,
      line;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      g = {
        beginPath: sandbox.spy(),
        moveTo: sandbox.spy(),
        lineTo: sandbox.spy(),
        stroke: sandbox.spy()
      };

      falsys = [false, null, undefined, 0, NaN, ''];

      truthys = [true, {}, [], 1, -1, 3.14, -3.14, 'foo'];

      line = {
        x1: 1, x2: 10, y1: 2, y2: 20
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should fire beginPath', () => {
      render(line, { g, doStroke: false });

      expect(g.beginPath.calledOnce).to.equal(true);
    });

    it('should fire moveTo with correct arguments', () => {
      render(line, { g, doStroke: false });

      expect(g.moveTo.calledOnce).to.equal(true);
      expect(g.moveTo.alwaysCalledWithExactly(1, 2));
    });

    it('should fire lineTo with correct arguments', () => {
      render(line, { g, doStroke: false });

      expect(g.lineTo.calledOnce).to.equal(true);
      expect(g.lineTo.alwaysCalledWithExactly(10, 20));
    });

    it('should not fire stroke if stroke condition is falsy', () => {
      falsys.forEach((value) => {
        render(line, { g, doStroke: value });

        expect(g.stroke.called).to.equal(false);
      });
    });

    it('should fire stroke if stroke condition is truthy', () => {
      truthys.forEach((value) => {
        g.stroke.reset();

        render(line, { g, doStroke: value });

        expect(g.stroke.calledOnce).to.equal(true);
      });
    });

    it('should fire beginPath as first canvas method', () => {
      render(line, { g, doStroke: true });

      expect(g.beginPath.calledBefore(g.moveTo)).to.equal(true);
      expect(g.beginPath.calledBefore(g.lineTo)).to.equal(true);
      expect(g.beginPath.calledBefore(g.stroke)).to.equal(true);
    });
  });
});
