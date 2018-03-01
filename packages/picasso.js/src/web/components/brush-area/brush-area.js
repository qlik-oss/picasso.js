import extend from 'extend';

function getPoint(rendererBounds, event) {
  let x;
  let y;

  if (typeof event.center === 'object') {
    x = event.center.x;
    y = event.center.y;
  } else {
    x = event.clientX;
    y = event.clientY;
  }

  return {
    x: x - rendererBounds.left,
    y: y - rendererBounds.top
  };
}

function getBrushConfig(settings) {
  return settings.settings.brush.components.map(b => (
    {
      key: b.key,
      contexts: b.contexts || ['areaBrush'],
      data: b.data || [''],
      action: b.action || 'set'
    }));
}

function doEndBrush(state, chart) {
  state.brushConfig.forEach((config) => {
    config.contexts.forEach((context) => {
      chart.brush(context).end();
    });
  });
}

function toRect(start, end) {
  return {
    x: start.x,
    y: start.y,
    width: end.x - start.x,
    height: end.y - start.y
  };
}

function doAreaBrush(ctx) {
  if (ctx.state.active) {
    const rect = ctx.renderer.size();
    const start = {
      x: ctx.state.start.x + rect.x,
      y: ctx.state.start.y + rect.y
    };
    const end = {
      x: ctx.state.end.x + rect.x,
      y: ctx.state.end.y + rect.y
    };

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
    settings: {
      brush: {
        components: []
      }
    },
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
  render() {},
  start(e) {
    this.state.active = true;
    this.state.brushConfig = getBrushConfig(this.settings);
    this.state.rendererBounds = this.renderer.element().getBoundingClientRect();

    this.state.start = getPoint(this.state.rendererBounds, e);
  },
  move(e) {
    if (!this.state.active) {
      return;
    }

    this.state.end = getPoint(this.state.rendererBounds, e);

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
