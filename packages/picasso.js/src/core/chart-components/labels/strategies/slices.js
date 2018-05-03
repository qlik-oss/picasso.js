import extend from 'extend';
import collisions from '../../../math/narrow-phase-collision';

function pad(bounds, padding) {
  bounds.x += padding;
  bounds.width -= (padding * 2);
  bounds.y += padding;
  bounds.height -= (padding * 2);
}

// assume 0 <= angle < (PI / 2)
function getLineCircleIntersection(radius, offset, angle) {
  let { x, y } = offset;

  if ((x * x) + (y * y) > radius * radius) { return null; }

  let dx = Math.sin(angle);
  let dy = Math.cos(angle);
  let D = (x * dy) - (y * dx);

  let d = (radius * radius) - (D * D);
  if (d < 0) {
    return null;
  }
  let sqrtD = Math.sqrt(d);
  return {
    x: (D * dy) + (dx * sqrtD),
    y: -(D * dx) + (dy * sqrtD)
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
      if (!intersection) { return null; }
      intersection.y *= -1;
      offset = { x: -width, y: 0 };
      break;
    case 1:
      intersection = getLineCircleIntersection(radius, lineOffset, Math.PI - angle);
      if (!intersection) { return null; }
      offset = { x: -width, y: -height };
      break;
    case 2:
      intersection = getLineCircleIntersection(radius, lineOffset, angle - Math.PI);
      if (!intersection) { return null; }
      intersection.x *= -1;
      offset = { x: 0, y: -height };
      break;
    case 3:
      intersection = getLineCircleIntersection(radius, lineOffset, (2 * Math.PI) - angle);
      if (!intersection) { return null; }
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
    height
  };
  return bounds;
}

function getHorizontalInsideSliceRect({ slice, padding, measured }) {
  let { start, end, innerRadius, outerRadius } = slice;
  let middle = (start + end) / 2;

  let size = {
    width: measured.width + (padding * 2),
    height: measured.height + (padding * 2)
  };

  let PI2 = Math.PI * 2;
  middle = ((middle % PI2) + PI2) % PI2; // normalize

  let bounds = getRectFromCircleIntersection({
    radius: outerRadius,
    size,
    angle: middle
  });

  if (!bounds) { return null; }

  let startLine = { x1: 0, y1: 0, x2: Math.sin(start) * outerRadius, y2: -Math.cos(start) * outerRadius };
  if (collisions.testRectLine(bounds, startLine)) { return null; }
  let endLine = { x1: 0, y1: 0, x2: Math.sin(end) * outerRadius, y2: -Math.cos(end) * outerRadius };
  if (collisions.testRectLine(bounds, endLine)) { return null; }
  let circle = { cx: 0, cy: 0, r: innerRadius };
  if (collisions.testCircleRect(circle, bounds)) { return null; }

  pad(bounds, padding);

  return bounds;
}

// TODO: this case can support a justify setting
function getRotatedInsideSliceRect({ slice, measured, padding }) {
  let { start, end, innerRadius, outerRadius } = slice;

  let maxWidth = outerRadius - innerRadius - (padding * 2);
  let size = end - start;
  if (size < Math.PI) {
    let x = ((measured.height / 2) + padding) / Math.tan(size / 2);
    if (x > innerRadius) {
      maxWidth = outerRadius - x - (padding * 2);
    }
  }
  if (maxWidth < 0) {
    return null;
  }

  let middle = (start + end) / 2;
  let PI2 = Math.PI * 2;
  middle = ((middle % PI2) + PI2) % PI2; // normalize
  let r = outerRadius - padding;
  let bounds = {
    x: Math.sin(middle) * r,
    y: -Math.cos(middle) * r,
    width: maxWidth,
    height: 0
  };
  if (middle < Math.PI) {
    bounds.angle = middle - (Math.PI / 2);
    bounds.anchor = 'end';
  } else {
    bounds.angle = middle + (Math.PI / 2);
    bounds.anchor = 'start';
  }
  return bounds;
}

function getFullCircleRect({ innerRadius, outerRadius, measured, padding }) {
  let { width, height } = measured;
  let r = innerRadius !== 0 ? innerRadius : outerRadius;
  let h = (height / 2) + padding;
  let maxWidth = 2 * (Math.sqrt((r * r) + (h * h)) - padding);
  width = Math.min(width, maxWidth);

  if (width <= 0) { return null; }

  let bounds = {
    x: -width / 2,
    y: -height / 2,
    width,
    height
  };
  return bounds;
}

function cbContext(node, chart) {
  return {
    node,
    data: node.data,
    scale: chart.scale,
    formatter: chart.formatter,
    dataset: chart.dataset
  };
}

function placeTextOnPoint(rect, text, opts) {
  const label = {
    type: 'text',
    text,
    maxWidth: rect.width,
    x: rect.x,
    y: rect.y + (rect.height / 2),
    fill: opts.fill,
    anchor: rect.anchor || 'start',
    baseline: 'middle',
    fontSize: `${opts.fontSize}px`,
    fontFamily: opts.fontFamily
  };

  if (!isNaN(rect.angle)) {
    let angle = rect.angle * (360 / (Math.PI * 2));
    label.transform = `rotate(${angle}, ${label.x}, ${label.y})`;
  }

  return label;
}

export function getSliceRect({ slice, direction, position, padding, measured }) {
  let {
    start,
    end,
    innerRadius,
    outerRadius,
    offset
  } = slice;

  let bounds;
  if (start + (Math.PI * 2) === end) {
    // TODO: fix case where there are multiple labels.
    bounds = getFullCircleRect({
      innerRadius,
      outerRadius,
      measured,
      padding
    });
  } else {
    let s;
    switch (position) {
      case 'inside':
        s = {
          start,
          end,
          innerRadius,
          outerRadius
        };
        if (direction === 'rotate') {
          bounds = getRotatedInsideSliceRect({ slice: s, measured, padding });
        } else {
          bounds = getHorizontalInsideSliceRect({ slice: s, measured, padding });
        }
        break;
      case 'opposite':
        s = {
          start,
          end,
          innerRadius: 0,
          outerRadius: innerRadius
        };
        if (direction === 'rotate') {
          bounds = getRotatedInsideSliceRect({ slice: s, measured, padding });
        } else {
          bounds = getHorizontalInsideSliceRect({ slice: s, measured, padding });
        }
        break;
      case 'outside':
      default:
        throw new Error('not implemented');
    }
  }
  if (bounds) {
    bounds.x += offset.x;
    bounds.y += offset.y;
  }
  return bounds;
}

function findBestPlacement({
  direction,
  lblStngs,
  measured,
  node,
  placementSettings,
  rect
}, sliceRect = getSliceRect) {
  for (let p = 0; p < placementSettings.length; p++) {
    let placement = placementSettings[p];
    let bounds = sliceRect({
      slice: node.desc.slice,
      view: rect,
      direction,
      position: placement.position,
      measured,
      padding: placement.padding
    });

    if (!bounds) {
      continue;
    }

    return { bounds, placement };
  }
  return { bounds: null, placement: null };
}

/**
 * @typedef {object} component--labels~slices-label-strategy
 *
 */

/**
 * @typedef {object} component--labels~slices-label-strategy.settings
 * @property {string|function} [direction='horizontal'] - The direction of the text: 'horizontal' or 'rotated'.
 * @property {string} [fontFamily='Arial']
 * @property {number} [fontSize=12]
 * @property {Array<object>} labels
 * @property {string|function} labels[].label - The text value
 * @property {Array<object>} labels[].placements
 * @property {string} labels[].placements[].position - 'inside' | 'outside' | 'opposite' (outside is not implmented yet)
 * @property {string} [labels[].placements[].fill='#333'] - Color of the label
 */

export function slices({
  settings,
  chart,
  nodes,
  rect,
  renderer,
  style
}, findPlacement = findBestPlacement,
  placer = placeTextOnPoint) {
  const defaults = extend({
    fontSize: 12,
    fontFamily: 'Arial',
    fill: '#333',
    padding: 4
  }, style.label);

  defaults.fontSize = parseInt(defaults.fontSize, 10);

  const labelSettings = settings.labels.map(labelSetting =>
    extend({}, defaults, settings, labelSetting)
  );

  const placementSettings = settings.labels.map(labelSetting =>
    labelSetting.placements.map(placement =>
      extend({}, defaults, settings, labelSetting, placement)
    )
  );

  const labelStruct = {};
  const labels = [];

  for (let i = 0, len = nodes.length; i < len; i++) {
    let node = nodes[i];
    let arg = cbContext(node, chart);

    for (let j = 0; j < labelSettings.length; j++) {
      let lblStngs = labelSettings[j];
      let text = typeof lblStngs.label === 'function' ? lblStngs.label(arg, i) : '';
      if (!text) {
        continue;
      }
      let direction = typeof lblStngs.direction === 'function' ? lblStngs.direction(arg, i) : lblStngs.direction || 'horizontal';

      labelStruct.fontFamily = lblStngs.fontFamily;
      labelStruct.fontSize = `${lblStngs.fontSize}px`;
      labelStruct.text = text;

      let measured = renderer.measureText(labelStruct);

      const bestPlacement = findPlacement({
        direction,
        lblStngs,
        measured,
        node,
        placementSettings: placementSettings[j],
        rect
      });

      let bounds = bestPlacement.bounds;
      let placement = bestPlacement.placement;

      if (bounds && placement) {
        let fill = typeof placement.fill === 'function' ? placement.fill(arg, i) : placement.fill;

        let label = placer(bounds, text, {
          fill,
          fontSize: lblStngs.fontSize,
          fontFamily: lblStngs.fontFamily,
          textMetrics: measured
        });

        if (label) {
          labels.push(label);
        }
      }
    }
  }

  return labels;
}
