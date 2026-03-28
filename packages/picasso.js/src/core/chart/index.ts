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
import createStorage from '../storage';
import { testRectPoint } from '../math/narrow-phase-collision';
import themeFn from '../theme';
import componentCollectionFn from './component-collection';

// Type definitions for commonly used types
interface Shape extends Record<string, unknown> {
  cx?: number;
  cy?: number;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  vertices?: Array<Array<{ x: number; y: number }>>;
  type?: string;
  [key: string]: unknown;
}

interface Bounds {
  left: number;
  top: number;
  width?: number;
  height?: number;
  right?: number;
  bottom?: number;
}

interface Component {
  instance: Record<string, unknown>;
  settings: Record<string, unknown>;
  key?: string;
  hasKey?: boolean;
  visible?: boolean;
  updateWith?: unknown;
  applyTransform?: boolean;
}

interface EventInfo extends Record<string, unknown> {
  x?: number;
  y?: number;
  multiTouch?: boolean;
  time?: number;
  comps?: Component[];
}

interface Listener {
  key: string;
  listener: (e: Event) => void;
}

interface Interaction extends Record<string, unknown> {
  key?: string;
  type: string;
  destroy?: () => void;
  set?: (settings: Record<string, unknown>) => void;
}

interface ChartInstance extends Record<string, unknown> {
  update?: (opts?: Record<string, unknown>) => void;
  destroy?: () => void;
  getAffectedShapes?: (ctx: string, mode?: string, props?: unknown[], key?: string) => unknown[];
  findShapes?: (selector: string) => unknown[];
  componentsFromPoint?: (p: Record<string, number>) => unknown[];
  shapesAt?: (shape: unknown, opts?: Record<string, unknown>) => unknown[];
  brush?: (config: Record<string, unknown>) => void;
}

/**
 * @callback customLayoutFunction
 * @param {Rect} rect
 * @param {object[]} components
 * @param {string} components[].key
 * @param {object} components[].dockConfig
 * @param {function} components[].resize
 * @param {function} components[].preferredSize
 */

/**
 * Called when the chart has been created
 * @callback ChartDefinition~created
 */

/**
 * Called before the chart has been mounted
 * @callback ChartDefinition~beforeMount
 */

/**
 * Called after the chart has been mounted
 * @callback ChartDefinition~mounted
 * @param {HTMLElement} element The element the chart been mounted to
 */

/**
 * Called before the chart has been rendered
 * @callback ChartDefinition~beforeRender
 */

/**
 * Called before the chart has been updated
 * @callback ChartDefinition~beforeUpdate
 */

/**
 * Called after the chart has been updated
 * @callback ChartDefinition~updated
 */

/**
 * Called before the chart has been destroyed
 * @callback ChartDefinition~beforeDestroy
 */

/**
 * Called after the chart has been destroyed
 * @callback ChartDefinition~destroyed
 */

/**
 * @typedef {ComponentAxis | ComponentBox | ComponentBrushArea | ComponentBrushAreaDir | ComponentBrushLasso | ComponentBrushRange | ComponentContainer | ComponentGridLine | ComponentLabels | ComponentLegendCat | ComponentLegendSeq | ComponentLine | ComponentPie | ComponentPoint | ComponentRefLine | ComponentText | ComponentTooltip} ComponentTypes
 */

/**
 * @typedef {object} ChartSettings
 * @property {ComponentTypes[]} [components] Components
 * @property {object.<string, ScaleDefinition>} [scales] Dictionary with scale definitions
 * @property {object.<string, FormatterDefinition>} [formatters] Dictionary with formatter definitions
 * @property {DockLayoutSettings} [strategy] Dock layout strategy
 * @property {InteractionSettings[]} [interactions] Interaction handlers
 * @property {CollectionSettings[]} [collections] Collections
 */

/**
 * Generic settings available to all components
 * @interface ComponentSettings
 * @property {string} type - Component type (ex: axis, point, ...)
 * @property {function} [preferredSize] - Function returning the preferred size
 * @property {function} [created] Called when the component has been created
 * @property {function} [beforeMount] Called before the component has been mounted
 * @property {function} [mounted] Called after the component has been mounted
 * @property {function} [beforeUpdate] Called before the component has been updated
 * @property {function} [updated] Called after the component has been updated
 * @property {function} [beforeRender] Called before the component has been rendered
 * @property {function} [beforeDestroy] Called before the component has been destroyed
 * @property {function} [destroyed] Called after the component has been destroyed
 * @property {object} [brush] Brush settings
 * @property {BrushTriggerSettings[]} [brush.trigger] Trigger settings
 * @property {BrushConsumeSettings[]} [brush.consume] Consume settings
 * @property {function} [brush.sortNodes] Sorting function for nodes. Should return sorted nodes.
 * @property {object} [layout] Layout settings
 * @property {number} [layout.displayOrder = 0]
 * @property {number} [layout.prioOrder = 0]
 * @property {string | {width: string, height: string}} [layout.minimumLayoutMode] Refer to layout sizes defined by layoutModes in `strategy`
 * @property {string} [layout.dock] left, right, top or bottom
 * @property {boolean} [show = true] If the component should be rendered
 * @property {string} [scale] Named scale. Will be provided to the component if it asks for it.
 * @property {string} [formatter] Named formatter. Fallback to create formatter from scale. Will be provided to the component if it asks for it.
 * @property {ComponentSettings[]} [components] Optional list of child components
 * @property {DockLayoutSettings|customLayoutFunction} [strategy] Layout strategy used for child components.
 * @property {DataExtraction|DataFieldExtraction} [data] Extracted data that should be available to the component
 * @property {RendererSettings} [rendererSettings] Settings for the renderer used to render the component
 * @property {string} [key] Component key
 */

// mark strategy as experimental
/**
 * @type {DockLayoutSettings|customLayoutFunction}
 * @name strategy
 * @memberof ComponentSettings
 * @experimental
 */

// mark components as experimental
/**
 * @type {ComponentSettings[]}
 * @name components
 * @memberof ComponentSettings
 * @experimental
 */

/**
 * @typedef {object} BrushTriggerSettings
 * @property {string} [on] Type of interaction to trigger brush on
 * @property {string} [action] Type of interaction to respond with
 * @property {string[]} [contexts] Name of the brushing contexts to affect
 * @property {string[]} [data] The mapped data properties to add to the brush
 * @property {string} [propagation] Control the event propagation when multiple shapes are tapped. Disabled by default
 * @property {string} [globalPropagation] Control the event propagation between components. Disabled by default
 * @property {number} [touchRadius] Extend contact area for touch events. Disabled by default
 * @property {number} [mouseRadius] Extend contact area for regular mouse events. Disabled by default
 * @example
 * {
 *    on: 'tap',
 *    action: 'toggle',
 *    contexts: ['selection', 'tooltip'],
 *    data: ['x'],
 *    propagation: 'stop', // 'stop' => prevent trigger from propagating further than the first shape
 *    globalPropagation: 'stop', // 'stop' => prevent trigger of same type to be triggered on other components
 *    touchRadius: 24,
 *    mouseRadius: 10
 *  }
 */

/**
 * @typedef {object} BrushConsumeSettings
 * @property {string} [context] Name of the brush context to observe
 * @property {string[]} [data] The mapped data properties to observe
 * @property {string} [mode] Data properties operator: and, or, xor.
 * @property {function} [filter] Filtering function
 * @property {object} [style] The style to apply to the shapes of the component
 * @property {object.<string, any>} [style.active] The style of active data points
 * @property {object.<string, any>} [style.inactive] The style of inactive data points
 * @example
 * {
 *    context: 'selection',
 *    data: ['x'],
 *    filter: (shape) => shape.type === 'circle',
 *    style: {
 *      active: {
 *        fill: 'red',
 *        stroke: '#333',
 *        strokeWidth: (shape) => shape.strokeWidth * 2,
 *      },
 *      inactive: {},
 *    },
 * }
 */

/**
 * @typedef {object} RendererSettings
 * @property {RendererSettings~TransformFunction} [transform] Setting for applying transform without re-rendering the whole component completely.
 * @property {RendererSettings~CanvasBufferSize} [canvasBufferSize] Specifies the size of buffer canvas (used together with transform setting).
 * @property {RendererSettings~Progressive} [progressive] Setting for applying progressive rendering to a canvas renderer
 * @property {boolean} [disableScreenReader = false] Setting to disable the screen reader for the component. If set to true, screen reader support will be disabled. This setting is not relevant when using the canvas renderer.
 * @experimental
 */

/**
 * Should return a transform object if transformation should be applied, otherwise undefined or a falsy value.
 * Transforms can be applied with the canvas, svg and dom renderer.
 * Transform is applied when running chart.update, see example.
 * !Important: When a transform is applied to a component, the underlaying node representations are not updated with the new positions/sizes, which
 * can cause problems for operations that relies on the positioning of the shapes/nodes (such as tooltips, selections etc). An extra chart update
 * without a transform is therefore needed to make sure the node position information is in sync with the visual representation again.
 * @typedef {function} RendererSettings~TransformFunction
 * @returns {TransformObject}
 * @experimental
 * @example
 * const pointComponentDef = {
 *   type: 'point',
 *   rendererSettings: {
 *     tranform() {
 *       if(shouldApplyTransform) {
 *         return {
 *           horizontalScaling: 1,
 *           horizontalSkewing: 0,
 *           verticalSkewing: 0,
 *           verticalScaling: 1,
 *           horizontalMoving: x,
 *           verticalMoving: y
 *         };
 *       }
 *     }
 *   }
 *   data: {
 * // ............
 *
 * chart.update({ partialData: true });
 */

/**
 * An object containing width and height of the canvas buffer or a function returning an object on that format.
 * Gets a rect object as input parameter.
 * @typedef {function|object} RendererSettings~CanvasBufferSize
 * @experimental
 */

/**
 * A format to represent a transformation.
 * @typedef {object} TransformObject
 * @property {number} horizontalScaling
 * @property {number} horizontalSkewing
 * @property {number} verticalSkewing
 * @property {number} verticalScaling
 * @property {number} horizontalMoving
 * @property {number} verticalMoving
 */

/**
 * A function which returns either (1) false (to specify no progressive rendering used) or an object specifing the data chunk rendered.
 *  This is only applied to a canvas renderer.
 * @typedef {function} RendererSettings~Progressive
 * @returns {ProgressiveObject|boolean}
 * @experimental
 */

/**
 * A format to represent a data chunk to be rendered.
 * @typedef {object} ProgressiveObject
 * @property {number} start - Start index of a data chunk.
 * @property {number} end - End index of a data chunk.
 * @property {boolean} isFirst - If it is the first data chunk rendered. This helps to clear a canvas before rendering.
 * @property {boolean} isLast - If it is the last data chunk rendered. This helps to update other components depending on a component with progressive rendering.
 * @experimental
 */

/**
 * @typedef {object} BrushTargetConfig
 * @property {string} key - Component key
 * @property {string[]} [contexts] - Name of the brushing contexts to affect
 * @property {string[]} [data] - The mapped data properties to add to the brush
 * @property {string} [action='set'] - Type of action to respond with
 */

function addComponentDelta(shape: Shape, containerBounds: Bounds, componentBounds: Bounds): Shape {
  const dx = containerBounds.left - componentBounds.left;
  const dy = containerBounds.top - componentBounds.top;
  const type = getShapeType(shape);
  const deltaShape: Shape = extend(true, {}, shape);

  switch (type) {
    case 'circle':
      if (typeof deltaShape.cx === 'number') deltaShape.cx += dx;
      if (typeof deltaShape.cy === 'number') deltaShape.cy += dy;
      break;
    case 'polygon':
      if (Array.isArray(deltaShape.vertices)) {
        for (let i = 0, num = deltaShape.vertices.length; i < num; i++) {
          const v = deltaShape.vertices[i];
          if (Array.isArray(v)) continue; // Skip if it's 2D array
          if (typeof v === 'object' && v !== null && 'x' in v && 'y' in v) {
            (v as { x: number; y: number }).x += dx;
            (v as { x: number; y: number }).y += dy;
          }
        }
      }
      break;
    case 'geopolygon': // vertices is 2D array
      if (Array.isArray(deltaShape.vertices)) {
        for (let n = 0; n < deltaShape.vertices.length; n++) {
          const vertices = deltaShape.vertices[n];
          if (Array.isArray(vertices)) {
            for (let i = 0, num = vertices.length; i < num; i++) {
              const v = vertices[i];
              if (typeof v === 'object' && v !== null && 'x' in v && 'y' in v) {
                (v as { x: number; y: number }).x += dx;
                (v as { x: number; y: number }).y += dy;
              }
            }
          }
        }
      }
      break;
    case 'line':
      if (typeof deltaShape.x1 === 'number') deltaShape.x1 += dx;
      if (typeof deltaShape.y1 === 'number') deltaShape.y1 += dy;
      if (typeof deltaShape.x2 === 'number') deltaShape.x2 += dx;
      if (typeof deltaShape.y2 === 'number') deltaShape.y2 += dy;
      break;
    case 'point':
    case 'rect':
      if (typeof deltaShape.x === 'number') deltaShape.x += dx;
      if (typeof deltaShape.y === 'number') deltaShape.y += dy;
      break;
    default:
      break;
  }

  return deltaShape;
}

const moveToPosition = (element: HTMLElement | null, comp: Component, index: number): void => {
  const el = (comp.instance.renderer as () => Record<string, unknown>)().element?.() as HTMLElement | null;
  if (isNaN(index) || !el || !element || !element.children) {
    return;
  }
  const nodes = element.children;
  const i = Math.max(0, index);
  const node = nodes[i];
  if (el === node) {
    return;
  }
  const additionalElResult = (comp.instance.def as Record<string, unknown>).additionalElements && (comp.instance.def as Record<string, () => HTMLElement[] | null>).additionalElements?.();
  const additionalEl = additionalElResult && Array.isArray(additionalElResult) ? additionalElResult.filter(Boolean) : undefined;
  if (element.insertBefore && typeof node !== 'undefined') {
    element.insertBefore(el, node);
    if (additionalEl && Array.isArray(additionalEl)) {
      additionalEl.forEach((ae: HTMLElement) => {
        element.insertBefore(ae, el);
      });
    }
  } else {
    if (additionalEl && Array.isArray(additionalEl)) {
      additionalEl.forEach((ae: HTMLElement) => {
        element.appendChild(ae);
      });
    }
    element.appendChild(el);
  }
};

export function orderComponents(element: HTMLElement, ordered: Component[]): void {
  const elToIdx: number[] = [];
  let numElements = 0;
  ordered.forEach((comp: Component) => {
    elToIdx.push(numElements);

    // assume each component has at least one element
    numElements++;

    // check additional elements
    const additionalElResult = (comp.instance.def as Record<string, unknown>).additionalElements && (comp.instance.def as Record<string, () => HTMLElement[] | null>).additionalElements?.();
    if (additionalElResult && Array.isArray(additionalElResult)) {
      numElements += additionalElResult.length;
    }
  });

  ordered.forEach((comp: Component, i: number) => moveToPosition(element, comp, elToIdx[i]));
}

function chartFn(definition: Record<string, unknown>, context: Record<string, unknown>): ChartInstance {
  /**
   * @typedef {object} ChartDefinition
   * @property {ChartDefinition~beforeDestroy} [beforeDestroy]
   * @property {ChartDefinition~beforeMount} [beforeMount]
   * @property {ChartDefinition~beforeRender} [beforeRender]
   * @property {ChartDefinition~beforeUpdate} [beforeUpdate]
   * @property {ChartDefinition~created} [created]
   * @property {ChartDefinition~destroyed} [destroyed]
   * @property {ChartDefinition~mounted} [mounted]
   * @property {ChartDefinition~updated} [updated]
   */
  let element: HTMLElement | null = null;
  let data: unknown = [];
  let settings: Record<string, unknown> = {};
  let on: Record<string, (e: Event) => void> = {};

  const def = definition as Record<string, unknown>;
  if ('element' in def) element = def.element as HTMLElement | null;
  if ('data' in def) data = def.data;
  if ('settings' in def) settings = def.settings as Record<string, unknown>;
  if ('on' in def) on = def.on as Record<string, (e: Event) => void>;

  const registries = (context as Record<string, unknown>).registries as Record<string, unknown>;
  const logger = (context as Record<string, unknown>).logger as Record<string, unknown>;
  const theme = themeFn((context as Record<string, unknown>).style as Record<string, unknown>, (context as Record<string, unknown>).palettes as Record<string, unknown>);

  const listeners: Listener[] = [];
  /**
   * Chart instance
   * @alias Chart
   * @interface
   */
  const instance: ChartInstance = extend({}, definition);
  const mediator = mediatorFactory();
  let visibleComponents: Component[] = [];

  let currentScales: Record<string, unknown> | null = null; // Built scales
  let currentFormatters: Record<string, unknown> | null = null; // Built formatters
  let currentScrollApis: Record<string, unknown> | null = null; // Build scroll apis
  let currentInteractions: Interaction[] = [];

  let dataset: ((_data: unknown) => void) | ReturnType<typeof datasources> = () => {};
  let dataCollection: ((_settings: unknown) => void) | ReturnType<typeof dataCollections> = () => {};
  const brushes: Record<string, unknown> = {};
  let stopBrushing = false;

  const createComponent = (compSettings: Record<string, unknown>): Component | false => {
    if (!(registries.component as Record<string, unknown>).has?.(compSettings.type)) {
      (logger as Record<string, (msg: string) => void>).warn?.(`Unknown component: ${compSettings.type}`);
      return false;
    }
    const componentDefinition = (registries.component as (type: string) => Record<string, unknown>)(compSettings.type as string);
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
      key: compSettings.key as string,
      hasKey: typeof compSettings.key !== 'undefined',
    };
  };

  const componentsC = componentCollectionFn({ createComponent });

  // Create a callback that calls lifecycle functions in the definition and config (if they exist).
  function createCallback(method: string, defaultMethod: (...args: unknown[]) => unknown = () => {}): (...args: unknown[]) => unknown {
    return function cb(...args: unknown[]): unknown {
      const inDefinition = typeof (definition as Record<string, unknown>)[method] === 'function';

      let returnValue: unknown;
      if (inDefinition) {
        returnValue = ((definition as Record<string, unknown>)[method] as (...args: unknown[]) => unknown).call(instance, ...args);
      } else {
        returnValue = defaultMethod.call(instance, ...args);
      }
      return returnValue;
    };
  }

  function getElementRect(el: HTMLElement | null): Bounds {
    if (typeof (el as Record<string, unknown>)?.getBoundingClientRect === 'function') {
      const { width, height } = (el as HTMLElement).getBoundingClientRect();
      return {
        x: 0,
        y: 0,
        width,
        height,
        left: 0,
        top: 0,
      };
    }
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      left: 0,
      top: 0,
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

    return (componentsC as Record<string, (...args: unknown[]) => unknown>).layout({ layoutSettings, rect });
  };

  const created = createCallback('created');
  const beforeMount = createCallback('beforeMount');
  const mounted = createCallback('mounted');
  const beforeUpdate = createCallback('beforeUpdate');
  const updated = createCallback('updated');
  const beforeRender = createCallback('beforeRender');
  const beforeDestroy = createCallback('beforeDestroy');
  const destroyed = createCallback('destroyed');

  const set = (_data: unknown, _settings: Record<string, unknown>, { partialData }: { partialData?: boolean } = {}): void => {
    const { formatters = {}, scales = {}, scroll = {} } = _settings as Record<string, unknown>;

    dataset = datasources(_data, { logger, types: (registries.data as Record<string, unknown>) });
    if (!partialData) {
      Object.keys(brushes).forEach((b: string) => (brushes[b] as Record<string, () => void>).clear?.());
    }
    if (_settings.palettes) {
      (theme as Record<string, (p: unknown) => void>).setPalettes?.(_settings.palettes);
    }
    if (_settings.style) {
      (theme as Record<string, (s: unknown) => void>).setStyle?.(_settings.style);
    }
    dataCollection = dataCollections(_settings.collections as unknown, { dataset }, { logger });

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
    currentScrollApis = buildScroll(scroll as Record<string, unknown>, currentScrollApis);
  };

  const render = (): void => {
    const { components = [] } = (settings as Record<string, unknown>);

    beforeRender();

    set(data, settings as Record<string, unknown>);

    (componentsC as Record<string, (...args: unknown[]) => void>).set?.({ components });

    const { visible, hidden, ordered } = (layout() as { visible: Component[]; hidden: Component[]; ordered: Component[] });
    visibleComponents = visible;

    hidden.forEach((comp: Component) => {
      ((comp.instance as Record<string, Record<string, () => void>>).hide)?.();
      comp.visible = false;
    });

    visible.forEach((comp: Component) => ((comp.instance as Record<string, () => void>).beforeMount)?.());
    visible.forEach((comp: Component) => ((comp.instance as Record<string, () => void>).mount)?.());
    visible.forEach((comp: Component) =>
      ((comp.instance as Record<string, () => void>).beforeRender)?.()
    );

    visible.forEach((comp: Component) => ((comp.instance as Record<string, () => void>).render)?.());
    visible.forEach((comp: Component) => ((comp.instance as Record<string, () => void>).mounted)?.());
    visible.forEach((comp: Component) => {
      comp.visible = true;
    });
    orderComponents(element as HTMLElement, ordered);
  };

  function setInteractions(interactions: Interaction[] = []): void {
    const current: Record<string, Interaction> = {};
    const newKeys: (string | undefined)[] = interactions.filter((it: Interaction) => !!it.key).map((it: Interaction) => it.key);
    currentInteractions.forEach((cit: Interaction) => {
      if (cit.key && newKeys.indexOf(cit.key) !== -1) {
        // keep old instance
        current[cit.key] = cit;
      } else {
        cit.destroy?.();
      }
    });
    currentInteractions = interactions.map((intSettings: Interaction) => {
      const intDefinition: Interaction =
        intSettings.key && current[intSettings.key]
          ? current[intSettings.key]
          : ((registries.interaction as (type: string) => (inst: ChartInstance, med: unknown, el: HTMLElement) => Interaction)(intSettings.type as string)(instance as ChartInstance, mediator, element as HTMLElement));
      (intDefinition.set as (settings: Interaction) => void)?.(intSettings);
      return intDefinition;
    });
  }

  const componentsFromPoint = (p: Record<string, number>): Component[] => {
    const br = (element as HTMLElement).getBoundingClientRect();
    const x = 'clientX' in p ? p.clientX : p.x;
    const y = 'clientY' in p ? p.clientY : p.y;
    const tp = { x: x - br.left, y: y - br.top };
    const ret: Component[] = [];
    visibleComponents.forEach((c: Component) => {
      const r = (c.instance.getRect as () => Record<string, unknown>)();
      // Do test on physical rect and use computed rect if available, otherwise fallback to computing a new rect for legacy support
      if (
        testRectPoint(
          (r.computedPhysical as Bounds)
            ? (r.computedPhysical as Bounds)
            : {
                x: ((r.margin as Record<string, number>).left + (r.x as number) * ((r.scaleRatio as Record<string, number>).x as number)) as number,
                y: ((r.margin as Record<string, number>).top + (r.y as number) * ((r.scaleRatio as Record<string, number>).y as number)) as number,
                width: ((r.width as number) * ((r.scaleRatio as Record<string, number>).x as number)) as number,
                height: ((r.height as number) * ((r.scaleRatio as Record<string, number>).y as number)) as number,
                left: 0,
                top: 0,
              },
          tp
        )
      ) {
        ret.push(c);
      }
    });
    return ret;
  };

  const addDefaultEventListeners = (): void => {
    if (listeners.length || !element) {
      return;
    }
    Object.keys(on).forEach((key: string) => {
      const listener = (on as Record<string, (e: Event) => void>)[key].bind(instance);
      (element as HTMLElement).addEventListener(key, listener);
      listeners.push({
        key,
        listener,
      });
    });

    const eventInfo: EventInfo = {};
    const onTapDown = (e: TouchEvent | MouseEvent): void => {
      if ((e as TouchEvent).touches) {
        eventInfo.x = (e as TouchEvent).touches[0].clientX;
        eventInfo.y = (e as TouchEvent).touches[0].clientY;
        eventInfo.multiTouch = (e as TouchEvent).touches.length > 1;
      } else {
        eventInfo.x = (e as MouseEvent).clientX;
        eventInfo.y = (e as MouseEvent).clientY;
        eventInfo.multiTouch = false;
      }
      eventInfo.time = Date.now();
      eventInfo.comps = componentsFromPoint(eventInfo as Record<string, number>);
    };

    const onBrushTap = (e: Event): void => {
      const comps: Component[] = (eventInfo.comps as Component[]) || componentsFromPoint(e as Record<string, number>);
      if (
        comps.every(
          (c: Component) =>
            ((c.instance as Record<string, unknown>).def as Record<string, boolean>).disableTriggers
        )
      ) {
        return;
      }

      if ((e as TouchEvent).type === 'touchend') {
        (e as TouchEvent).preventDefault();
      }
      if (!isValidTapEvent(e, eventInfo)) {
        return;
      }

      for (let i = comps.length - 1; i >= 0; i--) {
        const comp = comps[i];
        (comp.instance.onBrushTap as (e: Event) => void)?.(e);
        if (stopBrushing) {
          stopBrushing = false;
          break;
        }
      }
    };

    const onBrushOver = (e: Event): void => {
      const comps: Component[] = componentsFromPoint(e as Record<string, number>);
      for (let i = comps.length - 1; i >= 0; i--) {
        const comp = comps[i];
        (comp.instance.onBrushOver as (e: Event) => void)?.(e);
        if (stopBrushing) {
          stopBrushing = false;
          break;
        }
      }
    };

    const brushEventList: Listener[] = [];

    brushEventList.push({ key: 'mousedown', listener: onTapDown as (e: Event) => void });
    brushEventList.push({ key: 'mouseup', listener: onBrushTap });

    if (detectTouchSupport(element as HTMLElement)) {
      brushEventList.push({ key: 'touchstart', listener: onTapDown as (e: Event) => void });
      brushEventList.push({ key: 'touchend', listener: onBrushTap });
    }

    brushEventList.push({ key: 'mousemove', listener: onBrushOver });

    brushEventList.forEach((event: Listener) => {
      (element as HTMLElement).addEventListener(event.key, event.listener);
      listeners.push(event);
    });
  };

  const removeDefaultEventListeners = (): void => {
    listeners.forEach(({ key, listener }: Listener) => (element as HTMLElement).removeEventListener(key, listener));
    listeners.length = 0;
  };

  // Browser only
  const mount = (): void => {
    (element as HTMLElement).innerHTML = '';

    render();

    addDefaultEventListeners();
    setInteractions((settings as Record<string, unknown>).interactions as Interaction[]);
  };

  const unmount = (): void => {
    removeDefaultEventListeners();
    setInteractions();
  };

  /**
   * Layout the chart with new settings and / or data
   * @param {object} [def] - New chart definition
   * @param {Array<DataSource>|DataSource} [def.data] Chart data
   * @param {ChartSettings} [def.settings] Chart settings
   * @param {string[]} [def.excludeFromUpdate=[]] Keys of components to not include in the layout
   * @experimental
   */
  instance.layoutComponents = (newProps: Record<string, unknown> = {}) => {
    const { excludeFromUpdate = [] } = newProps;
    if (newProps.data) {
      data = newProps.data;
    }
    if (newProps.settings) {
      settings = newProps.settings;
      setInteractions((newProps.settings as Record<string, unknown>).interactions as unknown[]);
    }

    beforeUpdate();

    set(data, settings);

    const { formatters, scales, components = [] } = settings;

    (componentsC as Record<string, (...args: unknown[]) => unknown>).update({
      components,
      data,
      excludeFromUpdate,
      formatters,
      scales,
    });

    (componentsC as Record<string, (...args: unknown[]) => unknown>).forEach((comp) => {
      if (comp.updateWith) {
        comp.instance.set(comp.updateWith);
      }
    });
    (componentsC as Record<string, (...args: unknown[]) => unknown>).forEach((comp) => {
      if (comp.updateWith) {
        comp.instance.beforeUpdate();
      }
    });

    layout(); // Relayout
  };

  /**
   * Update the chart with new settings and / or data
   * @param {object} [def] - New chart definition
   * @param {Array<DataSource>|DataSource} [def.data] Chart data
   * @param {ChartSettings} [def.settings] Chart settings
   * @param {boolean} [def.partialData=false] If set to true, will trigger a data update only. Meaning the layout will not be updated
   * @param {string[]} [def.excludeFromUpdate=[]] Keys of components to not include in the update
   */
  instance.update = (newProps: Record<string, unknown> = {}) => {
    const { partialData, excludeFromUpdate = [] } = newProps;
    let visibleOrdered;
    if (newProps.data) {
      data = newProps.data;
    }
    if (newProps.settings) {
      settings = newProps.settings;
      setInteractions((newProps.settings as Record<string, unknown>).interactions as unknown[]);
    }

    beforeUpdate();

    set(data, settings, { partialData: partialData as boolean });

    const { formatters, scales, components = [] } = settings;

    (componentsC as Record<string, (...args: unknown[]) => unknown>).update({
      components,
      data,
      excludeFromUpdate,
      formatters,
      scales,
    });

    (componentsC as Record<string, (...args: unknown[]) => unknown>).forEach((comp) => {
      if (comp.updateWith) {
        comp.instance.set(comp.updateWith);
      }
    });
    (componentsC as Record<string, (...args: unknown[]) => unknown>).forEach((comp) => {
      if (comp.updateWith) {
        comp.instance.beforeUpdate();
      }
    });

    const toUpdate: Component[] = [];
    const toRender: Component[] = [];
    let toRenderOrUpdate: Component[];
    if (partialData) {
      (componentsC as Record<string, (cb: (comp: Component) => void) => void>).forEach((comp: Component) => {
        if ((comp.updateWith || comp.applyTransform) && comp.visible) {
          toUpdate.push(comp);
        }
      });
      toRenderOrUpdate = toUpdate;
    } else {
      const { visible, hidden, ordered } = (layout() as { visible: Component[]; hidden: Component[]; ordered: Component[] }); // Relayout
      visibleComponents = visible;
      toRenderOrUpdate = visible;
      visibleOrdered = ordered;

      visible.forEach((comp: Component) => {
        if (comp.updateWith && comp.visible) {
          toUpdate.push(comp);
        } else {
          toRender.push(comp);
        }
      });

      hidden.forEach((comp: Component) => {
        ((comp.instance as Record<string, () => void>).hide)?.();
        comp.visible = false;
        delete comp.updateWith;
        comp.applyTransform = false;
      });
    }

    toRender.forEach((comp: Component) =>
      ((comp.instance as Record<string, () => void>).beforeMount)?.()
    );
    toRender.forEach((comp: Component) => ((comp.instance as Record<string, () => void>).mount)?.());

    toRenderOrUpdate.forEach((comp: Component) => ((comp.instance as Record<string, () => void>).beforeRender)?.());

    toRenderOrUpdate.forEach((comp: Component) => {
      if ((comp.updateWith || comp.applyTransform) && comp.visible) {
        ((comp.instance as Record<string, () => void>).update)?.();
      } else {
        ((comp.instance as Record<string, () => void>).render)?.();
      }
    });

    // Ensure that displayOrder is keept, only do so on re-layout update.
    // Which is only the case if partialData is false.
    if (!partialData) {
      orderComponents(element as HTMLElement, visibleOrdered as Component[]);
    }

    toRender.forEach((comp: Component) => ((comp.instance as Record<string, () => void>).mounted)?.());
    toUpdate.forEach((comp: Component) => ((comp.instance as Record<string, () => void>).updated)?.());

    visibleComponents.forEach((comp: Component) => {
      delete comp.updateWith;
      comp.visible = true;
      comp.applyTransform = false;
    });

    updated();
  };

  /**
   * Destroy the chart instance.
   */
  instance.destroy = (): void => {
    beforeDestroy();
    (componentsC as Record<string, (...args: unknown[]) => void>).destroy?.();
    unmount();
    delete instance.update;
    delete instance.destroy;
    destroyed();
  };

  /**
   * Get all shapes associated with the provided context
   * @param {string} context The brush context
   * @param {string} mode Property comparison mode.
   * @param {Array<string>} props Which specific data properties to compare
   * @param {string} key Which component to get shapes from. Default gives shapes from all components.
   * @return {Array<object>} Array of objects containing shape and parent element
   */
  instance.getAffectedShapes = (ctx: string, mode: string = 'and', props?: unknown[], key?: string): unknown[] => {
    let shapes: unknown[] = [];
    visibleComponents
      .filter((comp: Component) => key === undefined || key === null || comp.key === key)
      .forEach((comp: Component) => {
        const brushedShapes = (comp.instance.getBrushedShapes as (ctx: string, mode: string, props?: unknown[]) => unknown[])(ctx, mode, props);
        shapes = [...shapes, ...brushedShapes];
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
  instance.findShapes = (selector: string): unknown[] => {
    let shapes: unknown[] = [];
    visibleComponents.forEach((c: Component) => {
      const matchedShapes = (c.instance.findShapes as (selector: string) => unknown[])(selector);
      shapes = [...shapes, ...matchedShapes];
    });
    return shapes;
  };

  /**
   * Get components overlapping a point.
   * @param {Point} p - Point with x- and y-coordinate. The coordinate is relative to the browser viewport.
   * @returns {Array<Component>} Array of component contexts
   */
  instance.componentsFromPoint = (p: Record<string, number>): unknown[] => componentsFromPoint(p).map((comp: Component) => (comp.instance.ctx as unknown));

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
  instance.shapesAt = (shape: unknown, opts: Record<string, unknown> = {}): unknown[] => {
    let result: unknown[] = [];
    const containerBounds: Bounds = (element as HTMLElement).getBoundingClientRect() as Bounds;
    let comps: Component[] | Array<Record<string, unknown>> = visibleComponents; // Assume that visibleComponents is ordererd according to displayOrder

    if (Array.isArray(opts.components) && (opts.components as unknown[]).length > 0) {
      const compKeys = ((opts.components as unknown[]) as Array<Record<string, unknown>>).map((c: Record<string, unknown>) => c.key);
      comps = visibleComponents
        .filter((c: Component) => compKeys.indexOf(c.key) !== -1)
        .map((c: Component) => ({
          instance: c.instance,
          opts: (opts.components as Array<Record<string, unknown>>)[compKeys.indexOf(c.key)],
        }));
    }

    for (let i = comps.length - 1; i >= 0; i--) {
      const c: Record<string, unknown> = comps[i] as Record<string, unknown>;
      const componentBounds: Bounds = ((c.instance as Record<string, unknown>).renderer as () => Record<string, unknown>)().element?.() as Bounds;
      const deltaShape = addComponentDelta(shape as Shape, containerBounds, componentBounds);
      const shapes = ((c.instance as Record<string, unknown>).shapesAt as (shape: Shape, opts?: Record<string, unknown>) => unknown[])(deltaShape, c.opts as Record<string, unknown>);
      const stopPropagation = shapes.length > 0 && (opts.propagation as string) === 'stop';

      result = [...result, ...shapes];

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
   * @param {BrushTargetConfig[]} config.components - Array of components to include in the lookup
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
  instance.brushFromShapes = (shapes: unknown[], config: Record<string, unknown> = { components: [] }): void => {
    for (let i = 0; i < ((config.components as unknown[]) || []).length; i++) {
      const iKey = ((config.components as Array<Record<string, unknown>>)[i] as Record<string, unknown>).key;
      visibleComponents
        .filter((c: Component) => iKey === c.key)
        .forEach((c: Component) => {
          const compShapes: unknown[] = shapes.filter((shape: Record<string, unknown>) => (shape.key as string) === c.key);
          ((c.instance as Record<string, unknown>).brushFromShapes as (shapes: unknown[], config: Record<string, unknown>) => void)(compShapes, (config.components as Array<Record<string, unknown>>)[i] as Record<string, unknown>);
        });
    }
  };

  /**
   * @private
   * @param {string} name - Name of scroll api
   * @returns {object}
   */
  instance.scroll = function scroll(name: string = 'default'): Record<string, unknown> {
    return getOrCreateScrollApi(name, currentScrollApis as Record<string, unknown>);
  };

  /**
   * Get
   * @param {string} key - Get the dataset identified by `key`
   * @returns {Dataset}
   */
  instance.dataset = (key: string): unknown => (dataset as (key: string) => unknown)(key);

  instance.dataCollection = (key: string): unknown => (dataCollection as (key: string) => unknown)(key);

  /**
   * Get all registered scales
   * @returns {Object<string,Scale>}
   */
  instance.scales = function scales(): Record<string, unknown> {
    return (currentScales as Record<string, (...args: unknown[]) => Record<string, unknown>>).all?.() || {};
  };

  /**
   * Get all registered formatters
   * @returns {Object<string,formatter>}
   */
  instance.formatters = function formatters(): Record<string, unknown> {
    return (currentFormatters as Record<string, (...args: unknown[]) => Record<string, unknown>>).all?.() || {};
  };

  /**
   * Get or create brush context for this chart
   * @param {string} name - Name of the brush context. If no match is found, a new brush context is created and returned.
   * @returns {Brush}
   */
  instance.brush = function brushFn(name: string = 'default'): unknown {
    if (!(brushes as Record<string, unknown>)[name]) {
      (brushes as Record<string, unknown>)[name] = brush();
    }
    return (brushes as Record<string, unknown>)[name];
  };

  /**
   * Get or create a scale for this chart
   * @param {string|object} v - Scale reference or scale options
   * @returns {Scale}
   * @example
   * instance.scale('nameOfMyScale'); // Fetch an existing scale by name
   * instance.scale({ scale: 'nameOfMyScale' }); // Fetch an existing scale by name
   * instance.scale({ source: '0/1', type: 'linear' }); // Create a new scale
   */
  instance.scale = function scale(v: string | Record<string, unknown>): unknown {
    return (currentScales as Record<string, (v: string | Record<string, unknown>) => unknown>).get?.(v);
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
  instance.formatter = function formatter(v: string | Record<string, unknown>): unknown {
    return (currentFormatters as Record<string, (v: string | Record<string, unknown>) => unknown>).get?.(v);
  };

  /**
   * @param {boolean} [val] - Toggle brushing on or off. If value is omitted, a toggle action is applied to the current state.
   */
  instance.toggleBrushing = function toggleBrushing(val?: boolean): void {
    if (typeof val !== 'undefined') {
      stopBrushing = val as boolean;
    } else {
      stopBrushing = !stopBrushing;
    }
  };

  /**
   * Get a component context
   * @param {string} key - Component key
   * @returns {Component} Component context
   */
  instance.component = (key: string): unknown => {
    const component = (componentsC as Record<string, (key: string) => Record<string, unknown> | undefined>).findComponentByKey?.(key);
    return ((component as Record<string, Record<string, unknown>> | undefined)?.instance as Record<string, unknown>)?.ctx;
  };

  instance.logger = (): Record<string, unknown> => logger as Record<string, unknown>;

  instance.theme = (): Record<string, unknown> => theme as Record<string, unknown>;

  instance.storage = createStorage({ animations: { updatingStageMeta: { isInit: false, shouldBeRemoved: false } } });

  /**
   * Interaction instance
   * @typedef {object} Interaction
   * @property {function} on Enable interaction
   * @property {function} off Disable interaction
   * @property {function} destroy Destroy interaction
   * @property {string} key Interaction identifier
   */

  /**
   * Get all interaction instances
   * @name Chart.interactions
   * @type {object}
   * @example
   * chart.interactions.instances; // Array of all interaction instances
   * chart.interactions.on(); // Toggle on all interactions instances
   * chart.interactions.off(); // Toggle off all interactions instances
   */
  Object.defineProperty(instance, 'interactions', {
    get(): Record<string, unknown> {
      return /** @lends Chart.interactions */ {
        /** @type Array<Interaction> */
        instances: currentInteractions,
        /** Enable all interaction instances */
        on(): void {
          addDefaultEventListeners();
          currentInteractions.forEach((i: Interaction) => (i.on as () => void)?.());
        },
        /** Disable all interaction instances */
        off(): void {
          removeDefaultEventListeners();
          currentInteractions.forEach((i: Interaction) => (i.off as () => void)?.());
        },
      };
    },
  });

  created();

  if (element) {
    (beforeMount as () => void)?.();
    mount();
    (mounted as (el: HTMLElement) => void)?.(element as HTMLElement);
    (instance as Record<string, unknown>).element = element;
  }

  return instance;
}

export default chartFn;
