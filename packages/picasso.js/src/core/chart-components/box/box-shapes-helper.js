import extend from 'extend';
import { resolveDiff } from './box-math';

/**
 * Out of bounds shape
 * @param {object} params parameters
 * @param {object} params.item Resolved styling item from box component with item.major
 * @param {number} params.value 0 or 1 depending on where to render the oob shape
 * @param {number} params.boxWidth Un-calculated box width in relative/normalized format
 * @param {number} params.boxPadding Un-calculated box padding in relative/normalized format
 * @param {number} params.rendWidth The pixel width of the area to render upon
 * @param {number} params.rendHeight The pixel height of the area to render upon
 * @param {boolean} params.flipXY Wether or not to flip X and Y coordinates together with Width and Height
 * @param {function} params.symbol Symbol library function from component
 * @ignore
 */
export function oob({
  item, value, boxCenter, rendWidth, rendHeight, flipXY, symbol
}) {
  let x = 'x';
  let y = 'y';
  let calcwidth = rendWidth;
  let calcheight = rendHeight;
  let startAngle = value < 0.5 ? 90 : -90;

  if (flipXY) {
    x = 'y';
    y = 'x';
    calcwidth = rendHeight;
    calcheight = rendWidth;
    startAngle = value < 0.5 ? 180 : 0;
  }

  return symbol(extend({}, item.oob, {
    [x]: boxCenter * calcwidth,
    [y]: Math.max((item.oob.size / 2), Math.min(value * calcheight, calcheight - (item.oob.size / 2))),
    startAngle
  }));
}

/**
 * Box shape calculation function
 * @param {object} params parameters
 * @param {object} params.item Resolved styling item from box component with item.major
 * @param {number} params.boxWidth Un-calculated box width in relative/normalized format
 * @param {number} params.boxPadding Un-calculated box padding in relative/normalized format
 * @param {number} params.rendWidth The pixel width of the area to render upon
 * @param {number} params.rendHeight The pixel height of the area to render upon
 * @param {boolean} params.flipXY wether or not to flip X and Y coordinates together with Width and Height
 * @ignore
 */
export function box({
  item, boxWidth, boxPadding, rendWidth, rendHeight, flipXY
}) {
  let x = 'x';
  let y = 'y';
  let width = 'width';
  let height = 'height';
  let calcwidth = rendWidth;
  let calcheight = rendHeight;

  if (flipXY) {
    x = 'y';
    y = 'x';
    width = 'height';
    height = 'width';
    calcwidth = rendHeight;
    calcheight = rendWidth;
  }

  const { actualDiff, actualLow } = resolveDiff({
    start: item.start, end: item.end, minPx: item.box.minHeightPx, maxPx: calcheight
  });

  return extend({}, item.box, {
    type: 'rect',
    [x]: (boxPadding + item.major) * calcwidth,
    [y]: actualLow,
    [height]: actualDiff,
    [width]: boxWidth * calcwidth,
    data: item.data || {},
    collider: {
      type: null
    }
  });
}

/**
 * A vertical line shape (for start - min, end - max values)
 * @param {object} params parameters
 * @param {object} params.item Resolved styling item from box component with item.major
 * @param {number} params.from Normalized from value
 * @param {number} params.to Normalized to value
 * @param {number} params.boxCenter Center coordinate for the box
 * @param {number} params.rendWidth The pixel width of the area to render upon
 * @param {number} params.rendHeight The pixel height of the area to render upon
 * @param {boolean} params.flipXY wether or not to flip X and Y coordinates together with Width and Height
 * @ignore
 */
export function verticalLine({
  item, from, to, boxCenter, rendWidth, rendHeight, flipXY
}) {
  let x1 = 'x1';
  let y1 = 'y1';
  let x2 = 'x2';
  let y2 = 'y2';
  let calcwidth = rendWidth;
  let calcheight = rendHeight;

  if (flipXY) {
    x1 = 'y1';
    y1 = 'x1';
    x2 = 'y2';
    y2 = 'x2';
    calcwidth = rendHeight;
    calcheight = rendWidth;
  }

  return extend({}, item.line, {
    type: 'line',
    [y2]: Math.floor(from * calcheight),
    [x1]: boxCenter * calcwidth,
    [y1]: Math.floor(to * calcheight),
    [x2]: boxCenter * calcwidth,
    data: item.data || {},
    collider: {
      type: null
    }
  });
}

/**
 * A horizontal line shape (for median and whiskers)
 * @param {object} params parameters
 * @param {object} params.item Resolved styling item from box component with item.major
 * @param {string} params.key Which key to use as style base in the item object
 * @param {number} params.position At which "height" (X) to position the horizontal line
 * @param {number} params.width Width of the horizontal line (i.e. box width or a multiple of it)
 * @param {number} params.boxCenter Center coordinate for the box
 * @param {number} params.rendWidth The pixel width of the area to render upon
 * @param {number} params.rendHeight The pixel height of the area to render upon
 * @param {boolean} params.flipXY wether or not to flip X and Y coordinates together with Width and Height
 * @ignore
 */
export function horizontalLine({
  item, key, position, width, boxCenter, rendWidth, rendHeight, flipXY
}) {
  let x1 = 'x1';
  let y1 = 'y1';
  let x2 = 'x2';
  let y2 = 'y2';
  let calcwidth = rendWidth;
  let calcheight = rendHeight;

  if (flipXY) {
    x1 = 'y1';
    y1 = 'x1';
    x2 = 'y2';
    y2 = 'x2';
    calcwidth = rendHeight;
    calcheight = rendWidth;
  }

  const halfWidth = width / 2;

  return extend({ type: 'line' }, item[key], {
    [y1]: Math.floor(position * calcheight),
    [x1]: (boxCenter - halfWidth) * calcwidth,
    [y2]: Math.floor(position * calcheight),
    [x2]: (boxCenter + halfWidth) * calcwidth,
    r: halfWidth * calcwidth,
    cx: boxCenter * calcwidth,
    cy: position * calcheight,
    width: width * calcwidth,
    data: item.data || {},
    collider: {
      type: null
    }
  });
}

/**
 * A horizontal line shape (for median and whiskers)
 * @param {number} bandwidth The current bandwidth for this item
 * @param {object} item A resolved style item to render with major and box width variables, minWidthPx and maxWidthPx
 * @param {number} maxMajorWidth The actual maximum major width
 * @ignore
 */
export function getBoxWidth(bandwidth, item, maxMajorWidth) {
  const { width, maxWidthPx, minWidthPx } = item.box;
  const sign = bandwidth >= 0 ? 1 : -1;
  let boxWidth = Math.min(sign * bandwidth * width, isNaN(maxWidthPx) ? maxMajorWidth : maxWidthPx / maxMajorWidth);
  boxWidth = isNaN(minWidthPx) ? boxWidth : Math.max(minWidthPx / maxMajorWidth, boxWidth);
  return boxWidth * sign;
}
