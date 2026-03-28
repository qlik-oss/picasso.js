import extend from 'extend';
import { resolveContainerRects, resolveSettings } from './settings-resolver';
import { rectToPoints, pointsToRect } from '../../geometry/util';
import type { Rect } from '../../geometry/util';
import createRect from './create-rect';

interface EdgeBleed {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface PreferredSizeReturn {
  width: number;
  height: number;
  size?: number;
  edgeBleed?: EdgeBleed;
}

interface Component {
  cachedSize?: number;
  edgeBleed?: EdgeBleed | number;
  config: {
    dock(): string;
    prioOrder(): number;
    displayOrder(): number;
  };
  comp: {
    preferredSize(opts: { inner: Rect; outer: Rect; dock: string }): number | PreferredSizeReturn;
    resize(rect: DockRect, outerRect: DockRect): void;
    visible?: boolean;
  };
  referencedDocks: string[];
  key: string;
  outerRect?: DockRect;
  r?: DockRect;
}

function cacheSize(c: Component, reducedRect: Rect, layoutRect: Rect): number {
  if (typeof c.cachedSize === 'undefined') {
    const dock = c.config.dock();
    let sizeResult = c.comp.preferredSize({ inner: reducedRect, outer: layoutRect, dock });
    let size: PreferredSizeReturn;
    
    // backwards compatibility
    if (typeof sizeResult === 'number') {
      if (!isNaN(sizeResult)) {
        size = { width: sizeResult, height: sizeResult };
      } else {
        size = { width: 0, height: 0 };
      }
    } else if (sizeResult && typeof sizeResult.size === 'number' && !isNaN(sizeResult.size)) {
      size = {
        ...sizeResult,
        width: sizeResult.size,
        height: sizeResult.size,
      };
    } else {
      size = sizeResult as PreferredSizeReturn;
    }

    let relevantSize: number;
    if (dock === 'top' || dock === 'bottom') {
      relevantSize = size.height;
    } else if (dock === 'right' || dock === 'left') {
      relevantSize = size.width;
    } else {
      relevantSize = Math.max(size.width, size.height);
    }
    c.cachedSize = Math.ceil(relevantSize);
    c.edgeBleed = size.edgeBleed || 0;
  }
  return c.cachedSize;
}

interface Settings {
  center: {
    minWidth: number;
    minHeight: number;
    minWidthRatio: number;
    minHeightRatio: number;
  };
}

function validateReduceRect(rect: Rect, reducedRect: Rect, settings: Settings): boolean {
  // Absolute value for width/height should have predence over relative value
  const minReduceWidth =
    Math.min(settings.center.minWidth, rect.width) || Math.max(rect.width * settings.center.minWidthRatio, 1);
  const minReduceHeight =
    Math.min(settings.center.minHeight, rect.height) || Math.max(rect.height * settings.center.minHeightRatio, 1);
  return reducedRect.width >= minReduceWidth && reducedRect.height >= minReduceHeight;
}

function reduceDocRect(reducedRect: Rect, c: Component): void {
  const size = c.cachedSize ?? 0;
  switch (c.config.dock()) {
    case 'top':
      reducedRect.y += size;
      reducedRect.height -= size;
      break;
    case 'bottom':
      reducedRect.height -= size;
      break;
    case 'left':
      reducedRect.x += size;
      reducedRect.width -= size;
      break;
    case 'right':
      reducedRect.width -= size;
      break;
    default:
  }
}

function addEdgeBleed(currentEdgeBleed: EdgeBleed, c: Component): void {
  const edgeBleed = c.edgeBleed;
  if (!edgeBleed) {
    return;
  }
  if (typeof edgeBleed === 'object') {
    currentEdgeBleed.left = Math.max(currentEdgeBleed.left, edgeBleed.left || 0);
    currentEdgeBleed.right = Math.max(currentEdgeBleed.right, edgeBleed.right || 0);
    currentEdgeBleed.top = Math.max(currentEdgeBleed.top, edgeBleed.top || 0);
    currentEdgeBleed.bottom = Math.max(currentEdgeBleed.bottom, edgeBleed.bottom || 0);
  }
}

function reduceEdgeBleed(layoutRect: Rect, reducedRect: Rect, edgeBleed: EdgeBleed): void {
  if (reducedRect.x < edgeBleed.left) {
    reducedRect.width -= edgeBleed.left - reducedRect.x;
    reducedRect.x = edgeBleed.left;
  }
  const reducedRectRightBoundary = layoutRect.width - (reducedRect.x + reducedRect.width);
  if (reducedRectRightBoundary < edgeBleed.right) {
    reducedRect.width -= edgeBleed.right - reducedRectRightBoundary;
  }
  if (reducedRect.y < edgeBleed.top) {
    reducedRect.height -= edgeBleed.top - reducedRect.y;
    reducedRect.y = edgeBleed.top;
  }
  const reducedRectBottomBoundary = layoutRect.height - (reducedRect.y + reducedRect.height);
  if (reducedRectBottomBoundary < edgeBleed.bottom) {
    reducedRect.height -= edgeBleed.bottom - reducedRectBottomBoundary;
  }
}

function reduceSingleLayoutRect(layoutRect: Rect, reducedRect: Rect, edgeBleed: EdgeBleed, c: Component, settings: Settings): boolean {
  const newReduceRect = extend({}, reducedRect);
  const newEdgeBleed = extend({}, edgeBleed);
  reduceDocRect(newReduceRect, c);
  addEdgeBleed(newEdgeBleed, c);
  reduceEdgeBleed(layoutRect, newReduceRect, newEdgeBleed);

  const isValid = validateReduceRect(layoutRect, newReduceRect, settings);
  if (!isValid) {
    return false;
  }

  reduceDocRect(reducedRect, c);
  addEdgeBleed(edgeBleed, c);
  return true;
}

/**
 * Updates the visible and hidden components based on components that are docked to other components.
 * For example, assume a component called myRect:
 * {
 *  key: 'myRect',
 *  type: 'rect',
 *  dock: 'bottom'
 * }
 * and a component called myLine:
 * {
 *  key: 'myLine',
 *  type: 'line',
 *  dock: '@myRect'
 * }
 * if the layout engine decides to hide myRect, then myLine should be hidden as well.
 * @param {Array} visible - Components to be decided if they should be hidden or not.
 * @param {Array} hidden - Components that are already hidden.
 * @returns {Object} containing the new visible components and additional components to be hidden.
 * @ignore
 */
function filterReferencedDocks(visible: Component[], hidden: Component[]): void {
  if (hidden.length === 0) {
    return;
  }

  for (let i = 0; i < visible.length; ++i) {
    let v = visible[i];
    if (v.referencedDocks.length) {
      const isAllHidden = v.referencedDocks.every((refDock) => hidden.some((h) => h.key === refDock));
      if (isAllHidden) {
        hidden.push(visible.splice(i, 1)[0]);
      }
    }
  }
}

function reduceLayoutRect({ layoutRect, visible, hidden, settings }: { layoutRect: Rect; visible: Component[]; hidden: Component[]; settings: Settings }): Rect {
  const reducedRect = createRect(layoutRect.x, layoutRect.y, layoutRect.width, layoutRect.height);
  const edgeBleed = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  const sortedComponents = visible.slice();
  sortedComponents.sort((a, b) => a.config.prioOrder() - b.config.prioOrder()); // lower prioOrder will have higher prio

  for (let i = 0; i < sortedComponents.length; ++i) {
    const c = sortedComponents[i];
    cacheSize(c, reducedRect, layoutRect);

    if (!reduceSingleLayoutRect(layoutRect, reducedRect, edgeBleed, c, settings)) {
      hidden.push(sortedComponents.splice(i, 1)[0]);
      --i;
    }
  }

  filterReferencedDocks(visible, hidden);

  const filteredUnsortedComps = visible.filter((c) => sortedComponents.indexOf(c) !== -1);
  visible.length = 0;
  visible.push(...filteredUnsortedComps);
  reduceEdgeBleed(layoutRect, reducedRect, edgeBleed);
  return reducedRect;
}

function computeRect(rect: DockRect): { x: number; y: number; width: number; height: number } {
  return {
    x: (rect.margin?.left ?? 0) + (rect.x ?? 0) * (rect.scaleRatio?.x ?? 1),
    y: (rect.margin?.top ?? 0) + (rect.y ?? 0) * (rect.scaleRatio?.y ?? 1),
    width: (rect.width ?? 0) * (rect.scaleRatio?.x ?? 1),
    height: (rect.height ?? 0) * (rect.scaleRatio?.y ?? 1),
  };
}

function appendScaleRatio(rect: DockRect, outerRect: DockRect, layoutRect: DockRect, containerRect: Rect): void {
  const width = layoutRect.width ?? 0;
  const height = layoutRect.height ?? 0;
  const scaleRatio = {
    x: containerRect.width / width,
    y: containerRect.height / height,
  };
  const margin = {
    left: 0,
    top: 0,
  };

  if (layoutRect.preserveAspectRatio) {
    const xLessThenY = scaleRatio.x < scaleRatio.y;
    // To preserve the aspect ratio, take the smallest ratio and apply in both directions to "meet" the size of the container
    const minRatio = Math.min(scaleRatio.x, scaleRatio.y);
    scaleRatio.x = minRatio;
    scaleRatio.y = minRatio;
    const area = xLessThenY ? 'height' : 'width';
    const spread = (containerRect[area] - (layoutRect[area] ?? 0) * scaleRatio.x) * (layoutRect.align ?? 0.5);
    margin.left = xLessThenY ? 0 : spread;
    margin.top = xLessThenY ? spread : 0;
  }

  rect.scaleRatio = scaleRatio;
  rect.margin = margin;
  outerRect.scaleRatio = scaleRatio;
  outerRect.margin = margin;
  layoutRect.scaleRatio = scaleRatio;
  layoutRect.margin = margin;
}

function boundingBox(rects: (Rect | DockRect)[]): Rect {
  const points: any[] = [];
  rects.forEach(rect => {
    points.push(...rectToPoints(rect as Rect));
  });
  return pointsToRect(points);
}

function positionComponents({ visible, layoutRect, reducedRect, containerRect, translation }: { visible: Component[]; layoutRect: DockRect; reducedRect: Rect; containerRect: Rect; translation: { x: number; y: number } }): Component[] {
  const vRect = createRect(reducedRect.x, reducedRect.y, reducedRect.width, reducedRect.height);
  const hRect = createRect(reducedRect.x, reducedRect.y, reducedRect.width, reducedRect.height);

  const referencedComponents: Record<string, { r: DockRect; outerRect: DockRect }> = {};
  const referenceArray = visible.slice();
  const elementOrder = referenceArray.slice().sort((a, b) => a.config.displayOrder() - b.config.displayOrder());
  visible
    .sort((a, b) => {
      if (a.referencedDocks.length > 0 && b.referencedDocks.length > 0) {
        return 0;
      }
      if (b.referencedDocks.length > 0) {
        return -1;
      }
      if (a.referencedDocks.length > 0) {
        return 1;
      }
      const diff = a.config.displayOrder() - b.config.displayOrder();
      if (diff === 0) {
        return referenceArray.indexOf(a) - referenceArray.indexOf(b);
      }
      return diff;
    })
    .forEach((c) => {
      let outerRect: DockRect = {};
      let rect: DockRect = {};
      const d = c.config.dock();
      const cachedSize = c.cachedSize ?? 0;
      switch (d) {
        case 'top':
          outerRect.height = rect.height = cachedSize;
          outerRect.width = layoutRect.width;
          rect.width = vRect.width;
          outerRect.x = layoutRect.x;
          rect.x = vRect.x;
          outerRect.y = rect.y = (vRect.y ?? 0) - cachedSize;

          vRect.y = (vRect.y ?? 0) - cachedSize;
          vRect.height = (vRect.height ?? 0) + cachedSize;
          break;
        case 'bottom':
          outerRect.x = layoutRect.x;
          rect.x = vRect.x;
          outerRect.y = rect.y = (vRect.y ?? 0) + (vRect.height ?? 0);
          outerRect.width = layoutRect.width;
          rect.width = vRect.width;
          outerRect.height = rect.height = cachedSize;

          vRect.height = (vRect.height ?? 0) + cachedSize;
          break;
        case 'left':
          outerRect.x = rect.x = (hRect.x ?? 0) - cachedSize;
          outerRect.y = layoutRect.y;
          rect.y = hRect.y;
          outerRect.width = rect.width = cachedSize;
          outerRect.height = layoutRect.height;
          rect.height = hRect.height;

          hRect.x = (hRect.x ?? 0) - cachedSize;
          hRect.width = (hRect.width ?? 0) + cachedSize;
          break;
        case 'right':
          outerRect.x = rect.x = (hRect.x ?? 0) + (hRect.width ?? 0);
          outerRect.y = layoutRect.y;
          rect.y = hRect.y;
          outerRect.width = rect.width = cachedSize;
          outerRect.height = layoutRect.height;
          rect.height = hRect.height;

          hRect.width = (hRect.width ?? 0) + cachedSize;
          break;
        case 'center':
          outerRect.x = rect.x = reducedRect.x;
          outerRect.y = rect.y = reducedRect.y;
          outerRect.width = rect.width = reducedRect.width;
          outerRect.height = rect.height = reducedRect.height;
          break;
        default:
          if (c.referencedDocks.length > 0) {
            const refs = c.referencedDocks
              .map((ref: string) => referencedComponents[ref])
              .filter((ref: { r: DockRect; outerRect: DockRect } | undefined) => !!ref);
            if (refs.length > 0) {
              outerRect = boundingBox(refs.map((ref: { r: DockRect; outerRect: DockRect }) => ref.outerRect));
              rect = boundingBox(refs.map((ref: { r: DockRect; outerRect: DockRect }) => ref.r));
            }
          }
          break;
      }
      if (c.key) {
        referencedComponents[c.key] = {
          // store the size of this component
          r: rect,
          outerRect,
        };
      }
      appendScaleRatio(rect, outerRect, layoutRect, containerRect);
      rect.edgeBleed = c.edgeBleed;
      rect.computed = computeRect(rect);
      outerRect.edgeBleed = c.edgeBleed;
      outerRect.computed = computeRect(outerRect);
      rect.x = (rect.x ?? 0) + translation.x;
      rect.y = (rect.y ?? 0) + translation.y;
      outerRect.x = (outerRect.x ?? 0) + translation.x;
      outerRect.y = (outerRect.y ?? 0) + translation.y;
      c.comp.resize(rect, outerRect);
      c.cachedSize = undefined;
      c.edgeBleed = undefined;
    });
  return elementOrder;
}

function checkShowSettings(strategySettings: any, dockSettings: any, logicalContainerRect: Rect): boolean {
  const layoutModes = strategySettings.layoutModes || {};
  const minimumLayoutMode = dockSettings.minimumLayoutMode();
  let show = dockSettings.show();
  if (show && typeof minimumLayoutMode === 'object') {
    show =
      layoutModes[minimumLayoutMode.width] &&
      layoutModes[minimumLayoutMode.height] &&
      logicalContainerRect.width >= layoutModes[minimumLayoutMode.width].width &&
      logicalContainerRect.height >= layoutModes[minimumLayoutMode.height].height;
  } else if (show && minimumLayoutMode !== undefined) {
    show =
      layoutModes[minimumLayoutMode] &&
      logicalContainerRect.width >= layoutModes[minimumLayoutMode].width &&
      logicalContainerRect.height >= layoutModes[minimumLayoutMode].height;
  }
  return show;
}

function validateComponent(component: any): void {
  if (!component.resize || typeof component.resize !== 'function') {
    throw new Error('Component is missing resize function');
  }
  if (!component.dockConfig && !component.preferredSize) {
    throw new Error('Component is missing preferredSize function');
  }
}

function filterComponents(components: unknown[], settings: unknown, rect: Rect): { visible: Component[]; hidden: Component[] } {
  const visible: Component[] = [];
  const hidden: Component[] = [];
  // check show settings
  for (let i = 0; i < components.length; ++i) {
    const comp = components[i] as any;
    validateComponent(comp);
    // backwards compatibility
    let config = comp.dockConfig;
    const key = comp.key;
    const d = config.dock();
    const referencedDocks = /@/.test(d) ? d.split(',').map((s: string) => s.replace(/^\s*@/, '')) : [];
    if (checkShowSettings(settings, config, rect)) {
      visible.push({
        comp,
        key,
        config,
        referencedDocks,
      });
    } else {
      hidden.push({
        comp,
        key,
        config,
        referencedDocks,
      });
    }
  }
  return { visible, hidden };
}

/**
 * Dock layout settings
 * @typedef {object} DockLayoutSettings
 * @property {object} [logicalSize] - Logical size
 * @property {number} [logicalSize.width] - Width in pixels
 * @property {number} [logicalSize.height] - Height in pixels
 * @property {boolean} [logicalSize.preserveAspectRatio=false] - If true, takes the smallest ratio of width/height between logical and physical size ( physical / logical )
 * @property {number} [logicalSize.align=0.5] - Normalized value between 0-1. Defines how the space around the scaled axis is spread in the container, with 0.5 meaning the spread is equal on both sides. Only applicable if preserveAspectRatio is set to true
 * @property {object} [center] - Define how much space the center dock area requires
 * @property {number} [center.minWidthRatio=0.5] - Value between 0 and 1
 * @property {number} [center.minHeightRatio=0.5] - Value between 0 and 1
 * @property {number} [center.minWidth] - Width in pixels
 * @property {number} [center.minHeight] - Height in pixels
 * @property {object<string, DockLayoutSettings~LayoutMode>} [layoutModes] Dictionary with named sizes
 * @property {object} [size] - Size is equal to that of the container (element) of the chart by default. It's possible to overwrite it by explicitly setting width or height
 * @property {number} [size.width] - Width in pixels
 * @property {number} [size.height] - Height in pixels
 */

/**
 * @typedef {object} DockLayoutSettings~LayoutMode
 * @property {number} width
 * @property {number} height
 */

/** Extended rect used during dock layout computation */
interface DockRect {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  edgeBleed?: unknown;
  computed?: { x: number; y: number; width: number; height: number };
  scaleRatio?: { x: number; y: number };
  margin?: { left: number; top: number };
  preserveAspectRatio?: boolean;
  align?: number;
}

/** The docker layout object returned by dockLayout() */
interface Docker {
  layout(rect: { x: number; y: number; width: number; height: number }, components?: unknown[]): {
    visible: unknown[];
    hidden: unknown[];
    ordered: unknown[];
  };
  settings(s: unknown): void;
}

function dockLayout(initialSettings: any): Docker {
  let settings = resolveSettings(initialSettings);

  // Methods are assigned immediately below; the cast is safe since all Docker properties are defined before return.
  const docker: Docker = {} as Docker;

  docker.layout = function layout(rect: Rect, components: unknown[] = []): { visible: unknown[]; hidden: unknown[]; ordered: unknown[] } {
    if (!rect || isNaN(rect.x) || isNaN(rect.y) || isNaN(rect.width) || isNaN(rect.height)) {
      throw new Error('Invalid rect');
    }
    if (!components.length) {
      return { visible: [], hidden: [], ordered: [] };
    }

    const { logicalContainerRect, containerRect } = resolveContainerRects(rect, settings);

    const filteredResult = filterComponents(components, settings, logicalContainerRect);
    const visible = filteredResult.visible;
    const hidden = filteredResult.hidden;

    const reducedRect = reduceLayoutRect({
      layoutRect: logicalContainerRect,
      visible,
      hidden,
      settings,
    });

    const translation = { x: rect.x, y: rect.y };

    const ordered = positionComponents({
      visible,
      layoutRect: logicalContainerRect,
      reducedRect,
      containerRect,
      translation,
    });
    hidden.forEach((c: Component) => {
      c.comp.visible = false;
      // set empty rects on hidden components
      const r = createRect();
      c.comp.resize(r, r);
    });
    return {
      visible: visible.map((v: Component) => v.comp),
      hidden: hidden.map((h: Component) => h.comp),
      ordered: ordered!.map((h: Component) => h.comp),
    };
  };

  docker.settings = function settingsFn(s: unknown): void {
    settings = resolveSettings(s);
  };

  return docker;
}

export default dockLayout;
