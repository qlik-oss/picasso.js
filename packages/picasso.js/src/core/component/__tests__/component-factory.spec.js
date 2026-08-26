import componentFactory from '../component-factory';
import * as tween from '../tween';
import * as brushing from '../brushing';
import * as extractData from '../../data/extractor';
import { vi } from 'vitest';

vi.mock('../tween', async (importOriginal) => ({
  ...(await importOriginal()),
  default: vi.fn(),
}));
vi.mock('../brushing', async (importOriginal) => ({
  ...(await importOriginal()),
  resolveTapEvent: vi.fn(),
}));
vi.mock('../../data/extractor', async (importOriginal) => ({
  ...(await importOriginal()),
  default: vi.fn(),
}));

describe('Component', () => {
  let sandbox;
  let definition;
  let created;
  let beforeMount;
  let mounted;
  let beforeRender;
  let render;
  let beforeUpdate;
  let updated;
  let resize;
  let chart;
  let renderer;

  beforeEach(() => {
    sandbox = vi;
    chart = {
      brush: () => ({
        on: () => {},
      }),
      container: () => ({}),
      table: () => ({}),
      dataset: () => ({}),
      scale: vi.fn(),
      logger: () => 'logger',
      storage: { animations: 'animations-related info' },
    };
    created = vi.fn();
    beforeMount = vi.fn();
    mounted = vi.fn();
    beforeRender = vi.fn();
    render = vi.fn();
    beforeUpdate = vi.fn();
    updated = vi.fn();
    resize = vi.fn();
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
      size: (s) => s,
      element: () => 'elm',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createInstance(config) {
    return componentFactory(definition, {
      settings: config,
      chart,
      renderer,
      theme: {
        palette: vi.fn(),
        style: vi.fn(),
      },
    });
  }

  function createAndRenderComponent(config) {
    const instance = createInstance(config);
    instance.beforeMount();
    instance.resize({}, {});
    instance.beforeRender();
    instance.render();
    instance.mounted();
    return instance;
  }

  describe('require', () => {
    it('should be able to require symbol factory', () => {
      const opts = {
        settings: {},
        chart,
        renderer,
        theme: {
          palette: vi.fn(),
          style: vi.fn(),
        },
        registries: {},
      };

      let fn;

      definition = {
        defaultSettings: {},
        created() {
          fn = this.symbol;
        },
      };

      componentFactory(definition, opts);

      expect(fn).to.equal(undefined);

      definition.require = ['symbol'];

      componentFactory(definition, opts);

      expect(fn).to.be.a('Function');
    });
  });

  it('should forward rendererSettings if renderer has settings func', () => {
    renderer.settings = vi.fn();
    createInstance({ rendererSettings: { aa: 'AA', bb: {} } });
    expect(renderer.settings).toHaveBeenCalledWith({ aa: 'AA', bb: {} });
  });

  it('should call lifecycle methods with correct context when rendering', () => {
    createAndRenderComponent();

    expect(created).toHaveBeenCalledTimes(1);
    expect(resize).toHaveBeenCalledTimes(1);
    expect(beforeRender).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(1);
    expect(resize).toHaveBeenCalledTimes(1);
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it('should call lifecycle methods with correct context when updating', () => {
    const instance = createAndRenderComponent();
    instance.set();
    instance.beforeUpdate();
    instance.resize({}, {});
    instance.beforeRender();
    instance.render();
    instance.updated();

    expect(mounted).toHaveBeenCalledTimes(1);
    expect(beforeRender).toHaveBeenCalledTimes(2);
    expect(beforeUpdate).toHaveBeenCalledTimes(1);
    expect(updated).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(2);
  });

  it('should update brushArgs.config on set', () => {
    brushing.resolveTapEvent.mockReset();
    brushing.resolveTapEvent.mockReturnValue(false);
    const brush = { trigger: [{ on: 'tap' }] };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush } });
    instance.update();
    instance.onBrushTap({});
    const args = brushing.resolveTapEvent.mock.calls[0];
    expect(args[0].config.config).to.eql(brush);
  });

  it('should update data correctly if there is no progressive', () => {
    const data = { a: 'a' };
    brushing.resolveTapEvent.mockReset();
    brushing.resolveTapEvent.mockReturnValue(false);
    extractData.default.mockReset();
    extractData.default.mockReturnValue(data);
    const brush = { trigger: [{ on: 'tap' }] };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {} } });
    instance.update();
    instance.onBrushTap({});
    const args = brushing.resolveTapEvent.mock.calls[0];
    expect(args[0].config.data).to.eql({ a: 'a' });
  });

  it('should update data correctly if progressive = false', () => {
    const data = { b: 'b' };
    brushing.resolveTapEvent.mockReset();
    brushing.resolveTapEvent.mockReturnValue(false);
    extractData.default.mockReset();
    extractData.default.mockReturnValue(data);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: () => false };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const args = brushing.resolveTapEvent.mock.calls[0];
    expect(args[0].config.data).to.eql({ b: 'b' });
  });

  it('should update data correctly if progressive.isFirst = true and no data.items', () => {
    const data = { c: 'c' };
    brushing.resolveTapEvent.mockReset();
    brushing.resolveTapEvent.mockReturnValue(false);
    extractData.default.mockReset();
    extractData.default.mockReturnValue(data);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: () => ({ isFirst: true }) };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const args = brushing.resolveTapEvent.mock.calls[0];
    expect(args[0].config.data).to.eql({ c: 'c' });
  });

  it('should update data correctly if progressive.isFirst = true and has data.items', () => {
    const data = { items: [1, 2] };
    brushing.resolveTapEvent.mockReset();
    brushing.resolveTapEvent.mockReturnValue(false);
    extractData.default.mockReset();
    extractData.default.mockReturnValue(data);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: () => ({ isFirst: true }) };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const args = brushing.resolveTapEvent.mock.calls[0];
    expect(args[0].config.data).to.eql({ items: [1, 2] });
  });

  it('should update data correctly during progressive', () => {
    const data1 = { items: [1, 2] };
    const data2 = { items: [3, 4] };
    brushing.resolveTapEvent.mockReset();
    brushing.resolveTapEvent.mockReturnValue(false);
    extractData.default.mockReset();
    extractData.default.mockReturnValueOnce(data1);
    extractData.default.mockReturnValueOnce(data2);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: vi.fn() };
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: true, start: 0, end: 2 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: true, start: 0, end: 2 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: true, start: 0, end: 2 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: false, start: 2, end: 4 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: false, start: 2, end: 4 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: false, start: 2, end: 4 });
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const args = brushing.resolveTapEvent.mock.calls[0];
    expect(args[0].config.data).to.eql({ items: [1, 2, 3, 4] });
  });

  it('should update renderArgs correctly on the first progressive', () => {
    const data = { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
    brushing.resolveTapEvent.mockReset();
    brushing.resolveTapEvent.mockReturnValue(false);
    extractData.default.mockReset();
    extractData.default.mockReturnValue(data);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: () => ({ isFirst: true, start: 0, end: 5 }) };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const args = render.mock.calls[1];
    expect(args[0].data.items).to.eql([1, 2, 3, 4, 5]);
  });

  it('should update renderArgs correctly during progressive', () => {
    const data1 = { items: [1, 2, 3, 4, 5] };
    const data2 = { items: [6, 7, 8, 9, 10] };
    brushing.resolveTapEvent.mockReset();
    brushing.resolveTapEvent.mockReturnValue(false);
    extractData.default.mockReset();
    extractData.default.mockReturnValueOnce(data1);
    extractData.default.mockReturnValueOnce(data2);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: vi.fn() };
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: true, start: 0, end: 5 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: true, start: 0, end: 5 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: true, start: 0, end: 5 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: false, start: 5, end: 10 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: false, start: 5, end: 10 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: false, start: 5, end: 10 });
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const args1 = render.mock.calls[1];
    const args2 = render.mock.calls[2];
    expect(args1[0]).to.eql({ data: { items: [1, 2, 3, 4, 5] } });
    expect(args2[0]).to.eql({ data: { items: [6, 7, 8, 9, 10] } });
  });

  it('should update brushArgs.nodes correctly if progressive is falsy', () => {
    const data = { items: [1, 2, 3, 4, 5] };
    brushing.resolveTapEvent.mockReset();
    brushing.resolveTapEvent.mockReturnValue(false);
    extractData.default.mockReset();
    extractData.default.mockReturnValueOnce(data);
    render.mockReturnValue(['a', 'b']);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: false };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const args = brushing.resolveTapEvent.mock.calls[0];
    expect(args[0].config.nodes).to.eql(['a', 'b']);
  });

  it('should update brushArgs.nodes correctly if progressive.isFirst = true', () => {
    const data = { items: [1, 2, 3, 4, 5] };
    brushing.resolveTapEvent.mockReset();
    brushing.resolveTapEvent.mockReturnValue(false);
    extractData.default.mockReset();
    extractData.default.mockReturnValueOnce(data);
    render.mockReturnValue(['a', 'b']);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: vi.fn().mockReturnValue({ isFirst: true }) };
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const args = brushing.resolveTapEvent.mock.calls[0];
    expect(args[0].config.nodes).to.eql(['a', 'b']);
  });

  it('should update brushArgs.nodes correctly if progressive.isFirst = true', () => {
    const data1 = { items: [1, 2, 3, 4, 5] };
    const data2 = { items: [6, 7, 8, 9, 10] };
    brushing.resolveTapEvent.mockReset();
    brushing.resolveTapEvent.mockReturnValue(false);
    extractData.default.mockReset();
    extractData.default.mockReturnValueOnce(data1);
    extractData.default.mockReturnValueOnce(data2);
    const brush = { trigger: [{ on: 'tap' }] };
    const rendererSettings = { progressive: vi.fn() };
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: true, start: 0, end: 5 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: true, start: 0, end: 5 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: true, start: 0, end: 5 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: false, start: 5, end: 10 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: false, start: 5, end: 10 });
    rendererSettings.progressive.mockReturnValueOnce({ isFirst: false, start: 5, end: 10 });
    render.mockReturnValueOnce(['a', 'b']);
    render.mockReturnValueOnce(['a', 'b']);
    render.mockReturnValueOnce(['c', 'd']);
    const instance = createAndRenderComponent();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.set({ settings: { brush, data: {}, rendererSettings } });
    instance.update();
    instance.onBrushTap({});
    const args = brushing.resolveTapEvent.mock.calls[0];
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
      renderer.render = vi.fn();
      definition.render = () => ['node1', 'node2'];
      let transformation = false;
      let transformFn = () => transformation;
      let instance;

      instance = createInstance({
        rendererSettings: { transform: transformFn },
        rect: { computed: { x: 0, y: 0, width: 1, height: 1 } },
      });
      instance.update();
      expect(renderer.render).toHaveBeenCalledWith(['node1', 'node2']);
      transformation = { a: 0, b: 1, c: 1 };
      instance.update();
      expect(renderer.render).toHaveBeenCalledWith();
    });

    it('should run tween when animations are enabled', () => {
      let instance;
      tween.default.mockReset();
      tween.default.mockReturnValue({ start: vi.fn() });
      definition.render = () => ['node1', 'node2'];
      instance = createInstance({
        rect: { computed: { x: 0, y: 0, width: 1, height: 1 } },
        animations: { enabled: true, compensateForLayoutChanges: vi.fn() },
      });
      instance.render();
      instance.update();
      expect(tween.default).toHaveBeenCalledTimes(1);
      expect(tween.default.mock.calls[0][3]).to.deep.equal({ animations: 'animations-related info' });
      vi.restoreAllMocks();
    });

    it('should not run tween when animations are disabled, case 1: enabled is not a function', () => {
      let instance;
      tween.default.mockReset();
      tween.default.mockReturnValue({ start: vi.fn() });
      definition.render = () => ['node1', 'node2'];
      instance = createInstance({
        rect: { computed: { x: 0, y: 0, width: 1, height: 1 } },
        animations: { enabled: false, compensateForLayoutChanges: vi.fn() },
      });
      instance.render();
      instance.update();
      expect(tween.default).not.toHaveBeenCalled();
      vi.restoreAllMocks();
    });

    it('should not run tween when animations are disabled, case 2: enabled is a function', () => {
      let instance;
      tween.default.mockReset();
      tween.default.mockReturnValue({ start: vi.fn() });
      definition.render = () => ['node1', 'node2'];
      instance = createInstance({
        rect: { computed: { x: 0, y: 0, width: 1, height: 1 } },
        animations: { enabled: () => false, compensateForLayoutChanges: vi.fn() },
      });
      instance.render();
      instance.update();
      expect(tween.default).not.toHaveBeenCalled();
      vi.restoreAllMocks();
    });
  });

  describe('findShapes', () => {
    let instance;
    let config;
    let shapes;

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
    let instance;
    let config;
    let shapes;

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
    let instance;

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
    let instance;
    let config;
    let shapes;

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
      shapes.forEach((s, i) => {
        s.data = { x: i };
      });
      const spy = vi.fn();
      chart.brush = () => ({
        containsMappedData: spy,
      });

      instance = createAndRenderComponent(config);
      instance.getBrushedShapes('test', 'xor', ['x']);
      expect(spy).toHaveBeenCalledWith({ x: 0 }, ['x'], 'xor');
    });

    it('should fallback to brush data property if data props parameter is omitted', () => {
      shapes.forEach((s, i) => {
        s.data = { x: i };
      });
      const spy = vi.fn();
      chart.brush = () => ({
        containsMappedData: spy,
      });

      config.brush.consume = [{ context: 'test', data: ['x'] }];

      instance = createAndRenderComponent(config);
      instance.getBrushedShapes('test', 'xor');
      expect(spy).toHaveBeenCalledWith({ x: 0 }, ['x'], 'xor');
    });
  });
});
