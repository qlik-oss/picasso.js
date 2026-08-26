import render from '../circle';

describe('circle', () => {
  describe('render', () => {
    let sandbox, g, falsys, truthys, circle;

    beforeEach(() => {
      sandbox = vi;

      g = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
      };

      falsys = [false, null, undefined, 0, NaN, ''];

      truthys = [true, {}, [], 1, -1, 3.14, -3.14, 'foo'];

      circle = { cx: 1, cy: 2, r: 3 };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should fire beginPath', () => {
      render(circle, { g, doFill: false, doStroke: false });

      expect(g.beginPath).toHaveBeenCalledTimes(1);
    });

    it('should fire moveTo with correct arguments', () => {
      render(circle, { g, doFill: false, doStroke: false });

      expect(g.moveTo).toHaveBeenCalledTimes(1);
      expect(g.moveTo.mock.calls.every((call) => JSON.stringify(call) === JSON.stringify([4, 2]))).to.equal(true);
    });

    it('should fire arc with correct arguments', () => {
      render(circle, { g, doFill: false, doStroke: false });

      expect(g.arc).toHaveBeenCalledTimes(1);
      expect(
        g.arc.mock.calls.every((call) => JSON.stringify(call) === JSON.stringify([1, 2, 3, 0, Math.PI * 2, false])),
      ).to.equal(true);
    });

    it('should not fire fill if fill condition is falsy', () => {
      falsys.forEach((value) => {
        render(circle, { g, doFill: value, doStroke: false });

        expect(g.fill).not.toHaveBeenCalled();
      });
    });

    it('should fire fill if fill condition is truthy', () => {
      truthys.forEach((value) => {
        g.fill.mockClear();

        render(circle, { g, doFill: value, doStroke: false });

        expect(g.fill).toHaveBeenCalledTimes(1);
      });
    });

    it('should not fire stroke if stroke condition is falsy', () => {
      falsys.forEach((value) => {
        render(circle, { g, doFill: false, doStroke: value });

        expect(g.stroke).not.toHaveBeenCalled();
      });
    });

    it('should fire stroke if stroke condition is truthy', () => {
      truthys.forEach((value) => {
        g.stroke.mockClear();

        render(circle, { g, doFill: false, doStroke: value });

        expect(g.stroke).toHaveBeenCalledTimes(1);
      });
    });

    it('should fire methods in correct order', () => {
      render(circle, { g, doFill: true, doStroke: true });

      expect(g.beginPath.mock.invocationCallOrder[0] < g.moveTo.mock.invocationCallOrder[0]).to.equal(true);
      expect(g.moveTo.mock.invocationCallOrder[0] < g.arc.mock.invocationCallOrder[0]).to.equal(true);
      expect(g.arc.mock.invocationCallOrder[0] < g.fill.mock.invocationCallOrder[0]).to.equal(true);
      expect(g.fill.mock.invocationCallOrder[0] < g.stroke.mock.invocationCallOrder[0]).to.equal(true);
    });
  });
});
