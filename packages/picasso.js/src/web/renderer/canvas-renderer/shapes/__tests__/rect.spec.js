import render from '../rect';

describe('rect', () => {
  describe('render', () => {
    let sandbox, g, falsys, truthys, rect;

    beforeEach(() => {
      sandbox = vi;

      g = {
        beginPath: vi.fn(),
        rect: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
      };

      falsys = [false, null, undefined, 0, NaN, ''];

      truthys = [true, {}, [], 1, -1, 3.14, -3.14, 'foo'];

      rect = {
        x: 1,
        y: 2,
        width: 10,
        height: 20,
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should fire beginPath', () => {
      render(rect, { g, doFill: false, doStroke: false });

      expect(g.beginPath).toHaveBeenCalledTimes(1);
    });

    it('should fire rect with correct arguments', () => {
      render(rect, { g, doFill: false, doStroke: false });

      expect(g.rect).toHaveBeenCalledTimes(1);
      expect(g.rect.mock.calls.every((call) => JSON.stringify(call) === JSON.stringify([1, 2, 10, 20]))).to.equal(true);
    });

    it('should not fire fill if fill condition is falsy', () => {
      falsys.forEach((value) => {
        render(rect, { g, doFill: value, doStroke: false });

        expect(g.fill).not.toHaveBeenCalled();
      });
    });

    it('should fire fill if fill condition is truthy', () => {
      falsys.forEach((value) => {
        g.fill.mockClear();

        render(rect, { g, doFill: value, doStroke: false });

        expect(g.fill).not.toHaveBeenCalled();
      });
    });

    it('should not fire stroke if stroke condition is falsy', () => {
      falsys.forEach((value) => {
        render(rect, { g, doFill: false, doStroke: value });

        expect(g.stroke).not.toHaveBeenCalled();
      });
    });

    it('should fire stroke if stroke condition is truthy', () => {
      truthys.forEach((value) => {
        g.stroke.mockClear();

        render(rect, { g, doFill: false, doStroke: value });

        expect(g.stroke).toHaveBeenCalledTimes(1);
      });
    });

    it('should fire methods in correct order', () => {
      render(rect, { g, doFill: true, doStroke: true });

      expect(g.beginPath.mock.invocationCallOrder[0] < g.rect.mock.invocationCallOrder[0]).to.equal(true);
      expect(g.rect.mock.invocationCallOrder[0] < g.fill.mock.invocationCallOrder[0]).to.equal(true);
      expect(g.fill.mock.invocationCallOrder[0] < g.stroke.mock.invocationCallOrder[0]).to.equal(true);
    });

    describe('rounded rect', () => {
      it('should call context methods in correct order and with correct arguments', () => {
        rect.rx = 3;
        rect.ry = 4;

        render(rect, { g, doFill: true, doStroke: true });

        expect(g.moveTo.mock.calls[0]).to.eql([1, 6]);
        expect(g.lineTo.mock.calls[0]).to.eql([1, 18]);
        expect(g.quadraticCurveTo.mock.calls[0]).to.eql([1, 22, 4, 22]);

        expect(g.lineTo.mock.calls[1]).to.eql([8, 22]);
        expect(g.quadraticCurveTo.mock.calls[1]).to.eql([11, 22, 11, 18]);

        expect(g.lineTo.mock.calls[2]).to.eql([11, 6]);
        expect(g.quadraticCurveTo.mock.calls[2]).to.eql([11, 2, 8, 2]);

        expect(g.lineTo.mock.calls[3]).to.eql([4, 2]);
        expect(g.quadraticCurveTo.mock.calls[3]).to.eql([1, 2, 1, 6]);

        expect(g.moveTo.mock.calls).toHaveLength(1);
        expect(g.lineTo.mock.calls).toHaveLength(4);
        expect(g.quadraticCurveTo.mock.calls).toHaveLength(4);
      });
    });
  });
});
