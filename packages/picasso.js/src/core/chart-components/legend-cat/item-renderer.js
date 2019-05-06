import extend from 'extend';
import symbolFactory from '../../symbols';

/* eslint no-mixed-operators:0 */

function placeTextInRect(rect, label, opts) {
  const textMetrics = opts.textMetrics;

  if (rect.height < textMetrics.height) {
    return false;
  }

  const wiggleWidth = Math.max(0, rect.width - textMetrics.width);
  label.baseline = 'text-before-edge';
  const wiggleHeight = Math.max(0, rect.height - (textMetrics.height));
  label.x = rect.x + (opts.align * wiggleWidth);
  label.y = rect.y + (opts.justify * wiggleHeight) + parseInt(label.fontSize, 10) * 0.175; // 0.175 - basline offset

  return label;
}

function wiggleSymbol(container, size, opts) {
  const wiggleWidth = Math.max(0, container.width - size);
  const wiggleHeight = Math.max(0, container.height - size);

  return {
    x: container.x + (size / 2) + (opts.align * wiggleWidth),
    y: container.y + (size / 2) + (opts.justify * wiggleHeight)
  };
}

export function createRenderItem({
  x = 0,
  y,
  item,
  globalMetrics,
  symbolFn = symbolFactory,
  direction = 'ltr'
}) {
  let label = item.label.displayObject;
  let labelBounds = item.label.bounds;
  let symbolItem = item.symbol.meta;
  const rtl = direction === 'rtl';

  let labelRect = {
    x: rtl ? x + globalMetrics.maxLabelBounds.width : x + globalMetrics.maxSymbolSize + globalMetrics.spacing,
    y,
    width: globalMetrics.maxLabelBounds.width,
    height: Math.max(globalMetrics.maxSymbolSize, globalMetrics.maxLabelBounds.height)
  };

  let wiggled = wiggleSymbol({
    x: rtl ? x + globalMetrics.maxLabelBounds.width + globalMetrics.spacing : x,
    y,
    width: globalMetrics.maxSymbolSize,
    height: labelRect.height
  }, symbolItem.size, {
    align: typeof symbolItem.align === 'undefined' ? 0.5 : symbolItem.align,
    justify: typeof symbolItem.justify === 'undefined' ? 0.5 : symbolItem.justify
  });

  const symbol = symbolFn(extend({}, symbolItem, wiggled));

  delete symbol.collider;

  label.anchor = rtl ? 'end' : 'start';

  placeTextInRect(labelRect, label, {
    textMetrics: labelBounds,
    fontSize: parseInt(label.fontSize, 10),
    align: 0.0,
    justify: 0.5
  });

  let container = {
    type: 'container',
    data: item.label.displayObject.data,
    children: [symbol, label],
    collider: {
      type: 'rect',
      x,
      y,
      width: globalMetrics.maxItemBounds.width,
      height: globalMetrics.maxItemBounds.height
    }
  };

  return {
    item: container,
    metrics: labelRect
  };
}

export function getItemsToRender({
  viewRect
}, rect, {
  itemized,
  create = createRenderItem,
  parallels
}) {
  const direction = itemized.layout.direction;
  const globalMetrics = itemized.globalMetrics;
  const legendItems = itemized.items;
  const isHorizontal = itemized.layout.orientation === 'horizontal';
  let s = 0;

  const renderItems = [];
  const fixedHeight = globalMetrics.maxItemBounds.height;
  const fixedWidth = globalMetrics.maxItemBounds.width;
  const rowHeight = itemized.layout.margin.vertical + fixedHeight;
  const columnWidth = itemized.layout.margin.horizontal + fixedWidth;
  let x = rect.x;
  let y = rect.y;

  let shift = viewRect.x - rect.x;

  for (let i = 0; i < legendItems.length; i++) {
    let renderItem = create({
      y,
      x: direction === 'rtl' ? viewRect.x + shift + viewRect.width - fixedWidth - (x - rect.x) : x,
      item: legendItems[i],
      globalMetrics,
      direction
    });

    if ((isHorizontal && x >= viewRect.x - fixedWidth) || (!isHorizontal && y >= viewRect.y - fixedHeight)) {
      renderItems.push(renderItem.item);
    }

    s++;
    if (s >= parallels) {
      s = 0;
      if (isHorizontal) {
        x += columnWidth; // next column
        y = rect.y; // reset y to first row
      } else {
        y += rowHeight; // next row
        x = rect.x; // reset x to first column
      }
    } else if (isHorizontal) {
      y += rowHeight; // next row
    } else {
      x += columnWidth; // next column
    }

    if (!isHorizontal && (y > viewRect.y + viewRect.height)) {
      break;
    } else if (isHorizontal && x > viewRect.x + viewRect.width) {
      break;
    }
  }
  return renderItems;
}


export function itemize({
  resolved,
  dock
}, renderer) {
  let label;
  let items = [];
  let item;
  let sourceItems = resolved.items.items;
  let sourceSymbols = resolved.symbols.items;
  let sourceLabels = resolved.labels.items;

  let maxSymbolSize = 0;
  let maxLabelWidth = 0;
  let maxLabelHeight = 0;

  for (let i = 0; i < sourceItems.length; i++) {
    if (sourceItems[i].show === false) {
      continue;
    }

    const text = typeof sourceLabels[i].text !== 'undefined' ? sourceLabels[i].text : sourceLabels[i].data.label || '';
    label = extend({}, sourceLabels[i], { // create the displayObject here in order to measure it
      type: 'text',
      fontSize: `${parseInt(sourceLabels[i].fontSize, 10)}px`,
      text,
      title: text
    });

    item = {
      symbol: {
        // can't create a displayObject here due to need to wiggle the center position of the symbol later on,
        // just store the object needed later on
        meta: sourceSymbols[i]
      },
      label: {
        displayObject: label,
        bounds: renderer.textBounds(label)
      }
    };

    items.push(item);

    maxSymbolSize = Math.max(sourceSymbols[i].size, maxSymbolSize);
    maxLabelWidth = Math.max(item.label.bounds.width, maxLabelWidth);
    maxLabelHeight = Math.max(item.label.bounds.height, maxLabelHeight);
  }

  return {
    items,
    globalMetrics: {
      spacing: 8,
      maxSymbolSize,
      maxItemBounds: {
        height: Math.max(maxSymbolSize, maxLabelHeight),
        width: maxSymbolSize + 8 + maxLabelWidth
      },
      maxLabelBounds: {
        width: maxLabelWidth,
        height: maxLabelHeight
      }
    },
    layout: {
      margin: {
        vertical: typeof resolved.layout.item.vertical !== 'undefined' ? resolved.layout.item.vertical : 4,
        horizontal: typeof resolved.layout.item.horizontal !== 'undefined' ? resolved.layout.item.horizontal : 4
      },
      mode: resolved.layout.item.mode,
      size: resolved.layout.item.size,
      orientation: dock === 'top' || dock === 'bottom' ? 'horizontal' : 'vertical',
      direction: resolved.layout.item.direction,
      scrollOffset: resolved.layout.item.scrollOffset
    }
  };
}

export function extent(itemized, parallels) {
  const count = itemized.items.length;
  const size = Math.ceil(count / parallels);
  const property = itemized.layout.orientation === 'horizontal' ? 'width' : 'height';
  const margin = property === 'width' ? 'horizontal' : 'vertical';
  return (itemized.globalMetrics.maxItemBounds[property] * size)
    + ((size - 1) * itemized.layout.margin[margin]);
}

export function spread(itemized, parallels) {
  const size = parallels;
  const property = itemized.layout.orientation === 'horizontal' ? 'height' : 'width';
  const margin = property === 'width' ? 'horizontal' : 'vertical';
  return (itemized.globalMetrics.maxItemBounds[property] * size) // expected vertical size of items
    + ((size - 1) * itemized.layout.margin[margin]); // expected spacing between items
}

export function parallelize(availableExtent, availableSpread, itemized) {
  const count = itemized.items.length;
  const extentProperty = itemized.layout.orientation === 'horizontal' ? 'width' : 'height';
  const margin = extentProperty === 'width' ? 'horizontal' : 'vertical';
  const extentInPx = (itemized.globalMetrics.maxItemBounds[extentProperty] * count)
    + ((count - 1) * itemized.layout.margin[margin]);
  let numNeeded = Math.ceil(extentInPx / availableExtent);

  if (availableSpread != null) {
    const spreadProperty = itemized.layout.orientation === 'horizontal' ? 'height' : 'width';
    const numAllowed = Math.floor(availableSpread / (4 + itemized.globalMetrics.maxItemBounds[spreadProperty]));
    numNeeded = Math.min(numNeeded, numAllowed);
  }

  const numInput = isNaN(itemized.layout.size) ? 1 : itemized.layout.size;
  return Math.max(1, Math.min(numNeeded, numInput));
}

export default function (legend, {
  onScroll = () => {}
}) {
  let itemized;
  let parallels;
  let viewRect;
  let containerRect;
  let offset = null;
  let overflow = 0;

  const api = {
    itemize: (obj) => {
      itemized = itemize(obj, legend.renderer);
      offset = !isNaN(itemized.layout.scrollOffset) ? itemized.layout.scrollOffset : offset; // Set the initial offset
    },
    getItemsToRender: (obj) => {
      viewRect = obj.viewRect;
      overflow = api.getContentOverflow(viewRect);
      const ext = api.extent();
      offset = Math.max(0, Math.min(offset, overflow));

      containerRect = extend({}, viewRect);

      const offsetProperty = api.orientation() === 'horizontal' ? 'x' : 'y';
      containerRect[offsetProperty] -= offset;
      containerRect[offsetProperty === 'x' ? 'width' : 'height'] = ext;

      return getItemsToRender(obj, containerRect, { itemized, parallels });
    },
    parallelize: (availableExtent, availableSpread) => {
      parallels = parallelize(availableExtent, availableSpread, itemized);
      return parallels;
    },
    hasContentOverflow: () => {
      const property = itemized.layout.orientation === 'horizontal' ? 'width' : 'height';
      return extent(itemized, parallels) > viewRect[property];
    },
    getContentOverflow: (rect = viewRect) => {
      const property = itemized.layout.orientation === 'horizontal' ? 'width' : 'height';
      return Math.max(0, extent(itemized, parallels) - rect[property]);
    },
    getNextSize: () => {
      // TODO - calculate the actual size to next item to ensure alignment
      const property = itemized.layout.orientation === 'horizontal' ? 'width' : 'height';
      const margin = property === 'width' ? 'horizontal' : 'vertical';
      return itemized.globalMetrics.maxItemBounds[property] + itemized.layout.margin[margin];
    },
    getPrevSize: () => {
      // TODO - calculate the actual size to next item to ensure alignment
      const property = itemized.layout.orientation === 'horizontal' ? 'width' : 'height';
      const margin = property === 'width' ? 'horizontal' : 'vertical';
      return itemized.globalMetrics.maxItemBounds[property] + itemized.layout.margin[margin];
    },
    hasNext: () => {
      if (api.orientation() === 'horizontal') {
        return viewRect.x + viewRect.width < containerRect.x + containerRect.width;
      }
      return viewRect.y + viewRect.height < containerRect.y + containerRect.height;
    },
    hasPrev: () => {
      if (api.orientation() === 'horizontal') {
        return containerRect.x < viewRect.x;
      }
      return containerRect.y < viewRect.y;
    },
    next: () => {
      api.scroll(-api.getNextSize());
    },
    prev: () => {
      api.scroll(api.getPrevSize());
    },
    scroll: (delta) => {
      const current = Math.max(0, Math.min(overflow, (offset - delta)));
      if (current === offset) {
        return;
      }
      offset = current;
      onScroll();
    },
    offset: () => offset,
    orientation: () => itemized.layout.orientation,
    direction: () => itemized.layout.direction,
    extent: () => extent(itemized, parallels), // total amount of space along orientation
    spread: () => spread(itemized, parallels) // total amount of space perpendicular to orientation
  };

  return api;
}
