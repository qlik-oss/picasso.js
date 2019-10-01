import {
  getMoveDelta,
  nodes
} from './brush-range-node-builder';
import {
  startArea,
  moveArea,
  endArea
} from './brush-range-interaction';
import rangeCollection from '../../../core/brush/range-collection';
import {
  TARGET_SIZE,
  VERTICAL,
  HORIZONTAL
} from './brush-range-const';

function render(state) {
  state.renderer.render(nodes(state));
}

function ranges(state) {
  return state.rc.ranges();
}

function shapesFromRange(state, brushRange) {
  const shapeAt = {
    x: state.direction ? brushRange.min + state.rect.x : state.rect.x,
    y: state.direction ? state.rect.y : brushRange.min + state.rect.y,
    width: state.direction ? brushRange.max - brushRange.min : state.rect.width + state.rect.x,
    height: state.direction ? state.rect.height + state.rect.y : brushRange.max - brushRange.min
  };
  return state.chart.shapesAt(shapeAt, state.settings.brush);
}

function brushFromShape(state, newShapes) {
  state.chart.brushFromShapes(newShapes, state.settings.brush);
}

function setRanges(state) {
  const rs = state.ranges.map((r) => ({ min: r.min, max: r.max }));

  if (state.active.idx !== -1) {
    if (state.active.mode === 'modify') {
      rs[state.active.idx].min = Math.min(state.start, state.current);
      rs[state.active.idx].max = Math.max(state.start, state.current);
    } else {
      const delta = getMoveDelta(state);
      rs[state.active.idx].min = state.active.start + delta;
      rs[state.active.idx].max = state.active.end + delta;
    }
  } else {
    rs.push({
      min: Math.min(state.start, state.current),
      max: Math.max(state.start, state.current)
    });
  }

  state.rc.set(rs);

  const shapes = [];
  rs.forEach((range) => {
    shapes.push(...shapesFromRange(state, range));
  });

  brushFromShape(state, shapes);
}

function getBubbleLabel(state, value, range) {
  const min = Math.min(...range);
  const max = Math.max(...range);
  const shapeAt = {
    x: state.direction ? min + state.rect.x : state.rect.x,
    y: state.direction ? state.rect.y : min + state.rect.y,
    width: state.direction ? max - min : state.rect.width + state.rect.x,
    height: state.direction ? state.rect.height + state.rect.y : max - min
  };

  const shapes = state.chart.shapesAt(shapeAt, state.settings.brush);

  if (shapes.length === 0) {
    return '-';
  }

  const labelShape = shapes.reduce((s0, s1) => {
    // Min value
    const bounds0 = s0.bounds;
    const bounds1 = s1.bounds;

    if (value === min) {
      if (bounds0[state.cssCoord.coord] <= bounds1[state.cssCoord.coord]) {
        return s0;
      }
      return s1;
    }

    // Max value
    if (bounds0[state.cssCoord.coord] + bounds0[state.cssCoord.area] >= bounds1[state.cssCoord.coord] + bounds1[state.cssCoord.area]) {
      return s0;
    }
    return s1;
  });

  const compConfig = state.settings.brush.components.reduce((c0, c1) => (c0.key === labelShape.key ? c0 : c1));

  if (typeof state.settings.bubbles.label === 'function') {
    return state.settings.bubbles.label(labelShape.data);
  }
  if (Array.isArray(compConfig.data) && compConfig.data.length) {
    return labelShape.data[compConfig.data[0]].label;
  }

  return labelShape.data && labelShape.data.label ? labelShape.data.label : '-';
}

/**
 * @typedef {object} component--brush-area-dir-settings
 * @property {object} brush
 * @property {array} brush.components
 * @property {object} brush.components[].key - Component key
 * @property {object} brush.components[].contexts[] - Brush context to apply changes to
 * @property {object} [brush.components[].data] - Data reference
 * @property {object} [brush.components[].action] - Type of brush action
 * @property {string} [direction=vertical] - Rendering direction [horizontal|vertical]
 * @property {object} [bubbles]
 * @property {boolean} [bubbles.show=true] - True to show label bubble, false otherwise
 * @property {string} [bubbles.align=start] - Where to anchor bubble [start|end]
 * @property {function} [bubbles.label] - Callback function for the labels
 * @property {object} [target]
 * @property {string} [target.component] - Render matching overlay on target component. @deprecated Use `components` instead
 * @property {string[]} [target.components] - Render matching overlay on target components
 */

/**
 * @typedef {object} component--brush-area-dir-style
 * @property {object} [bubble]
 * @property {string} [bubble.fontSize]
 * @property {string} [bubble.fontFamily]
 * @property {string} [bubble.fill]
 * @property {string} [bubble.color]
 * @property {string} [bubble.stroke]
 * @property {number} [bubble.strokeWidth]
 * @property {number} [bubble.borderRadius]
 * @property {object} [line]
 * @property {string} [line.stroke]
 * @property {number} [line.strokeWidth]
 * @property {object} [target]
 * @property {string} [target.fill]
 * @property {number} [target.strokeWidth]
 * @property {number} [target.opacity]
 */

const brushAreaDirectionalComponent = {
  require: ['chart', 'settings', 'renderer'],
  defaultSettings: {
    settings: {
      bubbles: {
        show: true,
        align: 'start'
      }
    },
    style: {
      bubble: '$label-overlay',
      line: '$shape-guide--inverted',
      target: '$selection-area-target'
    }
  },
  renderer: 'dom',
  on: {
    areaStart(e) { this.start(e); },
    areaMove(e) { this.move(e); },
    areaEnd(e) { this.end(e); },
    areaClear(e) { this.clear(e); }
  },
  created() {
    this.state = {
      key: this.settings.key || 'brush-area-dir'
    };
  },
  render(h) {
    this.state.rect = this.rect;

    const stngs = this.settings.settings;
    const direction = stngs.direction === 'vertical' ? VERTICAL : HORIZONTAL;
    const size = this.state.rect[direction === VERTICAL ? 'height' : 'width'];
    const offset = this.renderer.element().getBoundingClientRect();

    const targets = (stngs.target ? stngs.target.components || [stngs.target.component] : [])
      .map((c) => this.chart.component(c)).filter((c) => !!c && !!c.rect);

    const targetRect = targets[0] ? targets.slice(1).reduce((prev, curr) => ({
      x0: Math.min(prev.x0, curr.rect.x),
      y0: Math.min(prev.y0, curr.rect.y),
      x1: Math.max(prev.x1, curr.rect.x + curr.rect.width),
      y1: Math.max(prev.y1, curr.rect.y + curr.rect.height)
    }), {
      x0: targets[0].rect.x,
      y0: targets[0].rect.y,
      x1: targets[0].rect.x + targets[0].rect.width,
      y1: targets[0].rect.y + targets[0].rect.height
    }) : null;

    this.state.targetRect = targetRect ? {
      x: targetRect.x0 - this.rect.x,
      y: targetRect.y0 - this.rect.y,
      width: targetRect.x1 - targetRect.x0,
      height: targetRect.y1 - targetRect.y0
    } : null;

    this.state.style = this.style;
    this.state.chart = this.chart;
    this.state.direction = direction;
    this.state.settings = stngs;
    this.state.offset = offset;
    this.state.rc = rangeCollection();
    this.state.renderer = this.renderer;
    this.state.multi = !!stngs.multiple;
    this.state.h = h;
    this.state.size = size;
    this.state.cssCoord = {
      offset: this.state.direction === VERTICAL ? 'top' : 'left',
      coord: this.state.direction === VERTICAL ? 'y' : 'x',
      pos: this.state.direction === VERTICAL ? 'deltaY' : 'deltaX',
      area: this.state.direction === VERTICAL ? 'height' : 'width'
    };

    this.state.format = function getFormat(v, r) {
      return getBubbleLabel(this, v, r);
    };

    return [];
  },
  start(e) {
    startArea({
      e,
      state: this.state,
      renderer: this.renderer,
      ranges,
      targetSize: TARGET_SIZE
    });
  },
  end() {
    if (!this.state.started) {
      return;
    }
    endArea(this.state, ranges);
    render(this.state);
  },
  move(e) {
    if (!this.state.started) {
      return;
    }
    moveArea(this.state, e);
    setRanges(this.state);
    render(this.state);
  },
  clear() {
    if (this.state.rc) {
      this.state.rc.clear();
    }
    this.state.renderer.render([]);
  }
};

export default brushAreaDirectionalComponent;
