import * as sinon from 'sinon';
import componentFactory from '../component-factory';
import * as tween from '../tween';
import * as brushing from '../brushing';
import * as extractData from '../../data/extractor';

interface Brush {
  on?: () => void;
  containsMappedData?: (data: unknown, props?: string[], mode?: string) => boolean;
  [key: string]: unknown;
}

interface Chart {
  brush: () => Brush;
  container: () => Record<string, unknown>;
  table: () => Record<string, unknown>;
  dataset: () => Record<string, unknown>;
  scale: sinon.SinonStub;
  logger: () => string;
  storage: Record<string, unknown>;
  containsMappedData?: (data: unknown, props?: string[], mode?: string) => boolean;
}

interface Renderer {
  appendTo: () => void;
  render: sinon.SinonStub | (() => Record<string, unknown>);
  destroy: () => Record<string, unknown>;
  size: (s: unknown) => unknown;
  element: () => string;
  settings?: sinon.SinonSpy;
  findShapes?: () => Array<Record<string, unknown>>;
  itemsAt?: () => Array<Record<string, unknown>>;
}

interface ThemeContext {
  palette: sinon.SinonStub;
  style: sinon.SinonStub;
}

interface ComponentDefinition {
  defaultSettings: Record<string, unknown>;
  created?: sinon.SinonSpy;
  beforeMount?: sinon.SinonSpy;
  mounted?: sinon.SinonSpy;
  beforeRender?: sinon.SinonSpy;
  render?: sinon.SinonSpy | sinon.SinonStub | (() => string[]);
  resize?: sinon.SinonSpy;
  beforeUpdate?: sinon.SinonSpy;
  updated?: sinon.SinonSpy;
  require?: string[];
  [key: string]: unknown;
}

interface ComponentInstanceCtx {
  emit: (...args: unknown[]) => void;
  isVisible: () => boolean;
  [key: string]: unknown;
}

interface ComponentInstance {
  dockConfig: () => unknown;
  set: (opts?: Record<string, unknown>) => void;
  resize: (inner?: Record<string, unknown>, outer?: Record<string, unknown>) => void;
  getRect: () => unknown;
  beforeMount: () => void;
  beforeRender: () => void;
  render: () => void;
  hide: () => void;
  beforeUpdate: () => void;
  update: () => void;
  updated: () => void;
  destroy: () => void;
  getBrushedShapes: (brushCtx: string, mode?: string, props?: unknown) => unknown[];
  findShapes: (selector: string) => unknown[];
  shapesAt: (shape: unknown, opts?: Record<string, unknown>) => unknown[];
  brushFromShapes: (shapes: unknown[], trigger?: Record<string, unknown>) => void;
  mount: () => void;
  mounted: () => void;
  unmount: () => void;
  onBrushTap: (e: unknown) => void;
  onBrushOver: (e: unknown) => void;
  def: unknown;
  ctx: ComponentInstanceCtx;
  renderer: () => Renderer;
}

interface ComponentConfig {
  settings?: Record<string, unknown>;
  chart?: Chart;
  renderer?: Renderer;
  theme?: ThemeContext;
  registries?: Record<string, unknown>;
  rendererSettings?: Record<string, unknown>;
  rect?: Record<string, unknown>;
  animations?: Record<string, unknown>;
  key?: string;
  brush?: Record<string, unknown>;
  data?: Record<string, unknown>;
  eventListeners?: Array<{ event: string; listener: () => void }>;
}

describe('Component', () => {
  let sandbox: sinon.SinonSandbox;
  let definition: ComponentDefinition;
  let created: sinon.SinonSpy;
  let beforeMount: sinon.SinonSpy;
  let mounted: sinon.SinonSpy;
  let beforeRender: sinon.SinonSpy;
  let render: sinon.SinonStub;
  let beforeUpdate: sinon.SinonSpy;
  let updated: sinon.SinonSpy;
  let resize: sinon.SinonSpy;
  let chart: Chart;
  let renderer: Renderer;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    chart = {
      brush: () => ({
        on: () => {},
      }),
      container: () => ({}),
      table: () => ({}),
      dataset: () => ({}),
      scale: sinon.stub(),
      logger: () => 'logger',
      storage: { animations: 'animations-related info' },
    };
    created = sinon.spy();
    beforeMount = sinon.spy();
    mounted = sinon.spy();
    beforeRender = sinon.spy();
    render = sandbox.stub();
    beforeUpdate = sinon.spy();
    updated = sinon.spy();
    resize = sinon.spy();
    definition = {
      defaultSettings: {
        layout: {
          dock: 'top',
        },
        style: {
          strokeWidth: 5,
        },
        key1: 'value1',
      },
      created,
      beforeMount,
      mounted,
      beforeRender,
      render,
      resize,
      beforeUpdate,
      updated,
    };
    renderer = {
      appendTo: () => {},
      render: () => ({}),
      destroy: () => ({}),
      size: (s: unknown) => s,
      element: () => 'elm',
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  function createInstance(config?: ComponentConfig): ComponentInstance {
    return componentFactory(definition as any, {
      settings: config?.settings ?? {},
      chart: chart as any,
      renderer: renderer as any,
      theme: {
        palette: sinon.stub() as any,
        style: sinon.stub() as any,
      },
    } as any) as any;
  }

  function createAndRenderComponent(config?: ComponentConfig): ComponentInstance {
    const instance = createInstance(config);
    instance.beforeMount?.();
    instance.resize({}, {});
    instance.beforeRender();
    instance.render();
    instance.mounted?.();
    return instance;
  }

  describe('require', () => {
    it('should be able to require symbol factory', () => {
      const opts: any = {
        settings: {},
        chart,
        renderer,
        theme: {
          palette: sinon.stub() as any,
          style: sinon.stub() as any,
        },
        registries: {},
      };

      let fn: any;

      definition = {
        defaultSettings: {},
        created() {
          fn = this.symbol;
        },
      } as any;

      componentFactory(definition as any, opts as any);

      expect(fn).to.equal(undefined);

      definition.require = ['symbol'];

      componentFactory(definition as any, opts as any);

      expect(fn).to.be.a('Function');
    });
  });

  it('should forward rendererSettings if renderer has settings func', () => {
    renderer.settings = sinon.spy();
    createInstance({ rendererSettings: { aa: 'AA', bb: {} } });
    expect(renderer.settings).to.have.been.calledWith({ aa: 'AA', bb: {} });
  });

  it('should call lifecycle methods with correct context when rendering', () => {
    createAndRenderComponent();

    expect(created).to.have.been.calledOnce;
    expect(resize).to.have.been.calledOnce;
    expect(beforeRender).to.have.been.calledOnce;
    expect(render).to.have.been.calledOnce;
    expect(resize).to.have.been.calledOnce;
    expect(mounted).to.have.been.calledOnce;
  });

  it('should call lifecycle methods with correct context when updating', () => {
    const instance = createAndRenderComponent();
    instance.set();
    instance.beforeUpdate();
    instance.resize({}, {});
    instance.beforeRender();
    instance.render();
    instance.updated();

    expect(mounted).to.have.been.calledOnce;
    expect(beforeRender).to.have.been.calledTwice;
    expect(beforeUpdate).to.have.been.calledOnce;
    expect(updated).to.have.been.calledOnce;
    expect(render).to.have.been.calledTwice;
  });

  it('should update brushArgs.config on set', () => {
    sandbox.stub(brushing, 'resolveTapEvent').returns(false);
    const brush = { trigger: [{ on: 'tap' }] };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush } });
    instance.update();
    instance.onBrushTap({});
    const { args } = (brushing.resolveTapEvent as sinon.SinonStub).getCall(0);
    expect(args[0].config.config).to.eql(brush);
  });

  it('should update data correctly if there is no progressive', () => {
    const data = { a: 'a' };
    sandbox.stub(brushing, 'resolveTapEvent').returns(false);
    sandbox.stub(extractData, 'default').returns(data);
    const brush = { trigger: [{ on: 'tap' }] };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {} } });
    instance.update();
    instance.onBrushTap({});
    const { args } = (brushing.resolveTapEvent as sinon.SinonStub).getCall(0);
    expect(args[0].config.data).to.eql({ a: 'a' });
  });

  it('should update data correctly if progressive = false', () => {
    const data = { b: 'b' };
    sandbox.stub(brushing, 'resolveTapEvent').returns(false);
    sandbox.stub(extractData, 'default').returns(data);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: () => false };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const { args } = (brushing.resolveTapEvent as sinon.SinonStub).getCall(0);
    expect(args[0].config.data).to.eql({ b: 'b' });
  });

  it('should update data correctly if progressive.isFirst = true and no data.items', () => {
    const data = { c: 'c' };
    sandbox.stub(brushing, 'resolveTapEvent').returns(false);
    sandbox.stub(extractData, 'default').returns(data);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: () => ({ isFirst: true }) };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const { args } = (brushing.resolveTapEvent as sinon.SinonStub).getCall(0);
    expect(args[0].config.data).to.eql({ c: 'c' });
  });

  it('should update data correctly if progressive.isFirst = true and has data.items', () => {
    const data = { items: [1, 2] };
    sandbox.stub(brushing, 'resolveTapEvent').returns(false);
    sandbox.stub(extractData, 'default').returns(data);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: () => ({ isFirst: true }) };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const { args } = (brushing.resolveTapEvent as sinon.SinonStub).getCall(0);
    expect(args[0].config.data).to.eql({ items: [1, 2] });
  });

  it('should update data correctly during progressive', () => {
    const data1 = { items: [1, 2] };
    const data2 = { items: [3, 4] };
    sandbox.stub(brushing, 'resolveTapEvent').returns(false);
    sandbox.stub(extractData, 'default');
    (extractData.default as sinon.SinonStub).onCall(0).returns(data1);
    (extractData.default as sinon.SinonStub).onCall(1).returns(data2);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: sandbox.stub() };
    (rendererSettings.progressive as sinon.SinonStub).onCall(0).returns({ isFirst: true, start: 0, end: 2 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(1).returns({ isFirst: true, start: 0, end: 2 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(2).returns({ isFirst: true, start: 0, end: 2 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(3).returns({ isFirst: false, start: 2, end: 4 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(4).returns({ isFirst: false, start: 2, end: 4 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(5).returns({ isFirst: false, start: 2, end: 4 });
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const { args } = (brushing.resolveTapEvent as sinon.SinonStub).getCall(0);
    expect(args[0].config.data).to.eql({ items: [1, 2, 3, 4] });
  });

  it('should update renderArgs correctly on the first progressive', () => {
    const data = { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
    sandbox.stub(brushing, 'resolveTapEvent').returns(false);
    sandbox.stub(extractData, 'default').returns(data);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: () => ({ isFirst: true, start: 0, end: 5 }) };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const { args } = render.getCall(1);
    expect(args[0].data.items).to.eql([1, 2, 3, 4, 5]);
  });

  it('should update renderArgs correctly during progressive', () => {
    const data1 = { items: [1, 2, 3, 4, 5] };
    const data2 = { items: [6, 7, 8, 9, 10] };
    sandbox.stub(brushing, 'resolveTapEvent').returns(false);
    sandbox.stub(extractData, 'default');
    (extractData.default as sinon.SinonStub).onFirstCall().returns(data1);
    (extractData.default as sinon.SinonStub).onSecondCall().returns(data2);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: sandbox.stub() };
    (rendererSettings.progressive as sinon.SinonStub).onCall(0).returns({ isFirst: true, start: 0, end: 5 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(1).returns({ isFirst: true, start: 0, end: 5 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(2).returns({ isFirst: true, start: 0, end: 5 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(3).returns({ isFirst: false, start: 5, end: 10 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(4).returns({ isFirst: false, start: 5, end: 10 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(5).returns({ isFirst: false, start: 5, end: 10 });
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const args1 = render.getCall(1).args;
    const args2 = render.getCall(2).args;
    expect(args1[0]).to.eql({ data: { items: [1, 2, 3, 4, 5] } });
    expect(args2[0]).to.eql({ data: { items: [6, 7, 8, 9, 10] } });
  });

  it('should update brushArgs.nodes correctly if progressive is falsy', () => {
    const data = { items: [1, 2, 3, 4, 5] };
    sandbox.stub(brushing, 'resolveTapEvent').returns(false);
    sandbox.stub(extractData, 'default');
    (extractData.default as sinon.SinonStub).onFirstCall().returns(data);
    render.returns(['a', 'b']);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: false };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const { args } = (brushing.resolveTapEvent as sinon.SinonStub).getCall(0);
    expect(args[0].config.nodes).to.eql(['a', 'b']);
  });

  it('should update brushArgs.nodes correctly if progressive.isFirst = true', () => {
    const data = { items: [1, 2, 3, 4, 5] };
    sandbox.stub(brushing, 'resolveTapEvent').returns(false);
    sandbox.stub(extractData, 'default');
    (extractData.default as sinon.SinonStub).onFirstCall().returns(data);
    render.returns(['a', 'b']);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: sandbox.stub().returns({ isFirst: true }) };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const { args } = (brushing.resolveTapEvent as sinon.SinonStub).getCall(0);
    expect(args[0].config.nodes).to.eql(['a', 'b']);
  });

  it('should update brushArgs.nodes correctly if progressive.isFirst = true', () => {
    const data1 = { items: [1, 2, 3, 4, 5] };
    const data2 = { items: [6, 7, 8, 9, 10] };
    sandbox.stub(brushing, 'resolveTapEvent').returns(false);
    sandbox.stub(extractData, 'default');
    (extractData.default as sinon.SinonStub).onFirstCall().returns(data1);
    (extractData.default as sinon.SinonStub).onSecondCall().returns(data2);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: sandbox.stub() };
    (rendererSettings.progressive as sinon.SinonStub).onCall(0).returns({ isFirst: true, start: 0, end: 5 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(1).returns({ isFirst: true, start: 0, end: 5 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(2).returns({ isFirst: true, start: 0, end: 5 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(3).returns({ isFirst: false, start: 5, end: 10 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(4).returns({ isFirst: false, start: 5, end: 10 });
    (rendererSettings.progressive as sinon.SinonStub).onCall(5).returns({ isFirst: false, start: 5, end: 10 });
    render.onCall(0).returns(['a', 'b']);
    render.onCall(1).returns(['a', 'b']);
    render.onCall(2).returns(['c', 'd']);
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const { args } = (brushing.resolveTapEvent as sinon.SinonStub).getCall(0);
    expect(args[0].config.nodes).to.eql(['a', 'b', 'c', 'd']);
  });

  describe('emits', () => {
    it('should have an empty emit function when rendering', () => {
      const instance = createAndRenderComponent();
      expect(instance.ctx.emit).to.be.a('function');
    });

    it('should have an empty emit function when updating', () => {
      const instance = createAndRenderComponent();
      instance.set();
      instance.beforeUpdate();
      instance.resize({}, {});
      instance.beforeRender();
      instance.render();
      instance.updated();

      expect(instance.ctx.emit).to.be.a('function');
    });

    it('should have an empty emit function when destroying', () => {
      const instance = createAndRenderComponent();
      instance.set();
      instance.destroy();

      expect(instance.ctx.emit).to.be.a('function');
    });
  });

  describe('visibility', () => {
    it('should return false for isVisible() when initialising', () => {
      const instance = createInstance();
      expect(instance.ctx.isVisible()).to.equal(false);
    });

    it('should return true for isVisible() when mounting', () => {
      const instance = createInstance();
      instance.mount();
      expect(instance.ctx.isVisible()).to.equal(true);
    });

    it('should return false for isVisible() when unmounting', () => {
      const instance = createInstance();
      instance.unmount();
      expect(instance.ctx.isVisible()).to.equal(false);
    });
  });

  /*
  it('should call lifecycle methods with correct context when updating with partial data', () => {
  });
  */

  describe('update', () => {
    it('should call renderers render func without args when applying transformation', () => {
      renderer.render = sinon.spy();
      definition.render = () => ['node1', 'node2'];
      let transformation: any = false;
      let transformFn = () => transformation;
      let instance: ComponentInstance;

      instance = createInstance({
        rendererSettings: { transform: transformFn },
        rect: { computed: { x: 0, y: 0, width: 1, height: 1 } },
      });
      instance.update();
      expect(renderer.render).to.have.been.calledWith(['node1', 'node2']);
      transformation = { a: 0, b: 1, c: 1 };
      instance.update();
      expect(renderer.render).to.have.been.calledWith();
    });

    it('should run tween when animations are enabled', () => {
      let instance: ComponentInstance;
      sandbox.stub(tween, 'default').returns({ start: sinon.spy() } as any);
      definition.render = () => ['node1', 'node2'];
      instance = createInstance({
        rect: { computed: { x: 0, y: 0, width: 1, height: 1 } },
        animations: { enabled: true, compensateForLayoutChanges: sinon.spy() },
      });
      instance.render();
      instance.update();
      expect((tween.default as sinon.SinonStub)).to.have.been.calledOnce;
      expect((tween.default as sinon.SinonStub).getCall(0).args[3]).to.deep.equal({ animations: 'animations-related info' });
      sandbox.restore();
    });

    it('should not run tween when animations are disabled, case 1: enabled is not a function', () => {
      let instance: ComponentInstance;
      sandbox.stub(tween, 'default').returns({ start: sinon.spy() } as any);
      definition.render = () => ['node1', 'node2'];
      instance = createInstance({
        rect: { computed: { x: 0, y: 0, width: 1, height: 1 } },
        animations: { enabled: false, compensateForLayoutChanges: sinon.spy() },
      });
      instance.render();
      instance.update();
      expect((tween.default as sinon.SinonStub)).to.not.have.been.called;
      sandbox.restore();
    });

    it('should not run tween when animations are disabled, case 2: enabled is a function', () => {
      let instance: ComponentInstance;
      sandbox.stub(tween, 'default').returns({ start: sinon.spy() } as any);
      definition.render = () => ['node1', 'node2'];
      instance = createInstance({
        rect: { computed: { x: 0, y: 0, width: 1, height: 1 } },
        animations: { enabled: () => false, compensateForLayoutChanges: sinon.spy() },
      });
      instance.render();
      instance.update();
      expect((tween.default as sinon.SinonStub)).to.not.have.been.called;
      sandbox.restore();
    });
  });

  describe('findShapes', () => {
    let instance: ComponentInstance;
    let config: Record<string, unknown>;
    let shapes: any;

    beforeEach(() => {
      shapes = [{ data: 0 }, { data: 1 }, { data: 2 }];
      renderer.findShapes = () => shapes;
      config = {
        key: 'myKey',
      };

      instance = createAndRenderComponent(config);
    });

    it('should return matching shapes', () => {
      const s = instance.findShapes('*');

      expect(s).to.deep.equal([
        { data: 0, key: 'myKey', element: 'elm' },
        { data: 1, key: 'myKey', element: 'elm' },
        { data: 2, key: 'myKey', element: 'elm' },
      ]);
    });
  });

  describe('shapesAt', () => {
    let instance: ComponentInstance;
    let config: Record<string, unknown>;
    let shapes: any;

    beforeEach(() => {
      shapes = [{ node: { data: 0 } }, { node: { data: 1 } }, { node: { data: 2 } }];
      renderer.itemsAt = () => shapes;
      config = {
        key: 'myKey',
      };

      instance = createAndRenderComponent(config);
    });

    it('should return matching shapes', () => {
      const s = instance.shapesAt({ x: 0, y: 0 }); // Input doesn't matter as output is mocked

      expect(s).to.deep.equal([
        { data: 0, key: 'myKey', element: 'elm' },
        { data: 1, key: 'myKey', element: 'elm' },
        { data: 2, key: 'myKey', element: 'elm' },
      ]);
    });

    it('propagation option should return last shape', () => {
      // Last shape is the shape that is visibly "on top"
      const s = instance.shapesAt({ x: 0, y: 0 }, { propagation: 'stop' });

      expect(s).to.deep.equal([{ data: 2, key: 'myKey', element: 'elm' }]);
    });
  });

  describe('unmount', () => {
    let instance: ComponentInstance;

    beforeEach(() => {
      instance = createAndRenderComponent({
        key: 'myKey',
        eventListeners: [
          { event: 'event1', listener: () => {} },
          { event: 'event2', listener: () => {} },
        ],
      });
    });

    it('should remove event listeners from instance context', () => {
      instance.unmount();
      expect(instance.ctx.eventListeners).to.deep.equal([]);
    });
  });

  describe('getBrushedShapes', () => {
    let instance: ComponentInstance;
    let config: any;
    let shapes: any;

    beforeEach(() => {
      shapes = [{ data: 0 }, { data: 1 }, { data: 2 }];
      renderer.findShapes = () => shapes;
      chart.brush = () => ({ containsMappedData: (d) => d === 1 || d === 2 });
      config = {
        key: 'myKey',
        brush: {
          consume: [
            {
              context: 'test',
            },
          ],
        },
      };

      instance = createAndRenderComponent(config);
    });

    it('should only return shapes within the same context', () => {
      const rNoMatch = instance.getBrushedShapes('unknown');
      expect(rNoMatch).to.be.empty;

      const rMatch = instance.getBrushedShapes('test');
      expect(rMatch).to.deep.equal([
        { data: 1, key: 'myKey', element: 'elm' },
        { data: 2, key: 'myKey', element: 'elm' },
      ]);
    });

    it('should not return duplicate shapes', () => {
      // Config two brush listeners on the same context
      config.brush.consume.push({ context: 'test' });

      instance = createAndRenderComponent(config);
      expect(instance.getBrushedShapes('test')).to.deep.equal([
        { data: 1, key: 'myKey', element: 'elm' },
        { data: 2, key: 'myKey', element: 'elm' },
      ]);
    });

    it('should use data props parameter if submitted', () => {
      shapes.forEach((s: any, i: number) => {
        s.data = { x: i };
      });
      const spy = sinon.spy();
      chart.brush = () => ({
        containsMappedData: spy,
      });

      instance = createAndRenderComponent(config);
      instance.getBrushedShapes('test', 'xor', ['x']);
      expect(spy).to.have.been.calledWith({ x: 0 }, ['x'], 'xor');
    });

    it('should fallback to brush data property if data props parameter is omitted', () => {
      shapes.forEach((s: any, i: number) => {
        s.data = { x: i };
      });
      const spy = sinon.spy();
      chart.brush = () => ({
        containsMappedData: spy,
      });

      config.brush.consume = [{ context: 'test', data: ['x'] }];

      instance = createAndRenderComponent(config);
      instance.getBrushedShapes('test', 'xor');
      expect(spy).to.have.been.calledWith({ x: 0 }, ['x'], 'xor');
    });
  });
});
