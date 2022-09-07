/* eslint camelcase: 1 */
import extend from 'extend';
import EventEmitter from '../utils/event-emitter';
import extractData from '../data/extractor';
import tween from './tween';
import settingsResolver from './settings-resolver';
import { styler as brushStyler, resolveTapEvent, resolveOverEvent, brushFromSceneNodes } from './brushing';
import createSymbolFactory from '../symbols';
import createDockConfig from '../layout/dock/config';

const isReservedProperty = (prop) =>
  [
    'on',
    'preferredSize',
    'created',
    'beforeMount',
    'mounted',
    'resize',
    'beforeUpdate',
    'updated',
    'beforeRender',
    'render',
    'beforeUnmount',
    'beforeDestroy',
    'destroyed',
    'defaultSettings',
    'data',
    'settings',
    'formatter',
    'scale',
    'chart',
    'dockConfig',
    'mediator',
    'style',
    'resolver',
    'registries',
    '_DO_NOT_USE_getInfo',
    'symbol',
    'isVisible',
  ].some((name) => name === prop);

function prepareContext(ctx, definition, opts) {
  const { require = [] } = definition;
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
    rect,
    style,
    registries,
    resolver,
    update,
    _DO_NOT_USE_getInfo,
    symbol,
    isVisible,
  } = opts;

  ctx.emit = () => {};

  if (isVisible) {
    ctx.isVisible = isVisible;
  }

  // TODO add setters and log warnings / errors to console
  Object.defineProperty(ctx, 'settings', {
    get: settings,
  });
  Object.defineProperty(ctx, 'data', {
    get: data,
  });
  Object.defineProperty(ctx, 'formatter', {
    get: formatter,
  });
  Object.defineProperty(ctx, 'scale', {
    get: scale,
  });
  Object.defineProperty(ctx, 'mediator', {
    get: mediator,
  });
  Object.defineProperty(ctx, 'style', {
    get: style,
  });
  Object.defineProperty(ctx, 'registries', {
    get: registries,
  });
  if (rect) {
    Object.defineProperty(ctx, 'rect', {
      get: rect,
    });
  }

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
        get: renderer,
      });
    } else if (req === 'chart') {
      Object.defineProperty(ctx, 'chart', {
        get: chart,
      });
    } else if (req === 'dockConfig') {
      Object.defineProperty(ctx, 'dockConfig', {
        get: dockConfig,
      });
    } else if (req === 'instance') {
      Object.defineProperty(ctx, 'instance', {
        get: instance,
      });
    } else if (req === 'update' && update) {
      Object.defineProperty(ctx, 'update', {
        get: update,
      });
    } else if (req === 'resolver') {
      Object.defineProperty(ctx, 'resolver', {
        get: resolver,
      });
    } else if (req === 'symbol') {
      Object.defineProperty(ctx, 'symbol', {
        get: symbol,
      });
    }
  });

  Object.keys(mediatorSettings).forEach((eventName) => {
    ctx.mediator.on(eventName, mediatorSettings[eventName].bind(ctx));
  });
}

function createDockDefinition(settings, preferredSize, logger) {
  const getLayoutProperty = (propName) => {
    if (settings[propName]) {
      logger.warn(`Deprecation Warning the ${propName} property should be moved into layout: {} property`); // eslint-disable-line no-console
      return settings[propName];
    }
    return settings.layout ? settings.layout[propName] : undefined;
  };

  const def = {};
  def.displayOrder = getLayoutProperty('displayOrder');
  def.dock = getLayoutProperty('dock');
  def.prioOrder = getLayoutProperty('prioOrder');
  def.minimumLayoutMode = getLayoutProperty('minimumLayoutMode');

  // move layout properties to layout object
  settings.layout = settings.layout || {};
  settings.layout.displayOrder =
    typeof def.displayOrder !== 'undefined' ? def.displayOrder : settings.layout.displayOrder;
  settings.layout.prioOrder = typeof def.prioOrder !== 'undefined' ? def.prioOrder : settings.layout.prioOrder;
  settings.layout.dock = def.dock || settings.layout.dock;
  settings.layout.minimumLayoutMode = def.minimumLayoutMode || settings.layout.minimumLayoutMode;

  // not directly a dock layout property
  def.show = settings.show;
  def.preferredSize = preferredSize;
  return def;
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

function tearDownEmitter(ctx, emitter) {
  if (ctx.eventListeners) {
    ctx.eventListeners.forEach(({ event, listener }) => {
      emitter.removeListener(event, listener);
    });
    ctx.eventListeners.length = 0;
  }
  ctx.emit = () => {};
}

// First render
// preferredSize -> resize -> beforeRender -> render -> mounted

// Normal update
// beforeUpdate -> preferredSize -> resize -> beforeRender -> render -> updated

// Update without relayout
// beforeUpdate -> beforeRender -> render -> updated

// TODO support es6 classes
function componentFactory(definition, context = {}) {
  const { defaultSettings = {}, _DO_NOT_USE_getInfo = () => ({}) } = definition;
  const {
    chart,
    container,
    mediator,
    registries,
    theme,
    renderer, // Used by tests
  } = context;
  const emitter = EventEmitter.mixin({});
  let config = context.settings || {};
  let settings = extend(true, {}, defaultSettings, config);
  let data = [];
  let scale;
  let formatter;
  let element;
  let size;
  let style;
  let resolver = settingsResolver({
    chart,
  });
  let isVisible = false;

  const brushArgs = {
    nodes: [],
    chart,
    config: settings.brush || {},
    renderer: null,
  };
  const brushTriggers = {
    tap: [],
    over: [],
  };
  const brushStylers = [];
  const definitionContext = {};
  const instanceContext = extend({}, config);

  // Create a callback that calls lifecycle functions in the definition and config (if they exist).
  function createCallback(method, defaultMethod = () => {}, canBeValue = false) {
    return function cb(...args) {
      const inDefinition = typeof definition[method] !== 'undefined';
      const inConfig = typeof config[method] !== 'undefined';

      let returnValue;
      if (inDefinition) {
        if (typeof definition[method] === 'function') {
          returnValue = definition[method].call(definitionContext, ...args);
        } else if (canBeValue) {
          returnValue = definition[method];
        }
      }

      if (inConfig) {
        if (typeof config[method] === 'function') {
          returnValue = config[method].call(instanceContext, ...args);
        } else if (canBeValue) {
          returnValue = config[method];
        }
      }

      if (!inDefinition && !inConfig) {
        returnValue = defaultMethod.call(definitionContext, ...args);
      }

      return returnValue;
    };
  }

  const preferredSize = createCallback('preferredSize', () => 0, true);
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
    get: () => data,
  });

  const rendString = settings.renderer || definition.renderer;
  const rend = rendString ? renderer || registries.renderer(rendString)() : renderer || registries.renderer()();
  if (typeof rend.settings === 'function') {
    rend.settings(settings.rendererSettings);
  }
  brushArgs.renderer = rend;

  const dockConfigCallbackContext = { resources: chart.logger ? { logger: chart.logger() } : {} };
  let dockConfig = createDockConfig(
    createDockDefinition(settings, preferredSize, chart.logger()),
    dockConfigCallbackContext
  );

  const appendComponentMeta = (node) => {
    node.key = settings.key;
    node.element = rend.element();
  };

  const fn = () => {};

  fn.dockConfig = () => dockConfig;

  // Set new settings - will trigger mapping of data and creation of scale / formatter.
  fn.set = (opts = {}) => {
    if (opts.settings) {
      config = opts.settings;
      settings = extend(true, {}, defaultSettings, opts.settings);
      dockConfig = createDockConfig(
        createDockDefinition(settings, preferredSize, chart.logger()),
        dockConfigCallbackContext
      );
      brushArgs.config = settings.brush || {};
    }

    if (settings.scale) {
      scale = chart.scale(settings.scale);
    }

    if (settings.data) {
      const { rendererSettings } = settings;
      const progressive = typeof rendererSettings?.progressive === 'function' && rendererSettings.progressive();
      const extracted = extractData(
        settings.data,
        { dataset: chart.dataset, collection: chart.dataCollection },
        { logger: chart.logger() },
        chart.dataCollection
      );
      if (!progressive) {
        data = extracted;
      } else if (progressive.isFirst) {
        data = extracted;
        if (data.items) {
          data.items = [...(extracted.items || [])];
        }
      } else if (data.items) {
        data.items.push(...extracted.items);
      }
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

  fn.resize = (inner = {}, outer = {}) => {
    const newSize = resize({
      inner,
      outer,
    });
    if (newSize) {
      size = rend.size(newSize);
    } else {
      size = rend.size(inner);
    }
    instanceContext.rect = extend(
      true,
      {
        computedPhysical: size.computedPhysical,
        computedOuter: outer.computed || outer,
        computedInner: inner.computed || inner,
      },
      inner
    );
    size = extend(
      true,
      {
        computedOuter: outer.computed || outer,
        computedInner: inner.computed || inner,
      },
      size
    );
  };

  fn.getRect = () => instanceContext.rect;

  const getRenderArgs = () => {
    const renderArgs = rend.renderArgs ? rend.renderArgs.slice(0) : [];
    const { rendererSettings } = settings;
    let d = data;
    const progressive = typeof rendererSettings?.progressive === 'function' && rendererSettings.progressive();
    if (data.items && progressive) {
      d = {
        ...data,
        items: data.items.slice(progressive.start, progressive.end),
      };
    }
    renderArgs.push({
      data: d,
    });
    return renderArgs;
  };

  fn.beforeMount = beforeMount;

  fn.beforeRender = () => {
    beforeRender({
      size,
    });
  };

  let currentNodes;
  let preComputedRect;

  function updateBrushNodes(nodes) {
    const { rendererSettings } = settings;
    const progressive = typeof rendererSettings?.progressive === 'function' && rendererSettings.progressive();
    if (!progressive) {
      brushArgs.nodes = nodes;
    } else if (progressive.isFirst) {
      brushArgs.nodes = [...(nodes || [])];
    } else if (brushArgs.nodes) {
      brushArgs.nodes.push(...(nodes || []));
    }
  }

  fn.render = () => {
    const nodes = render.call(definitionContext, ...getRenderArgs());
    updateBrushNodes(nodes);
    rend.render(nodes);
    currentNodes = nodes;
    preComputedRect = instanceContext.rect.computed;
  };

  fn.hide = () => {
    fn.unmount();
    rend.size({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
    rend.clear();
  };

  fn.beforeUpdate = () => {
    beforeUpdate({
      settings,
      data,
    });
  };

  let currentTween;
  fn.update = () => {
    if (currentTween) {
      currentTween.stop();
    }

    const { rendererSettings, brush, animations } = settings;

    if (typeof rendererSettings?.transform === 'function' && rendererSettings.transform()) {
      rend.render();
      currentNodes = null;
      return;
    }

    const nodes = render.call(definitionContext, ...getRenderArgs());
    updateBrushNodes(nodes);

    // Reset brush stylers and triggers
    brushStylers.forEach((b) => b.cleanUp());
    brushStylers.length = 0;
    brushTriggers.tap = [];
    brushTriggers.over = [];

    if (brush) {
      addBrushStylers();
      addBrushTriggers();
    }

    brushStylers.forEach((bs) => {
      if (bs.isActive()) {
        bs.update();
      }
    });

    if (
      currentNodes &&
      animations &&
      (typeof animations.enabled === 'function' ? animations.enabled() : animations.enabled)
    ) {
      /* The issue: as soon as animation begins, the layout changes immediately to a new layout while the displaying nodes' positions are still calculated relative to the old layout.
      This makes the nodes "jump" at the beginning of the animations. To fix this, we can compesate for the layout changes by adjusting the relative positions of the displaying nodes.
      For example, if the new layout of the point component (the central area) jumps 10px to the left compared to the old layout, we shift the points 10px to the right, making the absolute positions of the points stay the same. */
      if (animations.compensateForLayoutChanges) {
        animations.compensateForLayoutChanges({
          currentNodes,
          currentRect: instanceContext.rect.computed,
          previousRect: preComputedRect,
        });
      }
      currentTween = tween(
        {
          old: currentNodes,
          current: nodes,
        },
        { renderer: rend },
        animations
      );
      currentTween.start();
    } else {
      rend.render(nodes);
    }
    currentNodes = nodes;
    preComputedRect = instanceContext.rect.computed;

    if (rend.setKey && typeof config.key === 'string') {
      rend.setKey(config.key);
    }
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
    rect: () => instanceContext.rect,
    style: () => style,
    update: () => updateNodes,
    registries: () => registries,
    resolver: () => resolver,
    symbol: () => createSymbolFactory(registries.symbol),
  });

  /**
   * Component instance
   * @typedef {object} Component
   * @property {string} type Type of component
   * @property {string} key Key of the component
   */
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
    _DO_NOT_USE_getInfo: _DO_NOT_USE_getInfo.bind(definitionContext),
    isVisible: () => isVisible,
  });

  fn.getBrushedShapes = function getBrushedShapes(brushCtx, mode, props) {
    const shapes = [];
    if (settings.brush && settings.brush.consume) {
      const brusher = chart.brush(brushCtx);
      const sceneNodes = rend.findShapes('*');
      settings.brush.consume
        .filter((t) => t.context === brushCtx)
        .forEach((consume) => {
          for (let i = 0; i < sceneNodes.length; i++) {
            const node = sceneNodes[i];
            if (node.data && brusher.containsMappedData(node.data, props || consume.data, mode)) {
              appendComponentMeta(node);
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
    const shapes = (currentTween?.inProgress() ? currentTween.targetScene : rend).findShapes(selector);
    for (let i = 0, num = shapes.length; i < num; i++) {
      appendComponentMeta(shapes[i]);
    }

    return shapes;
  };

  fn.shapesAt = (shape, opts = {}) => {
    const items = rend.itemsAt(shape);
    let shapes;

    if (opts && opts.propagation === 'stop' && items.length > 0) {
      shapes = [items.pop().node];
    } else {
      shapes = items.map((i) => i.node);
    }

    for (let i = 0, num = shapes.length; i < num; i++) {
      appendComponentMeta(shapes[i]);
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
      data: brushArgs.data,
    });
  };

  fn.mount = () => {
    element = rend.element && rend.element() ? element : rend.appendTo(container);
    if (rend.setKey && typeof config.key === 'string') {
      rend.setKey(config.key);
    }

    if (settings.brush) {
      addBrushStylers();
      addBrushTriggers();
    }

    setUpEmitter(instanceContext, emitter, config);
    setUpEmitter(definitionContext, emitter, definition);

    isVisible = true;
  };

  fn.mounted = () => mounted(element);

  fn.unmount = () => {
    [instanceContext, definitionContext].forEach((ctx) => {
      tearDownEmitter(ctx, emitter);
    });
    brushTriggers.tap = [];
    brushTriggers.over = [];
    brushStylers.forEach((bs) => {
      bs.cleanUp();
    });
    brushStylers.length = 0;
    beforeUnmount();

    isVisible = false;
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
