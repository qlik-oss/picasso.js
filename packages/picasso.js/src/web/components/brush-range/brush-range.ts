import { nodes, getMoveDelta } from './brush-range-node-builder';
import { start, end, move } from './brush-range-interaction';
import linear from '../../../core/scales/linear';
import { scaleWithSize } from '../../../core/scales';
import brushFactory from '../../../core/brush';
import { TARGET_SIZE, VERTICAL, HORIZONTAL } from './brush-range-const';
import { pointsToRect, rectToPoints } from '../../../core/geometry/util';

function render(state: Record<string, any>): void {
  state.renderer.render(nodes(state));
}

function ranges(state: Record<string, any>, brush: any): { min: number; max: number }[] {
  if (!brush || !brush.isActive()) {
    return [];
  }

  const sourceData = state.scale.data();
  const sourceFields = sourceData ? sourceData.fields || [] : [];
  const sources = sourceFields.map((field: any) => field.id());
  const rangeBrush = brush.brushes().filter((f: any) => f.type === 'range' && sources.indexOf(f.id) !== -1)[0];

  if (!rangeBrush) {
    return [];
  }

  return rangeBrush.brush.ranges();
}

function setRanges(state: Record<string, any>): void {
  let rs = state.ranges.map((r: any) => ({ min: r.min, max: r.max }));
  if (state.active.idx !== -1) {
    if (state.active.mode === 'modify') {
      rs[state.active.idx].min = Math.min(state.start, state.current);
      rs[state.active.idx].max = Math.max(state.start, state.current);
    } else {
      const delta = getMoveDelta(state);
      rs[state.active.idx].min += delta;
      rs[state.active.idx].max += delta;
    }
  } else {
    rs.push({
      min: Math.min(state.start, state.current),
      max: Math.max(state.start, state.current),
    });
  }

  const scaleData = state.scale.data();
  if (scaleData && scaleData.fields) {
    scaleData.fields.forEach((field: any) => {
      if (state.fauxBrushInstance) {
        let ordRS = ranges(state, state.fauxBrushInstance);
        let oldValues = state.findValues(ordRS);
        let values = state.findValues(rs);

        let addedValues = values.filter((v: any) => oldValues.indexOf(v) === -1);
        let removedValues = oldValues.filter((v: any) => values.indexOf(v) === -1);

        let addItems = addedValues.map((v: any) => ({ key: field.id(), value: v }));
        let removeItems = removedValues.map((v: any) => ({ key: field.id(), value: v }));

        state.brushInstance.addAndRemoveValues(addItems, removeItems);

        state.fauxBrushInstance.setRange(field.id(), rs);
      } else {
        state.brushInstance.setRange(field.id(), rs);
      }
    });
  }
}

function setEditedRanges(state: Record<string, any>, idx: number, startValue: number, endValue: number): void {
  let rs = state.ranges.map((r: any) => ({ min: r.min, max: r.max }));
  const limitMin = state.scale.min();
  const limitMax = state.scale.max();
  rs[idx] = {
    min: Math.max(limitMin, Math.min(startValue, endValue)),
    max: Math.min(limitMax, Math.max(startValue, endValue)),
  };
  state.ranges[idx] = { ...rs[idx] };

  const scaleData = state.scale.data();
  if (scaleData && scaleData.fields) {
    scaleData.fields.forEach((field: any) => {
      if (!state.fauxBrushInstance) {
        state.brushInstance.setRange(field.id(), rs);
      }
    });
  }
}

function findClosest(value: number, scale: any): any {
  let name;
  let minDist = Infinity;
  const domain = scale.domain();
  const halfBandwidth = scale.bandwidth() / 2;
  for (let i = 0; i < domain.length; ++i) {
    const d = Math.abs(value - halfBandwidth - scale(domain[i]));
    if (d < minDist) {
      minDist = d;
      name = domain[i];
    }
  }
  return name;
}

function findClosestLabel(value: number, scale: any): string {
  const ticks = scale.ticks();
  const idx = scale.domain().indexOf(findClosest(value, scale));
  return idx !== -1 ? ticks[idx].label : '-';
}

function rangesOverlap(r1: number[], r2: number[]): boolean {
  return Math.min(...r1) <= Math.max(...r2) && Math.max(...r1) >= Math.min(...r2);
}

function findValues(rangesValues: any[], scale: any): any[] {
  const domain = scale.domain();
  const scaleRange = scale.range();
  const values: any[] = [];
  rangesValues.forEach((range: any) => {
    if (!rangesOverlap(scaleRange, [range.min, range.max])) {
      return;
    }
    const startIdx = domain.indexOf(findClosest(range.min, scale));
    const endIdx = domain.indexOf(findClosest(range.max, scale));
    values.push.apply(
      values,
      domain.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1)
    ); /* eslint prefer-spread:0 */
  });

  return values;
}

function resolveNodeBounds(targetNodes: any[]): any {
  const points = targetNodes.reduce((ary, node) => {
    ary.push(...rectToPoints(node.bounds));
    return ary;
  }, []);
  return pointsToRect(points);
}

function resolveTarget(ctx: any): any {
  const resolved: any = {
    targetRect: null,
    targetFillRect: null,
    scale: null,
    size: null,
  };
  const stngs = ctx.settings.settings;
  const targets =
    stngs.target &&
    (stngs.target.components || (stngs.target.component ? [stngs.target.component] : []))
      .map((c: any) => ctx.chart.component(c))
      .filter((c: any) => !!c && !!c.rect);
  const targetNodes = stngs.target && stngs.target.selector ? ctx.chart.findShapes(stngs.target.selector) : [];
  const targetFillNodes =
    stngs.target && stngs.target.fillSelector ? ctx.chart.findShapes(stngs.target.fillSelector) : [];
  if (targetNodes.length > 0) {
    const bounds = resolveNodeBounds(targetNodes);
    resolved.size = bounds[ctx.state.direction === VERTICAL ? 'height' : 'width'];
    resolved.scale = scaleWithSize(ctx.chart.scale(stngs.scale), resolved.size);
    resolved.targetRect = bounds;
    if (targetFillNodes.length > 0) {
      const fillBounds = resolveNodeBounds(targetFillNodes);
      resolved.targetFillRect = fillBounds;
    }
  } else if (targets && targets.length > 0) {
    const targetRect = targets.slice(1).reduce(
      (prev: any, curr: any) => ({
        x0: Math.min(prev.x0, curr.rect.computedInner.x),
        y0: Math.min(prev.y0, curr.rect.computedInner.y),
        x1: Math.max(prev.x1, curr.rect.computedInner.x + curr.rect.computedInner.width),
        y1: Math.max(prev.y1, curr.rect.computedInner.y + curr.rect.computedInner.height),
      }),
      {
        x0: targets[0].rect.computedInner.x,
        y0: targets[0].rect.computedInner.y,
        x1: targets[0].rect.computedInner.x + targets[0].rect.computedInner.width,
        y1: targets[0].rect.computedInner.y + targets[0].rect.computedInner.height,
      }
    );

    resolved.targetRect = {
      x: targetRect.x0 - ctx.state.rect.x,
      y: targetRect.y0 - ctx.state.rect.y,
      width: targetRect.x1 - targetRect.x0,
      height: targetRect.y1 - targetRect.y0,
    };
  }

  return resolved;
}

/**
 * @typedef {object} ComponentBrushRange.settings
 * @property {string|object} brush - Brush context to apply changes to
 * @property {string} scale - Scale to extract data from
 * @property {string} [direction=vertical] - Rendering direction [horizontal|vertical]
 * @property {object} [bubbles]
 * @property {boolean} [bubbles.show=true] - True to show label bubble, false otherwise
 * @property {string} [bubbles.align=start] - Where to anchor bubble [start|end]
 * @property {function} [bubbles.label] - Callback function for the labels
 * @property {object} [target]
 * @property {string[]} [target.components] - Render matching overlay on target components
 * @property {string} [target.selector] - Instead of targeting a component, target one or more shapes
 * @property {string} [target.fillSelector] - Target a subset of the selector as fill area. Only applicable if `selector` property is set
 */

/**
 * @private
 * @typedef {object} ComponentBrushRangeStyle
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

const brushRangeComponent: any = {
  require: ['chart', 'settings', 'renderer'],
  defaultSettings: {
    settings: {
      bubbles: {
        show: true,
        align: 'start',
      },
    },
    style: {
      bubble: '$label-overlay',
      line: '$shape-guide--inverted',
      target: '$selection-area-target',
    },
  },
  renderer: 'dom',
  on: {
    rangeStart(e: any): void {
      (this as any).start(e);
    },
    rangeMove(e: any): void {
      (this as any).move(e);
    },
    rangeEnd(e: any): void {
      (this as any).end(e);
    },
    rangeClear(e: any): void {
      (this as any).clear(e);
    },
    bubbleStart(e: any): void {
      (this as any).bubbleStart(e);
    },
  },
  created(): void {
    this.state = {
      key: this.settings.key || 'brush-range',
    };
  },
  beforeRender(opts: any): void {
    this.state.rect = opts.size.computedInner;
  },
  renderRanges(): void {
    if (!this.state.started) {
      this.state.ranges = ranges(this.state, this.state.brushInstance);
      this.state.active = null;
      render(this.state);
    }
  },
  render(h: any): any[] {
    const stngs = this.settings.settings;
    this.state.direction = stngs.direction === 'vertical' ? VERTICAL : HORIZONTAL;
    const offset = this.renderer.element().getBoundingClientRect();
    const size = this.state.rect[this.state.direction === VERTICAL ? 'height' : 'width'];
    let scale = scaleWithSize(this.chart.scale(stngs.scale), size);

    const target = resolveTarget(this);
    scale = target.scale ? target.scale : scale;
    this.state.targetRect = target.targetRect;
    this.state.targetFillRect = target.targetFillRect;
    this.state.size = target.size === null ? size : target.size;

    this.state.settings = stngs;
    this.state.style = this.style;
    this.state.offset = offset;
    this.state.brush = typeof stngs.brush === 'object' ? stngs.brush.context : stngs.brush;
    this.state.brushInstance = this.chart.brush(this.state.brush);
    this.state.renderer = this.renderer;
    this.state.multi = !!stngs.multiple;
    this.state.h = h;
    this.state.onEditConfirmed = (rangeIdx: number, value: number, otherValue: number): void => {
      this.state.edit = null;
      setEditedRanges(this.state, rangeIdx, value, otherValue);
      this.emit('bubbleEnd');
      render(this.state);
    };
    this.state.onEditCanceled = (): void => {
      this.state.edit = null;
      render(this.state);
    };
    this.state.cssCoord = {
      offset: this.state.direction === VERTICAL ? 'top' : 'left',
      coord: this.state.direction === VERTICAL ? 'y' : 'x',
      pos: this.state.direction === VERTICAL ? 'deltaY' : 'deltaX',
    };
    this.state.format =
      typeof stngs.bubbles.label === 'function'
        ? (v: any, r: any): string =>
            stngs.bubbles.label.call(undefined, {
              datum: v,
              data: r,
              scale,
              resources: {
                scale: this.chart.scale,
                formatter: this.chart.formatter,
              },
            })
        : false;

    if (!{}.hasOwnProperty.call(scale, 'norm')) {
      // Non-linear scale if norm method is unavailable
      this.state.editable = false;
      this.state.scale = linear();
      this.state.scale.data = scale.data;
      if (!this.state.format) {
        this.state.format = (v: any, r: any): string => {
          if (!rangesOverlap(scale.range(), r)) {
            return '-';
          }
          return findClosestLabel(v, scale);
        };
      }
      this.state.fauxBrushInstance = brushFactory();
      this.state.findValues = (valueRanges: any[]): any[] => findValues(valueRanges, scale);
    } else {
      this.state.editable = true;
      this.state.observeBrush = typeof stngs.brush === 'object' ? stngs.brush.observe : false;
      this.state.fauxBrushInstance = null;
      this.state.findValues = null;
      this.state.scale = scale;
      const scaleData = this.state.scale.data();
      if (!this.state.format && scaleData && scaleData.fields && scaleData.fields[0]) {
        this.state.format = scaleData.fields[0].formatter();
      }
    }

    this.state.ranges = ranges(this.state, this.state.brushInstance);

    return this.state.observeBrush || this.state.sourcedFromThisComponent ? [nodes(this.state)] : [];
  },
  mounted(): void {
    if (this.state.observeBrush && this.state.brushInstance) {
      this.state.brushInstance.on('update', this.renderRanges);
    }
  },
  beforeDestroy(): void {
    if (this.state.observeBrush && this.state.brushInstance) {
      this.state.brushInstance.removeListener('update', this.renderRanges);
    }
  },
  start(e: any): void {
    start({
      e,
      state: this.state,
      renderer: this.renderer,
      ranges,
      targetSize: TARGET_SIZE,
    });
  },
  end(): void {
    if (!this.state.started) {
      return;
    }
    end(this.state, ranges);
    render(this.state);
    this.state.sourcedFromThisComponent = true;
    this.state.active = null;
  },
  move(e: any): void {
    if (!this.state.started) {
      return;
    }
    move(this.state, e);
    setRanges(this.state);
    render(this.state);
  },
  clear(): void {
    if (this.state.fauxBrushInstance) {
      this.state.fauxBrushInstance.clear();
    }
    this.state.renderer.render([]);
    this.state.started = false;
    this.state.active = null;
    this.state.sourcedFromThisComponent = false;
  },
  bubbleStart(e: any): void {
    if (!this.state.editable) {
      return;
    }
    const ee = e.srcEvent || e;

    const target = ee.target;
    const ed = {
      rangeIdx: parseInt(target.getAttribute('data-idx'), 10),
      bubbleIdx: parseInt(target.getAttribute('data-bidx'), 10),
    };
    if (isNaN(ed.rangeIdx) || JSON.stringify(ed) === JSON.stringify(this.state.edit)) {
      return;
    }
    this.state.edit = ed;

    ee.stopPropagation();
    ee.stopImmediatePropagation();
    ee.preventDefault();

    const wrapper = target.parentNode;

    render(this.state);
    const inputEl = wrapper.querySelector('input');
    inputEl.focus();
    inputEl.select();
  },
};

export default brushRangeComponent;
