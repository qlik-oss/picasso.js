import extend from 'extend';

import { resolveDiff, calcItemRenderingOpts } from '../box/box-math';
import complexResolver from '../box/box-resolver';

const DEFAULT_DATA_SETTINGS = {
  box: {
    show: true,
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 1,
    strokeLinejoin: 'miter',
    width: 1,
    maxWidthPx: undefined,
    minWidthPx: 1,
    minHeightPx: 1
  }
};

const dataKeys = Object.keys(DEFAULT_DATA_SETTINGS);

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
  item, boxWidth, boxPadding, rendWidth, rendHeight, flipXY, symbol
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

  const hat1 = symbol(extend({}, item.box, {
    type: 'advanced-triangle',
    [x]: (boxPadding + item.major) * calcwidth,
    [y]: 0,
    [height]: calcheight,
    [width]: boxWidth * calcwidth,
    alignment: 1,
    extend: 10,
    contract: 8,
    direction: 'up',
    data: item.data || {}
  }));

  const hat2 = symbol(extend({}, item.box, {
    type: 'advanced-triangle',
    [x]: ((boxPadding + item.major) - (boxWidth / 2)) * calcwidth + 5,
    [y]: calcheight,
    [height]: calcheight,
    [width]: boxWidth * calcwidth,
    alignment: 1,
    extend: 10,
    contract: 8,
    direction: 'down',
    data: item.data || {}
  }));

  console.log(hat1, hat2);

  return [hat1, hat2];

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

function buildShapes({
  width,
  height,
  flipXY,
  resolved,
  keys,
  symbol
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
    } = calcItemRenderingOpts({
      i, width, height, resolved, keys, flipXY
    });

    const d = items[i].data;

    let children = [];

    /* THE BOX */
    if (!isOutOfBounds && item.box.show) {
      children.push(...box({
        item,
        boxWidth,
        boxPadding,
        rendWidth,
        rendHeight,
        flipXY,
        symbol
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
      box: '$shape',
      line: '$shape-guide',
      whisker: '$shape-guide',
      median: '$shape-guide--inverted'
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
  preferredSize(opts) {
    console.log(opts);
    return 40;
  },
  render({ data }) {
    const { width, height } = this.rect;

    console.log('hai', this.rect);

    const flipXY = this.settings.settings.orientation === 'horizontal';

    const { style, resolver, symbol } = this;

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
      keys: dataKeys,
      symbol
    });

    return shapes;
  }
};

export default component;
