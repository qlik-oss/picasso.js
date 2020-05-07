import sceneFactory from '../../../core/scene-graph/scene';
import registry from '../../../core/utils/registry';
import { onLineBreak } from '../../text-manipulation';
import createCanvasGradient from './canvas-gradient';
import patternizer from './canvas-pattern';
import createRendererBox from '../renderer-box';
import create from '../index';
import injectTextBoundsFn from '../../text-manipulation/inject-textbounds';

const reg = registry();

function toLineDash(p) {
  if (Array.isArray(p)) {
    return p;
  }
  if (typeof p === 'string') {
    if (p.indexOf(',') !== -1) {
      return p.split(',');
    }
    return p.split(' ');
  }
  return [];
}

function dpiScale(g) {
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const backingStorePixelRatio =
    g.webkitBackingStorePixelRatio ||
    g.mozBackingStorePixelRatio ||
    g.msBackingStorePixelRatio ||
    g.oBackingStorePixelRatio ||
    g.backingStorePixelRatio ||
    1;
  return dpr / backingStorePixelRatio;
}

function resolveMatrix(p, g) {
  g.setTransform(p[0][0], p[1][0], p[0][1], p[1][1], p[0][2], p[1][2]);
}

function applyContext(g, s, shapeToCanvasMap, computed = {}) {
  const computedKeys = Object.keys(computed);

  for (let i = 0, len = shapeToCanvasMap.length; i < len; i++) {
    let cmd = shapeToCanvasMap[i];

    const shapeCmd = cmd[0];
    const canvasCmd = cmd[1];
    const convertCmd = cmd[2];

    if (shapeCmd in s.attrs && !(canvasCmd in computed) && g[canvasCmd] !== s.attrs[shapeCmd]) {
      const val = convertCmd ? convertCmd(s.attrs[shapeCmd]) : s.attrs[shapeCmd];
      if (typeof g[canvasCmd] === 'function') {
        g[canvasCmd](val);
      } else {
        g[canvasCmd] = val;
      }
    }
  }

  for (let i = 0, len = computedKeys.length; i < len; i++) {
    const key = computedKeys[i];
    g[key] = computed[key];
  }
}

function renderShapes(shapes, g, shapeToCanvasMap, deps) {
  for (let i = 0, len = shapes.length; i < len; i++) {
    let shape = shapes[i];
    let computed = {};
    g.save();

    if (shape.attrs && (shape.attrs.fill || shape.attrs.stroke)) {
      if (shape.attrs.fill && typeof shape.attrs.fill === 'object' && shape.attrs.fill.type === 'gradient') {
        computed.fillStyle = createCanvasGradient(g, shape, shape.attrs.fill);
      } else if (shape.attrs.fill && typeof shape.attrs.fill === 'object' && shape.attrs.fill.type === 'pattern') {
        computed.fillStyle = deps.patterns.create(shape.attrs.fill);
      }

      if (shape.attrs.stroke && typeof shape.attrs.stroke === 'object' && shape.attrs.stroke.type === 'gradient') {
        computed.strokeStyle = createCanvasGradient(g, shape, shape.attrs.stroke);
      } else if (
        shape.attrs.stroke &&
        typeof shape.attrs.stroke === 'object' &&
        shape.attrs.stroke.type === 'pattern'
      ) {
        computed.strokeStyle = deps.patterns.create(shape.attrs.stroke);
      }
    }

    applyContext(g, shape, shapeToCanvasMap, computed);

    if (shape.modelViewMatrix) {
      resolveMatrix(shape.modelViewMatrix.elements, g);
    }

    if (reg.has(shape.type)) {
      reg.get(shape.type)(shape.attrs, {
        g,
        doFill: 'fill' in shape.attrs && shape.attrs.fill !== 'none',
        doStroke: 'stroke' in shape.attrs && shape.attrs['stroke-width'] !== 0,
        ellipsed: shape.ellipsed,
      });
    }
    if (shape.children) {
      renderShapes(shape.children, g, shapeToCanvasMap, deps);
    }
    g.restore();
  }
}

/**
 * Create a new canvas renderer
 * @typedef {function} canvasRendererFactory
 * @param {function} sceneFn - Scene factory
 * @returns {renderer} A canvas renderer instance
 */
export function renderer(sceneFn = sceneFactory) {
  let el;
  let scene;
  let hasChangedRect = false;
  let rect = createRendererBox();
  const shapeToCanvasMap = [
    ['fill', 'fillStyle'],
    ['stroke', 'strokeStyle'],
    ['opacity', 'globalAlpha'],
    ['globalAlpha', 'globalAlpha'],
    ['stroke-width', 'lineWidth'],
    ['stroke-linejoin', 'lineJoin'],
    ['stroke-dasharray', 'setLineDash', toLineDash],
  ];

  let patterns;

  const canvasRenderer = create();

  canvasRenderer.element = () => el;

  canvasRenderer.root = () => el;

  canvasRenderer.appendTo = (element) => {
    if (!el) {
      el = element.ownerDocument.createElement('canvas');
      el.style.position = 'absolute';
      el.style['-webkit-font-smoothing'] = 'antialiased';
      el.style['-moz-osx-font-smoothing'] = 'antialiased';
      el.style.pointerEvents = 'none';
    }

    element.appendChild(el);

    return el;
  };

  canvasRenderer.render = (shapes) => {
    if (!el) {
      return false;
    }
    if (!patterns) {
      patterns = patternizer(el.ownerDocument);
    }

    const g = el.getContext('2d');
    const dpiRatio = dpiScale(g);
    const scaleX = rect.scaleRatio.x;
    const scaleY = rect.scaleRatio.y;

    if (hasChangedRect) {
      el.style.left = `${rect.computedPhysical.x}px`;
      el.style.top = `${rect.computedPhysical.y}px`;
      el.style.width = `${rect.computedPhysical.width}px`;
      el.style.height = `${rect.computedPhysical.height}px`;
      el.width = Math.round(rect.computedPhysical.width * dpiRatio);
      el.height = Math.round(rect.computedPhysical.height * dpiRatio);
    }

    const sceneContainer = {
      type: 'container',
      children: shapes,
      transform: rect.edgeBleed.bool
        ? `translate(${rect.edgeBleed.left * dpiRatio * scaleX}, ${rect.edgeBleed.top * dpiRatio * scaleY})`
        : '',
    };

    if (dpiRatio !== 1 || scaleX !== 1 || scaleY !== 1) {
      sceneContainer.transform += `scale(${dpiRatio * scaleX}, ${dpiRatio * scaleY})`;
    }

    const newScene = sceneFn({
      items: [sceneContainer],
      dpi: dpiRatio,
      on: {
        create: [onLineBreak(canvasRenderer.measureText), injectTextBoundsFn(canvasRenderer)],
      },
    });
    const hasChangedScene = scene ? !newScene.equals(scene) : true;

    patterns.clear();

    const doRender = hasChangedRect || hasChangedScene;
    if (doRender) {
      canvasRenderer.clear();
      renderShapes(newScene.children, g, shapeToCanvasMap, {
        patterns,
      });
    }

    hasChangedRect = false;
    scene = newScene;
    return doRender;
  };

  canvasRenderer.itemsAt = (input) => (scene ? scene.getItemsFrom(input) : []);

  canvasRenderer.findShapes = (selector) => (scene ? scene.findShapes(selector) : []);

  canvasRenderer.clear = () => {
    if (el) {
      el.width = el.width; // eslint-disable-line
    }
    scene = null;

    return canvasRenderer;
  };

  canvasRenderer.size = (opts) => {
    if (opts) {
      const newRect = createRendererBox(opts);

      if (JSON.stringify(rect) !== JSON.stringify(newRect)) {
        hasChangedRect = true;
        rect = newRect;
      }
    }

    return rect;
  };

  canvasRenderer.destroy = () => {
    if (el) {
      if (el.parentElement) {
        el.parentElement.removeChild(el);
      }
      el = null;
    }
    scene = null;
  };

  return canvasRenderer;
}

export function register(type, renderFn) {
  reg.add(type, renderFn);
}
