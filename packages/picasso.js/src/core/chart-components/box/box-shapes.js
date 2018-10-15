import extend from 'extend';
import { resolveDiff } from './box-math';

import { isNumber } from '../../utils/is-number';

/**
 * Out of bounds shape
 * @param {object} params parameters
 * @param {object} params.item Resolved styling item from box component with item.major
 * @param {number} params.value 0 or 1 depending on where to render the oob shape
 * @param {number} params.boxWidth Un-calculated box width in relative/normalized format
 * @param {number} params.boxPadding Un-calculated box padding in relative/normalized format
 * @param {number} params.rendwidth The pixel width of the area to render upon
 * @param {number} params.rendheight The pixel height of the area to render upon
 * @param {boolean} params.flipXY Wether or not to flip X and Y coordinates together with Width and Height
 * @param {function} params.symbol Symbol library function from component
 * @ignore
 */
export function oob({
  item, value, boxWidth, boxPadding, rendwidth, rendheight, flipXY, symbol
}) {
  let x = 'x';
  let y = 'y';
  let calcwidth = rendwidth;
  let calcheight = rendheight;

  if (flipXY) {
    x = 'y';
    y = 'x';
    calcwidth = rendheight;
    calcheight = rendwidth;
  }

  return symbol(extend({}, item.oob, {
    [x]: (boxPadding + item.major + (boxWidth / 2)) * calcwidth,
    [y]: Math.max((item.oob.size / 2), Math.min(value * calcheight, calcheight - (item.oob.size / 2))),
    startAngle: value < 0.5 ? 90 : -90
  }));
}

/**
 * Box shape calculation function
 * @param {object} params parameters
 * @param {object} params.item Resolved styling item from box component with item.major
 * @param {number} params.boxWidth Un-calculated box width in relative/normalized format
 * @param {number} params.boxPadding Un-calculated box padding in relative/normalized format
 * @param {number} params.rendwidth The pixel width of the area to render upon
 * @param {number} params.rendheight The pixel height of the area to render upon
 * @param {boolean} params.flipXY wether or not to flip X and Y coordinates together with Width and Height
 * @ignore
 */
export function box({
  item, boxWidth, boxPadding, rendwidth, rendheight, flipXY
}) {
  let x = 'x';
  let y = 'y';
  let width = 'width';
  let height = 'height';
  let calcwidth = rendwidth;
  let calcheight = rendheight;

  if (flipXY) {
    x = 'y';
    y = 'x';
    width = 'height';
    height = 'width';
    calcwidth = rendheight;
    calcheight = rendwidth;
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
 * @param {number} params.rendwidth The pixel width of the area to render upon
 * @param {number} params.rendheight The pixel height of the area to render upon
 * @param {boolean} params.flipXY wether or not to flip X and Y coordinates together with Width and Height
 * @ignore
 */
export function verticalLine({
  item, from, to, boxCenter, rendwidth, rendheight, flipXY
}) {
  let x1 = 'x1';
  let y1 = 'y1';
  let x2 = 'x2';
  let y2 = 'y2';
  let calcwidth = rendwidth;
  let calcheight = rendheight;

  if (flipXY) {
    x1 = 'y1';
    y1 = 'x1';
    x2 = 'y2';
    y2 = 'x2';
    calcwidth = rendheight;
    calcheight = rendwidth;
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
 * @param {number} params.rendwidth The pixel width of the area to render upon
 * @param {number} params.rendheight The pixel height of the area to render upon
 * @param {boolean} params.flipXY wether or not to flip X and Y coordinates together with Width and Height
 * @ignore
 */
export function horizontalLine({
  item, key, position, width, boxCenter, rendwidth, rendheight, flipXY
}) {
  let x1 = 'x1';
  let y1 = 'y1';
  let x2 = 'x2';
  let y2 = 'y2';
  let calcwidth = rendwidth;
  let calcheight = rendheight;

  if (flipXY) {
    x1 = 'y1';
    y1 = 'x1';
    x2 = 'y2';
    y2 = 'x2';
    calcwidth = rendheight;
    calcheight = rendwidth;
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
  const boxWidth = Math.min(bandwidth * item.box.width, isNaN(item.box.maxWidthPx) ? maxMajorWidth : item.box.maxWidthPx / maxMajorWidth);
  return isNaN(item.box.minWidthPx) ? boxWidth : Math.max(item.box.minWidthPx / maxMajorWidth, boxWidth);
}

export function buildShapes({
  width,
  height,
  flipXY,
  resolved,
  keys,
  symbol
}) {
  // if (!settings || !settings.major || !settings.major.scale || !settings.minor || !settings.minor.scale) {
  //   return [];
  // }

  const output = [];

  let major = null;
  const items = resolved.major.items;

  for (let i = 0, len = items.length; i < len; i++) {
    const d = items[i].data;
    let children = [];

    let majorVal = null;
    let majorEndVal = null;

    if (typeof resolved.major.settings.binStart !== 'undefined') { // if start and end is defined
      majorVal = resolved.major.items[i].binStart;
      majorEndVal = resolved.major.items[i].binEnd;
      major = resolved.major.settings.binStart.scale;
    } else {
      major = resolved.major.settings.major.scale;
      majorVal = major ? resolved.major.items[i].major : 0;
    }

    let bandwidth = 0;
    if (!major) {
      bandwidth = 1;
    } else if (major.bandwidth) {
      bandwidth = major.bandwidth();
      majorVal -= (bandwidth / 2);
    } else {
      bandwidth = majorEndVal - majorVal;
    }

    let item = extend({}, {
      major: majorVal,
      majorEnd: majorEndVal
    }, resolved.minor.items[i]);

    keys.forEach(key => (item[key] = resolved[key].items[i]));

    const maxMajorWidth = flipXY ? height : width;
    const boxWidth = getBoxWidth(bandwidth, item, maxMajorWidth);
    const boxPadding = (bandwidth - boxWidth) / 2;
    const boxCenter = boxPadding + item.major + (boxWidth / 2);

    const rendwidth = width;
    const rendheight = height;


    const allValidValues = [item.min, item.start, item.med, item.end, item.max].filter(v => typeof v === 'number' && !Number.isNaN(v));

    const isLowerOutOfBounds = Math.min(...allValidValues) < 0 && Math.max(...allValidValues) < 0;
    const isHigherOutOfBounds = Math.min(...allValidValues) > 1 && Math.max(...allValidValues) > 1;
    const isOutOfBounds = isLowerOutOfBounds || isHigherOutOfBounds;

    /* OUT OF BOUNDS */
    if (item.oob.show && isLowerOutOfBounds) {
      children.push(oob({
        item, value: 0, boxWidth, boxPadding, rendwidth, rendheight, flipXY, symbol
      }));
    }

    if (item.oob.show && isHigherOutOfBounds) {
      children.push(oob({
        item, value: 1, boxWidth, boxPadding, rendwidth, rendheight, flipXY, symbol
      }));
    }

    /* THE BOX */
    if (!isOutOfBounds && item.box.show && isNumber(item.start) && isNumber(item.end)) {
      children.push(box({
        item, boxWidth, boxPadding, rendwidth, rendheight, flipXY
      }));
    }

    /* LINES MIN - START, END - MAX */
    if (!isOutOfBounds && item.line.show && isNumber(item.min) && isNumber(item.start)) {
      children.push(verticalLine({
        item, from: item.min, to: item.start, boxCenter, rendwidth, rendheight, flipXY
      }));
    }

    if (!isOutOfBounds && item.line.show && isNumber(item.max) && isNumber(item.end)) {
      children.push(verticalLine({
        item, from: item.max, to: item.end, boxCenter, rendwidth, rendheight, flipXY
      }));
    }

    /* MEDIAN */
    if (!isOutOfBounds && item.median.show && isNumber(item.med)) {
      children.push(horizontalLine({
        item, key: 'median', position: item.med, width: boxWidth, boxCenter, rendwidth, rendheight, flipXY
      }));
    }

    /* WHISKERS */
    if (!isOutOfBounds && item.whisker.show) {
      const whiskerWidth = boxWidth * item.whisker.width;

      if (isNumber(item.min)) {
        children.push(horizontalLine({
          item, key: 'whisker', position: item.min, width: whiskerWidth, boxCenter, rendwidth, rendheight, flipXY
        }));
      }

      if (isNumber(item.max)) {
        children.push(horizontalLine({
          item, key: 'whisker', position: item.max, width: whiskerWidth, boxCenter, rendwidth, rendheight, flipXY
        }));
      }
    }

    const container = {
      type: 'container',
      data: d,
      collider: { type: 'bounds' },
      children
    };

    output.push(container);
  }

  return output;
}
