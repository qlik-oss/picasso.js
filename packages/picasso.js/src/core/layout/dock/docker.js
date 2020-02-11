import extend from 'extend';
import dockConfig from './config';
import { resolveContainerRects, resolveSettings } from './settings-resolver';
import { rectToPoints, pointsToRect } from '../../geometry/util';
import createRect from './create-rect';

function cacheSize(c, reducedRect, layoutRect) {
  if (typeof c.cachedSize === 'undefined') {
    const dock = c.config.dock();
    let size = c.comp.preferredSize({ inner: reducedRect, outer: layoutRect, dock });
    // backwards compatibility
    if (!isNaN(size)) {
      size = { width: size, height: size };
    } else if (size && !isNaN(size.size)) {
      size.width = size.size;
      size.height = size.size;
    }

    let relevantSize;
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

function validateReduceRect(rect, reducedRect, settings) {
  // Absolute value for width/height should have predence over relative value
  const minReduceWidth =
    Math.min(settings.center.minWidth, rect.width) || Math.max(rect.width * settings.center.minWidthRatio, 1);
  const minReduceHeight =
    Math.min(settings.center.minHeight, rect.height) || Math.max(rect.height * settings.center.minHeightRatio, 1);
  return reducedRect.width >= minReduceWidth && reducedRect.height >= minReduceHeight;
}

function reduceDocRect(reducedRect, c) {
  switch (c.config.dock()) {
    case 'top':
      reducedRect.y += c.cachedSize;
      reducedRect.height -= c.cachedSize;
      break;
    case 'bottom':
      reducedRect.height -= c.cachedSize;
      break;
    case 'left':
      reducedRect.x += c.cachedSize;
      reducedRect.width -= c.cachedSize;
      break;
    case 'right':
      reducedRect.width -= c.cachedSize;
      break;
    default:
  }
}

function addEdgeBleed(currentEdgeBleed, c) {
  const edgeBleed = c.edgeBleed;
  if (!edgeBleed) {
    return;
  }
  currentEdgeBleed.left = Math.max(currentEdgeBleed.left, edgeBleed.left || 0);
  currentEdgeBleed.right = Math.max(currentEdgeBleed.right, edgeBleed.right || 0);
  currentEdgeBleed.top = Math.max(currentEdgeBleed.top, edgeBleed.top || 0);
  currentEdgeBleed.bottom = Math.max(currentEdgeBleed.bottom, edgeBleed.bottom || 0);
}

function reduceEdgeBleed(layoutRect, reducedRect, edgeBleed) {
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

function reduceSingleLayoutRect(layoutRect, reducedRect, edgeBleed, c, settings) {
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
function filterReferencedDocks(visible, hidden) {
  if (hidden.length === 0) {
    return;
  }

  for (let i = 0; i < visible.length; ++i) {
    let v = visible[i];
    if (v.referencedDocks.length) {
      const isAllHidden = v.referencedDocks.every(refDock => hidden.some(h => h.key === refDock));
      if (isAllHidden) {
        hidden.push(visible.splice(i, 1)[0]);
      }
    }
  }
}

function reduceLayoutRect({ layoutRect, visible, hidden, settings }) {
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

  const filteredUnsortedComps = visible.filter(c => sortedComponents.indexOf(c) !== -1);
  visible.length = 0;
  visible.push(...filteredUnsortedComps);
  reduceEdgeBleed(layoutRect, reducedRect, edgeBleed);
  return reducedRect;
}

function computeRect(rect) {
  return {
    x: rect.margin.left + rect.x * rect.scaleRatio.x,
    y: rect.margin.top + rect.y * rect.scaleRatio.y,
    width: rect.width * rect.scaleRatio.x,
    height: rect.height * rect.scaleRatio.y,
  };
}

function appendScaleRatio(rect, outerRect, layoutRect, containerRect) {
  const scaleRatio = {
    x: containerRect.width / layoutRect.width,
    y: containerRect.height / layoutRect.height,
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
    const spread = (containerRect[area] - layoutRect[area] * scaleRatio.x) * layoutRect.align;
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

function boundingBox(rects) {
  const points = [].concat(...rects.map(rectToPoints));
  return pointsToRect(points);
}

function positionComponents({ visible, layoutRect, reducedRect, containerRect, translation }) {
  const vRect = createRect(reducedRect.x, reducedRect.y, reducedRect.width, reducedRect.height);
  const hRect = createRect(reducedRect.x, reducedRect.y, reducedRect.width, reducedRect.height);

  const referencedComponents = {};
  const referenceArray = visible.slice();
  const elementOrder = referenceArray.slice().sort((a, b) => a.config.displayOrder() - b.config.displayOrder());
  visible
    .sort((a, b) => {
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
    .forEach(c => {
      let outerRect = {};
      let rect = {};
      const d = c.config.dock();
      switch (d) {
        case 'top':
          outerRect.height = rect.height = c.cachedSize;
          outerRect.width = layoutRect.width;
          rect.width = vRect.width;
          outerRect.x = layoutRect.x;
          rect.x = vRect.x;
          outerRect.y = rect.y = vRect.y - c.cachedSize;

          vRect.y -= c.cachedSize;
          vRect.height += c.cachedSize;
          break;
        case 'bottom':
          outerRect.x = layoutRect.x;
          rect.x = vRect.x;
          outerRect.y = rect.y = vRect.y + vRect.height;
          outerRect.width = layoutRect.width;
          rect.width = vRect.width;
          outerRect.height = rect.height = c.cachedSize;

          vRect.height += c.cachedSize;
          break;
        case 'left':
          outerRect.x = rect.x = hRect.x - c.cachedSize;
          outerRect.y = layoutRect.y;
          rect.y = hRect.y;
          outerRect.width = rect.width = c.cachedSize;
          outerRect.height = layoutRect.height;
          rect.height = hRect.height;

          hRect.x -= c.cachedSize;
          hRect.width += c.cachedSize;
          break;
        case 'right':
          outerRect.x = rect.x = hRect.x + hRect.width;
          outerRect.y = layoutRect.y;
          rect.y = hRect.y;
          outerRect.width = rect.width = c.cachedSize;
          outerRect.height = layoutRect.height;
          rect.height = hRect.height;

          hRect.width += c.cachedSize;
          break;
        case 'center':
          outerRect.x = rect.x = reducedRect.x;
          outerRect.y = rect.y = reducedRect.y;
          outerRect.width = rect.width = reducedRect.width;
          outerRect.height = rect.height = reducedRect.height;
          break;
        default:
          if (c.referencedDocks.length > 0) {
            const refs = c.referencedDocks.map(ref => referencedComponents[ref]).filter(ref => !!ref);
            if (refs.length > 0) {
              outerRect = boundingBox(refs.map(ref => ref.outerRect));
              rect = boundingBox(refs.map(ref => ref.r));
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
      rect.x += translation.x;
      rect.y += translation.y;
      outerRect.x += translation.x;
      outerRect.y += translation.y;
      c.comp.resize(rect, outerRect);
      c.cachedSize = undefined;
      c.edgeBleed = undefined;
    });
  return visible.map(c => elementOrder.indexOf(c));
}

function checkShowSettings(strategySettings, dockSettings, logicalContainerRect) {
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

function validateComponent(component) {
  if (!component.settings && !component.settings) {
    throw new Error('Invalid component settings');
  }
  if (!component.resize || typeof component.resize !== 'function') {
    throw new Error('Component is missing resize function');
  }
  if (!component.dockConfig && !component.preferredSize) {
    throw new Error('Component is missing preferredSize function');
  }
}

function filterComponents(components, settings, rect) {
  const visible = [];
  const hidden = [];
  // check show settings
  for (let i = 0; i < components.length; ++i) {
    const comp = components[i];
    validateComponent(comp);
    // backwards compatibility
    let config;
    if (comp.instance) {
      config = comp.instance.dockConfig();
    } else {
      config = dockConfig(comp.settings.layout);
    }
    const key = comp.settings.key;
    const d = config.dock();
    const referencedDocks = /@/.test(d) ? d.split(',').map(s => s.replace(/^\s*@/, '')) : [];
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
  return [visible, hidden];
}

/**
 * @typedef {object} dock-layout-settings
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
 * @property {object<string, {width: number, height: number}>} [layoutModes] Dictionary with named sizes
 */
function dockLayout(initialSettings) {
  let settings = resolveSettings(initialSettings);

  const docker = {};

  docker.layout = function layout(rect, components = []) {
    if (!rect || isNaN(rect.x) || isNaN(rect.y) || isNaN(rect.width) || isNaN(rect.height)) {
      throw new Error('Invalid rect');
    }
    if (!components.length) {
      return { visible: [], hidden: [] };
    }

    const { logicalContainerRect, containerRect } = resolveContainerRects(rect, settings);

    const [visible, hidden] = filterComponents(components, settings, logicalContainerRect);

    const reducedRect = reduceLayoutRect({
      layoutRect: logicalContainerRect,
      visible,
      hidden,
      settings,
    });

    const translation = { x: rect.x, y: rect.y };

    const order = positionComponents({
      visible,
      layoutRect: logicalContainerRect,
      reducedRect,
      containerRect,
      translation,
    });
    hidden.forEach(c => {
      c.comp.visible = false;
      // set empty rects on hidden components
      const r = createRect();
      c.comp.resize(r, r);
    });
    return { visible: visible.map(v => v.comp), hidden: hidden.map(h => h.comp), order };
  };

  docker.settings = function settingsFn(s) {
    settings = resolveSettings(s);
  };

  return docker;
}

export default dockLayout;
