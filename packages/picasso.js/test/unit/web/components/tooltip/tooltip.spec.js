import tooltip from '../../../../../src/web/components/tooltip/tooltip';

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
  let context;
  let renderSpy;
  let invokeSpy;
  let dispatcherSpy;
  let cMock;

  beforeEach(() => {
    renderSpy = sinon.spy();
    invokeSpy = sinon.spy();
    dispatcherSpy = {
      invoke: a => a(),
      clear: sinon.spy()
    };
    cMock = chartMock();

    context = {
      chart: cMock,
      renderer: {
        render: renderSpy
      },
      invokeRenderer: invokeSpy,
      dispatcher: dispatcherSpy,
      state: {
        activeNodes: [],
        targetElement: {
          getBoundingClientRect: () => ({
            x: 0,
            y: 0,
            width: 100,
            height: 100
          })
        },
        targetBounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        },
        chartBounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        },
        prevent: false
      },
      props: {
        filter: () => true
      },
      rect: { x: 0, y: 0 }
    };

    instance = Object.assign({}, tooltip, context);
  });

  describe('events', () => {
    describe('over', () => {
      beforeEach(() => {
        instance.on.over = instance.on.over.bind(instance);
      });

      it('should show tooltip', () => {
        cMock.shapesAt.returns([0, 1, 2]);
        instance.on.over({});

        expect(invokeSpy).to.have.been.calledWith([0, 1, 2]);
      });

      it('should not re-render tooltip if over same nodes', () => {
        const nodes = [
          { data: 123 }
        ];
        cMock.shapesAt.returns(nodes);
        instance.state.activeNodes = nodes;
        instance.on.over({});

        expect(dispatcherSpy.clear).to.not.have.been.called;
        expect(invokeSpy).to.not.have.been.called;
      });

      it('should not show tooltip if there are no matching nodes', () => {
        cMock.shapesAt.returns([]);
        instance.on.over({});

        expect(dispatcherSpy.clear).to.not.have.been.called;
        expect(invokeSpy).to.not.have.been.called;
      });
    });

    describe('hide', () => {
      beforeEach(() => {
        instance.on.hide = instance.on.hide.bind(instance);
      });

      it('should hide tooltip', () => {
        instance.on.hide();
        expect(dispatcherSpy.clear).to.have.been.called;
      });
    });

    describe('show', () => {
      beforeEach(() => {
        instance.on.show = instance.on.show.bind(instance);
      });

      it('should show tooltip', () => {
        instance.on.show([0, 1, 2]);

        expect(invokeSpy).to.have.been.calledWith([0, 1, 2]);
      });

      it('should not show tooltip if there are no matching nodes', () => {
        instance.on.show([]);

        expect(invokeSpy).to.not.have.been.called;
      });
    });

    describe('prevent', () => {
      beforeEach(() => {
        instance.on.show = instance.on.show.bind(instance);
        instance.on.over = instance.on.over.bind(instance);
        instance.on.prevent = instance.on.prevent.bind(instance);
      });

      it('should prevent `show` from being invoked', () => {
        instance.props.filter = sinon.stub().returns(true);
        instance.on.prevent(true);
        instance.on.show([0, 1, 2]);

        expect(instance.props.filter).to.not.have.been.called;
      });

      it('should prevent `over` from being invoked', () => {
        instance.props.filter = sinon.stub().returns(true);
        instance.on.prevent(true);
        cMock.shapesAt.returns([0, 1, 2]);
        instance.on.over({});

        expect(instance.props.filter).to.not.have.been.called;
      });
    });
  });
});
