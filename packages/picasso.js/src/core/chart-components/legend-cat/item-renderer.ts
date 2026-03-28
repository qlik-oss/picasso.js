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

interface LegendItemData {
  label?: string;
  [key: string]: unknown;
}

interface LegendItem {
  label: { displayObject: Label & { data?: LegendItemData }; bounds: Rect };
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

function placeTextInRect(rect: Rect, label: Label, opts: { textMetrics: Rect; fontSize?: number; align: number; justify: number }): Label {
  const textMetrics = opts.textMetrics as Rect;

  if (rect.height < textMetrics.height) {
    return false as unknown as Label;
  }

  const wiggleWidth = Math.max(0, rect.width - textMetrics.width);
  label.baseline = 'text-before-edge';
  const wiggleHeight = Math.max(0, rect.height - textMetrics.height);
  label.x = rect.x + opts.align * wiggleWidth;
  label.y = rect.y + opts.justify * wiggleHeight + (parseInt(label.fontSize as string, 10) * 0.175); // 0.175 - basline offset

  return label;
}

function wiggleSymbol(container: Rect, size: number, opts: { align: number; justify: number }): Size {
  const wiggleWidth = Math.max(0, container.width - size);
  const wiggleHeight = Math.max(0, container.height - size);

  return {
    x: container.x + size / 2 + opts.align * wiggleWidth,
    y: container.y + size / 2 + opts.justify * wiggleHeight,
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
  { viewRect }: { viewRect: Rect },
  rect: Rect,
  { itemized, create = createRenderItem, parallels, createSymbol }: { itemized: { layout: { direction: string; orientation: string }; globalMetrics: GlobalMetrics; items: LegendItem[] }; create?: (config: RenderItemConfig) => Record<string, unknown>; parallels: number; createSymbol: (config: Record<string, unknown>) => Record<string, unknown> }
): unknown[] {
  const direction = itemized.layout;
  const globalMetrics = itemized.globalMetrics;
  const legendItems = itemized.items;
  const isHorizontal = itemized.layout;
  let s = 0;

  const renderItems: unknown[] = [];
  const fixedHeight = globalMetrics.maxItemBounds.height;
  const fixedWidth = globalMetrics.maxItemBounds.width;
  const rowHeight = itemized.layout.margin?.vertical || 4 + fixedHeight;
  const columnWidth = itemized.layout.margin?.horizontal || 4 + fixedWidth;
  let x = rect.x;
  let y = rect.y;

  let shift = viewRect.x - rect.x;

  for (let i = 0; i < legendItems.length; i++) {
    const renderItem = (create)({
      y,
      x: direction.direction === 'rtl' ? viewRect.x + shift + viewRect.width - fixedWidth - (x - rect.x) : x,
      item: legendItems[i],
      globalMetrics,
      direction: direction.direction,
      createSymbol: createSymbol,
    });

    if ((isHorizontal.orientation === 'horizontal' && x >= viewRect.x - fixedWidth) || (isHorizontal.orientation !== 'horizontal' && y >= viewRect.y - fixedHeight)) {
      renderItems.push((renderItem as Record<string, unknown>).item as unknown);
    }

    s++;
    if (s >= parallels) {
      s = 0;
      if (isHorizontal.orientation === 'horizontal') {
        x += columnWidth; // next column
        y = rect.y; // reset y to first row
      } else {
        y += rowHeight; // next row
        x = rect.x; // reset x to first column
      }
    } else if (isHorizontal.orientation === 'horizontal') {
      y += rowHeight; // next row
    } else {
      x += columnWidth; // next column
    }

    if (isHorizontal.orientation !== 'horizontal' && y > viewRect.y + viewRect.height) {
      break;
    } else if (isHorizontal.orientation === 'horizontal' && x > viewRect.x + viewRect.width) {
      break;
    }
  }
  return renderItems;
}

interface ItemizeInput {
  resolved: {
    items: { items: unknown[] };
    symbols: { items: unknown[] };
    labels: { items: Record<string, unknown>[] };
    layout: {
      item: {
        vertical?: number;
        horizontal?: number;
        mode: unknown;
        size: unknown;
        direction: string;
        scrollOffset: number;
      };
    };
  };
  dock: string;
}

interface ItemizeOutput {
  items: LegendItem[];
  globalMetrics: GlobalMetrics;
  layout: {
    margin: { vertical: number; horizontal: number };
    mode: unknown;
    size: unknown;
    orientation: string;
    direction: string;
    scrollOffset: number;
  };
}

export function itemize({ resolved, dock }: ItemizeInput, renderer: { textBounds?: (label: Record<string, unknown>) => Rect }): ItemizeOutput {
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

export function extent(itemized: { items: unknown[]; layout: { orientation: string }; globalMetrics: GlobalMetrics }, parallels: number): number {
  const count = itemized.items.length;
  const size = Math.ceil(count / parallels);
  const property = itemized.layout.orientation === 'horizontal' ? 'width' : 'height';
  const margin = property === 'width' ? 'horizontal' : 'vertical';
  return itemized.globalMetrics.maxItemBounds[property as 'width' | 'height'] * size + (size - 1) * (itemized.layout.margin?.[margin as 'horizontal' | 'vertical'] as number);
}

export function spread(itemized: { items: unknown[]; layout: { orientation: string }; globalMetrics: GlobalMetrics }, parallels: number): number {
  const size = parallels;
  const property = itemized.layout.orientation === 'horizontal' ? 'height' : 'width';
  const margin = property === 'width' ? 'horizontal' : 'vertical';
  return (
    itemized.globalMetrics.maxItemBounds[property as 'width' | 'height'] * size +
    (size - 1) * (itemized.layout.margin?.[margin as 'horizontal' | 'vertical'] as number)
  );
}

export function parallelize(availableExtent: number, availableSpread: number | null, itemized: { items: unknown[]; layout: { orientation: string; size: unknown; margin?: { horizontal?: number; vertical?: number } }; globalMetrics: GlobalMetrics }): number {
  const count = itemized.items.length;
  const extentProperty = itemized.layout.orientation === 'horizontal' ? 'width' : 'height';
  const margin = extentProperty === 'width' ? 'horizontal' : 'vertical';
  const extentInPx =
    itemized.globalMetrics.maxItemBounds[extentProperty as 'width' | 'height'] * count + (count - 1) * (itemized.layout.margin?.[margin as 'horizontal' | 'vertical'] as number);
  let numNeeded = Math.ceil(extentInPx / availableExtent);

  if (availableSpread != null) {
    const spreadProperty = itemized.layout.orientation === 'horizontal' ? 'height' : 'width';
    const spreadMargin = spreadProperty === 'width' ? 'horizontal' : 'vertical';
    const spreadMarginSize = (itemized.layout.margin?.[spreadMargin as 'horizontal' | 'vertical'] as number) || 4;
    const numAllowed = Math.floor(
      (availableSpread + spreadMarginSize) / (spreadMarginSize + itemized.globalMetrics.maxItemBounds[spreadProperty as 'width' | 'height'])
    );
    numNeeded = Math.min(numNeeded, numAllowed);
  }

  const numInput = isNaN(itemized.layout.size as number) ? 1 : (itemized.layout.size as number);
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
