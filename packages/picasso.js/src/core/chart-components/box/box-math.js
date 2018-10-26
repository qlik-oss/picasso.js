import extend from 'extend';

/**
 * Short-hand for max(min())
 *
 * @param {number} min Minimum allowed value
 * @param {number} max Maximum allowed value
 * @param {number} value The actual value to cap
 * @ignore
 */
export function cap(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Resolve a diff, i.e. resolveDiff(0.2, 0.6, 1, 100) = 20
 *
 * @param {object} params parameters
 * @param {number} params.start Normalized start value
 * @param {number} params.end Normalized end value
 * @param {number} params.minPx The minimum number of pixels
 * @param {number} params.maxPx Maximum number of pixels, i.e. the width or height
 * @ignore
 */
export function resolveDiff({
  start, end, minPx = 0.1, maxPx = 1
}) {
  const high = Math.max(start, end);
  const low = Math.min(start, end);
  const highModified = cap(-0.1, 1.2, high);
  const lowModified = cap(-0.1, 1.2, low);

  const wantedDiff = (highModified * maxPx) - (lowModified * maxPx);
  const actualDiff = Math.max(minPx, wantedDiff);
  const startModifier = (actualDiff - wantedDiff) / 2;
  const actualLow = (lowModified * maxPx) - startModifier;

  return {
    actualDiff,
    startModifier,
    actualLow
  };
}

/**
 * A horizontal line shape (for median and whiskers)
 * @param {number} bandwidth The current bandwidth for this item
 * @param {object} item A resolved style item to render with major and box width variables, minWidthPx and maxWidthPx
 * @param {number} maxMajorWidth The actual maximum major width
 * @ignore
 */
export function getBoxWidth({
  bandwidth, width, minWidthPx, maxWidthPx, maxMajorWidth
}) {
  const boxWidth = Math.min(bandwidth * width, isNaN(maxWidthPx) ? maxMajorWidth : maxWidthPx / maxMajorWidth);
  return isNaN(minWidthPx) ? boxWidth : Math.max(minWidthPx / maxMajorWidth, boxWidth);
}

/**
 * Generic item calculation for each box item/container
 * @param {number} i index
 * @param {number} width width of the calc area
 * @param {number} height height of the calc area
 * @param {object[]} resolved array of resolved items
 * @param {string[]} keys array of keys to refer to the resolved items
 * @param {boolean} flipXY flip X, Y, width and height props
 * @param {string} calcKey the key which to compute width on
 * @ignore
 */
export function calcItemRenderingOpts({
  i, width, height, resolved, keys, flipXY, calcKey = 'box'
}) {
  let major;
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

  const boxWidth = getBoxWidth({
    bandwidth,
    width: item[calcKey].width,
    minWidthPx: item[calcKey].minWidthPx,
    maxWidthPx: item[calcKey].maxWidthPx,
    maxMajorWidth
  });

  const boxPadding = (bandwidth - boxWidth) / 2;
  const boxCenter = boxPadding + item.major + (boxWidth / 2);

  const rendWidth = width;
  const rendHeight = height;


  const allValidValues = [item.min, item.start, item.med, item.end, item.max].filter(v => typeof v === 'number' && !Number.isNaN(v));

  const isLowerOutOfBounds = Math.min(...allValidValues) < 0 && Math.max(...allValidValues) < 0;
  const isHigherOutOfBounds = Math.min(...allValidValues) > 1 && Math.max(...allValidValues) > 1;
  const isOutOfBounds = isLowerOutOfBounds || isHigherOutOfBounds;

  return {
    item,
    boxCenter,
    boxWidth,
    boxPadding,
    rendWidth,
    rendHeight,
    isLowerOutOfBounds,
    isHigherOutOfBounds,
    isOutOfBounds
  };
}
