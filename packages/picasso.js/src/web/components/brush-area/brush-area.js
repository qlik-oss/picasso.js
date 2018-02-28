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

function endBrush(state, chart) {
  state.brushConfig.forEach((config) => {
    config.contexts.forEach((context) => {
      chart.brush(context).end();
    });
  });
}

function getComponentDelta(chart, rendererBounds) {
  const chartBounds = chart.element.getBoundingClientRect();
  return {
    x: rendererBounds.left - chartBounds.left,
    y: rendererBounds.top - chartBounds.top
  };
}

function toRect(state) {
  return {
    x: state.start.x,
    y: state.start.y,
    width: state.end.x - state.start.x,
    height: state.end.y - state.start.y
  };
}

function doAreaBrush(ctx) {
  if (ctx.state.active) {
    ctx.state.start.x += ctx.state.componentDelta.x;
    ctx.state.start.y += ctx.state.componentDelta.y;
    ctx.state.end.x += ctx.state.componentDelta.x;
    ctx.state.end.y += ctx.state.componentDelta.y;

    const shapes = ctx.chart.shapesAt(toRect(ctx.state), { components: ctx.state.brushConfig });
    ctx.chart.brushFromShapes(shapes, { components: ctx.state.brushConfig });
  }
}

function render(ctx) {
  ctx.renderer.render([
    extend({ type: 'rect' }, toRect(ctx.state), ctx.style.area)
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
  require: ['chart', 'renderer', 'settings'],
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
    this.state.componentDelta = getComponentDelta(this.chart, this.state.rendererBounds);
    const p = getPoint(this.state.rendererBounds, e);

    this.state.start = p;
  },
  move(e) {
    if (!this.state.active) {
      return;
    }

    const p = getPoint(this.state.rendererBounds, e);

    this.state.end = p;

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
    endBrush(this.state, this.chart);
    this.state = resetState();
    this.renderer.render([]);
  }

};

export default definition;
