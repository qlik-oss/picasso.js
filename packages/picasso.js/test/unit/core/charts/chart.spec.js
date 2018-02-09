import elementMock from 'test-utils/mocks/element-mock';
import chart from '../../../../src/core/charts/chart';

describe('Chart', () => {
  describe('lifecycle methods', () => {
    let created;
    let beforeMount;
    let mounted;
    let beforeRender;
    let beforeUpdate;
    let updated;
    let beforeDestroy;
    let destroyed;
    let element;
    let definition;
    let context;

    beforeEach(() => {
      created = sinon.spy();
      beforeMount = sinon.spy();
      mounted = sinon.spy();
      beforeRender = sinon.spy();
      beforeUpdate = sinon.spy();
      updated = sinon.spy();
      beforeDestroy = sinon.spy();
      destroyed = sinon.spy();

      element = elementMock();

      definition = {
        element,
        settings: {
          scales: {},
          components: [],
          data: {}
        },
        on: {
          click: sinon.spy()
        },
        created,
        beforeMount,
        mounted,
        beforeRender,
        beforeUpdate,
        updated,
        beforeDestroy,
        destroyed
      };

      context = {
        registries: {
          data: () => () => ({})
        }
      };
    });

    it('should call lifecycle methods when rendering', () => {
      chart(definition, context);
      // const expectedThis = {
      //   ...definition
      // };
      expect(created, 'created').to.have.been.calledOnce;
      // expect(created.thisValues[0], 'created context').to.deep.equal(expectedThis);
      expect(beforeRender, 'beforeRender').to.have.been.calledOnce;
      expect(beforeMount, 'beforeMount').to.have.been.calledOnce;
      expect(mounted, 'mounted').to.have.been.calledOnce;
      expect(updated, 'updated').to.not.have.been.called;
    });

    it('should register event listeners when rendering', () => {
      expect(element.listeners.length).to.equal(0);
      chart(definition, context);
      expect(element.listeners.length).to.equal(4); // Click listener + 3 brush listeners
    });

    it('should call lifecycle methods when updating', () => {
      const chartInstance = chart(definition, context);
      chartInstance.update();
      expect(created, 'created').to.have.been.calledOnce;
      expect(beforeRender, 'beforeRender').to.have.been.calledOnce;
      expect(beforeUpdate, 'beforeUpdate').to.have.been.calledOnce;
      expect(beforeMount, 'beforeMount').to.have.been.calledOnce;
      expect(mounted, 'mounted').to.have.been.calledOnce;
      expect(updated, 'updated').to.have.been.calledOnce;
    });

    it('should call lifecycle methods when destroying', () => {
      const chartInstance = chart(definition, context);
      chartInstance.destroy();
      expect(created, 'created').to.have.been.calledOnce;
      expect(beforeRender, 'beforeRender').to.have.been.calledOnce;
      expect(beforeMount, 'beforeMount').to.have.been.calledOnce;
      expect(mounted, 'mounted').to.have.been.calledOnce;
      expect(beforeDestroy, 'beforeDestroy').to.have.been.calledOnce;
      expect(destroyed, 'destroyed').to.have.been.calledOnce;
      expect(element.listeners.length).to.equal(0);
    });
  });
});
