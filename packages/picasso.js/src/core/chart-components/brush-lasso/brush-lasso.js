import { sqrDistance } from '../../math/vector';

function getPoint(rendererBounds, event) {
  const eventOffsetX = event.center.x;
  const eventOffsetY = event.center.y;
  return {
    x: eventOffsetX - rendererBounds.left,
    y: eventOffsetY - rendererBounds.top,
  };
  // return {
  //   x: Math.min(Math.max(eventOffsetX - rendererBounds.left, 0), rendererBounds.width),
  //   y: Math.min(Math.max(eventOffsetY - rendererBounds.top, 0), rendererBounds.height)
  // };
}

function withinThreshold(p, state, settings) {
  const startPoint = state.points[0];
  const sqrDist = sqrDistance(p, startPoint);
  return sqrDist < Math.pow(settings.settings.snapIndicator.threshold, 2);
}

function appendToPath(state, p) {
  if (state.path.d == null) {
    state.path.d = `M${p.x} ${p.y} `;
  } else {
    state.path.d += `L${p.x} ${p.y} `;
  }
  state.points.push(p);
}

function render(state, renderer) {
  const nodes = [state.startPoint, state.path, state.snapIndicator].filter((node) => node.visible);

  renderer.render(nodes);
}

function setSnapIndictor({ state, start = null, end = null }) {
  if (start !== null) {
    state.snapIndicator.x1 = start.x;
    state.snapIndicator.y1 = start.y;
  }
  if (end !== null) {
    state.snapIndicator.x2 = end.x;
    state.snapIndicator.y2 = end.y;
  }
}

function showSnapIndicator(state, show) {
  state.snapIndicator.visible = show;
}

function setStartPoint(state, p) {
  state.startPoint.cx = p.x;
  state.startPoint.cy = p.y;
}

function getComponentDelta(chart, rendererBounds) {
  const chartBounds = chart.element.getBoundingClientRect();
  return {
    x: rendererBounds.left - chartBounds.left,
    y: rendererBounds.top - chartBounds.top,
  };
}

function doLineBrush(state, chart) {
  if (state.active) {
    const p1 = state.points[state.points.length - 2];
    const p2 = state.points[state.points.length - 1];
    state.lineBrushShape.x1 = p1.x + state.componentDelta.x;
    state.lineBrushShape.y1 = p1.y + state.componentDelta.y;
    state.lineBrushShape.x2 = p2.x + state.componentDelta.x;
    state.lineBrushShape.y2 = p2.y + state.componentDelta.y;

    const shapes = chart.shapesAt(state.lineBrushShape, { components: state.brushConfig });
    chart.brushFromShapes(shapes, { components: state.brushConfig });
  }
}

function doPolygonBrush(state, chart) {
  if (state.active) {
    const dx = state.componentDelta.x;
    const dy = state.componentDelta.y;
    const vertices = state.points.map((p) => ({
      x: p.x + dx,
      y: p.y + dy,
    }));

    const shapes = chart.shapesAt({ vertices }, { components: state.brushConfig });
    chart.brushFromShapes(shapes, { components: state.brushConfig });
  }
}

function initPath(stgns) {
  return {
    visible: true,
    type: 'path',
    d: null,
    fill: stgns.fill,
    stroke: stgns.stroke,
    strokeWidth: stgns.strokeWidth,
    opacity: stgns.opacity,
    strokeDasharray: stgns.strokeDasharray,
    collider: {
      type: null,
    },
  };
}

function initSnapIndicator(stgns) {
  return {
    visible: false,
    type: 'line',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    strokeDasharray: stgns.strokeDasharray,
    stroke: stgns.stroke,
    strokeWidth: stgns.strokeWidth,
    opacity: stgns.opacity,
    collider: {
      type: null,
    },
  };
}

function initStartPoint(stgns) {
  return {
    visible: true,
    type: 'circle',
    cx: 0,
    cy: 0,
    r: stgns.r,
    fill: stgns.fill,
    opacity: stgns.opacity,
    stroke: stgns.stroke,
    strokeWidth: stgns.strokeWidth,
    collider: {
      type: null,
    },
  };
}

function getBrushConfig(settings) {
  return settings.settings.brush.components.map((b) => ({
    key: b.key,
    contexts: b.contexts || ['lassoBrush'],
    data: b.data || [''],
    action: b.action || 'add',
  }));
}

function endBrush(state, chart) {
  state.brushConfig.forEach((config) => {
    config.contexts.forEach((context) => {
      chart.brush(context).end();
    });
  });
}

function resetState() {
  return {
    points: [],
    active: false,
    path: null,
    snapIndicator: null,
    startPoint: null,
    rendererBounds: null,
    componentDelta: null,
    brushConfig: null,
    lineBrushShape: {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
    }, // Keep a single shape instance to avoid instantiating a new object on each lookup
  };
}

/**
 * @typedef {object} ComponentBrushLasso
 * @property {string} type name of the component
 * @property {ComponentBrushLasso~Settings} settings component settings
 * @example
 * {
 *  type: 'brush-lasso',
 *  settings: {
 *    brush: {
 *      components: [{ key: '<target-component>', contexts: ['<brush-context>'] }]
 *    }
 *  },
 * }
 */

/**
 * @typedef {object} ComponentBrushLasso~Settings
 * @property {object} [lasso] - Lasso style settings
 * @property {string} [lasso.fill='transparent']
 * @property {string} [lasso.stroke='black']
 * @property {number} [lasso.strokeWidth=2]
 * @property {number} [lasso.opacity=0.7]
 * @property {number} [lasso.strokeDasharray]
 * @property {object} [snapIndicator] - Snap indicator settings
 * @property {number} [snapIndicator.threshold=75] - The distance in pixel to show the snap indicator, if less then threshold the indicator is dispalyed
 * @property {string} [snapIndicator.strokeDasharray='5, 5']
 * @property {string} [snapIndicator.stroke='black']
 * @property {number} [snapIndicator.strokeWidth=2]
 * @property {number} [snapIndicator.opacity=0.5]
 * @property {object} [startPoint] - Start point style settings
 * @property {number} [startPoint.r=10] - Circle radius
 * @property {string} [startPoint.stroke='green']
 * @property {number} [startPoint.strokeWidth=1]
 * @property {number} [startPoint.opacity=1]
 * @property {object} [brush]
 * @property {object[]} brush.components - Array of components to brush on.
 * @property {string} [brush.components[].component.key] - Component key
 * @property {string[]} [brush.components[].component.contexts=['brushLasso']] - Name of the brushing contexts to affect
 * @property {string[]} [brush.components[].component.data=['']] - The mapped data properties to add to the brush
 * @property {string} [brush.components[].component.action='add'] - Type of action to respond with
 */

const brushLassoComponent = {
  require: ['chart', 'renderer', 'settings'],
  defaultSettings: {
    layout: {
      displayOrder: 0,
    },
    settings: {
      brush: {
        components: [],
      },
      snapIndicator: {
        threshold: 75,
        strokeDasharray: '5, 5',
        stroke: 'black',
        strokeWidth: 2,
        opacity: 0.5,
      },
      lasso: {
        fill: 'transparent',
        stroke: 'black',
        strokeWidth: 2,
        opacity: 0.7,
        strokeDasharray: '20, 10',
      },
      startPoint: {
        r: 10,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 1,
        opacity: 1,
      },
    },
  },
  on: {
    lassoStart(e) {
      this.start(e);
    },
    lassoEnd(e) {
      this.end(e);
    },
    lassoMove(e) {
      this.move(e);
    },
    lassoCancel() {
      this.cancel();
    },
  },
  created() {
    this.state = resetState();
  },
  start(e) {
    this.state.active = true;
    this.state.path = initPath(this.settings.settings.lasso);
    this.state.snapIndicator = initSnapIndicator(this.settings.settings.snapIndicator);
    this.state.startPoint = initStartPoint(this.settings.settings.startPoint);
    this.state.rendererBounds = this.renderer.element().getBoundingClientRect();
    this.state.componentDelta = getComponentDelta(this.chart, this.state.rendererBounds);
    this.state.brushConfig = getBrushConfig(this.settings);

    const p = getPoint(this.state.rendererBounds, e);

    appendToPath(this.state, p);
    setSnapIndictor({ state: this.state, start: p });
    setStartPoint(this.state, p);
  },
  move(e) {
    if (!this.state.active) {
      return;
    }

    const p = getPoint(this.state.rendererBounds, e);

    if (withinThreshold(p, this.state, this.settings)) {
      showSnapIndicator(this.state, true);
    } else {
      showSnapIndicator(this.state, false);
    }

    appendToPath(this.state, p);
    setSnapIndictor({ state: this.state, end: p });
    render(this.state, this.renderer);

    doLineBrush(this.state, this.chart);
  },
  end(e) {
    if (!this.state.active) {
      return;
    }

    showSnapIndicator(this.state, false);
    const p = getPoint(this.state.rendererBounds, e);
    const shouldSnap = withinThreshold(p, this.state, this.settings);

    if (shouldSnap) {
      doPolygonBrush(this.state, this.chart);
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
  },
  render() {
    // Do nothing
  },
};

export default brushLassoComponent;
