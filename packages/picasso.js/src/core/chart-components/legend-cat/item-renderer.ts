import extend from 'extend';

/* eslint no-mixed-operators:0 */

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Label {
  baseline?: string;
  x?: number;
  y?: number;
  fontSize?: number | string;
  anchor?: string;
}

interface Size {
  x: number;
  y: number;
}

interface GlobalMetrics {
  maxLabelBounds: { width: number; height: number };
  maxSymbolSize: number;
  spacing: number;
  maxItemBounds: { width: number; height: number };
  [key: string]: unknown;
}

interface SymbolMeta {
  size: number;
  align?: number;
  justify?: number;
}

interface LegendItem {
  label: { displayObject: Label; bounds: Rect };
  symbol: { meta: SymbolMeta };
  [key: string]: unknown;
}

interface RenderItemConfig {
  x?: number;
  y: number;
  item: LegendItem;
  globalMetrics: GlobalMetrics;
  createSymbol: (config: Record<string, unknown>) => Record<string, unknown>;
  direction?: string;
}

interface Container {
  type: string;
  data?: unknown;
  children: unknown[];
  collider?: Record<string, unknown>;
}

function placeTextInRect(rect: Rect, label: Label, opts: Record<string, unknown>): Label {
  const textMetrics = opts.textMetrics as Rect;

  if (rect.height < textMetrics.height) {
    return false as unknown as Label;
  }

  const wiggleWidth = Math.max(0, rect.width - textMetrics.width);
  label.baseline = 'text-before-edge';
  const wiggleHeight = Math.max(0, rect.height - textMetrics.height);
  label.x = rect.x + (opts.align as number) * wiggleWidth;
  label.y = rect.y + (opts.justify as number) * wiggleHeight + parseInt(label.fontSize as string, 10) * 0.175; // 0.175 - basline offset

  return label;
}

function wiggleSymbol(container: Rect, size: number, opts: Record<string, unknown>): Size {
  const wiggleWidth = Math.max(0, container.width - size);
  const wiggleHeight = Math.max(0, container.height - size);

  return {
    x: container.x + size / 2 + (opts.align as number) * wiggleWidth,
    y: container.y + size / 2 + (opts.justify as number) * wiggleHeight,
  };
}

export function createRenderItem({ x = 0, y, item, globalMetrics, createSymbol, direction = 'ltr' }: RenderItemConfig): Record<string, unknown> {
  let label = (item.label.displayObject as Label);
  let labelBounds = item.label.bounds as Rect;
  let symbolItem = (item.symbol.meta as SymbolMeta);
  const rtl = direction === 'rtl';

  let labelRect = {
    x: rtl ? x + globalMetrics.maxLabelBounds.width : x + globalMetrics.maxSymbolSize + globalMetrics.spacing,
    y,
    width: globalMetrics.maxLabelBounds.width,
    height: Math.max(globalMetrics.maxSymbolSize, globalMetrics.maxLabelBounds.height),
  };

  let wiggled = wiggleSymbol(
    {
      x: rtl ? x + globalMetrics.maxLabelBounds.width + globalMetrics.spacing : x,
      y,
      width: globalMetrics.maxSymbolSize,
      height: labelRect.height,
    },
    symbolItem.size,
    {
      align: typeof symbolItem.align === 'undefined' ? 0.5 : symbolItem.align,
      justify: typeof symbolItem.justify === 'undefined' ? 0.5 : symbolItem.justify,
    }
  );

  const symbol = createSymbol(extend({}, symbolItem, wiggled));

  delete symbol.collider;

  label.anchor = rtl ? 'end' : 'start';

  placeTextInRect(labelRect, label, {
    textMetrics: labelBounds,
    fontSize: parseInt(label.fontSize, 10),
    align: 0.0,
    justify: 0.5,
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
      height: globalMetrics.maxItemBounds.height,
    },
  };

  return {
    item: container,
    metrics: labelRect,
  };
}

export function getItemsToRender(
  { viewRect }: Record<string, unknown>,
  rect: Rect,
  { itemized, create = createRenderItem, parallels, createSymbol }: Record<string, unknown>
): unknown[] {
  const direction = (itemized as Record<string, unknown>).layout as Record<string, string>;
  const globalMetrics = (itemized as Record<string, unknown>).globalMetrics as GlobalMetrics;
  const legendItems = (itemized as Record<string, unknown>).items as LegendItem[];
  const isHorizontal = (itemized as Record<string, unknown>).layout as Record<string, string>;
  let s = 0;

  const renderItems: unknown[] = [];
  const fixedHeight = globalMetrics.maxItemBounds.height;
  const fixedWidth = globalMetrics.maxItemBounds.width;
  const rowHeight = ((itemized as Record<string, Record<string, unknown>>).layout as Record<string, Record<string, unknown>>).margin.vertical as number + fixedHeight;
  const columnWidth = ((itemized as Record<string, Record<string, unknown>>).layout as Record<string, Record<string, unknown>>).margin.horizontal as number + fixedWidth;
  let x = (rect as Rect).x;
  let y = (rect as Rect).y;

  let shift = (viewRect as Rect).x - (rect as Rect).x;

  for (let i = 0; i < legendItems.length; i++) {
    const renderItem = (create as (config: RenderItemConfig) => Record<string, unknown>)({
      y,
      x: direction.direction === 'rtl' ? (viewRect as Rect).x + shift + (viewRect as Rect).width - fixedWidth - (x - (rect as Rect).x) : x,
      item: legendItems[i],
      globalMetrics,
      direction: direction.direction,
      createSymbol: createSymbol as (config: Record<string, unknown>) => Record<string, unknown>,
    } as RenderItemConfig);

    if ((isHorizontal.orientation === 'horizontal' && x >= (viewRect as Rect).x - fixedWidth) || (isHorizontal.orientation !== 'horizontal' && y >= (viewRect as Rect).y - fixedHeight)) {
      renderItems.push((renderItem as Record<string, unknown>).item as unknown);
    }

    s++;
    if (s >= (parallels as number)) {
      s = 0;
      if (isHorizontal.orientation === 'horizontal') {
        x += columnWidth; // next column
        y = (rect as Rect).y; // reset y to first row
      } else {
        y += rowHeight; // next row
        x = (rect as Rect).x; // reset x to first column
      }
    } else if (isHorizontal.orientation === 'horizontal') {
      y += rowHeight; // next row
    } else {
      x += columnWidth; // next column
    }

    if (isHorizontal.orientation !== 'horizontal' && y > (viewRect as Rect).y + (viewRect as Rect).height) {
      break;
    } else if (isHorizontal.orientation === 'horizontal' && x > (viewRect as Rect).x + (viewRect as Rect).width) {
      break;
    }
  }
  return renderItems;
}

export function itemize({ resolved, dock }: Record<string, unknown>, renderer: Record<string, unknown>): Record<string, unknown> {
  let label: Record<string, unknown>;
  let items: LegendItem[] = [];
  let item: LegendItem;
  let sourceItems = (resolved as Record<string, Record<string, unknown[]>>).items.items as unknown[];
  let sourceSymbols = (resolved as Record<string, Record<string, unknown[]>>).symbols.items as unknown[];
  let sourceLabels = (resolved as Record<string, Record<string, unknown[]>>).labels.items as Record<string, unknown>[];

  let maxSymbolSize = 0;
  let maxLabelWidth = 0;
  let maxLabelHeight = 0;

  for (let i = 0; i < sourceItems.length; i++) {
    if ((sourceItems[i] as Record<string, unknown>).show === false) {
      continue;
    }

    const text = typeof (sourceLabels[i] as Record<string, unknown>).text !== 'undefined' ? (sourceLabels[i] as Record<string, unknown>).text : ((sourceLabels[i] as Record<string, Record<string, unknown>>).data as Record<string, unknown>).label || '';
    label = extend({}, sourceLabels[i], {
      // create the displayObject here in order to measure it
      type: 'text',
      fontSize: `${parseInt((sourceLabels[i] as Record<string, unknown>).fontSize as string, 10)}px`,
      text,
      title: text,
    });

    item = {
      symbol: {
        // can't create a displayObject here due to need to wiggle the center position of the symbol later on,
        // just store the object needed later on
        meta: (sourceSymbols[i] as SymbolMeta),
      },
      label: {
        displayObject: label as unknown as Label,
        bounds: (renderer as Record<string, (label: Record<string, unknown>) => Rect>).textBounds?.(label) || { x: 0, y: 0, width: 0, height: 0 },
      },
    } as LegendItem;

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
        width: maxSymbolSize + 8 + maxLabelWidth,
      },
      maxLabelBounds: {
        width: maxLabelWidth,
        height: maxLabelHeight,
      },
    },
    layout: {
      margin: {
        vertical: typeof resolved.layout.item.vertical !== 'undefined' ? resolved.layout.item.vertical : 4,
        horizontal: typeof resolved.layout.item.horizontal !== 'undefined' ? resolved.layout.item.horizontal : 4,
      },
      mode: resolved.layout.item.mode,
      size: resolved.layout.item.size,
      orientation: dock === 'top' || dock === 'bottom' ? 'horizontal' : 'vertical',
      direction: resolved.layout.item.direction,
      scrollOffset: resolved.layout.item.scrollOffset,
    },
  };
}

export function extent(itemized: Record<string, unknown>, parallels: number): number {
  const count = (itemized as Record<string, unknown[]>).items.length;
  const size = Math.ceil(count / parallels);
  const property = (itemized as Record<string, Record<string, string>>).layout.orientation === 'horizontal' ? 'width' : 'height';
  const margin = property === 'width' ? 'horizontal' : 'vertical';
  return (itemized as Record<string, Record<string, Record<string, Record<string, number>>>>).globalMetrics.maxItemBounds[property] * size + (size - 1) * (itemized as Record<string, Record<string, Record<string, number>>>).layout.margin[margin];
}

export function spread(itemized: Record<string, unknown>, parallels: number): number {
  const size = parallels;
  const property = (itemized as Record<string, Record<string, string>>).layout.orientation === 'horizontal' ? 'height' : 'width';
  const margin = property === 'width' ? 'horizontal' : 'vertical';
  return (
    (itemized as Record<string, Record<string, Record<string, Record<string, number>>>>).globalMetrics.maxItemBounds[property] * size + // expected vertical size of items
    (size - 1) * (itemized as Record<string, Record<string, Record<string, number>>>).layout.margin[margin]
  ); // expected spacing between items
}

export function parallelize(availableExtent: number, availableSpread: number | null, itemized: Record<string, unknown>): number {
  const count = (itemized as Record<string, unknown[]>).items.length;
  const extentProperty = (itemized as Record<string, Record<string, string>>).layout.orientation === 'horizontal' ? 'width' : 'height';
  const margin = extentProperty === 'width' ? 'horizontal' : 'vertical';
  const extentInPx =
    (itemized as Record<string, Record<string, Record<string, Record<string, number>>>>).globalMetrics.maxItemBounds[extentProperty] * count + (count - 1) * (itemized as Record<string, Record<string, Record<string, number>>>).layout.margin[margin];
  let numNeeded = Math.ceil(extentInPx / availableExtent);

  if (availableSpread != null) {
    const spreadProperty = (itemized as Record<string, Record<string, string>>).layout.orientation === 'horizontal' ? 'height' : 'width';
    const spreadMargin = spreadProperty === 'width' ? 'horizontal' : 'vertical';
    const spreadMarginSize = ((itemized as Record<string, Record<string, Record<string, Record<string, number>>>>).layout.margin as Record<string, number>)[spreadMargin] || 4;
    const numAllowed = Math.floor(
      (availableSpread + spreadMarginSize) / (spreadMarginSize + (itemized as Record<string, Record<string, Record<string, Record<string, number>>>>).globalMetrics.maxItemBounds[spreadProperty])
    );
    numNeeded = Math.min(numNeeded, numAllowed);
  }

  const numInput = isNaN(((itemized as Record<string, Record<string, unknown>>).layout as Record<string, unknown>).size as number) ? 1 : ((itemized as Record<string, Record<string, unknown>>).layout as Record<string, unknown>).size as number;
  return Math.max(1, Math.min(numNeeded, numInput));
}

export default function itemRenderer(legend: Record<string, unknown>, { onScroll = () => {} }: Record<string, unknown> = {}): Record<string, unknown> {
  let itemized: Record<string, unknown>;
  let parallels: number;
  let viewRect: Rect;
  let containerRect: Rect;
  let offset: number | null = null;
  let overflow = 0;

  const api: Record<string, unknown> = {
    itemize: (obj: Record<string, unknown>) => {
      itemized = itemize(obj as Record<string, unknown>, (legend as Record<string, unknown>).renderer as Record<string, unknown>);
      offset = !isNaN((itemized as Record<string, Record<string, number>>).layout.scrollOffset as number) ? (itemized as Record<string, Record<string, number>>).layout.scrollOffset as number : offset; // Set the initial offset
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

      return getItemsToRender(obj, containerRect, { itemized, parallels, createSymbol: legend.symbol });
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
      const current = Math.max(0, Math.min(overflow, offset - delta));
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
    spread: () => spread(itemized, parallels), // total amount of space perpendicular to orientation
  };

  return api;
}
