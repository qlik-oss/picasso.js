import {
  styler,
  resolveTapEvent
} from '../../../../src/core/component/brushing';

describe('Brushing', () => {
  let nodes;
  let data;

  beforeEach(() => {
    data = [
      {
        value: 7,
        source: { field: 'a' },
        self: {
          source: { field: 'foo', key: 'cube' },
          value: 1337
        }
      },
      {
        value: 13,
        source: { field: 'b' },
        self: {
          source: { field: 'bar', key: 'corp' },
          value: 42
        }
      },
      {
        value: 9,
        source: { field: 'c' },
        self: {
          source: { field: 'bez', key: 'table' },
          value: 33
        }
      },
      {
        value: 9,
        source: { field: 'c' },
        self: {
          source: { field: 'bez', key: 'table' },
          value: [33, 56]
        }
      }
    ];

    nodes = [
      {
        type: 'rect',
        fill: 'yellow',
        stroke: 'pink',
        data: data[0]
      },
      {
        type: 'rect',
        fill: 'yellow',
        stroke: 'pink',
        data: data[1]
      }
    ];
  });

  describe('Resolver', () => {
    let trigger;
    let config;
    let eventMock;
    let brushContext;

    beforeEach(() => {
      brushContext = {
        setValues: sinon.spy(),
        toggleValues: sinon.spy(),
        addValues: sinon.spy(),
        removeValues: sinon.spy(),
        toggleRanges: sinon.spy()
      };

      config = {
        renderer: {
          itemsAt: sinon.stub().returns([]),
          element: () => ({
            getBoundingClientRect: sinon.stub().returns({ left: 0, top: 0, width: 100, height: 100 })
          })
        },
        chart: {
          brush: sinon.stub().returns(brushContext)
        },
        data
      };

      trigger = {
        contexts: ['test'],
        data: ['self']
      };

      eventMock = {
        clientX: 50,
        clientY: 50
      };
    });

    it('should bin multiple collisions into a single brush call', () => {
      config.renderer.itemsAt.returns([
        { node: { data: data[0] } },
        { node: { data: data[1] } }
      ]);

      resolveTapEvent({ e: eventMock, t: trigger, config });

      expect(brushContext.toggleValues.callCount).to.equal(1);
      expect(brushContext.toggleValues.args[0][0]).to.deep.equal([
        { key: `${data[0].self.source.key}/${data[0].self.source.field}`, value: data[0].self.value },
        { key: `${data[1].self.source.key}/${data[1].self.source.field}`, value: data[1].self.value }
      ]);
    });

    it('should bin multiple collisions into a single brush call using node.data property', () => {
      config.renderer.itemsAt.returns([
        { node: { data: data[0] } },
        { node: { data: data[1] } }
      ]);

      resolveTapEvent({ e: eventMock, t: trigger, config });

      expect(brushContext.toggleValues.callCount).to.equal(1);
      expect(brushContext.toggleValues.args[0][0]).to.deep.equal([
        { key: `${data[0].self.source.key}/${data[0].self.source.field}`, value: data[0].self.value },
        { key: `${data[1].self.source.key}/${data[1].self.source.field}`, value: data[1].self.value }
      ]);
    });

    it('should call range brush when data value is an array', () => {
      config.renderer.itemsAt.returns([
        { node: { data: data[3] } }
      ]);

      resolveTapEvent({ e: eventMock, t: trigger, config });

      expect(brushContext.toggleRanges.callCount).to.equal(1);
      expect(brushContext.toggleRanges.args[0][0]).to.deep.equal([
        { key: `${data[3].self.source.key}/${data[3].self.source.field}`, range: { min: data[3].self.value[0], max: data[3].self.value[1] } }
      ]);
    });

    it('should handle when there is no collision', () => {
      config.renderer.itemsAt.returns([]);

      resolveTapEvent({ e: eventMock, t: trigger, config });

      expect(brushContext.toggleValues).to.have.been.calledWith([]);
    });

    it('should default to "" if no data context is configured', () => {
      config.renderer.itemsAt.returns([{ node: { data: data[0] } }]);
      trigger.data = undefined;

      resolveTapEvent({ e: eventMock, t: trigger, config });

      expect(brushContext.toggleValues.args[0][0]).to.deep.equal([{ key: data[0].source.field, value: data[0].value }]);
    });

    it('should not attempt to resolve any collisions if event origin is outside the component area', () => {
      eventMock.clientX = 250;
      eventMock.clientY = 250;

      resolveTapEvent({ e: eventMock, t: trigger, config });

      expect(config.renderer.itemsAt.callCount).to.equal(0);
    });

    describe('should use configured action', () => {
      beforeEach(() => {
        config.renderer.itemsAt.returns([{ node: { data: data[0] } }]);
      });

      it('add', () => {
        trigger.action = 'add';

        resolveTapEvent({ e: eventMock, t: trigger, config });

        expect(brushContext.addValues.callCount).to.equal(1);
      });

      it('remove', () => {
        trigger.action = 'remove';

        resolveTapEvent({ e: eventMock, t: trigger, config });

        expect(brushContext.removeValues.callCount).to.equal(1);
      });

      it('set', () => {
        trigger.action = 'set';

        resolveTapEvent({ e: eventMock, t: trigger, config });

        expect(brushContext.setValues.callCount).to.equal(1);
      });
    });

    describe('touch events', () => {
      beforeEach(() => {
        eventMock.changedTouches = [
          { clientX: 50, clientY: 50 }
        ];
      });

      it('should resolve collisions with a touchRadius if configured', () => {
        const radius = 5;
        trigger.touchRadius = radius;

        resolveTapEvent({ e: eventMock, t: trigger, config });

        expect(config.renderer.itemsAt.args[0][0]).to.deep.equal({
          cx: 50,
          cy: 50,
          r: radius
        });
      });
    });
  });

  describe('Styler', () => {
    let dummyComponent;
    let consume;
    let brusherStub;

    beforeEach(() => {
      nodes[0].data = data[0];
      nodes[1].data = data[1];
      dummyComponent = {
        chart: {
          brush: sinon.stub()
        },
        data: [
          { self: 0 },
          { self: 1 }
        ],
        nodes,
        renderer: {
          render: sinon.spy()
        }
      };

      brusherStub = {
        listeners: [],
        containsMappedData: sinon.stub(),
        on: function on(key, fn) {
          const obj = {};
          obj[key] = fn;
          this.listeners.push(obj);
        },
        trigger: function trigger(key) {
          this.listeners
          .filter(listener => typeof listener[key] !== 'undefined')
          .forEach(listener => listener[key]());
        }
      };
      brusherStub.containsMappedData.onCall(0).returns(false); // Do not match first node but all after
      brusherStub.containsMappedData.returns(true);
      dummyComponent.chart.brush.returns(brusherStub);

      consume = {
        context: 'test',
        style: {
          inactive: {
            fill: 'inactiveFill'
          },
          active: {
            stroke: 'activeStroke'
          }
        }
      };
    });

    it('start should store all original styling values', () => {
      styler(dummyComponent, consume);
      brusherStub.trigger('start');

      dummyComponent.renderer.render.args[0][0].forEach((node) => {
        expect(node.__style).to.deep.equal({
          fill: 'yellow',
          stroke: 'pink'
        });
      });
    });

    it('start should inactive all nodes', () => {
      styler(dummyComponent, consume);
      brusherStub.trigger('start');

      dummyComponent.renderer.render.args[0][0].forEach((node) => {
        expect(node.style).to.deep.equal({
          fill: 'inactiveFill'
        });
      });
    });

    it('end should restore all original styling values', () => {
      styler(dummyComponent, consume);
      brusherStub.trigger('start');
      brusherStub.trigger('end');

      dummyComponent.renderer.render.args[0][0].forEach((node) => {
        expect(node.__style).to.equal(undefined);
      });
    });

    it('update should apply styling values', () => {
      styler(dummyComponent, consume);
      brusherStub.trigger('start');
      brusherStub.trigger('update');

      const output = dummyComponent.renderer.render.args[0][0];
      expect(output[0].stroke).to.equal('pink'); // Inactive
      expect(output[0].fill).to.equal('inactiveFill');
      expect(output[1].stroke).to.equal('activeStroke'); // Active
      expect(output[1].fill).to.equal('yellow');
    });

    it('update should apply styling values only to shape nodes', () => {
      nodes.push(
        {
          type: 'container',
          stroke: 'doNotUpdate',
          fill: 'doNotUpdate',
          children: [
            {
              type: 'circle',
              fill: 'yellow',
              stroke: 'updateThis',
              data: data[0]
            },
            {
              type: 'container',
              children: [
                {
                  type: 'line',
                  fill: 'yellow',
                  stroke: 'updateThis',
                  data: data[0]
                }
              ]
            }
          ]
        }
      );
      styler(dummyComponent, consume);
      brusherStub.trigger('start');
      brusherStub.trigger('update');

      const output = dummyComponent.renderer.render.args[0][0];
      expect(output[0].stroke).to.equal('pink'); // Inactive
      expect(output[0].fill).to.equal('inactiveFill');
      expect(output[1].stroke).to.equal('activeStroke'); // Active
      expect(output[1].fill).to.equal('yellow');
      expect(output[2].stroke).to.equal('doNotUpdate'); // Active but not affected because type is container
      expect(output[2].fill).to.equal('doNotUpdate');
      expect(output[2].children[0].stroke).to.equal('activeStroke'); // Active because it's parent is affected
      expect(output[2].children[1].stroke).to.equal(undefined); // Active but not affected because type is container
      expect(output[2].children[1].fill).to.equal(undefined);
      expect(output[2].children[1].children[0].stroke).to.equal('activeStroke'); // Active because it's parent is affected
      expect(output[2].children[1].children[0].fill).to.equal('yellow');
    });

    it('update should apply styling values only to shape nodes with data attribute', () => {
      dummyComponent.nodes = [
        {
          type: 'circle',
          fill: 'doNotUpdate',
          stroke: 'doNotUpdate'
        },
        {
          type: 'line',
          fill: 'updateThis',
          data: data[1]
        }
      ];
      styler(dummyComponent, consume);
      brusherStub.trigger('start');
      brusherStub.trigger('update');

      const output = dummyComponent.renderer.render.args[0][0];
      expect(output[0].stroke).to.equal('doNotUpdate'); // No data attr
      expect(output[0].fill).to.equal('inactiveFill');
      expect(output[1].fill).to.equal('inactiveFill'); // Inactive
    });
  });
});
