import sceneFactory from '../../../core/scene-graph/scene';
import registry from '../../../core/utils/registry';
import { onLineBreak } from '../../text-manipulation';
import createCanvasGradient from './canvas-gradient';
import patternizer from './canvas-pattern';
import createRendererBox from '../renderer-box';
import create from '../index';
import injectTextBoundsFn from '../../text-manipulation/inject-textbounds';
import CanvasBuffer from './canvas-buffer';

interface SceneObject {
  children: unknown[];
  equals(d: SceneObject | null | undefined): boolean;
  findShapes(selector: string): unknown[];
  getItemsFrom(input: unknown): unknown[];
}

type CanvasMapEntry = [string, string] | [string, string, (v: unknown) => unknown];

type CanvasRendererInstance = Omit<
  ReturnType<typeof create>,
  'settings' | 'appendTo' | 'getScene' | 'render' | 'itemsAt' | 'findShapes' | 'size'
> & {
  settings: (rendererSettings?: Record<string, unknown>) => Record<string, unknown>;
  appendTo: (element: Element) => HTMLCanvasElement;
  getScene: (shapes: unknown[]) => SceneObject;
  render: (shapes: unknown[]) => boolean;
  itemsAt: (input: unknown) => unknown[];
  findShapes: (selector: string) => unknown[];
  size: (opts?: unknown) => ReturnType<typeof createRendererBox>;
  // Note: the base create() has a typo 'destory'; we add the correctly-spelled 'destroy' here
  destroy: () => void;
};

const reg = registry();

function toLineDash(p: unknown): string[] {
  if (Array.isArray(p)) {
    return p as string[];
  }
  if (typeof p === 'string') {
    if (p.indexOf(',') !== -1) {
      return p.split(',');
    }
    return p.split(' ');
  }
  return [];
}

function dpiScale(g: CanvasRenderingContext2D): number {
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const backingStorePixelRatio =
    (g as unknown as Record<string, unknown>).webkitBackingStorePixelRatio ||
    (g as unknown as Record<string, unknown>).mozBackingStorePixelRatio ||
    (g as unknown as Record<string, unknown>).msBackingStorePixelRatio ||
    (g as unknown as Record<string, unknown>).oBackingStorePixelRatio ||
    (g as unknown as Record<string, unknown>).backingStorePixelRatio ||
    1;
  return dpr / (backingStorePixelRatio as number);
}

function resolveMatrix(p: unknown[][], g: CanvasRenderingContext2D): void {
  g.setTransform(p[0][0] as number, p[1][0] as number, p[0][1] as number, p[1][1] as number, p[0][2] as number, p[1][2] as number);
}

function applyContext(
  g: CanvasRenderingContext2D,
  s: Record<string, unknown>,
  shapeToCanvasMap: CanvasMapEntry[],
  computed: Record<string, unknown> = {}
): void {
  const computedKeys = Object.keys(computed);
  const attrs = s.attrs as Record<string, unknown>;
  const gRecord = g as unknown as Record<string, unknown>;

  for (let i = 0, len = shapeToCanvasMap.length; i < len; i++) {
    const cmd = shapeToCanvasMap[i];
    const shapeCmd = cmd[0];
    const canvasCmd = cmd[1];
    const convertCmd = cmd[2];

    if (shapeCmd in attrs && !(canvasCmd in computed) && gRecord[canvasCmd] !== attrs[shapeCmd]) {
      const val = convertCmd ? convertCmd(attrs[shapeCmd]) : attrs[shapeCmd];
      if (typeof gRecord[canvasCmd] === 'function') {
        (gRecord[canvasCmd] as (v: unknown) => void)(val);
      } else {
        gRecord[canvasCmd] = val;
      }
    }
  }

  for (let i = 0, len = computedKeys.length; i < len; i++) {
    const key = computedKeys[i];
    gRecord[key] = computed[key];
  }
}

interface Shape {
  type?: string;
  attrs?: Record<string, unknown>;
  modelViewMatrix?: { elements: unknown[][] };
  children?: Shape[];
  ellipsed?: boolean;
}

interface RenderDeps {
  patterns: { create: (fill: unknown) => unknown };
}

function renderShapes(shapes: Shape[], g: CanvasRenderingContext2D, shapeToCanvasMap: CanvasMapEntry[], deps: RenderDeps): void {
  for (let i = 0, len = shapes.length; i < len; i++) {
    let shape = shapes[i];
    let computed: Record<string, unknown> = {};
    g.save();

    if (shape.attrs && (shape.attrs.fill || shape.attrs.stroke)) {
      if (shape.attrs.fill && typeof shape.attrs.fill === 'object' && (shape.attrs.fill as unknown as { type: string }).type === 'gradient') {
        computed.fillStyle = createCanvasGradient(g, shape, shape.attrs.fill);
      } else if (shape.attrs.fill && typeof shape.attrs.fill === 'object' && (shape.attrs.fill as unknown as { type: string }).type === 'pattern') {
        computed.fillStyle = deps.patterns.create(shape.attrs.fill);
      }

      if (shape.attrs.stroke && typeof shape.attrs.stroke === 'object' && (shape.attrs.stroke as unknown as { type: string }).type === 'gradient') {
        computed.strokeStyle = createCanvasGradient(g, shape, shape.attrs.stroke);
      } else if (
        shape.attrs.stroke &&
        typeof shape.attrs.stroke === 'object' &&
        (shape.attrs.stroke as unknown as { type: string }).type === 'pattern'
      ) {
        computed.strokeStyle = deps.patterns.create(shape.attrs.stroke);
      }
    }

    applyContext(g, shape as unknown as Record<string, unknown>, shapeToCanvasMap, computed);

    if (shape.modelViewMatrix) {
      resolveMatrix(shape.modelViewMatrix.elements as unknown[][], g);
    }

    if (reg.has(shape.type!)) {
      (reg.get(shape.type!) as (attrs: unknown, opts: unknown) => void)(shape.attrs, {
        g,
        doFill: 'fill' in (shape.attrs || {}) && shape.attrs!.fill !== 'none',
        doStroke: 'stroke' in (shape.attrs || {}) && shape.attrs!['stroke-width'] !== 0,
        ellipsed: shape.ellipsed,
      });
    }
    if (shape.children) {
      renderShapes(shape.children, g, shapeToCanvasMap, deps);
    }
    g.restore();
  }
}

interface TransformObject {
  horizontalScaling: number;
  horizontalSkewing: number;
  verticalSkewing: number;
  verticalScaling: number;
  horizontalMoving: number;
  verticalMoving: number;
}

interface ApplyTransformParams {
  el: HTMLCanvasElement;
  dpiRatio: number;
  transform: TransformObject;
}

/**
 * Sets transform on target element.
 * @param {Element} el Target canvas element
 * @param {number} dpiRatio
 * @param {TransformObject}
 * @private
 */
function applyTransform({ el, dpiRatio, transform }: ApplyTransformParams): void {
  if (typeof transform === 'object') {
    const adjustedTransform = [
      transform.horizontalScaling,
      transform.horizontalSkewing,
      transform.verticalSkewing,
      transform.verticalScaling,
      transform.horizontalMoving * dpiRatio,
      transform.verticalMoving * dpiRatio,
    ];
    const g = el.getContext('2d');
    if (g) {
      g.setTransform(...(adjustedTransform as [number, number, number, number, number, number]));
    }
  }
}

/**
 * Create a new canvas renderer
 * @typedef {function} canvasRendererFactory
 * @param {function} [sceneFn] - Scene factory
 * @returns {Renderer} A canvas renderer instance
 */
export function renderer(sceneFn = sceneFactory) {
  let el: HTMLCanvasElement | null;
  let buffer: CanvasBuffer | null;
  const settings: Record<string, unknown> = {
    transform: undefined,
    canvasBufferSize: undefined,
    progressive: undefined,
  };
  let scene: SceneObject | null;
  let hasChangedRect = false;
  let rect = createRendererBox();
  const shapeToCanvasMap: CanvasMapEntry[] = [
    ['fill', 'fillStyle'],
    ['stroke', 'strokeStyle'],
    ['opacity', 'globalAlpha'],
    ['globalAlpha', 'globalAlpha'],
    ['stroke-width', 'lineWidth'],
    ['stroke-linejoin', 'lineJoin'],
    ['stroke-dasharray', 'setLineDash', toLineDash],
  ];

  let patterns: { clear: () => void; create: (fill: unknown) => unknown };

  const canvasRenderer = create() as unknown as CanvasRendererInstance;

  canvasRenderer.element = () => el;

  canvasRenderer.root = () => el;

  canvasRenderer.settings = (rendererSettings?: Record<string, unknown>): Record<string, unknown> => {
    if (rendererSettings) {
      Object.keys(settings).forEach((key) => {
        if ((rendererSettings as Record<string, unknown>)[key] !== undefined) {
          settings[key] = (rendererSettings as Record<string, unknown>)[key];
        }
      });
    }

    return settings;
  };

  canvasRenderer.appendTo = (element: Element): HTMLCanvasElement => {
    if (!el) {
      el = element.ownerDocument.createElement('canvas');
      el.style.position = 'absolute';
      el.style['-webkit-font-smoothing' as any] = 'antialiased';
      el.style['-moz-osx-font-smoothing' as any] = 'antialiased';
      el.style.pointerEvents = 'none';
    }

    if (typeof settings.transform === 'function' && !buffer) {
      buffer = new CanvasBuffer(el);
    }

    element.appendChild(el);

    return el;
  };

  canvasRenderer.getScene = (shapes: unknown[]): SceneObject => {
    const g = (buffer && buffer.getContext()) || (el && el.getContext('2d'));
    const dpiRatio = dpiScale(g!);

    const scaleX = rect.scaleRatio.x;
    const scaleY = rect.scaleRatio.y;

    const sceneContainer: Record<string, unknown> = {
      type: 'container',
      children: shapes,
      transform: rect.edgeBleed.bool
        ? `translate(${rect.edgeBleed.left * dpiRatio * scaleX}, ${rect.edgeBleed.top * dpiRatio * scaleY})`
        : '',
    };

    if (dpiRatio !== 1 || scaleX !== 1 || scaleY !== 1) {
      (sceneContainer.transform as string) += `scale(${dpiRatio * scaleX}, ${dpiRatio * scaleY})`;
    }

    return sceneFn({
      items: [sceneContainer],
      stage: undefined,
      dpi: dpiRatio,
      on: {
        create: [onLineBreak(canvasRenderer.measureText), injectTextBoundsFn(canvasRenderer)],
      },
    });
  };

  canvasRenderer.render = (shapes: unknown[]): boolean => {
    if (!el) {
      return false;
    }
    if (!patterns) {
      patterns = patternizer(el.ownerDocument);
    }

    const g = (buffer && buffer.getContext()) || el.getContext('2d');
    if (!g) {
      return false;
    }
    const dpiRatio = dpiScale(g);
    const transform = buffer && typeof settings.transform === 'function' ? (settings.transform as () => unknown)() : null;
    if (transform) {
      // clear canvas
      el.width = el.width; // eslint-disable-line
      applyTransform({ el, dpiRatio, transform: transform as TransformObject });
      buffer!.apply();
      return true;
    }
    if (hasChangedRect) {
      const cp = rect.computedPhysical as unknown as Record<string, number>;
      el.style.left = `${cp.x}px`;
      el.style.top = `${cp.y}px`;
      el.style.width = `${cp.width}px`;
      el.style.height = `${cp.height}px`;
      el.width = Math.round(cp.width * dpiRatio);
      el.height = Math.round(cp.height * dpiRatio);

      if (buffer) {
        buffer.updateSize({ rect, dpiRatio, canvasBufferSize: settings.canvasBufferSize });
      }
    }

    const newScene = canvasRenderer.getScene(shapes);

    const hasChangedScene = scene ? !newScene.equals(scene) : true;

    patterns.clear();

    const doRender = hasChangedRect || hasChangedScene;
    const progressive = typeof settings.progressive === 'function' ? (settings.progressive as () => unknown)() : null;
    if (doRender) {
      if (!progressive || (progressive as unknown as { isFirst: boolean }).isFirst) {
        canvasRenderer.clear();
      }
      renderShapes(newScene.children as Shape[], g, shapeToCanvasMap, {
        patterns,
      });
    }

    if (buffer) {
      // clear canvas
      el.width = el.width; // eslint-disable-line
      buffer.apply();
    }

    hasChangedRect = false;
    if (progressive && !(progressive as unknown as { isFirst: boolean }).isFirst) {
      (newScene.children as unknown[]).unshift(...((scene!.children || []) as unknown[]));
    }
    scene = newScene;
    return doRender;
  };

  canvasRenderer.itemsAt = (input: unknown): unknown[] => (scene ? scene.getItemsFrom(input) : []);

  canvasRenderer.findShapes = (selector: string): unknown[] => (scene ? scene.findShapes(selector) : []);

  canvasRenderer.clear = (): CanvasRendererInstance => {
    if (el) {
      el.width = el.width; // eslint-disable-line
    }
    if (buffer) {
      buffer.clear();
    }
    scene = null;

    return canvasRenderer;
  };

  canvasRenderer.size = (opts?: unknown): ReturnType<typeof createRendererBox> => {
    if (opts) {
      const newRect = createRendererBox(opts);

      if (JSON.stringify(rect) !== JSON.stringify(newRect)) {
        hasChangedRect = true;
        rect = newRect;
      }
    }

    return rect;
  };

  canvasRenderer.destroy = (): void => {
    if (el) {
      if (el.parentElement) {
        el.parentElement.removeChild(el);
      }
      el = null;
    }
    if (buffer) {
      buffer = null;
    }
    scene = null;
  };

  return canvasRenderer;
}

export function register(type: string, renderFn: (attrs: unknown, opts: unknown) => void): void {
  reg.add(type, renderFn);
}
