import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import brushLasso from '../brush-lasso';

describe('brush-lasso', () => {
  let componentFixture;
  let instance;
  let config;
  let rendererOutput;
  let chartMock;

  beforeEach(() => {
    componentFixture = componentFactoryFixture();
    config = {
      settings: {
        lasso: {},
        snapIndicator: {},
        startPoint: {}
      }
    };

    instance = componentFixture.simulateCreate(brushLasso, config);
    chartMock = componentFixture.mocks().chart;
    chartMock.shapesAt = componentFixture.sandbox().stub().returns([]);
    chartMock.brushFromShapes = componentFixture.sandbox().stub();
  });

  it('should show lasso', () => {
    instance.def.start({ center: { x: 1, y: 2 } });
    instance.def.move({ center: { x: 11, y: 12 } });
    instance.def.move({ center: { x: 11, y: 0 } });
    rendererOutput = componentFixture.getRenderOutput().reduce((a, b) => (a.type === 'path' ? a : b), {});

    let expected = {
      visible: true,
      type: 'path', // Lasso
      d: 'M1 2 L11 12 L11 0 ',
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 2,
      opacity: 0.7,
      strokeDasharray: '20, 10',
      collider: {
        type: null
      }
    };
    expect(rendererOutput).to.deep.equal(expected);
  });

  it('should show startPoint', () => {
    instance.def.start({ center: { x: 1, y: 2 } });
    instance.def.move({ center: { x: 10, y: 10 } });
    rendererOutput = componentFixture.getRenderOutput().reduce((a, b) => (a.type === 'circle' ? a : b), {});

    let expected = {
      visible: true,
      type: 'circle', // Start point
      cx: 1,
      cy: 2,
      r: 10,
      fill: 'green',
      opacity: 1,
      stroke: 'black',
      strokeWidth: 1,
      collider: {
        type: null
      }
    };
    expect(rendererOutput).to.deep.equal(expected);
  });

  it('should show snapIndicator if distance is smaller then threshold', () => {
    config.settings.snapIndicator.threshold = 7;

    instance = componentFixture.simulateCreate(brushLasso, config);
    instance.def.start({ center: { x: 0, y: 0 } });
    instance.def.move({ center: { x: 6, y: 0 } });

    rendererOutput = componentFixture.getRenderOutput().reduce((a, b) => (a.type === 'line' ? a : b), {});

    const expected = {
      visible: true,
      type: 'line',
      x1: 0,
      y1: 0,
      x2: 6,
      y2: 0,
      strokeDasharray: '5, 5',
      stroke: 'black',
      strokeWidth: 2,
      opacity: 0.5,
      collider: { type: null }
    };
    expect(rendererOutput).to.deep.equal(expected);
  });

  it('should not show snapIndicator if distance is larger then threshold', () => {
    config.settings.snapIndicator.threshold = 5;
    instance = componentFixture.simulateCreate(brushLasso, config);
    instance.def.start({ center: { x: 0, y: 0 } });
    instance.def.move({ center: { x: 6, y: 0 } });
    rendererOutput = componentFixture.getRenderOutput();

    expect(rendererOutput.some((node) => node.type === 'line')).to.equal(false);
  });

  // TODO Currently does allow it, TBD if it should continues to
  // it('should not allow a path renderer outside the component container', () => {
  //   instance.def.start({ x: 0, y: 0 });
  //   instance.def.move({ x: -10, y: 10 }); // x outside
  //   instance.def.move({ x: 10, y: 2000 }); // y outside
  //   instance.def.end({ x: 0, y: 0 });
  //   rendererOutput = componentFixture.getRenderOutput().reduce((a, b) => (a.type === 'path' ? a : b), {});

  //   let expected = {
  //     visible: true,
  //     type: 'path', // Lasso
  //     d: 'M0 0 L0 10 L10 100 Z', // wrap around component container bounds
  //     fill: 'transparent',
  //     stroke: 'black',
  //     strokeWidth: 2,
  //     opacity: 0.7,
  //     collider: {
  //       type: null
  //     }
  //   };
  //   expect(rendererOutput).to.deep.equal(expected);
  // });

  describe('call cycle', () => {
    let spy;
    let shapesAtStub;
    let brushFromShapesStub;

    beforeEach(() => {
      spy = componentFixture.sandbox().spy();
      shapesAtStub = chartMock.shapesAt;
      brushFromShapesStub = chartMock.brushFromShapes;
      componentFixture.mocks().renderer.render = spy;
    });

    it('should not call render on "start"', () => {
      instance.def.start({ center: { x: 0, y: 0 } });

      expect(spy).to.not.have.been.called;
      expect(shapesAtStub).to.not.have.been.called;
      expect(brushFromShapesStub).to.not.have.been.called;
    });

    it('should call render on "move"', () => {
      instance.def.start({ center: { x: 0, y: 0 } }); // needed to init state
      instance.def.move({ center: { x: 10, y: 10 } });

      expect(spy).to.have.been.calledOnce;
      expect(shapesAtStub).to.have.been.calledOnce;
      expect(brushFromShapesStub).to.have.been.calledOnce;
    });

    it('should call render on "end"', () => {
      instance.def.start({ center: { x: 0, y: 0 } }); // needed to init state
      instance.def.end({ center: { x: 10, y: 10 } });

      expect(spy).to.have.been.calledOnce;
      expect(shapesAtStub).to.have.been.calledOnce;
      expect(brushFromShapesStub).to.have.been.calledOnce;
    });

    it('should not call render on "move" if lasso has not been initiated', () => {
      instance.def.move({ center: { x: 10, y: 10 } });

      expect(spy).to.not.have.been.called;
      expect(shapesAtStub).to.not.have.been.called;
      expect(brushFromShapesStub).to.not.have.been.called;
    });

    it('should not call render on "end" if lasso has not been initiated', () => {
      instance.def.end({ center: { x: 10, y: 10 } });

      expect(spy).to.not.have.been.called;
      expect(shapesAtStub).to.not.have.been.called;
      expect(brushFromShapesStub).to.not.have.been.called;
    });
  });

  describe('settings', () => {
    it('lasso', () => {
      config.settings.lasso = {
        fill: 'black',
        stroke: 'red',
        strokeWidth: 33,
        opacity: 3.14
      };

      instance = componentFixture.simulateCreate(brushLasso, config);
      instance.def.start({ center: { x: 1, y: 2 } });
      instance.def.move({ center: { x: 11, y: 12 } });
      rendererOutput = componentFixture.getRenderOutput().reduce((a, b) => (a.type === 'path' ? a : b), {});

      let expected = {
        visible: true,
        type: 'path', // Lasso
        d: 'M1 2 L11 12 ',
        fill: 'black',
        stroke: 'red',
        strokeWidth: 33,
        strokeDasharray: '20, 10',
        opacity: 3.14,
        collider: {
          type: null
        }
      };
      expect(rendererOutput).to.deep.equal(expected);
    });

    it('snapIndicator', () => {
      config.settings.snapIndicator = {
        strokeDasharray: '15, 5',
        stroke: 'red',
        strokeWidth: 1337,
        opacity: 42
      };

      instance = componentFixture.simulateCreate(brushLasso, config);
      instance.def.start({ center: { x: 1, y: 2 } });
      instance.def.move({ center: { x: 11, y: 12 } });
      rendererOutput = componentFixture.getRenderOutput().reduce((a, b) => (a.type === 'line' ? a : b), {});

      const expected = {
        visible: true,
        type: 'line',
        x1: 1,
        y1: 2,
        x2: 11,
        y2: 12,
        strokeDasharray: '15, 5',
        stroke: 'red',
        strokeWidth: 1337,
        opacity: 42,
        collider: { type: null }
      };
      expect(rendererOutput).to.deep.equal(expected);
    });

    it('startPoint', () => {
      config.settings.startPoint = {
        r: 33,
        fill: 'yellow',
        stroke: 'submarine',
        strokeWidth: 1337,
        opacity: 42
      };

      instance = componentFixture.simulateCreate(brushLasso, config);
      instance.def.start({ center: { x: 1, y: 2 } });
      instance.def.move({ center: { x: 11, y: 12 } });
      rendererOutput = componentFixture.getRenderOutput().reduce((a, b) => (a.type === 'circle' ? a : b), {});

      let expected = {
        visible: true,
        type: 'circle', // Start point
        cx: 1,
        cy: 2,
        r: 33,
        fill: 'yellow',
        stroke: 'submarine',
        opacity: 42,
        strokeWidth: 1337,
        collider: {
          type: null
        }
      };
      expect(rendererOutput).to.deep.equal(expected);
    });
  });
});
