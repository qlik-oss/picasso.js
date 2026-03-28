import extend from 'extend';
import * as boxShapesHelper from './box-shapes-helper';

import { isNumber } from '../../utils/is-number';

interface MinorItem {
  [key: string]: unknown;
  major?: number;
  majorEnd?: number;
  start?: number;
  end?: number;
  min?: number;
  max?: number;
  med?: number;
  median?: boolean;
  whisker?: { width: number };
  box?: {
    minHeightPx: number;
    [key: string]: unknown;
  };
  oob?: {
    size: number;
    [key: string]: unknown;
  };
}

interface MajorItem {
  data: unknown;
  major?: number;
  binStart?: number;
  binEnd?: number;
  [key: string]: unknown;
}

interface ResolvedSettings {
  [key: string]: unknown;
  binStart?: unknown;
  major?: {
    scale?: {
      bandwidth?: () => number;
    };
  };
}

interface MajorSettings {
  binStart?: unknown;
  major?: {
    scale?: {
      bandwidth?: () => number;
    };
  };
  [key: string]: unknown;
}

interface MinorSettings {
  start?: number;
  end?: number;
  min?: number;
  max?: number;
  med?: number;
  [key: string]: unknown;
}

interface Resolved {
  major: {
    items: MajorItem[];
    settings: ResolvedSettings;
  };
  minor: {
    items: MinorItem[];
    settings: MinorSettings;
  };
  [key: string]: {
    items: unknown[];
  };
}

interface ShapeContainer {
  type: 'container';
  data: unknown;
  collider: { type: string };
  children: unknown[];
}

interface BuildShapesParams {
  width?: number;
  height?: number;
  flipXY?: boolean;
  resolved: Resolved;
  keys: string[];
  symbol?: (config: Record<string, unknown>) => unknown;
}

export default function buildShapes({
  width = 0,
  height = 0,
  flipXY = false,
  resolved,
  keys,
  symbol,
}: BuildShapesParams): ShapeContainer[] {
  // if (!settings || !settings.major || !settings.major.scale || !settings.minor || !settings.minor.scale) {
  //   return [];
  // }

  const output: ShapeContainer[] = [];
  const majorItems = resolved.major.items;

  if (!majorItems.length) {
    return output;
  }

  const rendWidth = width;
  const rendHeight = height;
  const maxMajorWidth = flipXY ? height : width;
  const majorSettings = resolved.major.settings;
  const minorProps: string[] = ['start', 'end', 'min', 'max', 'med'].filter(
    (prop) => typeof resolved.minor.settings[prop] !== 'undefined'
  );
  const numMinorProps = minorProps.length;
  const nonOobKeys: string[] = keys.filter((key: string) => key !== 'oob');

  let children: unknown[];
  let major: { bandwidth?: () => number } | null;
  let minorItem: MinorItem;
  let boxWidth: number;
  let boxPadding: number;
  let boxCenter: number;
  let isLowerOutOfBounds: boolean = false;
  let isHigherOutOfBounds: boolean = false;
  let isOutOfBounds: boolean = false;
  const numKeys = keys ? keys.length : 0;
  const numNonOobKeys = nonOobKeys ? nonOobKeys.length : 0;

  function addBox(): void {
    /* THE BOX */
    if (minorItem.box && isNumber(minorItem.start) && isNumber(minorItem.end)) {
      children.push(
        boxShapesHelper.box({
          item: minorItem,
          boxWidth,
          boxPadding,
          rendWidth,
          rendHeight,
          flipXY,
        })
      );
    }
  }

  function addLine(): void {
    /* LINES MIN - START, END - MAX */
    if (isNumber(minorItem.min) && isNumber(minorItem.start)) {
      children.push(
        boxShapesHelper.verticalLine({
          item: minorItem,
          from: minorItem.min,
          to: minorItem.start,
          boxCenter,
          rendWidth,
          rendHeight,
          flipXY,
        })
      );
    }

    if (isNumber(minorItem.max) && isNumber(minorItem.end)) {
      children.push(
        boxShapesHelper.verticalLine({
          item: minorItem,
          from: minorItem.max,
          to: minorItem.end,
          boxCenter,
          rendWidth,
          rendHeight,
          flipXY,
        })
      );
    }
  }

  function addMedian(): void {
    /* MEDIAN */
    if (minorItem.median && isNumber(minorItem.med)) {
      children.push(
        boxShapesHelper.horizontalLine({
          item: minorItem,
          key: 'median',
          position: minorItem.med,
          width: boxWidth,
          boxCenter,
          rendWidth,
          rendHeight,
          flipXY,
        })
      );
    }
  }

  function addWhisker(): void {
    /* WHISKERS */
    if (minorItem.whisker) {
      const whiskerWidth = boxWidth * minorItem.whisker.width;

      if (isNumber(minorItem.min)) {
        children.push(
          boxShapesHelper.horizontalLine({
            item: minorItem,
            key: 'whisker',
            position: minorItem.min,
            width: whiskerWidth,
            boxCenter,
            rendWidth,
            rendHeight,
            flipXY,
          })
        );
      }

      if (isNumber(minorItem.max)) {
        children.push(
          boxShapesHelper.horizontalLine({
            item: minorItem,
            key: 'whisker',
            position: minorItem.max,
            width: whiskerWidth,
            boxCenter,
            rendWidth,
            rendHeight,
            flipXY,
          })
        );
      }
    }
  }

  function addOutOfBounds(): void {
    /* OUT OF BOUNDS */
    if (isLowerOutOfBounds) {
      children.push(
        boxShapesHelper.oob({
          item: minorItem,
          value: 0,
          boxCenter,
          rendWidth,
          rendHeight,
          flipXY,
          symbol,
        })
      );
    } else if (isHigherOutOfBounds) {
      children.push(
        boxShapesHelper.oob({
          item: minorItem,
          value: 1,
          boxCenter,
          rendWidth,
          rendHeight,
          flipXY,
          symbol,
        })
      );
    }
  }

  const addMarkerList: Record<string, () => void> = {
    box: addBox,
    line: addLine,
    median: addMedian,
    whisker: addWhisker,
  };

  function checkOutOfBounds(): void {
    let value: unknown;
    let max = -Number.MAX_VALUE;
    let min = Number.MAX_VALUE;
    for (let n = 0; n < numMinorProps; n++) {
      value = minorItem[minorProps[n]];
      if (isNumber(value)) {
        if (max < (value as number)) {
          max = value as number;
        }
        if (min > (value as number)) {
          min = value as number;
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
    const majorItem: MajorItem = majorItems[i];
    const d = majorItem.data;

    let majorVal: number | null = null;
    let majorEndVal: number | null = null;

    if (typeof majorSettings.binStart !== 'undefined') {
      // if start and end is defined
      majorVal = majorItem.binStart as number;
      majorEndVal = majorItem.binEnd as number;
      major = majorSettings.binStart as { bandwidth?: () => number } | null;
    } else {
      major = (majorSettings.major?.scale as { bandwidth?: () => number } | undefined) ?? null;
      majorVal = major ? (majorItem.major as number) : 0;
    }

    let bandwidth = 0;
    if (!major) {
      bandwidth = 1;
    } else if (major.bandwidth) {
      bandwidth = major.bandwidth();
      majorVal -= bandwidth / 2;
    } else {
      bandwidth = (majorEndVal as number) - (majorVal as number);
    }

    minorItem = extend(
      {},
      {
        major: majorVal,
        majorEnd: majorEndVal,
      },
      resolved.minor.items[i]
    );

    for (let j = 0; j < numKeys; j++) {
      minorItem[keys[j]] = resolved[keys[j]].items[i];
    }

    boxWidth = boxShapesHelper.getBoxWidth(bandwidth, minorItem, maxMajorWidth);
    boxPadding = (bandwidth - boxWidth) / 2;
    boxCenter = boxPadding + (minorItem.major as number) + boxWidth / 2;

    checkOutOfBounds();

    if (!isOutOfBounds) {
      for (let k = 0; k < numNonOobKeys; k++) {
        const nonOobKey = nonOobKeys[k];
        if (minorItem[nonOobKey] && typeof minorItem[nonOobKey] === 'object' && (minorItem[nonOobKey] as Record<string, unknown>).show === false) {
          continue;
        }
        (addMarkerList[nonOobKey] as (() => void) | undefined)?.();
      }
    } else if (minorItem.oob) {
      addOutOfBounds();
    }

    const container: ShapeContainer = {
      type: 'container',
      data: d,
      collider: { type: 'bounds' },
      children,
    };

    output.push(container);
  }

  return output;
}
