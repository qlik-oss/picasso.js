import { createTitleNode, generateStopNodes, createLegendRectNode, createTickNodes } from './node-builder';

interface AnchorMapEntry {
  valid: string[];
  default: string;
}

type AnchorMap = Record<string, AnchorMapEntry> & { default: string };

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextMetrics {
  width: number;
  height: number;
}

interface Tick {
  value: unknown;
  label: string;
  pos: number;
  textMetrics: TextMetrics;
}

interface Scale {
  domain(): unknown[];
  norm(value: number): number;
  data(): { fields?: Array<{ formatter(): (value: unknown) => unknown }> };
}

interface LegendSeqContext {
  stgns: {
    padding: { left: number; right: number; top: number; bottom: number };
    tick: {
      anchor?: string;
      label?: (value: unknown) => string;
      fontSize: string;
      fontFamily: string;
      padding: number;
    };
    fill: string;
    major: string;
    length: number;
    maxLengthPx: number;
    size: number;
    title: {
      show: boolean;
      text?: string;
      anchor?: string;
      fontSize: string;
      fontFamily: string;
    };
  };
  settings: {
    layout: { dock: string };
    settings: Record<string, unknown>;
  };
  chart: {
    scale(scaleId: string): Scale;
  };
  formatter?: (value: unknown) => string;
  renderer: {
    measureText(config: Record<string, unknown>): TextMetrics;
  };
}

interface LegendSeqState {
  isVertical: boolean;
  rect: Rect;
  ticks: {
    anchor: string;
    length: number;
    values: Tick[];
  };
  title: {
    anchor: string;
    textBounds: { height: number };
    requiredWidth(): number;
  };
  legend: {
    fillScale: Scale;
    majorScale: Scale;
    length(): number;
  };
  preferredSize?: number;
  nodes?: unknown[];
}

interface LegendSeqComponent {
  state?: LegendSeqState;
  stgns?: Record<string, unknown>;
  settings: {
    layout: { dock: string };
    settings: Record<string, unknown>;
  };
  chart: { scale(id: string): Scale };
  renderer: { measureText(config: Record<string, unknown>): TextMetrics };
}

function resolveAnchor(
  dock: string,
  anchor: string | null,
  map: Record<string, unknown>
): string {
  const mapped = map[dock];
  if (typeof mapped === 'object') {
    const m = mapped as { valid: string[]; default: string };
    if (m.valid.indexOf(anchor || '') !== -1) {
      return anchor || '';
    }
    return m.default;
  }

  return (map.default as string) || '';
}

function resolveTickAnchor(settings: Record<string, unknown>): string {
  const dock = ((settings.layout as Record<string, unknown>).dock as string) || '';
  const anchor =
    ((settings.settings as Record<string, unknown>).tick as Record<string, unknown>)
      ?.anchor || null;

  const dockAnchorMap: Record<string, unknown> = {
    left: { valid: ['left', 'right'], default: 'left' },
    right: { valid: ['left', 'right'], default: 'right' },
    top: { valid: ['top', 'bottom'], default: 'top' },
    bottom: { valid: ['top', 'bottom'], default: 'bottom' },
    default: 'right',
  };

  return resolveAnchor(dock, (anchor as string) || '', dockAnchorMap);
}

function resolveTitleAnchor(settings: Record<string, unknown>): string {
  const dockAnchorMap: Record<string, unknown> = {
    left: { valid: ['top'], default: 'top' },
    right: { valid: ['top'], default: 'top' },
    top: { valid: ['left', 'right'], default: 'left' },
    bottom: { valid: ['left', 'right'], default: 'left' },
    default: 'top',
  };

  const dock = ((settings.layout as Record<string, unknown>).dock as string) || '';
  const anchor =
    ((settings.settings as Record<string, unknown>).title as Record<string, unknown>)?.anchor ||
    null;

  return resolveAnchor(dock, (anchor as string) || '', dockAnchorMap);
}

function initRect(ctx: LegendSeqContext, size: Record<string, unknown>): Rect {
  const rect: Rect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  const padding = ctx.stgns.padding;
  rect.x = padding.left;
  rect.y = padding.top;
  rect.width = (size.width as number) - padding.left - padding.right;
  rect.height = (size.height as number) - padding.top - padding.bottom;

  return rect;
}

function getTicks(ctx: LegendSeqContext, majorScale: Scale): Tick[] {
  const values = majorScale.domain();
  let labels: string[] = values.map(String);
  let labelFn: ((value: unknown) => string) | undefined = (ctx.stgns.tick.label as ((value: unknown) => string) | undefined);
  if (!labelFn && ctx.formatter) {
    labelFn = ctx.formatter as (value: unknown) => string;
  } else if (!labelFn && majorScale.data().fields) {
    labelFn = majorScale.data().fields![0].formatter() as (value: unknown) => string;
  }
  if (typeof labelFn === 'function') {
    labels = values.map((v: unknown) => (labelFn as (value: unknown) => string)(v)).map(String);
  }

  const ticks: Tick[] = values.map((value: unknown, i: number) => {
    const label = labels[i];
    return {
      value,
      label,
      pos: majorScale.norm(parseFloat(value as string)),
      textMetrics: ctx.renderer.measureText({
        text: label,
        fontSize: ctx.stgns.tick.fontSize,
        fontFamily: ctx.stgns.tick.fontFamily,
      }),
    };
  });

  return ticks;
}

function initState(ctx: LegendSeqComponent): LegendSeqState {
  const isVertical =
    (ctx.settings.layout.dock as string) !== 'top' &&
    (ctx.settings.layout.dock as string) !== 'bottom';
  const titleStgns = (ctx.stgns?.title as Record<string, unknown>) || {};

  const fillScale = ctx.chart.scale(ctx.stgns?.fill as string);
  const majorScale = ctx.chart.scale(ctx.stgns?.major as string);
  const tickValues = getTicks(ctx as unknown as LegendSeqContext, majorScale);
  const tickAnchor = resolveTickAnchor(ctx.settings);

  if (typeof (titleStgns.text as string | undefined) === 'undefined') {
    const fields = majorScale.data().fields;
    titleStgns.text = fields && fields[0] ? (fields[0] as unknown as { title?: () => string }).title?.() || String(fields[0].formatter?.()) : '';
  }

  const titleTextMetrics = ctx.renderer.measureText({
    text: titleStgns.text,
    fontSize: titleStgns.fontSize,
    fontFamily: titleStgns.fontFamily,
  });

  const titleTextBounds = ((ctx.renderer as Record<string, unknown>).textBounds as (
    config: Record<string, unknown>
  ) => Record<string, unknown>)({
    text: titleStgns.text,
    fontSize: titleStgns.fontSize,
    fontFamily: titleStgns.fontFamily,
    maxLines: titleStgns.maxLines,
    maxWidth: titleStgns.maxLengthPx,
    wordBreak: titleStgns.wordBreak,
    hyphens: titleStgns.hyphens,
    lineHeight: titleStgns.lineHeight,
  });

  const state: Record<string, unknown> = {
    isVertical,
    nodes: [],
    title: {
      anchor: resolveTitleAnchor(ctx.settings),
      textMetrics: titleTextMetrics,
      textBounds: titleTextBounds,
      requiredWidth: () => {
        if (!(titleStgns.show as boolean)) {
          return 0;
        }
        let w = (titleTextBounds.width as number) || 0;
        const mw = (titleStgns.maxLengthPx as number) || 100;
        if (!isVertical) {
          w += (titleStgns.padding as number) || 0;
        }
        return Math.min(w, mw);
      },
      requiredHeight: () => {
        if (!(titleStgns.show as boolean)) {
          return 0;
        }
        let h = (titleTextBounds.height as number) || 0;
        if (isVertical) {
          h += (titleStgns.padding as number) || 0;
        }
        return h;
      },
    },
    ticks: {
      values: tickValues,
      anchor: tickAnchor,
      length: Math.min(
        Math.max(...tickValues.map((t: Tick) => t.textMetrics.width)),
        (ctx.stgns?.tick as Record<string, unknown>)?.maxLengthPx as number
      ),
      requiredHeight: () => {
        const ticks = state.ticks as { values: Tick[] };
        return tickAnchor === 'top'
          ? Math.max(...ticks.values.map((t: Tick) => t.textMetrics.height)) +
              ((ctx.stgns?.tick as Record<string, unknown>)?.padding as number)
          : 0;
      },
      requiredWidth: () => {
        const ticks = state.ticks as { values: Tick[] };
        return tickAnchor === 'left' || tickAnchor === 'right'
          ? Math.max(...ticks.values.map((t: Tick) => t.textMetrics.width)) +
              ((ctx.stgns?.tick as Record<string, unknown>)?.padding as number)
          : 0;
      },
    },
    legend: {
      fillScale,
      majorScale,
      length: () => {
        const pos = isVertical ? 'height' : 'width';
        const fnPos = isVertical ? 'requiredHeight' : 'requiredWidth';
        const len =
          Math.min(
            (state.rect as Record<string, unknown>)[pos] as number,
            ((state.rect as Record<string, unknown>)[pos] as number) * (ctx.stgns?.length as number)
          ) - ((state.title as Record<string, unknown>)[fnPos] as () => number)();
        return Math.max(0, Math.min(len, (ctx.stgns?.maxLengthPx as number) || 250));
      },
    },
  };

  return state as unknown as LegendSeqState;
}

/**
 * Component settings
 * @typedef {object} ComponentLegendSeq.settings
 * @property {string} fill - Reference to definition of sequential color scale
 * @property {string} major - Reference to definition of linear scale
 * @property {number} [size=15] - Size in pixels of the legend, if vertical is the width and height otherwise
 * @property {number} [length=1] - A value in the range 0-1 indicating the length of the legend node
 * @property {number} [maxLengthPx=250] - Max length in pixels
 * @property {number} [align=0.5] - A value in the range 0-1 indicating horizontal alignment of the legend's content. 0 aligns to the left, 1 to the right.
 * @property {number} [justify=0] - A value in the range 0-1 indicating vertical alignment of the legend's content. 0 aligns to the top, 1 to the bottom.
 * @property {object} [padding]
 * @property {number} [padding.left=5] - Size in pixels
 * @property {number} [padding.right=5] - Size in pixels
 * @property {number} [padding.top=5] - Size in pixels
 * @property {number} [padding.bottom=5] - Size in pixels
 * @property {object} [tick]
 * @property {function} [tick.label] - Function applied to all tick values. Return value should be a string and is used as label
 * @property {string} [tick.fill='#595959'] - Tick color
 * @property {string} [tick.fontSize='12px'] - Font size in pixels
 * @property {string} [tick.fontFamily='Arial'] - Font family
 * @property {number} [tick.maxLengthPx=150] - Max length in pixels
 * @property {string} [tick.anchor=''] - Where to anchor the tick in relation to the legend node, supported values are [top, bottom, left and right] or empty string to auto anchor
 * @property {number} [tick.padding=5] - padding in pixels to the legend node
 * @property {object} [title] - Title settings
 * @property {boolean} [title.show=true] - Toggle title on/off
 * @property {string} [title.text=''] - Title text. Defaults to the title of the provided data field
 * @property {string} [title.fill='#595959'] - Title color
 * @property {string} [title.fontSize='12px'] - Font size in pixels
 * @property {string} [title.fontFamily='Arial'] - Font family
 * @property {number} [title.maxLengthPx=100] - Max length in pixels
 * @property {number} [title.padding=5] - padding in pixels to the legend node
 * @property {string} [title.anchor=''] - Where to anchor the title in relation to the legend node, supported values are [top, left and right] or empty string to auto anchor
 * @property {string} [title.wordBreak='none'] - How overflowing title is handled, if it should insert line breaks at word boundries (break-word) or character boundries (break-all)
 * @property {string} [title.hyphens='auto'] - How words should be hyphenated when text wraps across multiple lines (only applicable with wordBreak)
 * @property {number} [title.maxLines=2] - Number of allowed lines if title contains line breaks (only applicable with wordBreak)
 * @property {number} [title.lineHeight=1.2] - A multiplier defining the distance between lines (only applicable with wordBreak)
 */

const legendDef: {
  require: string[];
  defaultSettings: Record<string, unknown>;
  preferredSize(this: LegendSeqComponent, opts: Record<string, unknown>): number;
  created(this: LegendSeqComponent): void;
  beforeUpdate(this: LegendSeqComponent, opts: Record<string, unknown>): void;
  beforeRender(this: LegendSeqComponent, opts: Record<string, unknown>): void;
  render(this: LegendSeqComponent): unknown[];
} = {
  require: ['chart', 'settings', 'renderer'],
  defaultSettings: {
    layout: {
      displayOrder: 0,
      dock: 'right',
    },
    settings: {
      size: 15,
      length: 0.5,
      maxLengthPx: 250,
      align: 0.5,
      justify: 0,
      padding: {
        left: 5,
        right: 5,
        top: 5,
        bottom: 5,
      },
      tick: {
        label: null,
        fill: '#595959',
        fontSize: '12px',
        fontFamily: 'Arial',
        maxLengthPx: 100,
        anchor: null,
        padding: 5,
      },
      title: {
        show: true,
        text: undefined,
        fill: '#595959',
        fontSize: '12px',
        fontFamily: 'Arial',
        maxLengthPx: 100,
        padding: 5,
        maxLines: 2,
        wordBreak: 'none',
        lineHeight: 1.2,
        hyphens: 'auto',
        anchor: null,
      },
    },
  },
  preferredSize(opts: Record<string, unknown>): number {
    const state = this.state as LegendSeqState;
    state.rect = initRect(this as unknown as LegendSeqContext, (opts.inner as Record<string, unknown>) || {});

    let prefSize = (this.stgns?.size as number) || 15;

    const paddings = state.isVertical
      ? ((this.stgns?.padding as Record<string, unknown>)?.left as number) +
        ((this.stgns?.padding as Record<string, unknown>)?.right as number)
      : ((this.stgns?.padding as Record<string, unknown>)?.top as number) +
        ((this.stgns?.padding as Record<string, unknown>)?.bottom as number);
    prefSize += paddings;

    const maxSize = Math.max(
      (opts.inner as Record<string, unknown>)?.width as number,
      (opts.inner as Record<string, unknown>)?.height as number
    );
    if (state.ticks.anchor === 'left' || state.ticks.anchor === 'right') {
      const tHeight = state.ticks.values.reduce(
        (sum: number, t: Tick) => sum + t.textMetrics.height,
        0
      );
      if (tHeight > state.legend.length()) {
        return maxSize;
      }
      prefSize += state.ticks.length;
    } else {
      const tWidth = state.ticks.length;
      if (tWidth > state.legend.length()) {
        return maxSize;
      }
      prefSize += Math.max(...state.ticks.values.map((t: Tick) => t.textMetrics.height));
    }
    prefSize += ((this.stgns?.tick as Record<string, unknown>)?.padding as number) || 5;

    if (((this.stgns?.title as Record<string, unknown>)?.show as boolean) || false) {
      if (state.title.anchor === 'left' || state.title.anchor === 'right') {
        prefSize = Math.max((state.title.textBounds as Record<string, unknown>).height as number + paddings, prefSize);
      } else {
        prefSize = Math.max(prefSize, state.title.requiredWidth() + paddings);
      }
    }

    state.preferredSize = prefSize;
    return prefSize;
  },
  created(): void {
    this.stgns = (this.settings.settings as Record<string, unknown>) || {};
    this.state = initState(this);
  },
  beforeUpdate(opts: Record<string, unknown>): void {
    this.stgns = ((opts.settings as Record<string, unknown>)?.settings as Record<string, unknown>) || {};
    this.state = initState(this);
  },
  beforeRender(opts: Record<string, unknown>): void {
    (this.state as LegendSeqState).nodes = [];
    (this.state as LegendSeqState).rect = initRect(this as unknown as LegendSeqContext, (opts.size as Record<string, unknown>) || {});

    if (((this.stgns?.title as Record<string, unknown>)?.show as boolean) || false) {
      const titleNode = createTitleNode(this as unknown as Record<string, unknown>);
      ((this.state as LegendSeqState).nodes as unknown[]).push(titleNode);
    }

    const stopNodes = generateStopNodes(this as unknown as Record<string, unknown>);
    const rectNode = createLegendRectNode(this as unknown as Record<string, unknown>, stopNodes);
    const tickNodes = createTickNodes(this as unknown as Record<string, unknown>, rectNode);

    const targetNode = {
      id: 'legend-seq-target',
      type: 'container',
      children: [rectNode, tickNodes],
    };

    ((this.state as LegendSeqState).nodes as unknown[]).push(targetNode);
  },
  render(): unknown[] {
    return ((this.state as LegendSeqState).nodes as unknown[]) || [];
  },
};

export default legendDef;
