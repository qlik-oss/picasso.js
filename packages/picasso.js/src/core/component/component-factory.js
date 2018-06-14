/* eslint camelcase: 1 */
import extend from 'extend';
import EventEmitter from '../utils/event-emitter';
import { list as listMixins } from './component-mixins';
import extractData from '../data/extractor';
import tween from './tween';
import settingsResolver from './settings-resolver';
import {
  styler as brushStyler,
  resolveTapEvent,
  resolveOverEvent,
  brushFromSceneNodes
} from './brushing';

const isReservedProperty = prop => [
  'on', 'preferredSize', 'created', 'beforeMount', 'mounted', 'resize',
  'beforeUpdate', 'updated', 'beforeRender', 'render', 'beforeUnmount', 'beforeDestroy',
  'destroyed', 'defaultSettings', 'data', 'settings', 'formatter',
  'scale', 'chart', 'dockConfig', 'mediator', 'style', 'resolver', 'registries',
  '_DO_NOT_USE_getInfo'
].some(name => name === prop);

function prepareContext(ctx, definition, opts) {
  const {
    require = []
  } = definition;
  const mediatorSettings = definition.mediator || {};
  const {
    settings,
    formatter,
    scale,
    data,
    renderer,
    chart,
    dockConfig,
    mediator,
    instance,
    style,
    registries,
    resolver,
    update,
    _DO_NOT_USE_getInfo
  } = opts;

  // TODO add setters and log warnings / errors to console
  Object.defineProperty(ctx, 'settings', {
    get: settings
  });
  Object.defineProperty(ctx, 'data', {
    get: data
  });
  Object.defineProperty(ctx, 'formatter', {
    get: formatter
  });
  Object.defineProperty(ctx, 'scale', {
    get: scale
  });
  Object.defineProperty(ctx, 'mediator', {
    get: mediator
  });
  Object.defineProperty(ctx, 'style', {
    get: style
  });
  Object.defineProperty(ctx, 'registries', {
    get: registries
  });

  // TODO _DO_NOT_USE_getInfo is a temporary solution to expose info from a component
  // It should replace ASAP with a proper solution.
  // The only component activaly in need of it is the legend-cat
  if (_DO_NOT_USE_getInfo) {
    ctx._DO_NOT_USE_getInfo = _DO_NOT_USE_getInfo;
  }

  Object.keys(definition).forEach((key) => {
    if (!isReservedProperty(key)) {
      // Add non-lifecycle methods to the context
      if (typeof definition[key] === 'function') {
        ctx[key] = definition[key].bind(ctx);
      } else {
        ctx[key] = definition[key];
      }
    }
  });

  // Add properties to context
  require.forEach((req) => {
    if (req === 'renderer') {
      Object.defineProperty(ctx, 'renderer', {
        get: renderer
      });
    } else if (req === 'chart') {
      Object.defineProperty(ctx, 'chart', {
        get: chart
      });
    } else if (req === 'dockConfig') {
      Object.defineProperty(ctx, 'dockConfig', {
        get: dockConfig
      });
    } else if (req === 'instance') {
      Object.defineProperty(ctx, 'instance', {
        get: instance
      });
    } else if (req === 'update' && update) {
      Object.defineProperty(ctx, 'update', {
        get: update
      });
    } else if (req === 'resolver') {
      Object.defineProperty(ctx, 'resolver', {
        get: resolver
      });
    }
  });

  Object.keys(mediatorSettings).forEach((eventName) => {
    ctx.mediator.on(eventName, mediatorSettings[eventName].bind(ctx));
  });
}

function updateDockConfig(config, settings) {
  config.displayOrder = settings.displayOrder;
  config.dock = settings.dock;
  config.prioOrder = settings.prioOrder;
  config.minimumLayoutMode = settings.minimumLayoutMode;
  config.show = settings.show;
  return config;
}

function setUpEmitter(ctx, emitter, settings) {
  // Object.defineProperty(ctx, 'emitter', )
  Object.keys(settings.on || {}).forEach((event) => {
    ctx.eventListeners = ctx.eventListeners || [];
    const listener = settings.on[event].bind(ctx);
    ctx.eventListeners.push({ event, listener });
    emitter.on(event, listener);
  });
  ctx.emit = (name, ...event) => emitter.emit(name, ...event);
}

// First render
// preferredSize -> resize -> beforeRender -> render -> mounted

// Normal update
// beforeUpdate -> preferredSize -> resize -> beforeRender -> render -> updated

// Update without relayout
// beforeUpdate -> beforeRender -> render -> updated

// TODO support es6 classes
function componentFactory(definition, options = {}) {
  const {
    defaultSettings = {},
    _DO_NOT_USE_getInfo = () => ({})
  } = definition;
  const {
    chart,
    container,
    mediator,
    registries,
    theme,
    renderer // Used by tests
  } = options;
  const config = options.settings || {};
  const emitter = EventEmitter.mixin({});
  let settings = extend(true, {}, defaultSettings, config);
  let data = [];
  let scale;
  let formatter;
  let element;
  let size;
  let style;
  let resolver = settingsResolver({
    chart
  });

  const brushArgs = {
    nodes: [],
    chart,
    config: settings.brush || {},
    renderer: null
  };
  const brushTriggers = {
    tap: [],
    over: []
  };
  const brushStylers = [];
  const componentMixins = listMixins(settings.type);
  const definitionContext = {};
  const instanceContext = extend({}, config, componentMixins.filter(mixinName => !isReservedProperty(mixinName)));

  // Create a callback that calls lifecycle functions in the definition and config (if they exist).
  function createCallback(method, defaultMethod = () => {}) {
    return function cb(...args) {
      const inDefinition = typeof definition[method] === 'function';
      const inConfig = typeof config[method] === 'function';

      let returnValue;
      if (inDefinition) {
        returnValue = definition[method].call(definitionContext, ...args);
      }
      if (typeof config[method] === 'function') {
        returnValue = config[method].call(instanceContext, ...args);
      }
      if (!inDefinition && !inConfig) {
        returnValue = defaultMethod.call(definitionContext, ...args);
      }
      componentMixins.forEach((mixin) => {
        if (mixin[method]) {
          mixin[method].call(instanceContext, ...args);
        }
      });
      return returnValue;
    };
  }

  const preferredSize = createCallback('preferredSize', () => 0);
  const resize = createCallback('resize', ({ inner }) => inner);
  const created = createCallback('created');
  const beforeMount = createCallback('beforeMount');
  const mounted = createCallback('mounted');
  const beforeUnmount = createCallback('beforeUnmount');
  const beforeUpdate = createCallback('beforeUpdate');
  const updated = createCallback('updated');
  const beforeRender = createCallback('beforeRender');
  const beforeDestroy = createCallback('beforeDestroy');
  const destroyed = createCallback('destroyed');
  const render = definition.render; // Do not allow overriding of this function

  const addBrushStylers = () => {
    if (settings.brush) {
      (settings.brush.consume || []).forEach((b) => {
        if (b.context && b.style) {
          brushStylers.push(brushStyler(brushArgs, b));
        }
      });
    }
  };

  const addBrushTriggers = () => {
    if (settings.brush) {
      (settings.brush.trigger || []).forEach((t) => {
        if (t.on === 'over') {
          brushTriggers.over.push(t);
        } else {
          brushTriggers.tap.push(t);
        }
      });
    }
  };

  Object.defineProperty(brushArgs, 'data', {
    get: () => data
  });

  const rendString = settings.renderer || definition.renderer;
  const rend = rendString ? renderer || registries.renderer(rendString)() : renderer || registries.renderer()();
  brushArgs.renderer = rend;

  const dockConfig = {
    requiredSize: (inner, outer) => preferredSize({
      inner,
      outer,
      dock: dockConfig.dock
    })
  };
  updateDockConfig(dockConfig, settings);

  const fn = () => {};

  fn.dockConfig = dockConfig;

  // Set new settings - will trigger mapping of data and creation of scale / formatter.
  fn.set = (opts = {}) => {
    if (opts.settings) {
      settings = extend(true, {}, defaultSettings, opts.settings);
      updateDockConfig(dockConfig, settings);
    }

    if (settings.scale) {
      scale = chart.scale(settings.scale);
    }

    if (settings.data) {
      data = extractData(settings.data, { dataset: chart.dataset, collection: chart.dataCollection }, { logger: chart.logger() }, chart.dataCollection);
    } else if (scale) {
      data = scale.data();
    } else {
      data = [];
    }

    if (typeof settings.formatter === 'string') {
      formatter = chart.formatter(settings.formatter);
    } else if (typeof settings.formatter === 'object') {
      formatter = chart.formatter(settings.formatter);
    } else if (scale && scale.data().fields) {
      formatter = scale.data().fields[0].formatter();
    }

    style = theme.style(settings.style || {});
  };

  fn.resize = (inner, outer) => {
    const newSize = resize({
      inner,
      outer
    });
    if (newSize) {
      rend.size(newSize);
      size = newSize;
    } else {
      rend.size(inner);
      size = inner;
    }
    instanceContext.rect = inner;
  };

  fn.getRect = () => instanceContext.rect;

  const getRenderArgs = () => {
    const renderArgs = rend.renderArgs ? rend.renderArgs.slice(0) : [];
    renderArgs.push({
      data
    });
    return renderArgs;
  };

  fn.beforeMount = beforeMount;

  fn.beforeRender = () => {
    beforeRender({
      size
    });
  };

  let currentNodes;

  fn.render = () => {
    const nodes = brushArgs.nodes = render.call(definitionContext, ...getRenderArgs());
    rend.render(nodes);
    currentNodes = nodes;
  };

  fn.hide = () => {
    fn.unmount();
    rend.size({
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });
    rend.clear();
  };

  fn.beforeUpdate = () => {
    beforeUpdate({
      settings,
      data
    });
  };

  let currentTween;
  fn.update = () => {
    if (currentTween) {
      currentTween.stop();
    }
    const nodes = brushArgs.nodes = render.call(definitionContext, ...getRenderArgs());

    // Reset brush stylers and triggers
    brushStylers.forEach(b => b.cleanUp());
    brushStylers.length = 0;
    brushTriggers.tap = [];
    brushTriggers.over = [];

    if (settings.brush) {
      addBrushStylers();
      addBrushTriggers();
    }

    brushStylers.forEach((bs) => {
      if (bs.isActive()) {
        bs.update();
      }
    });

    if (currentNodes && settings.animations && settings.animations.enabled) {
      currentTween = tween({
        old: currentNodes,
        current: nodes
      }, { renderer: rend }, settings.animations);
      currentTween.start();
    } else {
      rend.render(nodes);
    }
    currentNodes = nodes;
  };

  fn.updated = updated;

  fn.destroy = () => {
    fn.unmount();
    beforeDestroy(element);
    rend.destroy();
    destroyed();
    element = null;
  };

  /**
   * Update active nodes. For now this can be used as a way update and apply brushing on nodes.
   * Ex: if a component have changed the nodes since its initial render.
   * @param {Nodes[]} nodes
   * @deprecated
   * @ignore
   */
  const updateNodes = (nodes) => {
    brushArgs.nodes = nodes;
    brushStylers.forEach((bs) => {
      if (bs.isActive()) {
        bs.update();
      }
    });
    rend.render(nodes);
  };

  // Set contexts, note that the definition and instance need different contexts (for example if they have different 'require' props)
  prepareContext(definitionContext, definition, {
    settings: () => settings,
    data: () => data,
    scale: () => scale,
    formatter: () => formatter,
    renderer: () => rend,
    chart: () => chart,
    dockConfig: () => dockConfig,
    mediator: () => mediator,
    instance: () => instanceContext,
    style: () => style,
    update: () => updateNodes,
    registries: () => registries,
    resolver: () => resolver
  });

  prepareContext(instanceContext, config, {
    settings: () => settings,
    data: () => data,
    scale: () => scale,
    formatter: () => formatter,
    renderer: () => rend,
    chart: () => chart,
    dockConfig: () => dockConfig,
    mediator: () => mediator,
    style: () => style,
    _DO_NOT_USE_getInfo: _DO_NOT_USE_getInfo.bind(definitionContext)
  });

  fn.getBrushedShapes = function getBrushedShapes(context, mode, props) {
    const shapes = [];
    if (settings.brush && settings.brush.consume) {
      const brusher = chart.brush(context);
      const sceneNodes = rend.findShapes('*');
      settings.brush.consume
        .filter(t => t.context === context)
        .forEach((consume) => {
          for (let i = 0; i < sceneNodes.length; i++) {
            const node = sceneNodes[i];
            if (node.data && brusher.containsMappedData(node.data, props || consume.data, mode)) {
              shapes.push(node);
              sceneNodes.splice(i, 1);
              i--;
            }
          }
        });
    }
    return shapes;
  };

  fn.findShapes = (selector) => {
    const shapes = rend.findShapes(selector);
    for (let i = 0, num = shapes.length; i < num; i++) {
      shapes[i].key = settings.key;
    }

    return shapes;
  };

  fn.shapesAt = (shape, opts = {}) => {
    const items = rend.itemsAt(shape);
    let shapes;

    if (opts && opts.propagation === 'stop' && items.length > 0) {
      shapes = [items.pop().node];
    } else {
      shapes = items.map(i => i.node);
    }

    for (let i = 0, num = shapes.length; i < num; i++) {
      shapes[i].key = settings.key;
    }

    return shapes;
  };

  fn.brushFromShapes = (shapes, trigger = {}) => {
    trigger.contexts = Array.isArray(trigger.contexts) ? trigger.contexts : [];
    const action = trigger.action || 'toggle';

    brushFromSceneNodes({
      nodes: shapes,
      action,
      trigger,
      chart,
      data: brushArgs.data
    });
  };

  fn.mount = () => {
    element = rend.element && rend.element() ? element : rend.appendTo(container);

    if (settings.brush) {
      addBrushStylers();
      addBrushTriggers();
    }

    setUpEmitter(instanceContext, emitter, config);
    setUpEmitter(definitionContext, emitter, definition);
  };

  fn.mounted = () => mounted(element);

  fn.unmount = () => {
    [instanceContext, definitionContext].forEach((ctx) => {
      (ctx.eventListeners || []).forEach(({ event, listener }) => {
        emitter.removeListener(event, listener);
      });
    });
    brushTriggers.tap = [];
    brushTriggers.over = [];
    brushStylers.forEach((bs) => {
      bs.cleanUp();
    });
    brushStylers.length = 0;
    beforeUnmount();
  };

  fn.onBrushTap = (e) => {
    brushTriggers.tap.forEach((t) => {
      if (resolveTapEvent({ e, t, config: brushArgs }) && t.globalPropagation === 'stop') {
        chart.toggleBrushing(true);
      }
    });
  };

  fn.onBrushOver = (e) => {
    brushTriggers.over.forEach((t) => {
      if (resolveOverEvent({ e, t, config: brushArgs }) && t.globalPropagation === 'stop') {
        chart.toggleBrushing(true);
      }
    });
  };

  /**
   * Expose definition on instance
   * @private
   * @experimental
   */
  fn.def = definitionContext;

  /**
   * Expose instanceCtx on "instance"
   * @private
   * @experimental
   */
  fn.ctx = instanceContext;

  fn.renderer = () => rend;

  fn.set({ settings: config });
  created();

  return fn;
}

export default componentFactory;
