import extend from 'extend';
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
  let isEql;

  beforeEach(() => {
    renderSpy = sinon.spy();
    invokeSpy = sinon.spy();
    dispatcherSpy = {
      invoke: a => a(),
      clear: sinon.spy()
    };
    cMock = chartMock();
    isEql = sinon.stub().returns(false);

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
        filter: nodes => nodes,
        isEqual: isEql
      },
      rect: { x: 0, y: 0 }
    };

    instance = extend(true, {}, tooltip, context);
  });

  describe('events', () => {
    describe('show', () => {
      beforeEach(() => {
        instance.on.show = instance.on.show.bind(instance);
      });

      it('should do shape loookup and show tooltip', () => {
        cMock.shapesAt.returns([0, 1, 2]);
        instance.on.show({});

        expect(invokeSpy).to.have.been.calledWith([0, 1, 2]);
      });

      it('should show tooltip with provided nodes', () => {
        instance.on.show({}, { nodes: [0, 1, 2] });

        expect(invokeSpy).to.have.been.calledWith([0, 1, 2]);
      });

      it('should not re-render tooltip if over same nodes', () => {
        isEql.returns(true);
        instance.on.show({});

        expect(dispatcherSpy.clear).to.not.have.been.called;
        expect(invokeSpy).to.not.have.been.called;
      });

      it('should not show tooltip if there are no matching nodes', () => {
        cMock.shapesAt.returns([]);
        instance.on.show({});

        expect(invokeSpy).to.not.have.been.called;

        instance.on.show({}, { nodes: [] });

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

    describe('prevent', () => {
      beforeEach(() => {
        instance.on.show = instance.on.show.bind(instance);
        instance.on.prevent = instance.on.prevent.bind(instance);
      });

      it('should prevent `show` from being invoked', () => {
        instance.props.filter = sinon.stub().returns(true);
        instance.on.prevent(true);
        cMock.shapesAt.returns([0, 1, 2]);
        instance.on.show({});

        expect(instance.props.filter).to.not.have.been.called;
      });
    });
  });
});
