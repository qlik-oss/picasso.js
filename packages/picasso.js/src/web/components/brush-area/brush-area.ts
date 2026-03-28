import extend from 'extend';
import { testRectPoint } from '../../../core/math/narrow-phase-collision';

interface Point {
  x: number;
  y: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EventWithCenter {
  center: Point;
  clientX?: number;
  clientY?: number;
}

interface BrushContext {
  state: {
    boundingRect: DOMRect;
    start: Point;
    end: Point;
    active: boolean;
    brushConfig: BrushConfig[];
  };
  rect: Rect;
  chart: { brush: (context: string) => { end: () => void }; shapesAt: (rect: Rect, opts: unknown) => unknown[]; brushFromShapes: (shapes: unknown[], opts: unknown) => void };
  renderer: { element: () => HTMLCanvasElement; render: (shapes: unknown[]) => void };
  settings: { settings: { brush: { components: Array<{ key: string; contexts: string[]; data: unknown; action?: string }> } } };
  style: { area: Record<string, unknown> };
  start: (e: EventWithCenter) => void;
  move: (e: EventWithCenter) => void;
  end: () => void;
  cancel: () => void;
}

interface BrushConfig {
  key: string;
  contexts: string[];
  data: unknown;
  action: string;
}

/**
 * @typedef {object}
 * @alias ComponentBrushArea.settings
 */
const DEFAULT_SETTINGS = {
  /**
   * @type {object}
   */
  brush: {
    /**
     * @type {Array<BrushTargetConfig>}
     */
    components: [],
  },
};

/**
 * Transform the incoming event into point in the local coordinate system. That is the coordinate system of the component.
 * @private
 * @param {object} ctx - Context
 * @param {object} event - Incoming event, either native event or hammer event
 * @param {boolean} clamp - True to clamp the point inside the component bounds
 * @returns {point}
 */
function getLocalPoint(ctx: BrushContext, event: EventWithCenter, clamp: boolean = true): Point {
  let x: number;
  let y: number;

  if (typeof event.center === 'object') {
    x = event.center.x;
    y = event.center.y;
  } else {
    x = event.clientX || 0;
    y = event.clientY || 0;
  }

  const localX = x - ctx.state.boundingRect.left;
  const localY = y - ctx.state.boundingRect.top;

  return {
    x: clamp ? Math.max(0, Math.min(localX, ctx.rect.width)) : localX,
    y: clamp ? Math.max(0, Math.min(localY, ctx.rect.height)) : localY,
  };
}

/**
 * Transform a local point into a point in the chart coordinate system.
 * @private
 * @param {object} ctx - Context
 * @param {object} p - Point to transform
 * @returns {point}
 */
function localToChartPoint(ctx: BrushContext, p: Point): Point {
  return {
    x: p.x + ctx.rect.x,
    y: p.y + ctx.rect.y,
  };
}

/**
 * Extract and apply default brush configuration.
 * @private
 * @param {object} settings
 * @returns {object[]} An Array of brush configurations
 */
function getBrushConfig(settings: { settings: { brush: { components: Array<{ key: string; contexts: string[]; data: unknown; action?: string }> } } }): BrushConfig[] {
  return settings.settings.brush.components.map((b) => ({
    key: b.key,
    contexts: b.contexts,
    data: b.data,
    action: b.action || 'set',
  }));
}

/**
 * End all active brush contexts.
 * @private
 * @param {oject} state
 * @param {object} chart - Chart instance
 */
function doEndBrush(state: { brushConfig: BrushConfig[] }, chart: { brush: (context: string) => { end: () => void } }): void {
  state.brushConfig.forEach((config) => {
    if (Array.isArray(config.contexts)) {
      config.contexts.forEach((context) => {
        chart.brush(context).end();
      });
    }
  });
}

/**
 * Convert two points into a rectangle.
 * @private
 * @param {Point} p0
 * @param {Point} p1
 * @returns {Rect}
 */
function toRect(p0: Point, p1: Point): Rect {
  const xMin = Math.min(p0.x, p1.x);
  const yMin = Math.min(p0.y, p1.y);
  const xMax = Math.max(p0.x, p1.x);
  const yMax = Math.max(p0.y, p1.y);

  return {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
  };
}

/**
 * Perform a brush on the given area.
 * @private
 * @param {object} ctx
 */
function doAreaBrush(ctx: BrushContext): void {
  if (ctx.state.active) {
    const start = localToChartPoint(ctx, ctx.state.start);
    const end = localToChartPoint(ctx, ctx.state.end);

    const shapes = ctx.chart.shapesAt(toRect(start, end), { components: ctx.state.brushConfig });
    ctx.chart.brushFromShapes(shapes, { components: ctx.state.brushConfig });
  }
}

function render(ctx: BrushContext): void {
  ctx.renderer.render([extend({ type: 'rect' }, toRect(ctx.state.start, ctx.state.end), ctx.style.area)]);
}

function resetState(): Omit<BrushContext['state'], 'boundingRect' | 'brushConfig'> {
  return {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    active: false,
  };
}

const definition = {
  require: ['chart', 'renderer'],
  defaultSettings: {
    layout: {
      displayOrder: 99,
    },
    settings: DEFAULT_SETTINGS,
    style: {
      area: '$selection-area-target',
    },
  },
  on: {
    areaStart(this: BrushContext, e: EventWithCenter) {
      this.start(e);
    },
    areaMove(this: BrushContext, e: EventWithCenter) {
      this.move(e);
    },
    areaEnd(this: BrushContext) {
      this.end();
    },
    areaCancel(this: BrushContext) {
      this.cancel();
    },
  },
  created(this: BrushContext) {
    this.state = {
      ...resetState(),
      boundingRect: {} as DOMRect,
      brushConfig: [],
    };
  },
  preferredSize(): number {
    return 0;
  },
  render(): void {},
  start(this: BrushContext, e: EventWithCenter): void {
    this.state.boundingRect = this.renderer.element().getBoundingClientRect();
    const p = getLocalPoint(this, e, false);

    // Require event to be inside the component bounds
    if (
      !testRectPoint(
        {
          x: 0,
          y: 0,
          width: this.rect.width,
          height: this.rect.height,
        },
        p
      )
    ) {
      return;
    }

    this.state.brushConfig = getBrushConfig(this.settings);
    this.state.start = getLocalPoint(this, e);
    this.state.active = true;
  },
  move(this: BrushContext, e: EventWithCenter): void {
    if (!this.state.active) {
      return;
    }

    this.state.end = getLocalPoint(this, e);

    doAreaBrush(this);
    render(this);
  },
  end(this: BrushContext): void {
    if (!this.state.active) {
      return;
    }

    this.state = {
      ...resetState(),
      boundingRect: this.state.boundingRect,
      brushConfig: this.state.brushConfig,
    };
    this.renderer.render([]);
  },
  cancel(this: BrushContext): void {
    if (!this.state.active) {
      return;
    }
    doEndBrush(this.state, this.chart);
    this.state = {
      ...resetState(),
      boundingRect: this.state.boundingRect,
      brushConfig: this.state.brushConfig,
    };
    this.renderer.render([]);
  },
};

export default definition;
