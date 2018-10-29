import extend from 'extend';

import pointsToPath from '../../utils/points-to-path';

import { calcItemRenderingOpts } from '../box/box-math';
import complexResolver from '../box/box-resolver';

/**
  * @typedef {object}
  * @alias component--box.settings
  */
const DEFAULT_DATA_SETTINGS = {
  /** Size of the component
   * @type {number=} */
  size: 25,
  /**
  * @typedef {object}
  * @alias component--box.settings.hat
  */
  hat: {
    /** Wether or not to show the hat
     * @type {boolean=} */
    show: true,
    /** Fill color
     * @type {datum-string=} */
    fill: '#999',
    /** Stroke color
     * @type {datum-string=} */
    stroke: '#000',
    /** Stroke width
     * @type {datum-number=} */
    strokeWidth: 0,
    /** Stroke line join
     * @type {string=} */
    strokeLinejoin: 'miter',
    /** Hat width (should be same as box)
     * @type {datum-number=} */
    width: 1,
    /** Max hat width in pixels (should be same as box)
     * @type {datum-number=} */
    maxWidthPx: undefined,
    /** Mininum hat width in pixels (should be same as box)
     * @type {datum-number=} */
    minWidthPx: 1,
    /** Mininum hat height in pixels (should be same as box)
     * @type {datum-number=} */
    minHeightPx: 1,
    /** Point alignment of the hat (from 0 to 1)
     * @type {datum-number=} */
    alignment: 0,
    /** The location of the hat (if it's docked above or below)
     * @type {string=} */
    location: 'above'
  }
};

const dataKeys = Object.keys(DEFAULT_DATA_SETTINGS);

/**
 * Hat shape calculation function
 * @param {object} params parameters
 * @param {object} params.item Resolved styling item from box component with item.major
 * @param {number} params.boxWidth Un-calculated box width in relative/normalized format
 * @param {number} params.boxPadding Un-calculated box padding in relative/normalized format
 * @param {number} params.rendWidth The pixel width of the area to render upon
 * @param {number} params.rendHeight The pixel height of the area to render upon
 * @param {boolean} params.flipXY wether or not to flip X and Y coordinates together with Width and Height
 * @ignore
 */
export function hat({
  item, boxWidth, boxPadding, rendWidth, rendHeight, flipXY
}) {
  let x = 'x';
  let y = 'y';
  let calcWidth = rendWidth;
  let calcHeight = rendHeight;
  let alignment = item.hat.alignment || 0;

  if (flipXY) {
    x = 'y';
    y = 'x';
    calcWidth = rendHeight;
    calcHeight = rendWidth;
    alignment = 1 - alignment;
  }

  let left = (boxPadding + item.major) * calcWidth;
  let top = 0;

  let contract = 8;
  let symExtend = 10;

  let points = [
    { [x]: left, [y]: top + calcHeight },
    { [x]: left + (boxWidth * alignment * calcWidth), [y]: top + contract },
    { [x]: left + (boxWidth * calcWidth), [y]: top + calcHeight },
    { [x]: left + (boxWidth * calcWidth), [y]: top + calcHeight + symExtend },
    { [x]: left, [y]: top + calcHeight + symExtend }
  ];

  const hat1 = extend({}, item.hat, {
    type: 'path',
    d: pointsToPath(points)
  });

  points = [
    { [x]: left, [y]: top - symExtend },
    { [x]: left, [y]: top },
    { [x]: left + (boxWidth * (1 - alignment) * calcWidth), [y]: top + calcHeight - contract },
    { [x]: left + (boxWidth * calcWidth), [y]: top },
    { [x]: left, [y]: top - symExtend }
  ];

  const hat2 = extend({}, item.hat, {
    type: 'path',
    d: pointsToPath(points)
  });

  return [hat1, hat2];
}

export function buildShapes({
  width,
  height,
  flipXY,
  resolved,
  keys,
  _calcItemRenderingOpts = calcItemRenderingOpts
}) {
  const output = [];

  const items = resolved.major.items;

  for (let i = 0, len = items.length; i < len; i++) {
    const {
      item,
      boxWidth,
      boxPadding,
      rendWidth,
      rendHeight,
      isOutOfBounds
    } = _calcItemRenderingOpts({
      i, width, height, resolved, keys, flipXY, calcKey: 'hat'
    });

    const d = items[i].data;

    let children = [];

    let above = 'above';
    let below = 'below';

    if (flipXY) {
      above = 'below';
      below = 'above';
    }

    /* THE HAT */
    if (!isOutOfBounds && ((Math.min(item.start, item.end) < 0 && item.hat.location === above) || (Math.max(item.start, item.end) > 1 && item.hat.location === below))) {
      children.push(...hat({
        item,
        boxWidth,
        boxPadding,
        rendWidth,
        rendHeight,
        flipXY
      }));
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

const component = {
  require: ['chart', 'resolver', 'symbol'],
  defaultSettings: {
    settings: {},
    data: {},
    style: {
      hat: '$shape'
    }
  },
  created() {
    this.rect = {
      x: 0, y: 0, width: 0, height: 0
    };
    this.state = {};
  },
  beforeRender(opts) {
    this.rect = opts.size;
  },
  preferredSize() {
    return (this.settings && this.settings.settings && this.settings.settings.size) || 25;
  },
  render({ data }) {
    const { width, height } = this.rect;

    const flipXY = this.settings.settings.orientation === 'horizontal';

    const { style, resolver } = this;

    const resolved = complexResolver({
      keys: dataKeys,
      data,
      defaultSettings: DEFAULT_DATA_SETTINGS,
      style,
      settings: this.settings.settings,
      width,
      height,
      resolver
    });

    const { settings, items } = resolved;

    const shapes = buildShapes({
      items,
      settings,
      width,
      height,
      flipXY,
      resolved,
      keys: dataKeys
    });

    return shapes;
  }
};

export default component;
