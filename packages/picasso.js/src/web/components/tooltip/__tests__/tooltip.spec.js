import extend from 'extend';
import tooltip from '../tooltip';
import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';

function componentMock() {
  return {
    emit: sinon.stub()
  };
}

function chartMock() {
  return {
    componentsFromPoint: sinon.stub().returns([]),
    shapesAt: sinon.stub().returns([]),
    brushFromShapes: sinon.stub(),
    component: sinon.stub().returns(componentMock()),
    element: {
      getBoundingClientRect: sinon.stub().returns({
        left: 0,
        top: 0
      })
    }
  };
}

describe('Tooltip', () => {
  let instance;
  let invokeSpy;
  let dispatcherSpy;
  let cMock;
  let isEql;
  let componentFixture;
  let sandbox;
  let config;
  let clock;

  beforeEach(() => {
    componentFixture = componentFactoryFixture();
    sandbox = componentFixture.sandbox();
    cMock = extend(componentFixture.mocks().chart, chartMock());
    clock = sandbox.useFakeTimers();
    isEql = sandbox.stub().returns(false);

    config = {
      settings: {
        filter: nodes => nodes,
        isEqual: isEql
      }
    };

    instance = componentFixture.simulateCreate(tooltip, config);
    componentFixture.simulateRender({
      inner: {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      }
    }); // To attach h to context

    invokeSpy = sandbox.stub(instance.def, 'invokeRenderer');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('events', () => {
    describe('show', () => {
      it('should do shape loookup and show tooltip', () => {
        cMock.shapesAt.returns([0, 1, 2]);
        instance.def.show({});
        clock.tick(500);

        expect(invokeSpy).to.have.been.calledWith([0, 1, 2]);
      });

      it('should show tooltip with provided nodes', () => {
        instance.def.show({}, { nodes: [0, 1, 2] });
        clock.tick(500);

        expect(invokeSpy).to.have.been.calledWith([0, 1, 2]);
      });

      it('should not re-render tooltip if over same nodes', () => {
        isEql.returns(true);
        cMock.shapesAt.returns([0, 1, 2]);
        instance.def.show({});

        expect(invokeSpy).to.not.have.been.called;
        expect(isEql).to.have.been.called;
      });

      it('should not show tooltip if there are no matching nodes', () => {
        cMock.shapesAt.returns([]);
        instance.def.show({});

        expect(invokeSpy).to.not.have.been.called;

        instance.def.show({}, { nodes: [] });

        expect(invokeSpy).to.not.have.been.called;
      });
    });

    describe('hide', () => {
      it('should hide tooltip', () => {
        dispatcherSpy = sandbox.spy(instance.def.dispatcher, 'clear');
        instance.def.hide();

        expect(dispatcherSpy).to.have.been.called;
      });
    });

    describe('prevent', () => {
      it('should prevent `show` from being invoked', () => {
        instance.def.prevent(true);
        instance.def.show({});

        expect(isEql).to.not.have.been.called;
      });
    });
  });

  describe('lifecycle hooks', () => {
    let hookSpy;

    beforeEach(() => {
      hookSpy = sandbox.spy();
      cMock.shapesAt.returns([0, 1, 2]);
    });

    it('should call beforeShow', () => {
      instance.def.props.beforeShow = hookSpy;
      instance.def.show({});

      expect(hookSpy).to.have.been.called;
    });

    it('should call afterShow', () => {
      instance.def.props.afterShow = hookSpy;
      instance.def.show({});
      clock.tick(500);

      expect(hookSpy).to.have.been.called;
    });

    it('should call beforeHide', () => {
      instance.def.props.afterShow = hookSpy;
      instance.def.show({});
      clock.tick(8500);

      expect(hookSpy).to.have.been.called;
    });

    it('should not call beforeHide if tooltip is not displayed', () => {
      instance.def.props.afterShow = hookSpy;
      instance.def.hide();

      expect(hookSpy).to.not.have.been.called;
    });

    it('should call onHide', () => {
      instance.def.props.onHide = hookSpy;
      instance.def.show({});
      clock.tick(8500);

      expect(hookSpy).to.have.been.called;
    });

    it('should not call onHide if tooltip is not displayed', () => {
      instance.def.props.onHide = hookSpy;
      instance.def.hide();

      expect(hookSpy).to.not.have.been.called;
    });

    it('should call afterHide', () => {
      instance.def.props.afterHide = hookSpy;
      instance.def.show({});
      clock.tick(8500);

      expect(hookSpy).to.have.been.called;
    });

    it('should not call afterHide if tooltip is not displayed', () => {
      instance.def.props.afterHide = hookSpy;
      instance.def.hide();

      expect(hookSpy).to.not.have.been.called;
    });
  });

  describe('beforeUpdate', () => {
    it('should destroy dispatcher if exists', () => {
      dispatcherSpy = sandbox.spy(instance.def.dispatcher, 'destroy');
      instance.beforeUpdate({});

      expect(dispatcherSpy).to.have.been.called;
    });
  });

  describe('appendTo', () => {
    let container;

    beforeEach(() => {
      container = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        scaleRatio: { x: 0, y: 0 }
      };

      componentFixture.mocks().renderer.size = sandbox.stub().returns(container);
    });

    it('should apply appendTo on mounted', () => {
      const stub = sandbox.stub().returns({ getBoundingClientRect: () => container });
      instance.def.props.appendTo = stub;
      componentFixture.simulateRender({ inner: container, outer: container });

      expect(stub).to.have.been.called;
    });

    it('should apply appendTo on updated', () => {
      const stub = sandbox.stub().returns({ getBoundingClientRect: () => container });
      config.settings.appendTo = stub;
      componentFixture.simulateUpdate(config);

      expect(stub).to.have.been.called;
    });
  });
});
