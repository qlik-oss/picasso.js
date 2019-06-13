import extend from 'extend';
import * as boxShapesHelper from './box-shapes-helper';

import { isNumber } from '../../utils/is-number';

export default function buildShapes({
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
  const majorItems = resolved.major.items;

  if (!majorItems.length) {
    return output;
  }

  const rendWidth = width;
  const rendHeight = height;
  const maxMajorWidth = flipXY ? height : width;
  const majorSettings = resolved.major.settings;
  const minorProps = ['start', 'end', 'min', 'max', 'med'].filter(prop => typeof resolved.minor.settings[prop] !== 'undefined');
  const numMinorProps = minorProps.length;
  const nonOobKeys = keys.filter(key => key !== 'oob');

  let children;
  let major;
  let minorItem;
  let boxWidth;
  let boxPadding;
  let boxCenter;
  let isLowerOutOfBounds;
  let isHigherOutOfBounds;
  let isOutOfBounds;
  const numKeys = keys ? keys.length : 0;
  const numNonOobKeys = nonOobKeys ? nonOobKeys.length : 0;

  function addBox() {
    /* THE BOX */
    if (minorItem.box && isNumber(minorItem.start) && isNumber(minorItem.end)) {
      children.push(boxShapesHelper.box({
        item: minorItem, boxWidth, boxPadding, rendWidth, rendHeight, flipXY
      }));
    }
  }

  function addLine() {
    /* LINES MIN - START, END - MAX */
    if (isNumber(minorItem.min) && isNumber(minorItem.start)) {
      children.push(boxShapesHelper.verticalLine({
        item: minorItem, from: minorItem.min, to: minorItem.start, boxCenter, rendWidth, rendHeight, flipXY
      }));
    }

    if (isNumber(minorItem.max) && isNumber(minorItem.end)) {
      children.push(boxShapesHelper.verticalLine({
        item: minorItem, from: minorItem.max, to: minorItem.end, boxCenter, rendWidth, rendHeight, flipXY
      }));
    }
  }

  function addMedian() {
    /* MEDIAN */
    if (minorItem.median && isNumber(minorItem.med)) {
      children.push(boxShapesHelper.horizontalLine({
        item: minorItem, key: 'median', position: minorItem.med, width: boxWidth, boxCenter, rendWidth, rendHeight, flipXY
      }));
    }
  }

  function addWhisker() {
    /* WHISKERS */
    if (minorItem.whisker) {
      const whiskerWidth = boxWidth * minorItem.whisker.width;

      if (isNumber(minorItem.min)) {
        children.push(boxShapesHelper.horizontalLine({
          item: minorItem, key: 'whisker', position: minorItem.min, width: whiskerWidth, boxCenter, rendWidth, rendHeight, flipXY
        }));
      }

      if (isNumber(minorItem.max)) {
        children.push(boxShapesHelper.horizontalLine({
          item: minorItem, key: 'whisker', position: minorItem.max, width: whiskerWidth, boxCenter, rendWidth, rendHeight, flipXY
        }));
      }
    }
  }

  function addOutOfBounds() {
    /* OUT OF BOUNDS */
    if (isLowerOutOfBounds) {
      children.push(boxShapesHelper.oob({
        item: minorItem, value: 0, boxCenter, rendWidth, rendHeight, flipXY, symbol
      }));
    } else if (isHigherOutOfBounds) {
      children.push(boxShapesHelper.oob({
        item: minorItem, value: 1, boxCenter, rendWidth, rendHeight, flipXY, symbol
      }));
    }
  }

  const addMarkerList = {
    box: addBox,
    line: addLine,
    median: addMedian,
    whisker: addWhisker
  };

  function checkOutOfBounds() {
    let value;
    let max = -Number.MAX_VALUE;
    let min = Number.MAX_VALUE;
    for (let n = 0; n < numMinorProps; n++) {
      value = minorItem[minorProps[n]];
      if (isNumber(value)) {
        if (max < value) {
          max = value;
        }
        if (min > value) {
          min = value;
        }
      }
    }
    isLowerOutOfBounds = max < 0 && max !== -Number.MAX_VALUE;
    isHigherOutOfBounds = min > 1 && min !== Number.MAX_VALUE;
    isOutOfBounds = isLowerOutOfBounds || isHigherOutOfBounds;
  }

  for (let i = 0, len = majorItems.length; i < len; i++) {
    children = [];
    major = null;
    const majorItem = majorItems[i];
    const d = majorItem.data;

    let majorVal = null;
    let majorEndVal = null;

    if (typeof majorSettings.binStart !== 'undefined') { // if start and end is defined
      majorVal = majorItem.binStart;
      majorEndVal = majorItem.binEnd;
      major = majorSettings.binStart.scale;
    } else {
      major = majorSettings.major.scale;
      majorVal = major ? majorItem.major : 0;
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

    minorItem = extend({}, {
      major: majorVal,
      majorEnd: majorEndVal
    }, resolved.minor.items[i]);

    for (let j = 0; j < numKeys; j++) {
      minorItem[keys[j]] = resolved[keys[j]].items[i];
    }

    boxWidth = boxShapesHelper.getBoxWidth(bandwidth, minorItem, maxMajorWidth);
    boxPadding = (bandwidth - boxWidth) / 2;
    boxCenter = boxPadding + minorItem.major + (boxWidth / 2);

    checkOutOfBounds();

    if (!isOutOfBounds) {
      for (let k = 0; k < numNonOobKeys; k++) {
        if (minorItem[nonOobKeys[k]] && minorItem[nonOobKeys[k]].show === false) {
          continue;
        }
        addMarkerList[nonOobKeys[k]]();
      }
    } else if (minorItem.oob) {
      addOutOfBounds();
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
