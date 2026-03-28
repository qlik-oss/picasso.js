import * as Sinon from 'sinon';
import { styler, resolveTapEvent } from '../brushing';

interface SourceInfo {
  field: string;
  key?: string;
}

interface DataItemSelf {
  source: SourceInfo;
  value: number | number[];
}

interface DataItem {
  value: number;
  source: SourceInfo;
  self: DataItemSelf;
}

interface Node {
  type: string;
  fill?: string;
  stroke?: string;
  data?: DataItem;
  children?: Node[];
  __style?: Record<string, string | undefined>;
}

interface BrushContextMock {
  setValues: Sinon.SinonSpy;
  toggleValues: Sinon.SinonSpy;
  addValues: Sinon.SinonSpy;
  removeValues: Sinon.SinonSpy;
  toggleRanges: Sinon.SinonSpy;
}

interface BoundingRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface RendererMock {
  itemsAt: Sinon.SinonStub;
  element: () => {
    getBoundingClientRect: Sinon.SinonStub;
  };
}

interface ChartMock {
  brush: Sinon.SinonStub;
}

interface Config {
  renderer: RendererMock;
  chart: ChartMock;
  data: DataItem[];
  sortNodes?: Sinon.SinonStub;
  customRender?: Sinon.SinonStub;
}

interface Trigger {
  contexts: string[];
  data?: string[];
  action?: string;
  touchRadius?: number;
  mouseRadius?: number;
}

interface EventMock {
  clientX: number;
  clientY: number;
  changedTouches?: Array<{ clientX: number; clientY: number }>;
}

interface BrusherStub {
  listeners: Array<Record<string, Function>>;
  containsMappedData: Sinon.SinonStub;
  on: (key: string, fn: Function) => void;
  trigger: (key: string, ...args: any[]) => void;
}

interface DummyComponent {
  chart: ChartMock;
  data: Array<{ self: number }>;
  nodes: Node[];
  renderer: { render: Sinon.SinonSpy };
  config: Record<string, any>;
}

interface ConsumeStyle {
  context: string;
  style?: {
    inactive?: Record<string, string | ((shape: Node) => string)>;
    active?: Record<string, string | ((shape: Node) => string)>;
  };
  mode?: string;
  data?: string[] | ((brush: BrusherStub) => string[]);
  filter?: (node: Node) => boolean;
}

describe('Brushing', () => {
  let nodes: Node[];
  let data: DataItem[];

  beforeEach(() => {
    data = [
      {
        value: 7,
        source: { field: 'a' },
        self: {
          source: { field: 'foo', key: 'cube' },
          value: 1337,
        },
      },
      {
        value: 13,
        source: { field: 'b' },
        self: {
          source: { field: 'bar', key: 'corp' },
          value: 42,
        },
      },
      {
        value: 9,
        source: { field: 'c' },
        self: {
          source: { field: 'bez', key: 'table' },
          value: 33,
        },
      },
      {
        value: 9,
        source: { field: 'c' },
        self: {
          source: { field: 'bez', key: 'table' },
          value: [33, 56],
        },
      },
    ];

    nodes = [
      {
        type: 'rect',
        fill: 'yellow',
        stroke: 'pink',
        data: data[0],
      },
      {
        type: 'rect',
        fill: 'yellow',
        stroke: 'pink',
        data: data[1],
      },
    ];
  });

  describe('Resolver', () => {
    let trigger: Trigger;
    let config: Config;
    let eventMock: EventMock;
    let brushContext: BrushContextMock;

    beforeEach(() => {
      brushContext = {
        setValues: Sinon.spy(),
        toggleValues: Sinon.spy(),
        addValues: Sinon.spy(),
        removeValues: Sinon.spy(),
        toggleRanges: Sinon.spy(),
      };

      config = {
        renderer: {
          itemsAt: Sinon.stub().returns([]),
          element: (): { getBoundingClientRect: Sinon.SinonStub } => ({
            getBoundingClientRect: Sinon.stub().returns({
              left: 0,
              top: 0,
              width: 100,
              height: 100,
            } as BoundingRect),
          }),
        },
        chart: {
          brush: Sinon.stub().returns(brushContext),
        },
        data,
      };

      trigger = {
        contexts: ['test'],
        data: ['self'],
      };

      eventMock = {
        clientX: 50,
        clientY: 50,
      };
    });

    it('should bin multiple collisions into a single brush call', () => {
      config.renderer.itemsAt.returns([{ node: { data: data[0] } }, { node: { data: data[1] } }]);

      resolveTapEvent({ e: eventMock, t: trigger, config });

      expect(brushContext.toggleValues.callCount).to.equal(1);
      expect(brushContext.toggleValues.args[0][0]).to.deep.equal([
        { key: `${data[0].self.source.key}/${data[0].self.source.field}`, value: data[0].self.value },
        { key: `${data[1].self.source.key}/${data[1].self.source.field}`, value: data[1].self.value },
      ]);
    });

    it('should bin multiple collisions into a single brush call using node.data property', () => {
      config.renderer.itemsAt.returns([{ node: { data: data[0] } }, { node: { data: data[1] } }]);

      resolveTapEvent({ e: eventMock, t: trigger, config });

      expect(brushContext.toggleValues.callCount).to.equal(1);
      expect(brushContext.toggleValues.args[0][0]).to.deep.equal([
        { key: `${data[0].self.source.key}/${data[0].self.source.field}`, value: data[0].self.value },
        { key: `${data[1].self.source.key}/${data[1].self.source.field}`, value: data[1].self.value },
      ]);
    });

    it('should call range brush when data value is an array', () => {
      config.renderer.itemsAt.returns([{ node: { data: data[3] } }]);

      resolveTapEvent({ e: eventMock, t: trigger, config });

      expect(brushContext.toggleRanges.callCount).to.equal(1);
      expect(brushContext.toggleRanges.args[0][0]).to.deep.equal([
        {
          key: `${data[3].self.source.key}/${data[3].self.source.field}`,
          range: { min: (data[3].self.value as number[])[0], max: (data[3].self.value as number[])[1] },
        },
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
        eventMock.changedTouches = [{ clientX: 50, clientY: 50 }];
      });

      it('should resolve collisions with a touchRadius if configured', () => {
        const radius = 5;
        trigger.touchRadius = radius;

        resolveTapEvent({ e: eventMock, t: trigger, config });

        expect(config.renderer.itemsAt.args[0][0]).to.deep.equal({
          cx: 50,
          cy: 50,
          r: radius,
        });
      });
    });

    it('should resolve collisions with a mouseRadius if configured', () => {
      const radius = 15;
      trigger.mouseRadius = radius;

      resolveTapEvent({ e: eventMock, t: trigger, config });

      expect(config.renderer.itemsAt.args[0][0]).to.deep.equal({
        cx: 50,
        cy: 50,
        r: radius,
      });
    });
  });

  describe('Styler', () => {
    let dummyComponent: DummyComponent;
    let consume: ConsumeStyle;
    let brusherStub: BrusherStub;
    let dataFn: Sinon.SinonStub;

    beforeEach(() => {
      nodes[0].data = data[0];
      nodes[1].data = data[1];
      dummyComponent = {
        chart: {
          brush: Sinon.stub(),
        },
        data: [{ self: 0 }, { self: 1 }],
        nodes,
        renderer: {
          render: Sinon.spy(),
        },
        config: {},
      };

      brusherStub = {
        listeners: [],
        containsMappedData: Sinon.stub(),
        on: function on(key: string, fn: Function): void {
          const obj: Record<string, Function> = {};
          obj[key] = fn;
          this.listeners.push(obj);
        },
        trigger: function trigger(key: string, ...args: any[]): void {
          this.listeners
            .filter((listener) => typeof listener[key] !== 'undefined')
            .forEach((listener) => listener[key](...args));
        },
      };
      brusherStub.containsMappedData.onCall(0).returns(false); // Do not match first node but all after
      brusherStub.containsMappedData.returns(true);
      dummyComponent.chart.brush.returns(brusherStub);

      consume = {
        context: 'test',
        style: {
          inactive: {
            fill: 'inactiveFill',
          },
          active: {
            stroke: 'activeStroke',
          },
        },
      };

      dataFn = Sinon.stub();
      dataFn.returns(['b']);
    });

    it('should call containsMappedData with provided arguments', () => {
      const s = styler(dummyComponent, { ...consume, mode: 'moood', data: ['a'] } as any);
      (s as any).update();

      expect(brusherStub.containsMappedData.firstCall).to.have.been.calledWithExactly(data[0], ['a'], 'moood');
    });

    it('should call containsMappedData with provided arguments when data is a function', () => {
      const s = styler(dummyComponent, { ...consume, mode: 'moood', data: dataFn } as any);
      (s as any).update();
      expect(dataFn).to.have.been.calledWithExactly({ brush: brusherStub });
      expect(brusherStub.containsMappedData.firstCall).to.have.been.calledWithExactly(data[0], ['b'], 'moood');
    });

    it('start should store all original styling values', () => {
      styler(dummyComponent, consume as any);
      brusherStub.trigger('start');

      (dummyComponent.renderer.render.args[0][0] as Node[]).forEach((node: Node) => {
        expect(node.__style).to.deep.equal({
          fill: 'yellow',
          stroke: 'pink',
        });
      });
    });

    it('start should inactive all nodes', () => {
      styler(dummyComponent, consume as any);
      brusherStub.trigger('start');

      (dummyComponent.renderer.render.args[0][0] as Node[]).forEach((node: Node) => {
        expect(node.fill).to.deep.equal('inactiveFill');
      });
    });

    it('end should restore all original styling values', () => {
      styler(dummyComponent, consume as any);
      brusherStub.trigger('start');
      brusherStub.trigger('end');

      (dummyComponent.renderer.render.args[0][0] as Node[]).forEach((node: Node) => {
        expect(node.__style).to.equal(undefined);
      });
    });

    it('start and end should call renderer.render by default', () => {
      styler(dummyComponent, consume as any);
      brusherStub.trigger('start');
      brusherStub.trigger('end');

      expect(dummyComponent.renderer.render.calledTwice).to.be.true;
    });

    it('start, end and update should call renderer.render if supressRender=false is passed', () => {
      styler(dummyComponent, consume as any);
      brusherStub.trigger('start', { suppressRender: false });
      brusherStub.trigger('end', { suppressRender: false });

      expect(dummyComponent.renderer.render.calledTwice).to.be.true;
    });

    it('start and end should not call renderer.render if supressRender=true is passed', () => {
      styler(dummyComponent, consume as any);
      brusherStub.trigger('start', { suppressRender: true });
      brusherStub.trigger('end', { suppressRender: true });

      expect(dummyComponent.renderer.render.callCount).to.equal(0);
    });

    it('end should restore all original styling values if supressRender=true is passed but not call render', () => {
      styler(dummyComponent, consume as any);
      brusherStub.trigger('start');
      brusherStub.trigger('end', { suppressRender: true });

      (dummyComponent.renderer.render.args[0][0] as Node[]).forEach((node: Node) => {
        expect(node.__style).to.equal(undefined);
      });
      expect(dummyComponent.renderer.render.calledOnce).to.be.true;
    });

    it('update should apply styling values', () => {
      styler(dummyComponent, consume as any);
      brusherStub.trigger('start');
      brusherStub.trigger('update');

      const output = dummyComponent.renderer.render.args[0][0] as Node[];
      expect(output[0].stroke).to.equal('pink'); // Inactive
      expect(output[0].fill).to.equal('inactiveFill');
      expect(output[1].stroke).to.equal('activeStroke'); // Active
      expect(output[1].fill).to.equal('yellow');
    });

    it('update should apply sorting nodes', () => {
      dummyComponent.config.sortNodes = Sinon.stub().returns(nodes);
      styler(dummyComponent, consume as any);
      brusherStub.trigger('start');
      brusherStub.trigger('update');

      const output = dummyComponent.renderer.render.args[0][0] as Node[];
      expect(dummyComponent.config.sortNodes).to.have.been.calledWith(dummyComponent);
      expect(output[0].stroke).to.equal('pink'); // Inactive
      expect(output[0].fill).to.equal('inactiveFill');
      expect(output[1].stroke).to.equal('activeStroke'); // Active
      expect(output[1].fill).to.equal('yellow');
    });

    it('update should use customRender if any', () => {
      dummyComponent.config.customRender = Sinon.stub();
      styler(dummyComponent, consume as any);
      brusherStub.trigger('update');
      expect(dummyComponent.config.customRender).to.have.been.calledWith({
        render: dummyComponent.renderer.render,
        nodes: dummyComponent.nodes,
      });
    });

    it('update should apply styling values only to shape nodes', () => {
      nodes.push({
        type: 'container',
        stroke: 'doNotUpdate',
        fill: 'doNotUpdate',
        children: [
          {
            type: 'circle',
            fill: 'yellow',
            stroke: 'updateThis',
            data: data[0],
          },
          {
            type: 'container',
            children: [
              {
                type: 'line',
                fill: 'yellow',
                stroke: 'updateThis',
                data: data[0],
              },
            ],
          },
        ],
      });
      styler(dummyComponent, consume as any);
      brusherStub.trigger('start');
      brusherStub.trigger('update');

      const output = dummyComponent.renderer.render.args[0][0] as Node[];
      expect(output[0].stroke).to.equal('pink'); // Inactive
      expect(output[0].fill).to.equal('inactiveFill');
      expect(output[1].stroke).to.equal('activeStroke'); // Active
      expect(output[1].fill).to.equal('yellow');
      expect(output[2].stroke).to.equal('doNotUpdate'); // Active but not affected because type is container
      expect(output[2].fill).to.equal('doNotUpdate');
      expect((output[2].children as Node[])[0].stroke).to.equal('activeStroke'); // Active because it's parent is affected
      expect((output[2].children as Node[])[1].stroke).to.equal(undefined); // Active but not affected because type is container
      expect((output[2].children as Node[])[1].fill).to.equal(undefined);
      expect((output[2].children as Node[])[1].children![0].stroke).to.equal('activeStroke'); // Active because it's parent is affected
      expect((output[2].children as Node[])[1].children![0].fill).to.equal('yellow');
    });

    it('update should apply styling values only to shape nodes with data attribute', () => {
      dummyComponent.nodes = [
        {
          type: 'circle',
          fill: 'doNotUpdate',
          stroke: 'doNotUpdate',
        },
        {
          type: 'line',
          fill: 'updateThis',
          data: data[1],
        },
      ];
      styler(dummyComponent, consume as any);
      brusherStub.trigger('start');
      brusherStub.trigger('update');

      const output = dummyComponent.renderer.render.args[0][0] as Node[];
      expect(output[0].stroke).to.equal('doNotUpdate'); // No data attr
      expect(output[0].fill).to.equal('doNotUpdate');
      expect(output[1].fill).to.equal('inactiveFill'); // Inactive
    });

    it('should only affect filtered nodes', () => {
      dummyComponent.nodes = [
        { type: 'a', fill: 'start', data: {} as any },
        { type: 'b', fill: 'start', data: {} as any },
        { type: 'c', fill: 'start', data: {} as any },
        { type: 'd', fill: 'start', data: {} as any },
      ];

      styler(dummyComponent, {
        context: 'test',
        filter(n: Node): boolean {
          return n.type === 'a' || n.type === 'c';
        },
        style: {
          active: {
            fill: 'active',
          },
          inactive: {
            fill: 'inactive',
          },
        },
      } as any);
      brusherStub.trigger('start');
      brusherStub.trigger('update');

      const output = dummyComponent.renderer.render.args[0][0] as Node[];
      expect(output.map((n: Node) => n.fill)).to.eql(['inactive', 'start', 'active', 'start']);
    });

    it('should resolve style function property functions', () => {
      dummyComponent.nodes = [
        { type: 'a', fill: 'red', data: {} as any },
        { type: 'b', fill: 'green', data: {} as any },
      ];

      styler(dummyComponent, {
        context: 'test',
        style: {
          active: {
            fill: (shape: Node): string => `${shape.fill}-active`,
          },
          inactive: {
            fill: (shape: Node): string => `${shape.fill}-inactive`,
          },
        },
      } as any);
      brusherStub.trigger('start');
      brusherStub.trigger('update');

      const output = dummyComponent.renderer.render.args[0][0] as Node[];
      expect(output.map((n: Node) => n.fill)).to.eql(['inactive', 'start', 'active', 'start']);
    });

    it('should resolve style function property functions', () => {
      dummyComponent.nodes = [
        { type: 'a', fill: 'red', data: {} as any },
        { type: 'b', fill: 'green', data: {} as any },
      ];

      styler(dummyComponent, {
        context: 'test',
        style: {
          active: {
            fill: (shape: Node): string => `${shape.fill}-active`,
          },
          inactive: {
            fill: (shape: Node): string => `${shape.fill}-inactive`,
          },
        },
      } as any);
      brusherStub.trigger('start');
      brusherStub.trigger('update');

      const output = dummyComponent.renderer.render.args[0][0] as Node[];
      expect(output.map((n: Node) => n.fill)).to.eql(['red-inactive', 'green-active']);
    });
  });
});
