/**
 * @typedef {object} ComponentScrollbar
 * @extends ComponentSettings
 * @private
 */

/**
 * @typedef {object} ComponentScrollbar.settings
 * @property {boolean} [backgroundColor = '#eee']
 * @property {boolean} [thumbColor = '#ccc']
 * @property {boolean} [width = 16]
 */

interface ScrollPosition {
  x: number;
  y: number;
}

interface ScrollState {
  start: number;
  min: number;
  max: number;
  viewSize: number;
}

interface CurrentMove {
  startOffset: number;
  startScroll: number;
  swipe: boolean;
}

interface ScrollHandler {
  update(p: ScrollPosition): void;
  end(p: ScrollPosition): void;
}

interface Scrollbar {
  settings: {
    layout: { dock: string };
    scroll: string;
    settings: { invert?: boolean };
  };
  rect: Record<string, number>;
  chart: {
    scroll(scrollId: string): {
      getState(): ScrollState;
      moveTo(pos: number): void;
    };
  };
}

interface Event {
  center: { x: number; y: number };
  deltaX: number;
  deltaY: number;
}

interface Renderer {
  element(): Element;
}

function start(
  _scrollbar: Scrollbar,
  pos: ScrollPosition
): ScrollHandler {
  const dock = _scrollbar.settings.layout.dock;
  const invert = _scrollbar.settings.settings.invert || false;
  const horizontal = dock === 'top' || dock === 'bottom';
  const lengthAttr = horizontal ? 'width' : 'height';
  const length = _scrollbar.rect[lengthAttr];
  const scroll = _scrollbar.chart.scroll(_scrollbar.settings.scroll);
  let currentMove: CurrentMove;

  {
    // local scope to allow reuse of variable names later
    let offset = pos[horizontal ? 'x' : 'y'];
    if (invert) {
      offset = length - offset;
    }
    const scrollState = scroll.getState();

    currentMove = {
      startOffset: offset,
      startScroll: scrollState.start,
      swipe: false,
    };

    // Detect swipe start outside the thumb & change startScroll to jump the scroll there.
    const scrollPoint =
      (offset / length) * (scrollState.max - scrollState.min) + scrollState.min;
    if (scrollPoint < scrollState.start) {
      currentMove.startScroll = scrollPoint;
    } else if (scrollPoint > scrollState.start + scrollState.viewSize) {
      currentMove.startScroll = scrollPoint - scrollState.viewSize;
    }
  }

  const update = (p: ScrollPosition): void => {
    let offset = p[horizontal ? 'x' : 'y'];
    if (invert) {
      offset = length - offset;
    }
    if (!currentMove.swipe) {
      if (Math.abs(currentMove.startOffset - offset) <= 1) {
        return;
      }
      currentMove.swipe = true;
    }

    const scrollState = scroll.getState();
    const scrollMove =
      ((offset - currentMove.startOffset) / length) *
      (scrollState.max - scrollState.min);
    const scrollStart = currentMove.startScroll + scrollMove;
    scroll.moveTo(scrollStart);
  };

  const end = (p: ScrollPosition): void => {
    let offset = p[horizontal ? 'x' : 'y'];
    if (invert) {
      offset = length - offset;
    }
    const scrollState = scroll.getState();
    if (currentMove.swipe) {
      const scrollMove =
        ((offset - currentMove.startOffset) / length) *
        (scrollState.max - scrollState.min);
      const scrollStart = currentMove.startScroll + scrollMove;
      scroll.moveTo(scrollStart);
    } else {
      const scrollCenter =
        (offset / length) * (scrollState.max - scrollState.min) + scrollState.min;
      const scrollStart = scrollCenter - scrollState.viewSize / 2;
      scroll.moveTo(scrollStart);
    }
  };

  return {
    update,
    end,
  };
}

function getLocalPos(event: Event, renderer: Renderer): ScrollPosition {
  const containerRect = renderer.element().getBoundingClientRect();
  return {
    x: event.center.x - containerRect.left,
    y: event.center.y - containerRect.top,
  };
}

interface ScrollbarComponent extends Scrollbar, Renderer {
  currentMove?: ScrollHandler | null;
  require: string[];
  on: Record<string, (this: ScrollbarComponent, event?: Event) => void>;
  defaultSettings: Record<string, unknown>;
  preferredSize(this: ScrollbarComponent, rect: Record<string, number>): number;
  render(this: ScrollbarComponent, h: unknown): unknown[];
}

const scrollbarComponent = {
  require: ['chart', 'renderer'],
  on: {
    panStart(this: ScrollbarComponent, event: Event): void {
      const pos = getLocalPos(event, this as unknown as Renderer);
      const startPos: ScrollPosition = {
        x: pos.x - event.deltaX,
        y: pos.y - event.deltaY,
      };
      (this as unknown as Record<string, unknown>).currentMove = start(
        this as unknown as Scrollbar,
        startPos
      );
      ((this as unknown as Record<string, unknown>).currentMove as ScrollHandler).update(pos);
    },
    panMove(this: ScrollbarComponent, event: Event): void {
      const currentMove = (this as unknown as Record<string, unknown>).currentMove as
        | ScrollHandler
        | null;
      if (!currentMove) {
        return;
      }
      const pos = getLocalPos(event, this as unknown as Renderer);
      currentMove.update(pos);
    },
    panEnd(this: ScrollbarComponent, event: Event): void {
      const currentMove = (this as unknown as Record<string, unknown>).currentMove as
        | ScrollHandler
        | null;
      if (!currentMove) {
        return;
      }
      const pos = getLocalPos(event, this as unknown as Renderer);
      currentMove.end(pos);
      (this as unknown as Record<string, unknown>).currentMove = null;
    },
    panCancel(this: ScrollbarComponent): void {
      (this as unknown as Record<string, unknown>).currentMove = null;
    },
    tap(this: ScrollbarComponent, event: Event): void {
      const pos = getLocalPos(event, this as unknown as Renderer);
      const move = start(this as unknown as Scrollbar, pos);
      move.end(pos);
    },
  },
  defaultSettings: {
    settings: {
      backgroundColor: '#eee',
      thumbColor: '#ccc',
      width: 16,
    },
  },

  preferredSize(this: ScrollbarComponent, rect: Record<string, number>): number {
    const scrollState = this.chart
      .scroll((this.settings as Record<string, unknown>).scroll as string)
      .getState();
    if (scrollState.viewSize >= scrollState.max - scrollState.min) {
      const toLargeSize = Math.max(rect.width, rect.height);
      return toLargeSize;
    }
    return ((this.settings as Record<string, unknown>).settings as Record<string, unknown>)
      .width as number;
  },

  render(this: ScrollbarComponent, h: unknown): unknown[] {
    const dock = this.settings.layout.dock;
    const invert = this.settings.settings.invert;
    const horizontal = dock === 'top' || dock === 'bottom';
    const lengthAttr = horizontal ? 'width' : 'height';

    const _rect = this.rect;
    const length = _rect[lengthAttr];

    const scrollState = this.chart.scroll(this.settings.scroll).getState();
    let thumbStart = (length * (scrollState.start - scrollState.min)) / (scrollState.max - scrollState.min);
    const thumbRange = (length * scrollState.viewSize) / (scrollState.max - scrollState.min);

    if (invert) {
      thumbStart = length - thumbStart - thumbRange;
    }

    return [
      (h as (...args: unknown[]) => unknown)(
        'div',
        {
          style: {
            position: 'relative',
            width: '100%',
            height: '100%',
            background: ((this.settings as Record<string, unknown>).settings as Record<string, unknown>)
              .backgroundColor,
            pointerEvents: 'auto',
          },
        },
        (h as (...args: unknown[]) => unknown)('div', {
          class: 'scroller',
          style: {
            position: 'absolute',
            [horizontal ? 'left' : 'top']: `${thumbStart}px`,
            [horizontal ? 'top' : 'left']: '25%',
            [horizontal ? 'height' : 'width']: '50%',
            [lengthAttr]: `${Math.max(1, thumbRange)}px`,
            background: ((this.settings as Record<string, unknown>).settings as Record<string, unknown>)
              .thumbColor,
          },
        })
      ),
    ];
  },
} as unknown as (
  Record<string, unknown> & {
    require: string[];
    on: Record<string, (this: ScrollbarComponent, event?: Event) => void>;
    defaultSettings: Record<string, unknown>;
    preferredSize(this: ScrollbarComponent, rect: Record<string, number>): number;
    render(this: ScrollbarComponent, h: unknown): unknown[];
    renderer: string;
  }
);

(scrollbarComponent as Record<string, unknown>).renderer = 'dom';

export default function scrollbar(picasso: Record<string, unknown>): void {
  (picasso.component as (name: string, component: Record<string, unknown>) => void)(
    'scrollbar',
    scrollbarComponent as Record<string, unknown>
  );
}
