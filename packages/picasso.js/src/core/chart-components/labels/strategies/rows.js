import extend from 'extend';

const LINE_HEIGHT = 1.2;

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
    maxWidth: rect.width,
    x: 0,
    y: rect.y,
    dx: 0,
    dy: 0,
    fill: opts.fill,
    anchor: 'start',
    baseline: 'alphabetical',
    fontSize: `${opts.fontSize}px`,
    fontFamily: opts.fontFamily
  };

  const textMetrics = opts.textMetrics;

  if (rect.width < opts.fontSize) {
    return false;
  }

  const wiggleWidth = Math.max(0, rect.width - textMetrics.width);
  label.x = rect.x + (opts.align * wiggleWidth);
  label.y = rect.y + (textMetrics.height / LINE_HEIGHT);

  return label;
}

function getRectFromCircle({ cx, cy, r }) {
  let halfSide = r / Math.SQRT2;
  return {
    x: cx - halfSide,
    y: cy - halfSide,
    width: 2 * halfSide,
    height: 2 * halfSide
  };
}
function getSliceRect(slice) {
  let { start, end, innerRadius, outerRadius, offset } = slice;
  if (start + (2 * Math.PI) !== end) { return null; }
  let r = innerRadius !== 0 ? innerRadius : outerRadius;
  return getRectFromCircle({ cx: offset.x, cy: offset.y, r });
}

function getBounds(node) {
  if (node.desc && node.desc.slice) {
    return getSliceRect(node.desc.slice);
  }
  if (node.type === 'circle') {
    return getRectFromCircle(node.attrs);
  }
  if (node.type === 'rect') {
    return node.bounds;
  }
  // defualt to node.bounds ?
  return null;
}

/**
 * @typedef {object} component--labels~rows-label-strategy
 *
 */

/**
 * @typedef {object} component--labels~rows-label-strategy.settings
 * @property {string} [fontFamily='Arial']
 * @property {number} [fontSize=12]
 * @property {number} [justify=0.5]
 * @property {number} [padding=4]
 * @property {Array<object>} labels
 * @property {string|function} labels[].label - The text value
 * @property {number} [labels[].align=0.5]
 * @property {string|function} [labels[].fill='#333']
 */

export function rows({
  settings,
  chart,
  nodes,
  renderer,
  style
}, placer = placeTextInRect) {
  const defaults = extend({
    fontSize: 12,
    fontFamily: 'Arial',
    fill: '#333',
    padding: 4,
    align: 0.5,
    justify: 0.5
  }, style.label);

  defaults.fontSize = parseInt(defaults.fontSize, 10);

  const rowSettings = extend({}, defaults, settings);

  const labelSettings = settings.labels.map(labelSetting =>
    extend({}, rowSettings, labelSetting)
  );

  const labelStruct = {};
  const labels = [];

  for (let i = 0, len = nodes.length; i < len; i++) {
    let node = nodes[i];
    let arg = cbContext(node, chart);

    let bounds = getBounds(node);
    if (!bounds) {
      continue;
    }

    let totalHeight = 0;
    let measurements = [];
    let texts = [];

    totalHeight += rowSettings.padding;
    let j;
    for (j = 0; j < labelSettings.length; j++) {
      let lblStngs = labelSettings[j];
      let text = typeof lblStngs.label === 'function' ? lblStngs.label(arg, i) : '';
      if (!text) {
        continue;
      }

      labelStruct.fontFamily = lblStngs.fontFamily;
      labelStruct.fontSize = `${lblStngs.fontSize}px`;
      labelStruct.text = text;
      let measured = renderer.measureText(labelStruct);
      totalHeight += measured.height + lblStngs.padding;
      if (totalHeight > bounds.height) { break; }
      texts.push(text);
      measurements.push(measured);
    }

    const labelCount = j;
    const wiggleHeight = Math.max(0, bounds.height - totalHeight);
    let yOffset = rowSettings.justify * wiggleHeight;

    for (j = 0; j < labelCount; j++) {
      let lblStngs = labelSettings[j];
      let rect = {
        x: bounds.x + rowSettings.padding,
        y: bounds.y + yOffset + rowSettings.padding,
        width: bounds.width - (2 * rowSettings.padding),
        height: measurements[j].height
      };
      yOffset += measurements[j].height + rowSettings.padding;
      let fill = typeof lblStngs.fill === 'function' ? lblStngs.fill(arg, i) : lblStngs.fill;
      let label = placer(rect, texts[j], {
        fill,
        align: lblStngs.align,
        fontSize: lblStngs.fontSize,
        fontFamily: lblStngs.fontFamily,
        textMetrics: measurements[j]
      });
      if (label) {
        labels.push(label);
      }
    }
  }

  return labels;
}
