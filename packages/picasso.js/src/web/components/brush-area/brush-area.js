import extend from 'extend';
import NarrowPhaseCollision from '../../../core/math/narrow-phase-collision';

const DEFAULT_SETTINGS = {
  brush: {
    components: []
  }
};

/**
 * Transform the incoming event into point in the local coordinate system. That is the coordinate system of the component.
 * @private
 * @param {object} ctx - Context
 * @param {object} event - Incoming event, either native event or hammer event
 * @param {boolean} clamp - True to clamp the point inside the component bounds
 * @returns {point}
 */
function getLocalPoint(ctx, event, clamp = true) {
  let x;
  let y;

  if (typeof event.center === 'object') {
    x = event.center.x;
    y = event.center.y;
  } else {
    x = event.clientX;
    y = event.clientY;
  }

  const localX = x - ctx.state.boundingRect.left;
  const localY = y - ctx.state.boundingRect.top;

  return {
    x: clamp ? Math.max(0, Math.min(localX, ctx.rect.width)) : localX,
    y: clamp ? Math.max(0, Math.min(localY, ctx.rect.height)) : localY
  };
}

/**
 * Transform a local point into a point in the chart coordinate system.
 * @private
 * @param {object} ctx - Context
 * @param {object} p - Point to transform
 * @returns {point}
 */
function localToChartPoint(ctx, p) {
  return {
    x: p.x + ctx.rect.x,
    y: p.y + ctx.rect.y
  };
}

/**
 * Extract and apply default brush configuration.
 * @private
 * @param {object} settings
 * @returns {object[]} An Array of brush configurations
 */
function getBrushConfig(settings) {
  return settings.settings.brush.components.map(b => (
    {
      key: b.key,
      contexts: b.contexts || ['areaBrush'],
      data: b.data || [''],
      action: b.action || 'set'
    }));
}

/**
 * End all active brush contexts.
 * @param {oject} state
 * @param {object} chart - Chart instance
 */
function doEndBrush(state, chart) {
  state.brushConfig.forEach((config) => {
    config.contexts.forEach((context) => {
      chart.brush(context).end();
    });
  });
}

/**
 * Convert two points into a rectangle.
 * @private
 * @param {point} p0
 * @param {point} p1
 * @returns {rect}
 */
function toRect(p0, p1) {
  const xMin = Math.min(p0.x, p1.x);
  const yMin = Math.min(p0.y, p1.y);
  const xMax = Math.max(p0.x, p1.x);
  const yMax = Math.max(p0.y, p1.y);

  return {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin
  };
}

/**
 * Perform a brush on the given area.
 * @param {object} ctx
 */
function doAreaBrush(ctx) {
  if (ctx.state.active) {
    const start = localToChartPoint(ctx, ctx.state.start);
    const end = localToChartPoint(ctx, ctx.state.end);

    const shapes = ctx.chart.shapesAt(toRect(start, end), { components: ctx.state.brushConfig });
    ctx.chart.brushFromShapes(shapes, { components: ctx.state.brushConfig });
  }
}

function render(ctx) {
  ctx.renderer.render([
    extend({ type: 'rect' }, toRect(ctx.state.start, ctx.state.end), ctx.style.area)
  ]);
}

function resetState() {
  return {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    active: false
  };
}

const definition = {
  require: ['chart', 'renderer'],
  defaultSettings: {
    displayOrder: 99,
    settings: DEFAULT_SETTINGS,
    style: {
      area: '$selection-area-target'
    }
  },
  on: {
    areaStart(e) {
      this.start(e);
    },
    areaMove(e) {
      this.move(e);
    },
    areaEnd(e) {
      this.end(e);
    },
    areaCancel() {
      this.cancel();
    }
  },
  created() {
    this.state = resetState();
  },
  preferredSize() {
    return 0;
  },
  render() {},
  beforeRender({ size }) {
    this.rect = size;
  },
  start(e) {
    this.state.boundingRect = this.renderer.element().getBoundingClientRect();
    const p = getLocalPoint(this, e, false);

    if (!NarrowPhaseCollision.testRectPoint({ x: 0, y: 0, width: this.rect.width, height: this.rect.height }, p)) {
      return;
    }

    this.state.brushConfig = getBrushConfig(this.settings);
    this.state.start = getLocalPoint(this, e);
    this.state.active = true;
  },
  move(e) {
    if (!this.state.active) {
      return;
    }

    this.state.end = getLocalPoint(this, e);

    doAreaBrush(this);
    render(this);
  },
  end() {
    if (!this.state.active) {
      return;
    }

    this.state = resetState();
    this.renderer.render([]);
  },
  cancel() {
    if (!this.state.active) {
      return;
    }
    doEndBrush(this.state, this.chart);
    this.state = resetState();
    this.renderer.render([]);
  }

};

export default definition;
