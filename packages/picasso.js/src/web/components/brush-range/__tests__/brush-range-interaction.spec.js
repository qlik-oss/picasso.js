import { start, move, end } from '../brush-range-interaction';

describe('BrushRange Interaction', () => {
  let state;
  let event;

  beforeEach(() => {
    state = {
      cssCoord: {
        offset: 'top',
        coord: 'y',
        pos: 'deltaY'
      },
      offset: {
        left: 0,
        top: 0
      },
      multi: true,
      size: 1,
      scale: (x) => x
    };
    state.scale.min = sinon.stub().returns(0);
    state.scale.max = sinon.stub().returns(1);
    state.scale.invert = (x) => x;
    state.scale.norm = (x) => x;
    state.scale.normInvert = (x) => x;

    event = {
      center: { x: 0.5, y: 0.5 },
      deltaX: 0,
      deltaY: 0.1
    };
  });

  describe('Start', () => {
    let renderer;
    let targetSize;
    let element;

    beforeEach(() => {
      const boundingRect = {
        left: 0,
        top: 0,
        height: 1,
        width: 1,
        right: 1,
        bottom: 1
      };
      element = {
        contains: sinon.stub().returns(false),
        getBoundingClientRect: sinon.stub().returns(boundingRect)
      };
      renderer = {
        element: sinon.stub().returns(element)
      };
      targetSize = 0.01;
      global.document = {
        elementFromPoint: sinon.stub()
      };
    });
    afterEach(() => {
      delete global.document;
    });

    it('should set started to true', () => {
      state.started = false;
      start({
        state,
        e: event,
        renderer,
        ranges: () => [],
        targetSize
      });
      expect(state.started, 'started should be true').to.be.true;
    });

    describe('should set state.active', () => {
      it('when only range', () => {
        state.started = false;
        start({
          state,
          e: event,
          renderer,
          ranges: () => [],
          targetSize
        });
        expect(state.active).to.deep.equals({
          start: 0.4,
          end: 0.5,
          idx: -1,
          limitLow: 0,
          limitHigh: 1,
          mode: 'current'
        });
        expect(state.start).to.equals(0.4);
        expect(state.current).to.equals(0.5);
      });

      it('limited by others', () => {
        state.started = false;
        const ranges = [
          { min: 0, max: 0.2 },
          { min: 0.6, max: 0.7 }
        ];
        start({
          state,
          e: event,
          renderer,
          ranges: () => ranges,
          targetSize
        });
        expect(state.active).to.deep.equals({
          start: 0.4,
          end: 0.5,
          idx: -1,
          limitLow: 0.2,
          limitHigh: 0.6,
          mode: 'current'
        });
        expect(state.start).to.equals(0.4);
        expect(state.current).to.equals(0.5);
      });

      it('drag existing', () => {
        state.started = false;
        const ranges = [{ min: 0, max: 1 }];
        start({
          state,
          e: event,
          renderer,
          ranges: () => ranges,
          targetSize
        });
        expect(state.active).to.deep.equals({
          start: 0,
          end: 1,
          idx: 0,
          limitLow: 0,
          limitHigh: 1,
          mode: 'move'
        });
        expect(state.start).to.equals(0.4);
        expect(state.current).to.equals(0.5);
      });

      it('resize existing', () => {
        state.started = false;
        const ranges = [{ min: 0, max: 0.4 }];
        start({
          state,
          e: event,
          renderer,
          ranges: () => ranges,
          targetSize
        });
        expect(state.active).to.deep.equals({
          start: 0,
          end: 0.4,
          idx: 0,
          limitLow: 0,
          limitHigh: 1,
          mode: 'modify'
        });
        expect(state.start, 'start').to.equals(0);
        expect(state.current, 'current').to.equals(0.5);
      });

      it('should detect drag in bubbles', () => {
        const bubbleElement = {
          hasAttribute: sinon.stub().returns(true),
          getAttribute: sinon.stub()
            .withArgs('data-idx')
            .returns('0')
            .withArgs('data-other-value')
            .returns('0')
        };
        global.document.elementFromPoint.returns(bubbleElement);
        element.contains.returns(true);
        state.started = false;
        const ranges = [
          { min: 0, max: 0.3 }
        ];
        start({
          state,
          e: event,
          renderer,
          ranges: () => ranges,
          targetSize
        });
        expect(state.active).to.deep.equals({
          start: 0,
          end: 0.3,
          idx: 0,
          limitLow: 0,
          limitHigh: 1,
          mode: 'modify'
        });
        expect(state.start, 'start').to.equals(0);
        expect(state.current, 'current').to.equals(0.5);
      });

      it('start if within targetRect', () => {
        state.started = false;
        state.targetRect = { // Event is targeting x: 0.5, y: 0.4
          x: 0.3,
          y: 0.2,
          width: 1,
          height: 1
        };
        start({
          state,
          e: event,
          renderer,
          ranges: () => [],
          targetSize
        });
        expect(state.active).to.deep.equals({
          start: 0.2,
          end: 0.3,
          idx: -1,
          limitLow: 0,
          limitHigh: 1,
          mode: 'current'
        });
        expect(state.start).to.equals(0.2);
        expect(state.current).to.equals(0.3);
      });

      it('not start if outside targetRect', () => {
        state.started = false;
        state.targetRect = { // Event is targeting x: 0.5, y: 0.4
          x: 0.7,
          y: 0.7,
          width: 0.3,
          height: 0.3
        };
        start({
          state,
          e: event,
          renderer,
          ranges: () => [],
          targetSize
        });
        expect(state.active).to.equals(undefined);
        expect(state.start).to.equals(undefined);
        expect(state.current).to.equals(undefined);
      });
    });
  });

  describe('Move', () => {
    it('should update current', () => {
      state.start = 0.3;
      state.current = 0.4;
      state.active = {
        limitLow: 0,
        limitHigh: 1
      };
      move(state, event);
      expect(state.current).to.equals(0.5);
    });
    it('should limit by current limits', () => {
      state.start = 0.1;
      state.current = 0.2;
      state.active = {
        limitLow: 0,
        limitHigh: 0.3
      };
      move(state, event);
      expect(state.current).to.equals(0.3);
    });
  });

  describe('End', () => {
    it('should set started to false', () => {
      state.started = true;
      end(state, () => []);
      expect(state.started, 'started should be false').to.be.false;
    });
  });
});
