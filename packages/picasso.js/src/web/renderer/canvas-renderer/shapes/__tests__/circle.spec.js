import render from '../circle';

describe('circle', () => {
  describe('render', () => {
    let sandbox, g, falsys, truthys, circle;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      g = {
        beginPath: sandbox.spy(),
        moveTo: sandbox.spy(),
        arc: sandbox.spy(),
        fill: sandbox.spy(),
        stroke: sandbox.spy(),
      };

      falsys = [false, null, undefined, 0, NaN, ''];

      truthys = [true, {}, [], 1, -1, 3.14, -3.14, 'foo'];

      circle = { cx: 1, cy: 2, r: 3 };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should fire beginPath', () => {
      render(circle, { g, doFill: false, doStroke: false });

      expect(g.beginPath.calledOnce).to.equal(true);
    });

    it('should fire moveTo with correct arguments', () => {
      render(circle, { g, doFill: false, doStroke: false });

      expect(g.moveTo.calledOnce).to.equal(true);
      expect(g.moveTo.alwaysCalledWithExactly(4, 2)).to.equal(true);
    });

    it('should fire arc with correct arguments', () => {
      render(circle, { g, doFill: false, doStroke: false });

      expect(g.arc.calledOnce).to.equal(true);
      expect(g.arc.alwaysCalledWithExactly(1, 2, 3, 0, Math.PI * 2, false)).to.equal(true);
    });

    it('should not fire fill if fill condition is falsy', () => {
      falsys.forEach(value => {
        render(circle, { g, doFill: value, doStroke: false });

        expect(g.fill.called).to.equal(false);
      });
    });

    it('should fire fill if fill condition is truthy', () => {
      truthys.forEach(value => {
        g.fill.resetHistory();

        render(circle, { g, doFill: value, doStroke: false });

        expect(g.fill.calledOnce).to.equal(true);
      });
    });

    it('should not fire stroke if stroke condition is falsy', () => {
      falsys.forEach(value => {
        render(circle, { g, doFill: false, doStroke: value });

        expect(g.stroke.called).to.equal(false);
      });
    });

    it('should fire stroke if stroke condition is truthy', () => {
      truthys.forEach(value => {
        g.stroke.resetHistory();

        render(circle, { g, doFill: false, doStroke: value });

        expect(g.stroke.calledOnce).to.equal(true);
      });
    });

    it('should fire methods in correct order', () => {
      render(circle, { g, doFill: true, doStroke: true });

      expect(g.beginPath.calledBefore(g.moveTo)).to.equal(true);
      expect(g.moveTo.calledBefore(g.arc)).to.equal(true);
      expect(g.arc.calledBefore(g.fill)).to.equal(true);
      expect(g.fill.calledBefore(g.stroke)).to.equal(true);
    });
  });
});
