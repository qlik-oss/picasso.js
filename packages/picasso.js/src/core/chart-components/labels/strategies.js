import extend from 'extend';
import collisions from '../../math/narrow-phase-collision';

const LINE_HEIGHT = 1.5;
const PADDING = 4;
// const DOUBLE_PADDING = PADDING * 2;

function cbContext(node, chart) {
  return {
    node,
    data: node.data,
    scale: chart.scale,
    formatter: chart.formatter,
    dataset: chart.dataset
  };
}

export function placeTextInRect(rect, text, opts) {
  const label = {
    type: 'text',
    text,
    maxWidth: opts.rotate ? rect.height : rect.width,
    x: 0,
    y: rect.y,
    dx: 0,
    dy: 0,
    fill: opts.fill,
    anchor: opts.rotate ? 'end' : 'start',
    baseline: 'alphabetical',
    fontSize: `${opts.fontSize}px`,
    fontFamily: opts.fontFamily
  };

  const textMetrics = opts.textMetrics;

  if (rect.width < opts.fontSize || rect.height < textMetrics.height) {
    return false;
  }

  if (opts.rotate) {
    const wiggleHor = Math.max(0, rect.width - (textMetrics.height / (LINE_HEIGHT * 0.8)));
    const wiggleVert = Math.max(0, rect.height - textMetrics.width);
    label.x = rect.x + (textMetrics.height / LINE_HEIGHT) + (opts.align * wiggleHor);
    label.y = rect.y + (opts.justify * wiggleVert);
    label.transform = `rotate(-90, ${label.x + label.dx}, ${label.y + label.dy})`;
  } else {
    const wiggleWidth = Math.max(0, rect.width - textMetrics.width);
    const wiggleHeight = Math.max(0, rect.height - (textMetrics.height / (LINE_HEIGHT * 0.8))); // 0.8 - MAGIC NUMBER - need to figure out why this works the best
    label.x = rect.x + (opts.align * wiggleWidth);
    label.y = rect.y + (textMetrics.height / LINE_HEIGHT) + (opts.justify * wiggleHeight);
  }

  return label;
}

function limitBounds(bounds, view) {
  const minY = Math.max(0, Math.min(bounds.y, view.height));
  const maxY = Math.max(0, Math.min(bounds.y + bounds.height, view.height));
  const minX = Math.max(0, Math.min(bounds.x, view.width));
  const maxX = Math.max(0, Math.min(bounds.x + bounds.width, view.width));
  bounds.x = minX;
  bounds.width = maxX - minX;
  bounds.y = minY;
  bounds.height = maxY - minY;
}

function pad(bounds, padding) {
  bounds.x += padding;
  bounds.width -= (padding * 2);
  bounds.y += padding;
  bounds.height -= (padding * 2);
}

export function getBarRect({ bar, view, direction, position, padding = PADDING }) {
  const bounds = {};
  extend(bounds, bar);

  if (!position || position === 'inside') {
    // do nothing
  } else if (direction === 'up' || direction === 'down') {
    const start = Math.max(0, Math.min(bar.y, view.height));
    const end = Math.max(0, Math.min(bar.y + bar.height, view.height));

    if ((position === 'outside' && direction === 'up') || (position === 'opposite' && direction === 'down')) {
      bounds.y = 0;
      bounds.height = start;
    } else if ((position === 'outside' && direction === 'down') || (position === 'opposite' && direction === 'up')) {
      bounds.y = end;
      bounds.height = view.height - end;
    }
  } else {
    const start = Math.max(0, Math.min(bar.x, view.width));
    const end = Math.max(0, Math.min(bar.x + bar.width, view.width));

    if ((position === 'outside' && direction === 'left') || (position === 'opposite' && direction === 'right')) {
      bounds.x = 0;
      bounds.width = start;
    } else if ((position === 'outside' && direction === 'right') || (position === 'opposite' && direction === 'left')) {
      bounds.x = end;
      bounds.width = view.width - end;
    }
  }

  limitBounds(bounds, view);
  pad(bounds, padding);

  return bounds;
}

export function findBestPlacement({
  direction,
  fitsHorizontally,
  lblStngs,
  measured,
  node,
  orientation,
  // placements,
  placementSettings,
  rect
}, barRect = getBarRect) {
  let largest;
  let bounds;
  let placement;
  let testBounds;
  let p;
  const boundaries = [];
  for (p = 0; p < placementSettings.length; p++) {
    placement = placementSettings[p];
    testBounds = barRect({
      bar: node.localBounds,
      view: rect,
      direction,
      position: placement.position
    });
    boundaries.push(testBounds);
    largest = !p || testBounds.height > largest.height ? testBounds : largest;

    if (orientation === 'v' && ((fitsHorizontally && testBounds.height > measured.height * LINE_HEIGHT) ||
      (!fitsHorizontally && testBounds.height > measured.width))) {
      bounds = testBounds;
      break;
    } else if (orientation === 'h' && (testBounds.height > measured.height) &&
      (testBounds.width > measured.width)) {
      bounds = testBounds;
      break;
    }
  }

  // fallback strategy - place the text in the largest rectangle
  if (orientation === 'v' && !fitsHorizontally && !bounds && largest.height > lblStngs.fontSize * 2) {
    bounds = largest;
    p = boundaries.indexOf(bounds);
  } else if (orientation === 'h' && !bounds && largest.height > lblStngs.fontSize * 2) {
    bounds = largest;
    p = boundaries.indexOf(bounds);
  }
  placement = placementSettings[p];

  return { bounds, placement };
}

export function placeInBars({
  chart,
  nodes,
  // stngs,
  placementSettings,
  labelSettings,
  measurements,
  texts,
  directions,
  rect,
  fitsHorizontally,
  collectiveOrientation
}, findPlacement = findBestPlacement,
  placer = placeTextInRect) {
  const labels = [];
  // const textPlacementFn = collectiveOrientation === 'h' || fitsHorizontally ? placeTextInRect : placeTextInRect;
  let label;
  let node;
  let text;
  let justify;
  let bounds;
  let fill;
  // let testBounds;
  let measured;
  let direction;
  let lblStngs;
  let nodeTexts;
  let placement;
  let placements;
  // let p;
  let arg;
  let orientation;

  for (let i = 0, len = nodes.length; i < len; i++) {
    bounds = null;
    node = nodes[i];
    arg = cbContext(node, chart);
    nodeTexts = texts[i];
    direction = directions[i];
    orientation = direction === 'left' || direction === 'right' ? 'h' : 'v';
    for (let j = 0; j < nodeTexts.length; j++) {
      text = nodeTexts[j];
      if (!text) {
        continue;
      }

      lblStngs = labelSettings[j];
      measured = measurements[i][j];
      placements = lblStngs.placements;

      const bestPlacement = findPlacement({
        direction,
        fitsHorizontally,
        lblStngs,
        measured,
        node,
        orientation,
        placements,
        placementSettings: placementSettings[j],
        rect
      });

      bounds = bestPlacement.bounds;
      placement = bestPlacement.placement;

      if (bounds && placement) {
        justify = placement.justify;
        fill = typeof placement.fill === 'function' ? placement.fill(arg, i) : placement.fill;

        if (direction === 'up') {
          justify = 1 - justify;
        }
        if (placement.position === 'opposite') {
          justify = 1 - justify;
        }

        label = placer(bounds, text, {
          fill,
          justify: orientation === 'h' ? placement.align : justify,
          align: orientation === 'h' ? justify : placement.align,
          fontSize: lblStngs.fontSize,
          fontFamily: lblStngs.fontFamily,
          textMetrics: measured,
          rotate: !(collectiveOrientation === 'h' || fitsHorizontally)
        });

        if (label) {
          labels.push(label);
        }
      }
    }
  }

  return labels;
}

export function precalculate({
  nodes,
  rect,
  chart,
  labelSettings,
  settings,
  renderer
}) {
  const measurements = [];
  const texts = [];
  const labelStruct = {};
  const directions = [];
  let fitsHorizontally = true;
  let hasHorizontalDirection = false;
  let node;
  let text;
  let bounds;
  let measured;
  let lblStng;
  let direction;

  for (let i = 0; i < nodes.length; i++) {
    node = nodes[i];
    bounds = node.localBounds;
    if (!collisions.testRectRect(bounds, rect)) {
      // Remove node if outside rendering container
      nodes.splice(i, 1);
      i--;
      continue;
    }
    texts[i] = [];
    measurements[i] = [];
    let arg = cbContext(node, chart);
    for (let j = 0; j < labelSettings.length; j++) {
      lblStng = labelSettings[j];
      text = typeof lblStng.label === 'function' ? lblStng.label(arg, i) : '';
      if (!text) {
        // Remove node if there is no label
        nodes.splice(i, 1);
        i--;
        continue; // eslint-ignore-line
      }
      direction = typeof settings.direction === 'function' ? settings.direction(arg, i) : settings.direction || 'up';
      hasHorizontalDirection = hasHorizontalDirection || direction === 'left' || direction === 'right';

      labelStruct.fontFamily = lblStng.fontFamily;
      labelStruct.fontSize = `${lblStng.fontSize}px`;
      labelStruct.text = text;

      measured = renderer.measureText(labelStruct);
      measurements[i][j] = measured;
      texts[i][j] = text;
      directions[i] = direction;
      fitsHorizontally = fitsHorizontally && measured.width <= (bounds.width - (PADDING * 2));
    }
  }

  return {
    measurements,
    texts,
    directions,
    fitsHorizontally,
    hasHorizontalDirection
  };
}

/**
 * @typedef {object} component--labels~label-strategy
 *
 */

/**
 * @typedef {object} component--labels~label-strategy.settings
 * @property {string|function} [direction='up'] - The direction in which the bars are growing: 'up', 'down', 'right' or 'left'.
 * @property {string} [fontFamily='Arial']
 * @property {number} [fontSize=12]
 * @property {Array<object>} labels
 * @property {string|function} labels[].label - The text value
 * @property {Array<object>} labels[].placements
 * @property {string} labels[].placements[].position - 'inside' | 'outside' | 'opposite'
 * @property {number} [labels[].placements[].justify=0] - Placement of the label along the direction of the bar
 * @property {number} [labels[].placements[].align=0.5] - Placement of the label along the perpendicular direction of the bar
 * @property {string} [labels[].placements[].fill='#333'] - Color of the label
 */

export function bars({
  settings,
  chart,
  nodes,
  rect,
  renderer,
  style
}, placer = placeInBars) {
  const defaults = extend({
    fontSize: 12,
    fontFamily: 'Arial',
    align: 0.5,
    justify: 0,
    fill: '#333'
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

  const {
    texts,
    measurements,
    fitsHorizontally,
    hasHorizontalDirection,
    directions
  } = precalculate({
    nodes,
    chart,
    renderer,
    settings,
    rect,
    labelSettings
  });

  return placer({
    chart,
    nodes,
    texts,
    directions,
    measurements,
    stngs: settings,
    placementSettings,
    labelSettings,
    rect,
    fitsHorizontally,
    collectiveOrientation: hasHorizontalDirection ? 'h' : 'v'
  });
}
