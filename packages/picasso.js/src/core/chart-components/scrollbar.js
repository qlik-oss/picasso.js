/**
 * @typedef {object} component--scrollbar
 * @private
 */

/**
 * @typedef {object} component--scrollbar.settings
 * @property {boolean} [backgroundColor = '#eee']
 * @property {boolean} [thumbColor = '#ccc']
 * @property {boolean} [width = 16]
 */

function start(_scrollbar, pos) {
  const dock = _scrollbar.settings.dock;
  const invert = _scrollbar.settings.settings.invert;
  const horizontal = dock === 'top' || dock === 'bottom';
  const lengthAttr = horizontal ? 'width' : 'height';
  const length = _scrollbar.rect[lengthAttr];
  const scroll = _scrollbar.chart.scroll(_scrollbar.settings.scroll);
  let currentMove;

  { // local scope to allow reuse of variable names later
    let offset = pos[horizontal ? 'x' : 'y'];
    if (invert) {
      offset = length - offset;
    }
    const scrollState = scroll.getState();

    currentMove = {
      startOffset: offset,
      startScroll: scrollState.start,
      swipe: false
    };

    // Detect swipe start outsize the thumb & change startScroll to jump the scroll there.
    const scrollPoint = ((offset / length) * (scrollState.max - scrollState.min)) + scrollState.min;
    if (scrollPoint < scrollState.start) {
      currentMove.startScroll = scrollPoint;
    } else if (scrollPoint > scrollState.start + scrollState.viewSize) {
      currentMove.startScroll = scrollPoint - scrollState.viewSize;
    }
  }

  const update = (p) => {
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
    const scrollMove = ((offset - currentMove.startOffset) / length) * (scrollState.max - scrollState.min);
    const scrollStart = currentMove.startScroll + scrollMove;
    scroll.moveTo(scrollStart);
  };
  const end = (p) => {
    let offset = p[horizontal ? 'x' : 'y'];
    if (invert) {
      offset = length - offset;
    }
    const scrollState = scroll.getState();
    if (currentMove.swipe) {
      const scrollMove = ((offset - currentMove.startOffset) / length) * (scrollState.max - scrollState.min);
      const scrollStart = currentMove.startScroll + scrollMove;
      scroll.moveTo(scrollStart);
    } else {
      const scrollCenter = ((offset / length) * (scrollState.max - scrollState.min)) + scrollState.min;
      const scrollStart = scrollCenter - (scrollState.viewSize / 2);
      scroll.moveTo(scrollStart);
    }
  };

  return {
    update,
    end
  };
}

function getLocalPos(event, renderer) {
  const containerRect = renderer.element().getBoundingClientRect();
  return {
    x: event.center.x - containerRect.left,
    y: event.center.y - containerRect.top
  };
}

const scrollbarComponent = {
  require: ['chart', 'renderer'],
  on: {
    panStart(event) {
      const pos = getLocalPos(event, this.renderer);
      const startPos = {
        x: pos.x - event.deltaX,
        y: pos.y - event.deltaY
      };
      this.currentMove = start(this, startPos);
      this.currentMove.update(pos);
    },
    panMove(event) {
      if (!this.currentMove) { return; }
      const pos = getLocalPos(event, this.renderer);
      this.currentMove.update(pos);
    },
    panEnd(event) {
      if (!this.currentMove) { return; }
      const pos = getLocalPos(event, this.renderer);
      this.currentMove.end(pos);
      this.currentMove = null;
    },
    panCancel() {
      this.currentMove = null;
    },
    tap(event) {
      const pos = getLocalPos(event, this.renderer);
      const move = start(this, pos);
      move.end(pos);
    }
  },
  defaultSettings: {
    settings: {
      backgroundColor: '#eee',
      thumbColor: '#ccc',
      width: 16 // 32 for touch
    }
  },
  created: function created() {
    this.rect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  },

  preferredSize: function preferredSize(rect) {
    const scrollState = this.chart.scroll(this.settings.scroll).getState();
    // hide the scrollbar if it is not possible to scroll
    if (scrollState.viewSize >= scrollState.max - scrollState.min) {
      const toLargeSize = Math.max(rect.width, rect.height);
      return toLargeSize;
    }
    return this.settings.settings.width;
  },

  resize: function resize(opts) {
    const inner = opts.inner;
    this.rect = inner;
    return inner;
  },

  render: function render(h) {
    const dock = this.settings.dock;
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

    return h(
      'div',
      {
        style: {
          position: 'relative',
          width: '100%',
          height: '100%',
          background: this.settings.settings.backgroundColor,
          pointerEvents: 'auto'
        }
      },
      [].concat(h('div', {
        class: {
          scroller: true
        },
        style: {
          position: 'absolute',
          [horizontal ? 'left' : 'top']: `${thumbStart}px`,
          [horizontal ? 'top' : 'left']: '25%',
          [horizontal ? 'height' : 'width']: '50%', // ${width}px
          [lengthAttr]: `${Math.max(1, thumbRange)}px`,
          background: this.settings.settings.thumbColor
        }
      }))
    );
  },

  renderer: 'dom'
};

export default function scrollbar(picasso) {
  picasso.component('scrollbar', scrollbarComponent);
}
