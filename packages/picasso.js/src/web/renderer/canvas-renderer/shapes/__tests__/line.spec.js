import render from '../line';

describe('line', () => {
  describe('render', () => {
    let sandbox, g, falsys, truthys, line;

    beforeEach(() => {
      sandbox = vi;

      g = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
      };

      falsys = [false, null, undefined, 0, NaN, ''];

      truthys = [true, {}, [], 1, -1, 3.14, -3.14, 'foo'];

      line = {
        x1: 1,
        x2: 10,
        y1: 2,
        y2: 20,
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should fire beginPath', () => {
      render(line, { g, doStroke: false });

      expect(g.beginPath).toHaveBeenCalledTimes(1);
    });

    it('should fire moveTo with correct arguments', () => {
      render(line, { g, doStroke: false });

      expect(g.moveTo).toHaveBeenCalledTimes(1);
      expect(g.moveTo.mock.calls.every((call) => JSON.stringify(call) === JSON.stringify([1, 2])));
    });

    it('should fire lineTo with correct arguments', () => {
      render(line, { g, doStroke: false });

      expect(g.lineTo).toHaveBeenCalledTimes(1);
      expect(g.lineTo.mock.calls.every((call) => JSON.stringify(call) === JSON.stringify([10, 20])));
    });

    it('should not fire stroke if stroke condition is falsy', () => {
      falsys.forEach((value) => {
        render(line, { g, doStroke: value });

        expect(g.stroke).not.toHaveBeenCalled();
      });
    });

    it('should fire stroke if stroke condition is truthy', () => {
      truthys.forEach((value) => {
        g.stroke.mockClear();

        render(line, { g, doStroke: value });

        expect(g.stroke).toHaveBeenCalledTimes(1);
      });
    });

    it('should fire beginPath as first canvas method', () => {
      render(line, { g, doStroke: true });

      expect(g.beginPath.mock.invocationCallOrder[0] < g.moveTo.mock.invocationCallOrder[0]).to.equal(true);
      expect(g.beginPath.mock.invocationCallOrder[0] < g.lineTo.mock.invocationCallOrder[0]).to.equal(true);
      expect(g.beginPath.mock.invocationCallOrder[0] < g.stroke.mock.invocationCallOrder[0]).to.equal(true);
    });
  });
});
