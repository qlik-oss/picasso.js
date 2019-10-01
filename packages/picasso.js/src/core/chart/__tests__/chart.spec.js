import elementMock from 'test-utils/mocks/element-mock';
import componentFactoryFixture from '../../../../test/helpers/component-factory-fixture';
import chart, { orderComponents } from '..';

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

    it('should not freak out when using unregistered components', () => {
      const comp = () => undefined;
      comp.has = () => false;
      const logger = {
        warn: sinon.spy()
      };
      const create = () => {
        chart(Object.assign(definition, {
          settings: {
            components: [{
              type: 'noop'
            }]
          }
        }), {
          logger,
          registries: {
            component: comp
          }
        });
      };

      expect(create).to.not.throw();
      expect(logger.warn).to.have.been.calledWithExactly('Unknown component: noop');
    });

    it('should not update components specified in excludeFromUpdate array', () => {
      const components = {
        box: {
          has: () => true,
          render: sinon.stub()
        },
        point: {
          has: () => true,
          render: sinon.stub()
        }
      };
      const comp = (key) => components[key];
      comp.has = () => true;
      const componentFixture = componentFactoryFixture();

      const comp1UpdatedCb = sinon.spy();
      const comp2UpdatedCb = sinon.spy();
      const chartInstance = chart(Object.assign(definition, {
        settings: {
          components: [{
            type: 'box',
            key: 'comp1',
            updated: comp1UpdatedCb
          }, {
            type: 'point',
            key: 'comp2',
            updated: comp2UpdatedCb
          }]
        }
      }), {
        registries: {
          component: comp,
          renderer: () => () => componentFixture.mocks().renderer
        }
      });
      chartInstance.update();
      expect(comp1UpdatedCb).to.have.been.calledOnce;
      expect(comp2UpdatedCb).to.have.been.calledOnce;
      chartInstance.update({ excludeFromUpdate: ['comp2'] });
      expect(comp1UpdatedCb).to.have.been.calledTwice;
      expect(comp2UpdatedCb).to.have.been.called;
      chartInstance.update({ partialData: true, excludeFromUpdate: ['comp1'] });
      expect(comp1UpdatedCb).to.have.been.calledTwice;
      expect(comp2UpdatedCb).to.have.been.calledTwice;
    });

    it('should maintain displayOrder of components after initial render', () => {
      const components = {
        point: {
          has: () => true,
          render: sinon.stub()
        }
      };
      const comp = (key) => components[key];
      comp.has = () => true;
      const first = componentFactoryFixture().mocks().renderer;
      const second = componentFactoryFixture().mocks().renderer;
      const rendererFactory = sinon.stub();
      rendererFactory.onFirstCall().returns(() => first);
      rendererFactory.onSecondCall().returns(() => second);

      chart({
        ...definition,
        settings: {
          components: [{
            type: 'point',
            key: 'comp1',
            layout: {
              dock: 'left',
              displayOrder: 2
            }
          }, {
            type: 'point',
            key: 'comp2',
            layout: {
              dock: '@comp1',
              displayOrder: 1
            }
          }]
        }
      }, {
        registries: {
          component: comp,
          renderer: rendererFactory
        }
      });
      const order = element.children.map((c) => c.attributes['data-key']);
      expect(order).to.eql(['comp2', 'comp1']);
    });

    it('should maintain displayOrder of components after update', () => {
      const components = {
        point: {
          has: () => true,
          render: sinon.stub()
        }
      };
      const comp = (key) => components[key];
      comp.has = () => true;
      const first = componentFactoryFixture().mocks().renderer;
      const second = componentFactoryFixture().mocks().renderer;
      const rendererFactory = sinon.stub();
      rendererFactory.onFirstCall().returns(() => first);
      rendererFactory.onSecondCall().returns(() => second);

      const chartInstance = chart({
        ...definition,
        settings: {
          components: [{
            type: 'point',
            key: 'comp1',
            layout: {
              dock: 'left',
              displayOrder: 1
            }
          }, {
            type: 'point',
            key: 'comp2',
            layout: {
              dock: 'left',
              displayOrder: 2
            }
          }]
        }
      }, {
        registries: {
          component: comp,
          renderer: rendererFactory
        }
      });
      expect(element.children.map((c) => c.attributes['data-key'])).to.eql(['comp1', 'comp2']);
      chartInstance.update({
        settings: {
          components: [{
            key: 'comp1',
            layout: {
              displayOrder: 2
            }
          }, {
            key: 'comp2',
            layout: {
              displayOrder: 1
            }
          }]
        }
      });
      expect(element.children.map((c) => c.attributes['data-key'])).to.eql(['comp2', 'comp1']);
    });

    describe('brushFromShapes', () => {
      let shapes;
      let config;
      let comp;
      let rendererFactory;
      beforeEach(() => {
        shapes = [{
          key: 'foo',
          data: {
            source: {
              field: 'path/to/data'
            },
            value: 0
          }
        }];

        config = {
          components: [
            {
              action: 'toggle',
              key: 'foo',
              contexts: ['selection']
            },
            {
              action: 'set',
              key: 'bar',
              contexts: ['hover']
            }
          ]
        };

        const components = {
          point: {
            has: () => true,
            render: sinon.stub()
          }
        };
        comp = (key) => components[key];
        comp.has = () => true;

        const first = componentFactoryFixture().mocks().renderer;
        rendererFactory = sinon.stub();
        rendererFactory.onFirstCall().returns(() => first);
      });

      it('should brush on component, which key matches the key of the input shape', () => {
        const defComp = [{
          type: 'point',
          key: 'foo'
        }];

        const chartInstance = chart({
          ...definition,
          settings: {
            components: defComp
          }
        }, {
          registries:
          {
            component: comp,
            renderer: rendererFactory
          }
        });

        chartInstance.brushFromShapes(shapes, config);

        const brushedComponent = chartInstance.component('foo');
        const nonBrushedComponent = chartInstance.component('bar');

        expect(brushedComponent).to.containSubset(defComp[0]);
        expect(nonBrushedComponent).to.be.undefined;
      });

      it('should brush on all components', () => {
        const defComp = [{
          type: 'point',
          key: 'foo'
        },
        {
          type: 'point',
          key: 'bar'
        }];

        const second = componentFactoryFixture().mocks().renderer;
        rendererFactory.onSecondCall().returns(() => second);

        const chartInstance = chart({
          ...definition,
          settings: {
            components: defComp
          }
        }, {
          registries:
          {
            component: comp,
            renderer: rendererFactory
          }
        });

        chartInstance.brushFromShapes(shapes, config);

        const b1 = chartInstance.component('foo');
        const b2 = chartInstance.component('bar');

        expect(b1).to.containSubset(defComp[0]);
        expect(b2).to.containSubset(defComp[1]);
      });

      it('should not brush on any components', () => {
        const defComp = [];

        const chartInstance = chart({
          ...definition,
          settings: {
            components: defComp
          }
        }, {
          registries:
          {
            component: comp,
            renderer: rendererFactory
          }
        });

        chartInstance.brushFromShapes(shapes, config);

        const b1 = chartInstance.component('foo');
        const b2 = chartInstance.component('bar');

        expect(b1).to.be.undefined;
        expect(b2).to.be.undefined;
      });
    });
  });

  describe('orderComponents', () => {
    let visible;
    let el;
    beforeEach(() => {
      const sub = ['b-1', 'b-2'].map(elementMock);
      visible = ['a', 'b', 'c'].map(elementMock).map((e) => ({
        instance: {
          renderer: () => ({
            element: () => e
          }),
          def: {
            additionalElements: e.name === 'b' ? () => sub : undefined
          }
        }
      }));
      el = elementMock('div');
    });

    it('should inject missing elements', () => {
      orderComponents(el, visible);
      let order = el.children.map((e) => e.name);
      expect(order).to.eql(['a', 'b-1', 'b-2', 'b', 'c']);
    });

    it('should re-order existing elements', () => {
      orderComponents(el, visible); // initial will inject children into el

      orderComponents(el, visible); // re-order when el is already populated
      const order = el.children.map((e) => e.name);
      expect(order).to.eql(['a', 'b-1', 'b-2', 'b', 'c']);
    });

    it('should re-order existing elements with explicit order', () => {
      orderComponents(el, visible); // initial will inject children into el

      orderComponents(el, visible, [2, 0, 1]); // re-order when el is already populated
      const order = el.children.map((e) => e.name);
      expect(order).to.eql(['b-1', 'b-2', 'b', 'c', 'a']);
    });
  });
});
