import render from '../rect';

describe('rect', () => {
  describe('render', () => {
    let sandbox, g, falsys, truthys, rect;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      g = {
        beginPath: sandbox.spy(),
        rect: sandbox.spy(),
        fill: sandbox.spy(),
        stroke: sandbox.spy(),
        moveTo: sandbox.spy(),
        lineTo: sandbox.spy(),
        quadraticCurveTo: sandbox.spy(),
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
      sandbox.restore();
    });

    it('should fire beginPath', () => {
      render(rect, { g, doFill: false, doStroke: false });

      expect(g.beginPath.calledOnce).to.equal(true);
    });

    it('should fire rect with correct arguments', () => {
      render(rect, { g, doFill: false, doStroke: false });

      expect(g.rect.calledOnce).to.equal(true);
      expect(g.rect.alwaysCalledWithExactly(1, 2, 10, 20)).to.equal(true);
    });

    it('should not fire fill if fill condition is falsy', () => {
      falsys.forEach(value => {
        render(rect, { g, doFill: value, doStroke: false });

        expect(g.fill.called).to.equal(false);
      });
    });

    it('should fire fill if fill condition is truthy', () => {
      falsys.forEach(value => {
        g.fill.resetHistory();

        render(rect, { g, doFill: value, doStroke: false });

        expect(g.fill.calledOnce).to.equal(false);
      });
    });

    it('should not fire stroke if stroke condition is falsy', () => {
      falsys.forEach(value => {
        render(rect, { g, doFill: false, doStroke: value });

        expect(g.stroke.called).to.equal(false);
      });
    });

    it('should fire stroke if stroke condition is truthy', () => {
      truthys.forEach(value => {
        g.stroke.resetHistory();

        render(rect, { g, doFill: false, doStroke: value });

        expect(g.stroke.calledOnce).to.equal(true);
      });
    });

    it('should fire methods in correct order', () => {
      render(rect, { g, doFill: true, doStroke: true });

      expect(g.beginPath.calledBefore(g.rect)).to.equal(true);
      expect(g.rect.calledBefore(g.fill)).to.equal(true);
      expect(g.fill.calledBefore(g.stroke)).to.equal(true);
    });

    describe('rounded rect', () => {
      it('should call context methods in correct order and with correct arguments', () => {
        rect.rx = 3;
        rect.ry = 4;

        render(rect, { g, doFill: true, doStroke: true });

        expect(g.moveTo.getCall(0).args).to.eql([1, 6]);
        expect(g.lineTo.getCall(0).args).to.eql([1, 18]);
        expect(g.quadraticCurveTo.getCall(0).args).to.eql([1, 22, 4, 22]);

        expect(g.lineTo.getCall(1).args).to.eql([8, 22]);
        expect(g.quadraticCurveTo.getCall(1).args).to.eql([11, 22, 11, 18]);

        expect(g.lineTo.getCall(2).args).to.eql([11, 6]);
        expect(g.quadraticCurveTo.getCall(2).args).to.eql([11, 2, 8, 2]);

        expect(g.lineTo.getCall(3).args).to.eql([4, 2]);
        expect(g.quadraticCurveTo.getCall(3).args).to.eql([1, 2, 1, 6]);

        expect(g.moveTo).to.have.callCount(1);
        expect(g.lineTo).to.have.callCount(4);
        expect(g.quadraticCurveTo).to.have.callCount(4);
      });
    });
  });
});
