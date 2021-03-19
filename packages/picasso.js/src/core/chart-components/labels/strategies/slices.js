import extend from 'extend';
import { testCircleRect, testRectLine, testRectRect } from '../../../math/narrow-phase-collision';
import { rectContainsRect } from '../../../math/intersection';

const LABEL_OVERLAP_THRESHOLD_X = 4;

function normalize(angle) {
  const PI2 = Math.PI * 2;
  return ((angle % PI2) + PI2) % PI2; // normalize
}

function pad(bounds, padding) {
  bounds.x += padding;
  bounds.width -= padding * 2;
  bounds.y += padding;
  bounds.height -= padding * 2;
}

function getTopLeftBounds(bounds) {
  const x = bounds.x;
  const y = bounds.y - bounds.height / 2;

  return {
    x,
    y,
    width: bounds.width,
    height: bounds.height,
  };
}

// assume 0 <= angle < (PI / 2)
function getLineCircleIntersection(radius, offset, angle) {
  let { x, y } = offset;

  if (x * x + y * y > radius * radius) {
    return null;
  }

  let dx = Math.sin(angle);
  let dy = Math.cos(angle);
  let D = x * dy - y * dx;

  let d = radius * radius - D * D;
  if (d < 0) {
    return null;
  }
  let sqrtD = Math.sqrt(d);
  return {
    x: D * dy + dx * sqrtD,
    y: -(D * dx) + dy * sqrtD,
  };
}

// assume 0 <= angle < (PI * 2)
function getRectFromCircleIntersection({ radius, size, angle }) {
  let { width, height } = size;
  let lineOffset = { x: width / 2, y: height / 2 };
  let section = Math.floor(angle / (Math.PI / 2));
  let intersection;
  let offset;
  switch (section) {
    case 0:
      intersection = getLineCircleIntersection(radius, lineOffset, angle);
      if (!intersection) {
        return null;
      }
      intersection.y *= -1;
      offset = { x: -width, y: 0 };
      break;
    case 1:
      intersection = getLineCircleIntersection(radius, lineOffset, Math.PI - angle);
      if (!intersection) {
        return null;
      }
      offset = { x: -width, y: -height };
      break;
    case 2:
      intersection = getLineCircleIntersection(radius, lineOffset, angle - Math.PI);
      if (!intersection) {
        return null;
      }
      intersection.x *= -1;
      offset = { x: 0, y: -height };
      break;
    case 3:
      intersection = getLineCircleIntersection(radius, lineOffset, 2 * Math.PI - angle);
      if (!intersection) {
        return null;
      }
      intersection.x *= -1;
      intersection.y *= -1;
      offset = { x: 0, y: 0 };
      break;
    default:
      throw new Error('invalid angle');
  }
  let bounds = {
    x: intersection.x + offset.x,
    y: intersection.y + offset.y,
    width,
    height,
  };
  return bounds;
}

function getHorizontalInsideSliceRect({ slice, padding, measured, store }) {
  const { start, end, outerRadius } = slice;
  const middle = normalize((start + end) / 2);

  const size = {
    width: measured.width + padding * 2,
    height: measured.height + padding * 2,
  };

  let bounds = getRectFromCircleIntersection({
    radius: outerRadius,
    size,
    angle: middle,
  });

  if (!bounds) {
    return null;
  }

  bounds.baseline = 'top';

  pad(bounds, padding);

  if (store.insideLabelBounds.some((rect) => testRectRect(rect, bounds))) {
    return null;
  }

  store.insideLabelBounds.push({
    x: bounds.x - LABEL_OVERLAP_THRESHOLD_X,
    y: bounds.y,
    width: bounds.width + LABEL_OVERLAP_THRESHOLD_X * 2,
    height: bounds.height,
  }); // Copy as bounds is mutated else where

  return bounds;
}

function getHorizontalIntoSliceRect({ slice, padding, measured }) {
  let { start, end, innerRadius, outerRadius } = slice;
  const middle = normalize((start + end) / 2);

  let size = {
    width: measured.width + padding * 2,
    height: measured.height + padding * 2,
  };

  let bounds = getRectFromCircleIntersection({
    radius: outerRadius,
    size,
    angle: middle,
  });

  if (!bounds) {
    return null;
  }

  bounds.baseline = 'top';

  let startLine = {
    x1: 0,
    y1: 0,
    x2: Math.sin(start) * outerRadius,
    y2: -Math.cos(start) * outerRadius,
  };
  if (testRectLine(bounds, startLine)) {
    return null;
  }
  let endLine = {
    x1: 0,
    y1: 0,
    x2: Math.sin(end) * outerRadius,
    y2: -Math.cos(end) * outerRadius,
  };
  if (testRectLine(bounds, endLine)) {
    return null;
  }
  let circle = { cx: 0, cy: 0, r: innerRadius };
  if (testCircleRect(circle, bounds)) {
    return null;
  }

  pad(bounds, padding);

  return bounds;
}

// TODO: this case can support a justify setting
function getRotatedInsideSliceRect({ slice, measured, padding }) {
  let { start, end, innerRadius, outerRadius } = slice;

  let maxWidth = outerRadius - innerRadius - padding * 2;
  let size = end - start;
  if (size < Math.PI) {
    let x = (measured.height / 2 + padding) / Math.tan(size / 2);
    if (x > innerRadius) {
      maxWidth = outerRadius - x - padding * 2;
    }
  }
  if (maxWidth < 0 || maxWidth < measured.minReqWidth) {
    return null;
  }

  const middle = normalize((start + end) / 2);
  let r = outerRadius - padding;
  let bounds = {
    x: Math.sin(middle) * r,
    y: -Math.cos(middle) * r,
    width: maxWidth,
    height: measured.height,
  };
  if (middle < Math.PI) {
    bounds.angle = middle - Math.PI / 2;
    bounds.anchor = 'end';
  } else {
    bounds.angle = middle + Math.PI / 2;
    bounds.anchor = 'start';
  }
  return bounds;
}

function getRotatedOusideSliceRect({ slice, measured, padding, view }) {
  let { start, end, outerRadius, offset } = slice;
  let r = outerRadius + padding;
  let size = end - start;
  if (size < Math.PI) {
    let minR = (measured.height / 2 + padding) / Math.tan(size / 2);
    if (minR > r) {
      return null;
    }
  }
  const middle = normalize((start + end) / 2);
  let x = Math.sin(middle) * r;
  let y = -Math.cos(middle) * r;

  let maxWidth = measured.width;
  let v = middle % Math.PI;
  if (v > Math.PI / 2) {
    v = Math.PI - v;
  }
  if (Math.cos(v) > 0.001) {
    let edge = y < 0 ? view.y : view.y + view.height;
    let d = Math.abs(edge - offset.y);
    let w = d / Math.cos(v) - Math.tan(v) * (measured.height / 2) - padding * 2 - outerRadius;
    if (w < maxWidth) {
      maxWidth = w;
    }
  }
  if (Math.sin(v) > 0.001) {
    let edge = x < 0 ? view.x : view.x + view.width;
    let d = Math.abs(edge - offset.x);
    let w = d / Math.sin(v) - measured.height / 2 / Math.tan(v) - padding * 2 - outerRadius;
    if (w < maxWidth) {
      maxWidth = w;
    }
  }

  if (maxWidth <= 0 || maxWidth < measured.minReqWidth) {
    return null;
  }

  let bounds = {
    x,
    y,
    width: maxWidth,
    height: measured.height,
  };
  if (middle < Math.PI) {
    bounds.angle = middle - Math.PI / 2;
    bounds.anchor = 'start';
  } else {
    bounds.angle = middle + Math.PI / 2;
    bounds.anchor = 'end';
  }
  return bounds;
}

function outOfSpace(context, section, view) {
  switch (section) {
    case 0:
      return context.q1maxY < 0;
    case 1:
      return context.q2minY > view.height;
    case 2:
      return context.q3minY > view.height;
    case 3:
      return context.q4maxY < 0;
    default:
      return true;
  }
}
function adjustBounds(bounds, context, slice) {
  const LINE_PADDING = 2;
  const LIMIT = 1;

  const { start, end, offset, outerRadius } = slice;
  const middle = normalize((start + end) / 2);
  let section = Math.floor(middle / (Math.PI / 2));

  switch (section) {
    case 0:
      if (context.q1maxY !== undefined) {
        let y = Math.min(bounds.y, context.q1maxY - bounds.height);
        let dy = bounds.y - y;
        bounds.y = y;
        if (dy > LIMIT) {
          let r = outerRadius + LINE_PADDING;
          bounds.line = {
            type: 'line',
            x1: bounds.x - LINE_PADDING,
            y1: bounds.y + LINE_PADDING,
            x2: offset.x + Math.sin(middle) * r,
            y2: offset.y - Math.cos(middle) * r,
            strokeWidth: 1,
          };
        }
      }
      break;
    case 1:
      if (context.q2minY !== undefined) {
        let y = Math.max(bounds.y, context.q2minY);
        let dy = y - bounds.y;
        bounds.y = y;
        if (dy > LIMIT) {
          let r = outerRadius + LINE_PADDING;
          bounds.line = {
            type: 'line',
            x1: bounds.x - LINE_PADDING,
            y1: bounds.y - LINE_PADDING,
            x2: offset.x + Math.sin(middle) * r,
            y2: offset.y - Math.cos(middle) * r,
            strokeWidth: 1,
          };
        }
      }
      break;
    case 2:
      if (context.q3minY !== undefined) {
        let y = Math.max(bounds.y, context.q3minY);
        let dy = y - bounds.y;
        bounds.y = y;
        if (dy > LIMIT) {
          let r = outerRadius + LINE_PADDING;
          bounds.line = {
            type: 'line',
            x1: bounds.x + LINE_PADDING,
            y1: bounds.y - LINE_PADDING,
            x2: offset.x + Math.sin(middle) * r,
            y2: offset.y - Math.cos(middle) * r,
            strokeWidth: 1,
          };
        }
      }
      break;
    case 3:
      if (context.q4maxY !== undefined) {
        let y = Math.min(bounds.y, context.q4maxY - bounds.height);
        let dy = bounds.y - y;
        bounds.y = y;
        if (dy > LIMIT) {
          let r = outerRadius + LINE_PADDING;
          bounds.line = {
            type: 'line',
            x1: bounds.x + LINE_PADDING,
            y1: bounds.y + LINE_PADDING,
            x2: offset.x + Math.sin(middle) * r,
            y2: offset.y - Math.cos(middle) * r,
            strokeWidth: 1,
          };
        }
      }
      break;
    default:
      break;
  }
}
function updateContext({ context, node, bounds }) {
  const PADDING = 2;
  let { start, end } = node.desc.slice;
  const middle = normalize((start + end) / 2);

  let section = Math.floor(middle / (Math.PI / 2));
  switch (section) {
    case 0:
      context.q1maxY = bounds.y - PADDING;
      if (context.q2minY === undefined) {
        context.q2minY = bounds.y + bounds.height + PADDING;
      }
      break;
    case 1:
      context.q2minY = bounds.y + bounds.height + PADDING;
      break;
    case 2:
      context.q3minY = bounds.y + bounds.height + PADDING;
      break;
    case 3:
      context.q4maxY = bounds.y - PADDING;
      if (context.q3minY === undefined) {
        context.q3minY = bounds.y + bounds.height + PADDING;
      }
      break;
    default:
      break;
  }
}

function getHorizontalOusideSliceRect({ slice, measured, padding, view, context }) {
  let { start, end, outerRadius, offset } = slice;
  const middle = normalize((start + end) / 2);

  let section = Math.floor(middle / (Math.PI / 2));
  if (outOfSpace(context, section, view)) {
    return null;
  }

  let r = outerRadius + padding + measured.height / 2;
  let x = Math.sin(middle) * r;
  let y = -Math.cos(middle) * r;

  let maxWidth = measured.width;
  if (middle < Math.PI) {
    let w = Math.abs(view.x + view.width - (x + offset.x));
    if (w < maxWidth) {
      maxWidth = w;
    }
  } else {
    let w = Math.abs(view.x - (x + offset.x));
    if (w < maxWidth) {
      maxWidth = w;
    }
  }

  if (maxWidth < measured.minReqWidth) {
    return null;
  }

  let bounds = {
    x,
    y,
    width: maxWidth,
    height: measured.height,
  };

  if (middle < Math.PI) {
    bounds.anchor = 'start';
  } else {
    bounds.anchor = 'end';
  }

  return bounds;
}

function cbContext(node, chart) {
  return {
    node,
    data: node.data,
    scale: chart.scale,
    formatter: chart.formatter,
    dataset: chart.dataset,
  };
}

function placeTextOnPoint(rect, text, opts) {
  const label = {
    type: 'text',
    text,
    maxWidth: rect.width,
    x: rect.x,
    y: rect.y + (rect.baseline === 'top' ? rect.height / 2 : 0),
    fill: opts.fill,
    anchor: rect.anchor || 'start',
    baseline: 'middle',
    fontSize: `${opts.fontSize}px`,
    fontFamily: opts.fontFamily,
  };

  if (!isNaN(rect.angle)) {
    let angle = rect.angle * (360 / (Math.PI * 2));
    label.transform = `rotate(${angle}, ${label.x}, ${label.y})`;
  }

  return label;
}

export function getSliceRect({ slice, direction, position, padding, measured, view, context, store }) {
  let { start, end, innerRadius, offset } = slice;

  let bounds;
  let s;
  switch (position) {
    case 'into':
      if (direction === 'rotate') {
        bounds = getRotatedInsideSliceRect({ slice, measured, padding });
      } else {
        bounds = getHorizontalIntoSliceRect({ slice, measured, padding });
      }
      break;
    case 'inside':
      s = {
        start,
        end,
        innerRadius: 0,
        outerRadius: innerRadius,
      };
      if (direction === 'rotate') {
        bounds = getRotatedInsideSliceRect({ slice: s, measured, padding });
      } else {
        bounds = getHorizontalInsideSliceRect({
          slice: s,
          measured,
          padding,
          store,
        });
      }
      break;
    case 'outside':
      if (direction === 'rotate') {
        bounds = getRotatedOusideSliceRect({
          slice,
          measured,
          padding,
          view,
        });
      } else {
        bounds = getHorizontalOusideSliceRect({
          slice,
          measured,
          padding,
          view,
          context,
        });
      }
      break;
    default:
      throw new Error('not implemented');
  }
  if (bounds) {
    bounds.x += offset.x;
    bounds.y += offset.y;
    if (position === 'outside' && direction !== 'rotate') {
      adjustBounds(bounds, context, slice);
    }
  }
  return bounds;
}

function findBestPlacement(
  { context, direction, measured, node, placementSettings, rect, store },
  sliceRect = getSliceRect
) {
  for (let p = 0; p < placementSettings.length; p++) {
    let placement = placementSettings[p];
    let bounds = sliceRect({
      context,
      slice: node.desc.slice,
      view: rect,
      direction,
      position: placement.position,
      measured,
      padding: placement.padding,
      store,
    });

    if (!bounds) {
      continue;
    }

    return { bounds, placement };
  }
  return { bounds: null, placement: null };
}

/*
 * Sorts the nodes so that
 *   in each quarter sort nodes from the center (in y) outwards
 *   first quarter before the second
 *   forth quarter before the third
 */
function sortNodes(nodes) {
  const q1 = [];
  const q2 = [];
  const q3 = [];
  const q4 = [];
  for (let i = 0; i < nodes.length; ++i) {
    const { start, end } = nodes[i].desc.slice;
    const middle = normalize((start + end) / 2);
    let section = Math.floor(middle / (Math.PI / 2));
    switch (section) {
      case 0:
        q1.push(nodes[i]);
        break;
      case 1:
        q2.push(nodes[i]);
        break;
      case 2:
        q3.push(nodes[i]);
        break;
      case 3:
        q4.push(nodes[i]);
        break;
      default:
        break;
    }
  }

  const sortFn = (a, b) => {
    const middleA = normalize((a.desc.slice.start + a.desc.slice.end) / 2);
    const middleB = normalize((b.desc.slice.start + b.desc.slice.end) / 2);
    return middleA - middleB;
  };
  const reverseSortFn = (a, b) => sortFn(b, a);

  q1.sort(reverseSortFn);
  q2.sort(sortFn);
  q3.sort(reverseSortFn);
  q4.sort(sortFn);
  return q1.concat(q2, q4, q3);
}

function measureText(text, stgns, renderer) {
  const fontFamily = stgns.fontFamily;
  const fontSize = `${stgns.fontSize}px`;
  const metrics = renderer.measureText({ text, fontFamily, fontSize });

  metrics.minReqWidth = Math.min(
    metrics.width,
    renderer.measureText({
      text: `${text[0]}…`,
      fontFamily,
      fontSize,
    }).width
  );

  return metrics;
}

/**
 * @typedef {object} ComponentLabels~slicesLabelStrategy
 * @property {string} type='slice' Name of strategy
 */

/**
 * Slices strategy settings
 * @typedef {object} ComponentLabels~slicesLabelStrategy.settings
 * @property {string|function} [direction='horizontal'] - The direction of the text: 'horizontal' or 'rotate'.
 * @property {string} [fontFamily='Arial']
 * @property {number} [fontSize=12]
 * @property {Array<object>} labels
 * @property {string|function} labels[].label - The text value
 * @property {function} labels[].linkData - Link data to the label
 * @property {Array<object>} labels[].placements
 * @property {string} [labels[].placements[].position='into'] - 'inside' | 'into' | 'outside' (outside is not implmented yet)
 * @property {string} [labels[].placements[].fill='#333'] - Color of the label
 */

export function slices(
  { settings, chart, nodes, rect, renderer, style },
  findPlacement = findBestPlacement,
  placer = placeTextOnPoint
) {
  const defaults = extend(
    {
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#333',
      padding: 4,
      position: 'into',
    },
    style.label
  );

  defaults.fontSize = parseInt(defaults.fontSize, 10);

  const labelSettings = settings.labels.map((labelSetting) => extend({}, defaults, settings, labelSetting));

  const placementSettings = settings.labels.map((labelSetting) =>
    labelSetting.placements.map((placement) => extend({}, defaults, settings, labelSetting, placement))
  );

  const labels = [];
  const store = {
    insideLabelBounds: [],
  };

  nodes = sortNodes(nodes);
  const context = {};

  for (let i = 0, len = nodes.length; i < len; i++) {
    const node = nodes[i];
    const arg = cbContext(node, chart);

    for (let j = 0; j < labelSettings.length; j++) {
      const lblStngs = labelSettings[j];
      const text = typeof lblStngs.label === 'function' ? lblStngs.label(arg, i) : '';
      if (!text) {
        continue;
      }
      const direction =
        typeof lblStngs.direction === 'function' ? lblStngs.direction(arg, i) : lblStngs.direction || 'horizontal';
      const linkData = typeof lblStngs.linkData === 'function' ? lblStngs.linkData(arg, i) : undefined;
      const measured = measureText(text, lblStngs, renderer);
      const bestPlacement = findPlacement({
        context,
        direction,
        lblStngs,
        measured,
        node,
        placementSettings: placementSettings[j],
        rect,
        store,
      });

      const bounds = bestPlacement.bounds;
      const placement = bestPlacement.placement;

      if (bounds && placement) {
        if (placement.position === 'outside' && direction !== 'rotate') {
          updateContext({ context, node, bounds });

          const topLeftBounds = getTopLeftBounds(bounds);

          if (!rectContainsRect(topLeftBounds, rect)) {
            continue;
          }
        }

        const fill = typeof placement.fill === 'function' ? placement.fill(arg, i) : placement.fill;

        const label = placer(bounds, text, {
          fill,
          fontSize: lblStngs.fontSize,
          fontFamily: lblStngs.fontFamily,
          textMetrics: measured,
        });

        if (label) {
          if (typeof linkData !== 'undefined') {
            label.data = linkData;
          }
          labels.push(label);
          if (bounds.line) {
            bounds.line.stroke = fill;
            labels.push(bounds.line);
          }
        }
      }
    }
  }

  return labels;
}
