import extend from 'extend';

import { detectTouchSupport, isValidTapEvent } from '../utils/event-type';
import { getShapeType } from '../geometry/util';
import datasources from '../data/data';
import dataCollections from '../data/collections';
import { collection as formatterCollection } from './formatter';
import { collection as scaleCollection } from './scales';
import buildScroll, { getOrCreateScrollApi } from './scroll-api';
import brush from '../brush';
import componentFactory from '../component/component-factory';
import mediatorFactory from '../mediator';
import { testRectPoint } from '../math/narrow-phase-collision';
import themeFn from '../theme';
import componentCollectionFn from './component-collection';

/**
 * @typedef {object} ComponentSettings
 * @property {string} type - Component type (ex: axis, point, ...)
 * @property {function} [preferredSize] - Function returning the preferred size
 * @property {function} [created]
 * @property {function} [beforeMount]
 * @property {function} [mounted]
 * @property {function} [beforeUpdate]
 * @property {function} [updated]
 * @property {function} [beforeRender]
 * @property {function} [beforeDestroy]
 * @property {function} [destroyed]
 * @property {brush-setting} [brush] see [brushing](./brushing.md)
 * @property {object} [layout] Layout settings
 * @property {number} [layout.displayOrder = 0]
 * @property {number} [layout.prioOrder = 0]
 * @property {string | {width: string, height: string}} [layout.minimumLayoutMode] Refer to layout sizes defined by layoutModes in `strategy`
 * @property {string} [layout.dock] left, right, top or bottom
 * @property {boolean} [show = true] If the component should be rendered
 * @property {string} [scale] Named scale. Will be provided to the component if it ask for it.
 * @property {string} [formatter] Named formatter. Fallback to create formatter from scale. Will be provided to the component if it ask for it.
 * @property {ComponentSettings[]} [components] Optional list of child components
 * @property {DockLayoutSettings|function} [strategy] Layout strategy used for child components.
 */

function addComponentDelta(shape, containerBounds, componentBounds) {
  const dx = containerBounds.left - componentBounds.left;
  const dy = containerBounds.top - componentBounds.top;
  const type = getShapeType(shape);
  const deltaShape = extend(true, {}, shape);

  switch (type) {
    case 'circle':
      deltaShape.cx += dx;
      deltaShape.cy += dy;
      break;
    case 'polygon':
      for (let i = 0, num = deltaShape.vertices.length; i < num; i++) {
        const v = deltaShape.vertices[i];
        v.x += dx;
        v.y += dy;
      }
      break;
    case 'geopolygon': // vertices is 2D array
      for (let n = 0; n < deltaShape.vertices.length; n++) {
        const vertices = deltaShape.vertices[n];
        for (let i = 0, num = vertices.length; i < num; i++) {
          const v = vertices[i];
          v.x += dx;
          v.y += dy;
        }
      }
      break;
    case 'line':
      deltaShape.x1 += dx;
      deltaShape.y1 += dy;
      deltaShape.x2 += dx;
      deltaShape.y2 += dy;
      break;
    case 'point':
    case 'rect':
      deltaShape.x += dx;
      deltaShape.y += dy;
      break;
    default:
      break;
  }

  return deltaShape;
}

const moveToPosition = (element, comp, index) => {
  const el = comp.instance.renderer().element();
  if (isNaN(index) || !el || !element || !element.children) {
    return;
  }
  const nodes = element.children;
  const i = Math.max(0, index);
  const node = nodes[i];
  if (el === node) {
    return;
  }
  const additionalEl = comp.instance.def.additionalElements && comp.instance.def.additionalElements().filter(Boolean);
  if (element.insertBefore && typeof node !== 'undefined') {
    element.insertBefore(el, node);
    if (additionalEl) {
      additionalEl.forEach((ae) => {
        element.insertBefore(ae, el);
      });
    }
  } else {
    if (additionalEl) {
      additionalEl.forEach((ae) => {
        element.appendChild(ae, el);
      });
    }
    element.appendChild(el);
  }
};

export function orderComponents(element, ordered) {
  const elToIdx = [];
  let numElements = 0;
  ordered.forEach((comp) => {
    elToIdx.push(numElements);

    // assume each component has at least one element
    numElements++;

    // check additional elements
    const additionalEl = comp.instance.def.additionalElements && comp.instance.def.additionalElements();
    if (additionalEl) {
      numElements += additionalEl.length;
    }
  });

  ordered.forEach((comp, i) => moveToPosition(element, comp, elToIdx[i]));
}

function chartFn(definition, context) {
  /**
   * @typedef {object} ChartDefinition
   */
  let {
    /**
     * @type {HTMLElement}
     * @memberof ChartDefinition
     */
    element,
    /**
     * @type {Array<DataSource>}
     * @memberof ChartDefinition
     */
    data = [],
    /**
     * @type {chart-settings}
     * @memberof ChartDefinition
     */
    settings = {},
    on = {},
  } = definition;

  const registries = context.registries;
  const logger = context.logger;
  const theme = themeFn(context.style, context.palettes);

  const listeners = [];
  /**
   * @alias Chart
   * @interface
   */
  const instance = extend({}, definition);
  const mediator = mediatorFactory();
  let visibleComponents = [];

  let currentScales = null; // Built scales
  let currentFormatters = null; // Built formatters
  let currentScrollApis = null; // Build scroll apis
  let currentInteractions = [];

  let dataset = () => {};
  let dataCollection = () => {};
  const brushes = {};
  let stopBrushing = false;

  const createComponent = (compSettings) => {
    if (!registries.component.has(compSettings.type)) {
      logger.warn(`Unknown component: ${compSettings.type}`);
      return false;
    }
    const componentDefinition = registries.component(compSettings.type);
    const compInstance = componentFactory(componentDefinition, {
      settings: compSettings,
      chart: instance,
      mediator,
      registries,
      theme,
      container: element,
    });
    return {
      instance: compInstance,
      settings: extend(true, {}, compSettings),
      key: compSettings.key,
      hasKey: typeof compSettings.key !== 'undefined',
    };
  };

  const componentsC = componentCollectionFn({ createComponent });

  // Create a callback that calls lifecycle functions in the definition and config (if they exist).
  function createCallback(method, defaultMethod = () => {}) {
    return function cb(...args) {
      const inDefinition = typeof definition[method] === 'function';

      let returnValue;
      if (inDefinition) {
        returnValue = definition[method].call(instance, ...args);
      } else {
        returnValue = defaultMethod.call(instance, ...args);
      }
      return returnValue;
    };
  }

  function getElementRect(el) {
    if (typeof el.getBoundingClientRect === 'function') {
      const { width, height } = el.getBoundingClientRect();
      return {
        x: 0,
        y: 0,
        width,
        height,
      };
    }
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  const layout = () => {
    let layoutSettings;
    if (settings.dockLayout) {
      logger.warn('Deprecation Warning: "dockLayout" property should be renamed to "strategy"');
      layoutSettings = settings.dockLayout;
    } else {
      layoutSettings = settings.strategy;
    }
    const rect = getElementRect(element);

    return componentsC.layout({ layoutSettings, rect });
  };

  const created = createCallback('created');
  const beforeMount = createCallback('beforeMount');
  const mounted = createCallback('mounted');
  const beforeUpdate = createCallback('beforeUpdate');
  const updated = createCallback('updated');
  const beforeRender = createCallback('beforeRender');
  const beforeDestroy = createCallback('beforeDestroy');
  const destroyed = createCallback('destroyed');

  const set = (_data, _settings, { partialData } = {}) => {
    const { formatters = {}, scales = {}, scroll = {} } = _settings;

    dataset = datasources(_data, { logger, types: registries.data });
    if (!partialData) {
      Object.keys(brushes).forEach((b) => brushes[b].clear());
    }
    if (_settings.palettes) {
      theme.setPalettes(_settings.palettes);
    }
    if (_settings.style) {
      theme.setStyle(_settings.style);
    }
    dataCollection = dataCollections(_settings.collections, { dataset }, { logger });

    const deps = {
      theme,
      logger,
    };
    currentScales = scaleCollection(
      scales,
      { dataset, collection: dataCollection },
      { ...deps, scale: registries.scale }
    );
    currentFormatters = formatterCollection(
      formatters,
      { dataset, collection: dataCollection },
      { ...deps, formatter: registries.formatter }
    );
    currentScrollApis = buildScroll(scroll, currentScrollApis);
  };

  const render = () => {
    const { components = [] } = settings;

    beforeRender();

    set(data, settings);

    componentsC.set({ components });

    const { visible, hidden, ordered } = layout();
    visibleComponents = visible;

    hidden.forEach((comp) => {
      comp.instance.hide();
      comp.visible = false;
    });

    visible.forEach((comp) => comp.instance.beforeMount());
    visible.forEach((comp) => comp.instance.mount());
    visible.forEach((comp) => comp.instance.beforeRender());

    visible.forEach((comp) => comp.instance.render());
    visible.forEach((comp) => comp.instance.mounted());
    visible.forEach((comp) => {
      comp.visible = true;
    });
    orderComponents(element, ordered);
  };

  function setInteractions(interactions = []) {
    const current = {};
    const newKeys = interactions.filter((it) => !!it.key).map((it) => it.key);
    currentInteractions.forEach((cit) => {
      if (cit.key && newKeys.indexOf(cit.key) !== -1) {
        // keep old instance
        current[cit.key] = cit;
      } else {
        cit.destroy();
      }
    });
    currentInteractions = interactions.map((intSettings) => {
      const intDefinition =
        intSettings.key && current[intSettings.key]
          ? current[intSettings.key]
          : registries.interaction(intSettings.type)(instance, mediator, element);
      intDefinition.set(intSettings);
      return intDefinition;
    });
  }

  const componentsFromPoint = (p) => {
    const br = element.getBoundingClientRect();
    const x = 'clientX' in p ? p.clientX : p.x;
    const y = 'clientY' in p ? p.clientY : p.y;
    const tp = { x: x - br.left, y: y - br.top };
    const ret = [];
    visibleComponents.forEach((c) => {
      const r = c.instance.getRect();
      // Do test on physical rect and use computed rect if available, otherwise fallback to computing a new rect for legacy support
      if (
        testRectPoint(
          r.computedPhysical
            ? r.computedPhysical
            : {
                x: r.margin.left + r.x * r.scaleRatio.x,
                y: r.margin.top + r.y * r.scaleRatio.y,
                width: r.width * r.scaleRatio.x,
                height: r.height * r.scaleRatio.y,
              },
          tp
        )
      ) {
        ret.push(c);
      }
    });
    return ret;
  };

  const addDefaultEventListeners = () => {
    if (listeners.length || !element) {
      return;
    }
    Object.keys(on).forEach((key) => {
      const listener = on[key].bind(instance);
      element.addEventListener(key, listener);
      listeners.push({
        key,
        listener,
      });
    });

    const eventInfo = {};
    const onTapDown = (e) => {
      if (e.touches) {
        eventInfo.x = e.touches[0].clientX;
        eventInfo.y = e.touches[0].clientY;
        eventInfo.multiTouch = e.touches.length > 1;
      } else {
        eventInfo.x = e.clientX;
        eventInfo.y = e.clientY;
        eventInfo.multiTouch = false;
      }
      eventInfo.time = Date.now();
      eventInfo.comps = componentsFromPoint(eventInfo);
    };

    const onBrushTap = (e) => {
      const comps = eventInfo.comps || componentsFromPoint(e);
      if (comps.every((c) => c.instance.def.disableTriggers)) {
        return;
      }

      if (e.type === 'touchend') {
        e.preventDefault();
      }
      if (!isValidTapEvent(e, eventInfo)) {
        return;
      }

      for (let i = comps.length - 1; i >= 0; i--) {
        const comp = comps[i];
        comp.instance.onBrushTap(e);
        if (stopBrushing) {
          stopBrushing = false;
          break;
        }
      }
    };

    const onBrushOver = (e) => {
      const comps = componentsFromPoint(e);
      for (let i = comps.length - 1; i >= 0; i--) {
        const comp = comps[i];
        comp.instance.onBrushOver(e);
        if (stopBrushing) {
          stopBrushing = false;
          break;
        }
      }
    };

    const brushEventList = [];

    brushEventList.push({ key: 'mousedown', listener: onTapDown });
    brushEventList.push({ key: 'mouseup', listener: onBrushTap });

    if (detectTouchSupport(element)) {
      brushEventList.push({ key: 'touchstart', listener: onTapDown });
      brushEventList.push({ key: 'touchend', listener: onBrushTap });
    }

    brushEventList.push({ key: 'mousemove', listener: onBrushOver });

    brushEventList.forEach((event) => {
      element.addEventListener(event.key, event.listener);
      listeners.push(event);
    });
  };

  const removeDefaultEventListeners = () => {
    listeners.forEach(({ key, listener }) => element.removeEventListener(key, listener));
    listeners.length = 0;
  };

  // Browser only
  const mount = () => {
    element.innerHTML = '';

    render();

    addDefaultEventListeners();
    setInteractions(settings.interactions);
  };

  const unmount = () => {
    removeDefaultEventListeners();
    setInteractions();
  };

  /**
   * Update the chart with new settings and / or data
   * @param {ChartDefinition} [chart] - Chart definition
   */
  instance.update = (newProps = {}) => {
    const { partialData, excludeFromUpdate = [] } = newProps;
    let visibleOrdered;
    if (newProps.data) {
      data = newProps.data;
    }
    if (newProps.settings) {
      settings = newProps.settings;
      setInteractions(newProps.settings.interactions);
    }

    beforeUpdate();

    set(data, settings, { partialData });

    const { formatters, scales, components = [] } = settings;

    componentsC.update({ components, data, excludeFromUpdate, formatters, scales });

    componentsC.forEach((comp) => {
      if (comp.updateWith) {
        comp.instance.set(comp.updateWith);
      }
    });
    componentsC.forEach((comp) => {
      if (comp.updateWith) {
        comp.instance.beforeUpdate();
      }
    });

    const toUpdate = [];
    const toRender = [];
    let toRenderOrUpdate;
    if (partialData) {
      componentsC.forEach((comp) => {
        if (comp.updateWith && comp.visible) {
          toUpdate.push(comp);
        }
      });
      toRenderOrUpdate = toUpdate;
    } else {
      const { visible, hidden, ordered } = layout(); // Relayout
      visibleComponents = visible;
      toRenderOrUpdate = visible;
      visibleOrdered = ordered;

      visible.forEach((comp) => {
        if (comp.updateWith && comp.visible) {
          toUpdate.push(comp);
        } else {
          toRender.push(comp);
        }
      });

      hidden.forEach((comp) => {
        comp.instance.hide();
        comp.visible = false;
        delete comp.updateWith;
      });
    }

    toRender.forEach((comp) => comp.instance.beforeMount());
    toRender.forEach((comp) => comp.instance.mount());

    toRenderOrUpdate.forEach((comp) => comp.instance.beforeRender());

    toRenderOrUpdate.forEach((comp) => {
      if (comp.updateWith && comp.visible) {
        comp.instance.update();
      } else {
        comp.instance.render();
      }
    });

    // Ensure that displayOrder is keept, only do so on re-layout update.
    // Which is only the case if partialData is false.
    if (!partialData) {
      orderComponents(element, visibleOrdered);
    }

    toRender.forEach((comp) => comp.instance.mounted());
    toUpdate.forEach((comp) => comp.instance.updated());

    visibleComponents.forEach((comp) => {
      delete comp.updateWith;
      comp.visible = true;
    });

    updated();
  };

  /**
   * Destroy the chart instance.
   */
  instance.destroy = () => {
    beforeDestroy();
    componentsC.destroy();
    unmount();
    delete instance.update;
    delete instance.destroy;
    destroyed();
  };

  /**
   * Get all shapes associated with the provided context
   * @param {string} context The brush context
   * @param {string} mode Property comparasion mode.
   * @param {Array<string>} props Which specific data properties to compare
   * @param {string} key Which component to get shapes from. Default gives shapes from all components.
   * @return {Array<object>} Array of objects containing shape and parent element
   */
  instance.getAffectedShapes = (ctx, mode = 'and', props, key) => {
    const shapes = [];
    visibleComponents
      .filter((comp) => key === undefined || key === null || comp.key === key)
      .forEach((comp) => {
        shapes.push(...comp.instance.getBrushedShapes(ctx, mode, props));
      });
    return shapes;
  };

  /**
   * Get all nodes matching the provided selector
   * @param {string} selector CSS selector [type, attribute, universal, class]
   * @returns {Array<SceneNode>} Array of objects containing matching nodes
   *
   * @example
   * chart.findShapes('Circle') // [<CircleNode>, <CircleNode>]
   * chart.findShapes('Circle[fill="red"][stroke!="black"]') // [CircleNode, CircleNode]
   * chart.findShapes('Container Rect') // [Rect, Rect]
   */
  instance.findShapes = (selector) => {
    const shapes = [];
    visibleComponents.forEach((c) => {
      shapes.push(...c.instance.findShapes(selector));
    });
    return shapes;
  };

  /**
   * Get components overlapping a point.
   * @param {Point} p - Point with x- and y-cooridnate. The coordinate is relative to the browser viewport.
   * @returns {Array<component-context>} Array of component contexts
   */
  instance.componentsFromPoint = (p) => componentsFromPoint(p).map((comp) => comp.instance.ctx);

  /**
   * Get all nodes colliding with a geometrical shape (circle, line, rectangle, point, polygon, geopolygon).
   *
   * The input shape is identified based on the geometrical attributes in the following order: circle => line => rectangle => point => polygon => geopolygon.
   * Note that not all nodes on a scene have collision detection enabled.
   * @param {Line|Rect|Point|Circle} shape - A geometrical shape. Coordinates are relative to the top-left corner of the chart instance container.
   * @param {object} opts - Options
   * @param {object[]} [opts.components] - Array of components to include in the lookup. If no components are specified, all components will be included.
   * @param {string} [opts.components[].component.key] - Component key
   * @param {string} [opts.components[].component.propagation] - if set to `stop`, will start lookup on top visible shape and propagate downwards until a shape is found.
   * @param {string} [opts.propagation] - if set to `stop`, will start lookup on top visible component and propagate downwards until a component has at least a match.
   * @returns {Array<SceneNode>} Array of objects containing colliding nodes
   *
   * @example
   * chart.shapesAt(
   *  {
   *    x: 0,
   *    y: 0,
   *    width: 100,
   *    height: 100
   *  },
   *  {
   *    components: [
   *      { key: 'key1', propagation: 'stop' },
   *      { key: 'key2' }
   *    ],
   *    propagation: 'stop'
   *  }
   * );
   */
  instance.shapesAt = (shape, opts = {}) => {
    const result = [];
    const containerBounds = element.getBoundingClientRect();
    let comps = visibleComponents; // Assume that visibleComponents is ordererd according to displayOrder

    if (Array.isArray(opts.components) && opts.components.length > 0) {
      const compKeys = opts.components.map((c) => c.key);
      comps = visibleComponents
        .filter((c) => compKeys.indexOf(c.key) !== -1)
        .map((c) => ({
          instance: c.instance,
          opts: opts.components[compKeys.indexOf(c.key)],
        }));
    }

    for (let i = comps.length - 1; i >= 0; i--) {
      const c = comps[i];
      const componentBounds = c.instance.renderer().element().getBoundingClientRect();
      const deltaShape = addComponentDelta(shape, containerBounds, componentBounds);
      const shapes = c.instance.shapesAt(deltaShape, c.opts);
      const stopPropagation = shapes.length > 0 && opts.propagation === 'stop';

      result.push(...shapes);

      if (result.length > 0 && stopPropagation) {
        return result;
      }
    }
    return result;
  };

  /**
   * Brush data by providing a collection of data bound shapes.
   * @param {SceneNode[]} shapes - An array of data bound shapes.
   * @param {object} config - Options
   * @param {Array<object>} opts.components - Array of components to include in the lookup.
   * @param {string} [opts.components.component.key] - Component key
   * @param {Array<string>} [opts.components.component.contexts] - Name of the brushing contexts to affect
   * @param {Array<string>} [opts.components.component.data] - The mapped data properties to add to the brush
   * @param {string} [opts.components.component.action] - Type of action to respond with
   *
   * @example
   * const shapes = chartInstance.shapesAt(...);
   * const config = {
   *  components:[
   *    {
   *      key: 'key1',
   *      contexts: ['myContext'],
   *      data: [''],
   *      action: 'add'
   *    }
   *  ]
   * };
   * chartInstance.brushFromShapes(shapes, config);
   */
  instance.brushFromShapes = (shapes, config = { components: [] }) => {
    for (let i = 0; i < config.components.length; i++) {
      const iKey = config.components[i].key;
      visibleComponents
        .filter((c) => iKey === c.key)
        .forEach((c) => {
          let compShapes = shapes.filter((shape) => shape.key === c.key);
          c.instance.brushFromShapes(compShapes, config.components[i]);
        });
    }
  };

  /**
   * @param {string} name - Name of scroll api
   * @returns {scroll}
   */
  instance.scroll = function scroll(name = 'default') {
    return getOrCreateScrollApi(name, currentScrollApis);
  };

  /**
   * Get
   * @param {string} key - Get the dataset identified by `key`
   * @returns {Dataset}
   */
  instance.dataset = (key) => dataset(key);

  instance.dataCollection = (key) => dataCollection(key);

  /**
   * Get all registered scales
   * @returns {Object<string,scale>}
   */
  instance.scales = function scales() {
    return currentScales.all();
  };

  /**
   * Get all registered formatters
   * @returns {Object<string,formatter>}
   */
  instance.formatters = function formatters() {
    return currentFormatters.all();
  };

  /**
   * Get or create brush context for this chart
   * @param {string} name - Name of the brush context. If no match is found, a new brush context is created and returned.
   * @returns {Brush}
   */
  instance.brush = function brushFn(name = 'default') {
    if (!brushes[name]) {
      brushes[name] = brush();
    }
    return brushes[name];
  };

  /**
   * Get or create a scale for this chart
   * @param {string|object} v - Scale reference or scale options
   * @returns {scale}
   * @example
   * instance.scale('nameOfMyScale'); // Fetch an existing scale by name
   * instance.scale({ scale: 'nameOfMyScale' }); // Fetch an existing scale by name
   * instance.scale({ source: '0/1', type: 'linear' }); // Create a new scale
   */
  instance.scale = function scale(v) {
    return currentScales.get(v);
  };

  /**
   * Get or create a formatter for this chart
   * @param {string|object} v - Formatter reference or formatter options
   * @returns {formatter}
   * @example
   * instance.formatter('nameOfMyFormatter'); // Fetch an existing formatter by name
   * instance.formatter({ formatter: 'nameOfMyFormatter' }); // Fetch an existing formatter by name
   * instance.formatter({ type: 'q' }); // Fetch an existing formatter by type
   * instance.formatter({
   *  formatter: 'd3',
   *  type: 'number',
   *  format: '1.0.%'
   * }); // Create a new formatter
   */
  instance.formatter = function formatter(v) {
    return currentFormatters.get(v);
  };

  /**
   * @param {boolean} [val] - Toggle brushing on or off. If value is omitted, a toggle action is applied to the current state.
   */
  instance.toggleBrushing = function toggleBrushing(val) {
    if (typeof val !== 'undefined') {
      stopBrushing = val;
    } else {
      stopBrushing = !stopBrushing;
    }
  };

  /**
   * Get a component context
   * @param {string} key - Component key
   * @returns {component-context} Component context
   */
  instance.component = (key) => {
    const component = componentsC.findComponentByKey(key);
    return component?.instance.ctx;
  };

  instance.logger = () => logger;

  instance.theme = () => theme;

  /**
   * Get the all interactions instances
   * @name Chart.interactions
   * @type {object}
   * @example
   * chart.interactions.instances; // Array of all interaction instances
   * chart.interactions.on(); // Toggle on all interactions instances
   * chart.interactions.off(); // Toggle off all interactions instances
   */
  Object.defineProperty(instance, 'interactions', {
    get() {
      return /** @lends Chart.interactions */ {
        /** @type Array<interaction> */
        instances: currentInteractions,
        /** Enable all interaction instances */
        on() {
          addDefaultEventListeners();
          currentInteractions.forEach((i) => i.on());
        },
        /** Disable all interaction instances */
        off() {
          removeDefaultEventListeners();
          currentInteractions.forEach((i) => i.off());
        },
      };
    },
  });

  created();

  if (element) {
    beforeMount();
    mount(element);
    mounted(element);
    instance.element = element;
  }

  return instance;
}

export default chartFn;
