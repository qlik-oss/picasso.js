import elementMock from 'test-utils/mocks/element-mock';
import componentFactoryFixture from '../../../../test/helpers/component-factory-fixture';
import * as createStorage from '../../storage';
import chart, { orderComponents } from '..';
import { vi } from 'vitest';

vi.mock('../../storage', async (importOriginal) => ({
  ...(await importOriginal()),
  default: vi.fn(),
}));

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
    let sandbox;

    beforeEach(() => {
      sandbox = vi;
      created = vi.fn();
      beforeMount = vi.fn();
      mounted = vi.fn();
      beforeRender = vi.fn();
      beforeUpdate = vi.fn();
      updated = vi.fn();
      beforeDestroy = vi.fn();
      destroyed = vi.fn();

      element = elementMock();

      definition = {
        element,
        settings: {
          scales: {},
          components: [],
          data: {},
        },
        on: {
          click: vi.fn(),
        },
        created,
        beforeMount,
        mounted,
        beforeRender,
        beforeUpdate,
        updated,
        beforeDestroy,
        destroyed,
      };

      context = {
        registries: {
          data: () => () => ({}),
        },
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should call lifecycle methods when rendering', () => {
      chart(definition, context);
      // const expectedThis = {
      //   ...definition
      // };
      expect(created, 'created').toHaveBeenCalledTimes(1);
      // expect(created.thisValues[0], 'created context').to.deep.equal(expectedThis);
      expect(beforeRender, 'beforeRender').toHaveBeenCalledTimes(1);
      expect(beforeMount, 'beforeMount').toHaveBeenCalledTimes(1);
      expect(mounted, 'mounted').toHaveBeenCalledTimes(1);
      expect(updated, 'updated').not.toHaveBeenCalled();
    });

    it('should register event listeners when rendering', () => {
      expect(element.listeners.length).to.equal(0);
      chart(definition, context);
      expect(element.listeners.length).to.equal(4); // Click listener + 3 brush listeners
    });

    it('should call lifecycle methods when updating', () => {
      const chartInstance = chart(definition, context);
      chartInstance.update();
      expect(created, 'created').toHaveBeenCalledTimes(1);
      expect(beforeRender, 'beforeRender').toHaveBeenCalledTimes(1);
      expect(beforeUpdate, 'beforeUpdate').toHaveBeenCalledTimes(1);
      expect(beforeMount, 'beforeMount').toHaveBeenCalledTimes(1);
      expect(mounted, 'mounted').toHaveBeenCalledTimes(1);
      expect(updated, 'updated').toHaveBeenCalledTimes(1);
    });

    it('should call lifecycle methods when destroying', () => {
      const chartInstance = chart(definition, context);
      chartInstance.destroy();
      expect(created, 'created').toHaveBeenCalledTimes(1);
      expect(beforeRender, 'beforeRender').toHaveBeenCalledTimes(1);
      expect(beforeMount, 'beforeMount').toHaveBeenCalledTimes(1);
      expect(mounted, 'mounted').toHaveBeenCalledTimes(1);
      expect(beforeDestroy, 'beforeDestroy').toHaveBeenCalledTimes(1);
      expect(destroyed, 'destroyed').toHaveBeenCalledTimes(1);
      expect(element.listeners.length).to.equal(0);
    });

    it('should not freak out when using unregistered components', () => {
      const comp = () => undefined;
      comp.has = () => false;
      const logger = {
        warn: vi.fn(),
      };
      const create = () => {
        chart(
          Object.assign(definition, {
            settings: {
              components: [
                {
                  type: 'noop',
                },
              ],
            },
          }),
          {
            logger,
            registries: {
              component: comp,
            },
          },
        );
      };

      expect(create).to.not.throw();
      expect(logger.warn).toHaveBeenCalledWith('Unknown component: noop');
    });

    it('should not update components specified in excludeFromUpdate array', () => {
      const components = {
        box: {
          has: () => true,
          render: vi.fn(),
        },
        point: {
          has: () => true,
          render: vi.fn(),
        },
      };
      const comp = (key) => components[key];
      comp.has = () => true;
      const componentFixture = componentFactoryFixture();

      const comp1UpdatedCb = vi.fn();
      const comp2UpdatedCb = vi.fn();
      const chartInstance = chart(
        Object.assign(definition, {
          settings: {
            components: [
              {
                type: 'box',
                key: 'comp1',
                updated: comp1UpdatedCb,
              },
              {
                type: 'point',
                key: 'comp2',
                updated: comp2UpdatedCb,
              },
            ],
          },
        }),
        {
          registries: {
            component: comp,
            renderer: () => () => componentFixture.mocks().renderer,
          },
        },
      );
      chartInstance.update();
      expect(comp1UpdatedCb).toHaveBeenCalledTimes(1);
      expect(comp2UpdatedCb).toHaveBeenCalledTimes(1);
      chartInstance.update({ excludeFromUpdate: ['comp2'] });
      expect(comp1UpdatedCb).toHaveBeenCalledTimes(2);
      expect(comp2UpdatedCb).toHaveBeenCalled();
      chartInstance.update({ partialData: true, excludeFromUpdate: ['comp1'] });
      expect(comp1UpdatedCb).toHaveBeenCalledTimes(2);
      expect(comp2UpdatedCb).toHaveBeenCalledTimes(2);
    });

    it('should run proper functions on layouting components', () => {
      const components = {
        box: {
          has: () => true,
          render: vi.fn(),
        },
        point: {
          has: () => true,
          render: vi.fn(),
        },
      };
      const comp = (key) => components[key];
      comp.has = () => true;
      const componentFixture = componentFactoryFixture();

      const comp1BeforeUpdateCb = vi.fn();
      const comp2BeforeUpdateCb = vi.fn();
      const chartInstance = chart(
        Object.assign(definition, {
          settings: {
            components: [
              {
                type: 'box',
                key: 'comp1',
                beforeUpdate: comp1BeforeUpdateCb,
              },
              {
                type: 'point',
                key: 'comp2',
                beforeUpdate: comp2BeforeUpdateCb,
              },
            ],
          },
        }),
        {
          registries: {
            component: comp,
            renderer: () => () => componentFixture.mocks().renderer,
          },
        },
      );
      chartInstance.layoutComponents();
      expect(comp1BeforeUpdateCb).toHaveBeenCalledTimes(1);
      expect(comp2BeforeUpdateCb).toHaveBeenCalledTimes(1);
      chartInstance.layoutComponents();
      expect(comp1BeforeUpdateCb).toHaveBeenCalledTimes(2);
      expect(comp2BeforeUpdateCb).toHaveBeenCalledTimes(2);
    });

    it('should update components where transform should be applied', () => {
      const components = {
        box: {
          render: () => ['boxNode1'],
        },
        point: {
          render: () => ['pointNode1'],
        },
      };
      const comp = (key) => components[key];
      comp.has = () => true;
      const componentFixture = componentFactoryFixture();
      const mockedRenderer = componentFixture.mocks().renderer;
      mockedRenderer.render = vi.fn();

      const chartInstance = chart(
        Object.assign(definition, {
          settings: {
            components: [
              {
                type: 'box',
                key: 'comp1',
              },
              {
                type: 'point',
                key: 'comp2',
                rendererSettings: {
                  transform: () => ({ a: 0, b: 1, c: 0, d: 1, e: 100, f: 100 }),
                },
              },
            ],
          },
        }),
        {
          registries: {
            component: comp,
            renderer: () => () => mockedRenderer,
          },
        },
      );

      expect(mockedRenderer.render).toHaveBeenCalledTimes(2);
      mockedRenderer.settings = vi.fn();
      chartInstance.update({ partialData: true });
      expect(mockedRenderer.settings).toHaveBeenCalledTimes(1);
      const renderArgs = mockedRenderer.render.mock.calls;
      // no nodes are passed into renderers render function when applying transform!
      expect(renderArgs).to.eql([[['boxNode1']], [['pointNode1']], [['boxNode1']], []]);
    });

    it('should maintain displayOrder of components after initial render', () => {
      const components = {
        point: {
          has: () => true,
          render: vi.fn(),
        },
      };
      const comp = (key) => components[key];
      comp.has = () => true;
      const first = componentFactoryFixture().mocks().renderer;
      const second = componentFactoryFixture().mocks().renderer;
      const rendererFactory = vi.fn();
      rendererFactory.mockReturnValueOnce(() => first);
      rendererFactory.mockReturnValueOnce(() => second);

      chart(
        {
          ...definition,
          settings: {
            components: [
              {
                type: 'point',
                key: 'comp1',
                layout: {
                  dock: 'left',
                  displayOrder: 2,
                },
              },
              {
                type: 'point',
                key: 'comp2',
                layout: {
                  dock: '@comp1',
                  displayOrder: 1,
                },
              },
            ],
          },
        },
        {
          registries: {
            component: comp,
            renderer: rendererFactory,
          },
        },
      );
      const order = element.children.map((c) => c.attributes['data-key']);
      expect(order).to.eql(['comp2', 'comp1']);
    });

    it('should maintain displayOrder of components after update', () => {
      const components = {
        point: {
          has: () => true,
          render: vi.fn(),
        },
      };
      const comp = (key) => components[key];
      comp.has = () => true;
      const first = componentFactoryFixture().mocks().renderer;
      const second = componentFactoryFixture().mocks().renderer;
      const rendererFactory = vi.fn();
      rendererFactory.mockReturnValueOnce(() => first);
      rendererFactory.mockReturnValueOnce(() => second);

      const chartInstance = chart(
        {
          ...definition,
          settings: {
            components: [
              {
                type: 'point',
                key: 'comp1',
                layout: {
                  dock: 'left',
                  displayOrder: 1,
                },
              },
              {
                type: 'point',
                key: 'comp2',
                layout: {
                  dock: 'left',
                  displayOrder: 2,
                },
              },
            ],
          },
        },
        {
          registries: {
            component: comp,
            renderer: rendererFactory,
          },
        },
      );
      expect(element.children.map((c) => c.attributes['data-key'])).to.eql(['comp1', 'comp2']);
      chartInstance.update({
        settings: {
          components: [
            {
              key: 'comp1',
              layout: {
                displayOrder: 2,
              },
            },
            {
              key: 'comp2',
              layout: {
                displayOrder: 1,
              },
            },
          ],
        },
      });
      expect(element.children.map((c) => c.attributes['data-key'])).to.eql(['comp2', 'comp1']);
    });

    describe('brushFromShapes', () => {
      let shapes;
      let config;
      let comp;
      let rendererFactory;
      beforeEach(() => {
        shapes = [
          {
            key: 'foo',
            data: {
              source: {
                field: 'path/to/data',
              },
              value: 0,
            },
          },
        ];

        config = {
          components: [
            {
              action: 'toggle',
              key: 'foo',
              contexts: ['selection'],
            },
            {
              action: 'set',
              key: 'bar',
              contexts: ['hover'],
            },
          ],
        };

        const components = {
          point: {
            has: () => true,
            render: vi.fn(),
          },
        };
        comp = (key) => components[key];
        comp.has = () => true;

        const first = componentFactoryFixture().mocks().renderer;
        rendererFactory = vi.fn();
        rendererFactory.mockReturnValueOnce(() => first);
      });

      it('should brush on component, which key matches the key of the input shape', () => {
        const defComp = [
          {
            type: 'point',
            key: 'foo',
          },
        ];

        const chartInstance = chart(
          {
            ...definition,
            settings: {
              components: defComp,
            },
          },
          {
            registries: {
              component: comp,
              renderer: rendererFactory,
            },
          },
        );

        chartInstance.brushFromShapes(shapes, config);

        const brushedComponent = chartInstance.component('foo');
        const nonBrushedComponent = chartInstance.component('bar');

        expect(brushedComponent).toMatchObject(defComp[0]);
        expect(nonBrushedComponent).to.be.undefined;
      });

      it('should brush on all components', () => {
        const defComp = [
          {
            type: 'point',
            key: 'foo',
          },
          {
            type: 'point',
            key: 'bar',
          },
        ];

        const second = componentFactoryFixture().mocks().renderer;
        rendererFactory.mockReturnValueOnce(() => second);

        const chartInstance = chart(
          {
            ...definition,
            settings: {
              components: defComp,
            },
          },
          {
            registries: {
              component: comp,
              renderer: rendererFactory,
            },
          },
        );

        chartInstance.brushFromShapes(shapes, config);

        const b1 = chartInstance.component('foo');
        const b2 = chartInstance.component('bar');

        expect(b1).toMatchObject(defComp[0]);
        expect(b2).toMatchObject(defComp[1]);
      });

      it('should not brush on any components', () => {
        const defComp = [];

        const chartInstance = chart(
          {
            ...definition,
            settings: {
              components: defComp,
            },
          },
          {
            registries: {
              component: comp,
              renderer: rendererFactory,
            },
          },
        );

        chartInstance.brushFromShapes(shapes, config);

        const b1 = chartInstance.component('foo');
        const b2 = chartInstance.component('bar');

        expect(b1).to.be.undefined;
        expect(b2).to.be.undefined;
      });
    });

    describe('storage', () => {
      it('should call createStorage with correct parameters', () => {
        createStorage.default.mockClear();
        createStorage.default.mockReturnValue({ key: 'cs' });
        const chartInstance = chart(definition, context);
        expect(createStorage.default.mock.calls).to.have.length(1);
        expect(createStorage.default.mock.calls[0][0]).to.deep.equal({
          animations: { updatingStageMeta: { isInit: false, shouldBeRemoved: false } },
        });
        expect(chartInstance.storage).to.deep.equal({ key: 'cs' });
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
            element: () => e,
          }),
          def: {
            additionalElements: e.name === 'b' ? () => sub : undefined,
          },
        },
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

    it('should re-order existing elements with new order', () => {
      orderComponents(el, visible); // initial will inject children into el
      visible = [visible[1], visible[2], visible[0]]; // change order
      orderComponents(el, visible); // re-order when el is already populated
      const order = el.children.map((e) => e.name);
      expect(order).to.eql(['b-1', 'b-2', 'b', 'c', 'a']);
    });
  });
});
