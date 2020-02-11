import extend from 'extend';
import { testRectPoint } from '../../../core/math/narrow-phase-collision';

function rangelimits(state) {
  return {
    min: state.scale.min(),
    max: state.scale.max(),
  };
}

function areaLimits(state) {
  return {
    min: 0,
    max: state.direction ? state.rect.width : state.rect.height,
  };
}

function findActive(state, value, limits) {
  let rs = state.ranges;
  let i;
  let activeIdx = -1;
  for (i = 0; i < rs.length; i++) {
    if (rs[i].min <= value && value <= rs[i].max) {
      activeIdx = i;
      limits.min = i ? rs[i - 1].max : limits.min;
      limits.max = i + 1 < rs.length ? rs[i + 1].min : limits.max;
      break;
    } else if (value < rs[i].min) {
      limits.max = rs[i].min;
      limits.min = i ? rs[i - 1].max : limits.min;
      break;
    }
  }
  if (activeIdx === -1 && rs.length && i >= rs.length) {
    limits.min = rs[rs.length - 1].max;
  }

  let activeRange;

  if (activeIdx !== -1) {
    activeRange = {
      idx: activeIdx,
      start: rs[activeIdx].min,
      end: rs[activeIdx].max,
      limitLow: limits.min,
      limitHigh: limits.max,
      mode: 'foo',
    };
  }
  state.active = activeRange;
}

export function startArea({ state, e, renderer, ranges, targetSize }) {
  if (state.started) {
    return;
  }
  const x = e.center.x - e.deltaX;
  const y = e.center.y - e.deltaY;
  let target = document.elementFromPoint(x, y);
  if (!renderer.element().contains(target)) {
    target = null;
  }

  const tempState = {
    started: true,
  };

  state.offset = renderer.element().getBoundingClientRect();
  state.ranges = ranges(state);
  const relX = x - state.offset.left; // coordinate relative renderer
  const relY = y - state.offset.top;
  const startPoint = e.center[state.cssCoord.coord] - e[state.cssCoord.pos] - state.offset[state.cssCoord.offset];
  const relStart = e.center[state.cssCoord.coord] - state.offset[state.cssCoord.offset];
  let v = relStart;
  let vStart = startPoint;

  tempState.start = startPoint;
  tempState.current = relStart;

  let rs = state.ranges;
  const limits = areaLimits(state);
  let i;
  let activeIdx = -1;
  if (target && target.hasAttribute('data-idx')) {
    activeIdx = parseInt(target.getAttribute('data-idx'), 10);
    limits.min = activeIdx > 0 ? rs[activeIdx - 1].max : limits.min;
    limits.max = activeIdx + 1 < rs.length ? rs[activeIdx + 1].min : limits.max;
  } else {
    for (i = 0; i < rs.length; i++) {
      if (rs[i].min <= vStart && vStart <= rs[i].max) {
        activeIdx = i;
        limits.min = i ? rs[i - 1].max : limits.min;
        limits.max = i + 1 < rs.length ? rs[i + 1].min : limits.max;
        break;
      } else if (vStart < rs[i].min) {
        limits.max = rs[i].min;
        limits.min = i ? rs[i - 1].max : limits.min;
        break;
      }
    }
    if (activeIdx === -1 && rs.length && i >= rs.length) {
      limits.min = rs[rs.length - 1].max;
    }
  }

  if (activeIdx === -1 && !state.multi) {
    tempState.ranges = [];
    limits.min = 0;
    limits.max = state.direction ? state.rect.width : state.rect.height;
  }
  let activeRange;

  if (activeIdx !== -1) {
    activeRange = {
      idx: activeIdx,
      start: rs[activeIdx].min,
      end: rs[activeIdx].max,
      limitLow: limits.min,
      limitHigh: limits.max,
      mode: 'move',
    };

    if (target && target.hasAttribute('data-other-value')) {
      tempState.start = parseFloat(target.getAttribute('data-other-value'));
      activeRange.mode = 'modify';
    } else {
      let pxStart = activeRange.start;
      let pxEnd = activeRange.end;
      if (Math.abs(startPoint - pxStart) <= targetSize) {
        tempState.start = activeRange.end;
        activeRange.mode = 'modify';
      } else if (Math.abs(startPoint - pxEnd) <= targetSize) {
        tempState.start = activeRange.start;
        activeRange.mode = 'modify';
      }
    }
  } else {
    activeRange = {
      idx: -1,
      start: vStart,
      end: v,
      limitLow: limits.min,
      limitHigh: limits.max,
      mode: 'current',
    };
  }

  tempState.active = activeRange;

  if (activeRange.mode !== 'modify' && state.targetRect && !testRectPoint(state.targetRect, { x: relX, y: relY })) {
    // do nothing
  } else {
    Object.keys(tempState).forEach(key => (state[key] = tempState[key]));
  }
}

export function start({ state, e, renderer, ranges, targetSize }) {
  if (state.started) {
    return;
  }
  state.edit = null;
  const x = e.center.x - e.deltaX;
  const y = e.center.y - e.deltaY;
  let target = document.elementFromPoint(x, y);
  if (!renderer.element().contains(target)) {
    target = null;
  }

  const tempState = {
    started: true,
  };

  state.offset = extend({}, renderer.element().getBoundingClientRect());
  const relX = x - state.offset.left; // coordinate relative renderer
  const relY = y - state.offset.top;
  state.offset.left += state.targetRect ? state.targetRect.x : 0; // make offset relative to targetRect
  state.offset.top += state.targetRect ? state.targetRect.y : 0;
  state.ranges = ranges(state, state.fauxBrushInstance || state.brushInstance);
  const startPoint = e.center[state.cssCoord.coord] - e[state.cssCoord.pos] - state.offset[state.cssCoord.offset];
  const relStart = e.center[state.cssCoord.coord] - state.offset[state.cssCoord.offset];
  tempState.current = state.scale.normInvert(relStart / state.size);
  tempState.start = state.scale.normInvert(startPoint / state.size);

  let rs = state.ranges;
  const limits = rangelimits(state);
  let i;
  let activeIdx = -1;
  if (target && target.hasAttribute('data-idx')) {
    activeIdx = parseInt(target.getAttribute('data-idx'), 10);
    limits.min = activeIdx > 0 ? rs[activeIdx - 1].max : limits.min;
    limits.max = activeIdx + 1 < rs.length ? rs[activeIdx + 1].min : limits.max;
  } else {
    for (i = 0; i < rs.length; i++) {
      if (rs[i].min <= tempState.start && tempState.start <= rs[i].max) {
        activeIdx = i;
        limits.min = i ? rs[i - 1].max : limits.min;
        limits.max = i + 1 < rs.length ? rs[i + 1].min : limits.max;
        break;
      } else if (tempState.start < rs[i].min) {
        limits.max = rs[i].min;
        limits.min = i ? rs[i - 1].max : limits.min;
        break;
      }
    }
    if (activeIdx === -1 && rs.length && i >= rs.length) {
      limits.min = rs[rs.length - 1].max;
    }
  }

  if (activeIdx === -1 && !state.multi) {
    tempState.ranges = [];
    limits.min = state.scale.min();
    limits.max = state.scale.max();
  }
  let activeRange;

  if (activeIdx !== -1) {
    activeRange = {
      idx: activeIdx,
      start: rs[activeIdx].min,
      end: rs[activeIdx].max,
      limitLow: limits.min,
      limitHigh: limits.max,
      mode: 'move',
    };

    if (target && target.hasAttribute('data-other-value')) {
      tempState.start = parseFloat(target.getAttribute('data-other-value'));
      activeRange.mode = 'modify';
    } else {
      let pxStart = state.scale.norm(activeRange.start) * state.size;
      let pxEnd = state.scale.norm(activeRange.end) * state.size;
      if (Math.abs(startPoint - pxStart) <= targetSize) {
        tempState.start = activeRange.end;
        activeRange.mode = 'modify';
      } else if (Math.abs(startPoint - pxEnd) <= targetSize) {
        tempState.start = activeRange.start;
        activeRange.mode = 'modify';
      }
    }
  } else {
    activeRange = {
      idx: -1,
      start: tempState.start,
      end: tempState.current,
      limitLow: limits.min,
      limitHigh: limits.max,
      mode: 'current',
    };
  }

  tempState.active = activeRange;

  if (activeRange.mode !== 'modify' && state.targetRect && !testRectPoint(state.targetRect, { x: relX, y: relY })) {
    // do nothing
  } else {
    Object.keys(tempState).forEach(key => (state[key] = tempState[key]));
  }
}
export function end(state, ranges) {
  state.started = false;
  state.ranges = ranges(state, state.fauxBrushInstance || state.brushInstance);
  const limits = rangelimits(state);
  findActive(state, state.current, limits);
}

export function endArea(state, ranges) {
  state.started = false;
  state.ranges = ranges(state);
  const limits = areaLimits(state);
  findActive(state, state.current, limits);
}

export function move(state, e) {
  const relY = e.center[state.cssCoord.coord] - state.offset[state.cssCoord.offset];
  const rel = relY / state.size;
  const v = state.scale.normInvert(rel);
  state.current = Math.max(Math.min(v, state.active.limitHigh), state.active.limitLow);
}

export function moveArea(state, e) {
  const rel = e.center[state.cssCoord.coord] - state.offset[state.cssCoord.offset];

  state.current = Math.max(Math.min(rel, state.active.limitHigh), state.active.limitLow);
}
