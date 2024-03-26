import extend from 'extend';

import { ellipsText } from '../../../../web/text-manipulation';
import { ELLIPSIS_CHAR } from '../../../../web/text-manipulation/text-const';

const LINE_HEIGHT = 1.2;
const CIRCLE_FACTOR = 0.9;

function cbContext(node, chart) {
  return {
    node,
    data: node.data,
    scale: chart.scale,
    formatter: chart.formatter,
    dataset: chart.dataset,
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
    fontFamily: opts.fontFamily,
  };

  const textMetrics = opts.textMetrics;

  if (rect.width < opts.fontSize) {
    return false;
  }

  const wiggleWidth = Math.max(0, rect.width - textMetrics.width);
  label.x = rect.x + opts.align * wiggleWidth;
  label.y = rect.y + textMetrics.height / LINE_HEIGHT;

  return label;
}

function getRectFromCircle({ cx, cy, r }) {
  return {
    type: 'circle',
    bounds: { cx, cy, r },
  };
}
function getSliceBounds(slice) {
  const EPSILON = 1e-12;
  let { start, end, innerRadius, outerRadius, offset } = slice;
  if (Math.abs(start + 2 * Math.PI - end) > EPSILON) {
    return { type: null, bounds: null };
  }
  let r = innerRadius !== 0 ? innerRadius : outerRadius;
  return getRectFromCircle({ cx: offset.x, cy: offset.y, r });
}

function getBounds(node) {
  if (node.desc && node.desc.slice) {
    return getSliceBounds(node.desc.slice);
  }
  if (node.type === 'circle') {
    return getRectFromCircle(node.attrs);
  }
  if (node.type === 'rect') {
    return { type: 'rect', bounds: node.bounds };
  }
  // defualt to node.bounds ?
  return { type: null, bounds: null };
}

const calculateRect = (type, currentY, bounds, measurement, rowSettings) => {
  if (type !== 'circle') {
    return {
      x: bounds.x + rowSettings.padding,
      y: currentY,
      width: bounds.width - 2 * rowSettings.padding,
      height: measurement.height,
    };
  }

  let maxYDistToCenter = Math.max(Math.abs(currentY - bounds.cy), Math.abs(currentY + measurement.height - bounds.cy));
  let halfWidth = Math.sqrt(bounds.r * bounds.r - maxYDistToCenter * maxYDistToCenter);
  return {
    x: bounds.cx - halfWidth + rowSettings.padding,
    y: currentY,
    width: 2 * halfWidth - 2 * rowSettings.padding,
    height: measurement.height,
  };
};

const getLabelProp = (label, renderer, linkData) => {
  if (label && label?.text !== ELLIPSIS_CHAR) {
    const ellipsed = ellipsText(label, renderer.measureText);
    // don't include label if it's only an ellipsis
    if (ELLIPSIS_CHAR !== ellipsed) {
      label.ellipsed = ellipsed;
    }
  }
  if (label && typeof linkData !== 'undefined') {
    label.data = linkData;
  }
  return label;
};

const setHeight = (type, bounds) => ({
  maxHeight: type === 'circle' ? 2 * bounds.r * CIRCLE_FACTOR : bounds.height,
  totalHeight: 0,
});

const getMeasurements = (labelConfig, labelSetting, text, renderer) => {
  labelConfig.fontFamily = labelSetting.fontFamily;
  labelConfig.fontSize = `${labelSetting.fontSize}px`;
  labelConfig.text = text;
  return renderer.measureText(labelConfig);
};

const getLabelStructure = (labelConfig, settingIndex, labelSettings, renderer, height, arg, nodeIndex) => {
  const texts = [];
  const measurements = [];
  for (settingIndex = 0; settingIndex < labelSettings.length; settingIndex++) {
    const text =
      typeof labelSettings[settingIndex].label === 'function' ? labelSettings[settingIndex].label(arg, nodeIndex) : '';
    const measurement = getMeasurements(labelConfig, labelSettings[settingIndex], text, renderer);
    height.totalHeight += measurement.height + labelSettings[settingIndex].padding;

    if (height.totalHeight > height.maxHeight) {
      break;
    }
    texts.push(text);
    measurements.push(measurement);
  }
  return { texts, measurements, settingIndex };
};

const getCurrentY = (height, bounds, type, rowSettings) => {
  const wiggleHeight = Math.max(0, height.maxHeight - height.totalHeight);
  let currentY = type === 'circle' ? bounds.cy - bounds.r * CIRCLE_FACTOR : bounds.y;
  currentY += rowSettings.justify * wiggleHeight + rowSettings.padding;
  return currentY;
};

const setLabels = (
  labels,
  height,
  bounds,
  type,
  rowSettings,
  labelSettings,
  labelStructure,
  placer,
  renderer,
  arg,
  index
) => {
  let currentY = getCurrentY(height, bounds, type, rowSettings);
  for (let j = 0; j < labelStructure.settingIndex; j++) {
    let rect = calculateRect(type, currentY, bounds, labelStructure.measurements[j], rowSettings);
    currentY += labelStructure.measurements[j].height + rowSettings.padding;
    let fill = typeof labelSettings[j].fill === 'function' ? labelSettings[j].fill(arg, index) : labelSettings[j].fill;
    const linkData =
      typeof labelSettings[j].linkData === 'function' ? labelSettings[j].linkData(arg, index) : undefined;
    let label = placer(rect, labelStructure.texts[j], {
      fill,
      align: labelSettings[j].align,
      fontSize: labelSettings[j].fontSize,
      fontFamily: labelSettings[j].fontFamily,
      textMetrics: labelStructure.measurements[j],
    });
    const lbl = getLabelProp(label, renderer, linkData);
    labels.push(lbl);
  }
  return labels;
};

/**
 * @typedef {object} ComponentLabels~RowsLabelStrategy
 * @property {'rows'} type Name of strategy
 */

/**
 * Rows strategy settings
 * @typedef {object} ComponentLabels~RowsLabelStrategy.settings
 * @property {string} [fontFamily='Arial']
 * @property {number} [fontSize=12]
 * @property {number} [justify=0.5]
 * @property {number} [padding=4]
 * @property {Array<object>} labels
 * @property {string|function} labels[].label - The text value
 * @property {function} labels[].linkData - Link data to the label
 * @property {number} [labels[].align=0.5]
 * @property {string|function} [labels[].fill='#333']
 */

export function rows({ settings, chart, nodes, renderer, style }, placer = placeTextInRect) {
  const defaults = extend(
    {
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#333',
      padding: 4,
      align: 0.5,
      justify: 0.5,
    },
    style.label
  );

  defaults.fontSize = parseInt(defaults.fontSize, 10);

  const rowSettings = extend({}, defaults, settings);

  const labelSettings = settings.labels.map((labelSetting) => extend({}, rowSettings, labelSetting));
  const labelConfig = {};

  let labels = [];
  let allLabels = [];
  for (let nodeIndex = 0, len = nodes.length; nodeIndex < len; nodeIndex++) {
    let node = nodes[nodeIndex];
    let arg = cbContext(node, chart);

    let { type, bounds } = getBounds(node);
    if (!bounds) {
      continue;
    }

    let settingIndex;
    const height = setHeight(type, bounds);
    const labelStructure = getLabelStructure(
      labelConfig,
      settingIndex,
      labelSettings,
      renderer,
      height,
      arg,
      nodeIndex
    );
    allLabels = setLabels(
      labels,
      height,
      bounds,
      type,
      rowSettings,
      labelSettings,
      labelStructure,
      placer,
      renderer,
      arg,
      nodeIndex
    );
  }
  return allLabels;
}
