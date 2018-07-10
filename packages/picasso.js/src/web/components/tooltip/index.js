import extractor from './extractor';
import render from './render';
import timeSpanDispatcher from './timespan-dispatcher';
import placement from './placement';
import {
  setActive,
  removeActive,
  cancelActive,
} from './instance-handler';

/**
 * Tooltip default settings
 * @typedef {object}
 */
const DEFAULT_SETTINGS = {
  /**
   * How long the tooltip is visible, in milliseconds
   * @type {number=}
   */
  duration: 8000,
  /**
   * Time to delay before the tooltip is rendered, in milliseconds
   * @type {number=}
   */
  delay: 500,
  /**
   * @type {function=}
   */
  filter: node => node.data, // Filter SceneNodes
  /**
   * Extract items from node.
   * @type {function=}
   * @returns {array}
   */
  extract: ctx => [ctx.node.data.value],
  /**
   * Content generator
   * Extracted items are available in the `items` property
   * @type {function=}
   * @returns {object[]} Array of h objects
   */
  content: ({ h, items, style }) => items.map(item => h('div', style, item)),
  /**
   * Placement strategy to use. Can be a custom function return a object with placement properties.
   * Available types: pointer | bounds | slice
   * Available docking: left | right | top | bottom | auto
   * @type {object=}
   * @example
   * As a custom generator function:
   * placement: {
   *  fn: ctx => ({ style: { left: 123, top: 123, }, dock: 'left' })
   * }
   *
   * As a function:
   * placement: ctx => { type: <condition> ? 'pointer' : 'bounds' }
   *
   * As a string:
   * placement: 'pointer'
   */
  placement: {
    type: 'pointer',
    dock: 'auto',
    offset: 10,
  },
  tooltipClass: {},
  arrowClass: {},
  direction: 'ltr',
  /**
   * Explicitly set a target element.
   * This allows the tooltip to attach itself outside the picasso container.
   * @type {HTMLElement=}
   * @example
   * appendTo: document.querySelector('#tooltip');
   */
  appendTo: null,
};

function areEqual(prev, curr) {
  // TODO Use better comparison
  return prev.length &&
    prev.every((p, i) => curr[i] && JSON.stringify(p.data) === JSON.stringify(curr[i].data));
}

function toPoint(event, { chart, state }) {
  let x = 0;
  let y = 0;
  if (event.center) {
    x += event.center.x;
    y += event.center.y;
  } else {
    x += event.clientX;
    y += event.clientY;
  }
  const chartBounds = chart.element.getBoundingClientRect();
  const targetBounds = state.targetElement.getBoundingClientRect();
  const clientX = x;
  const clientY = y;
  const dx = chartBounds.left - targetBounds.left;
  const dy = chartBounds.top - targetBounds.top;
  x -= targetBounds.left;
  y -= targetBounds.top;
  return {
    x, // Target point relative to the target bounds
    y,
    dx, // Delta from target bounds to the chart bounds
    dy,
    clientX,
    clientY,
    targetBounds, // Target bounding rect
    chartBounds, // Chart bounding rect
  };
}

const component = {
  require: ['chart', 'renderer'],
  defaultSettings: {
    settings: DEFAULT_SETTINGS,
    style: {
      tooltip: {},
      content: {},
    },
  },
  renderer: 'dom',
  on: {
    over(e, duration, delay) { // Duration and delay are optional
      if (this.state.prevent) {
        return;
      }

      const p = toPoint(e, this);
      // Set pointer here to always expose latest pointer to invokeRenderer
      this.state.pointer = p;
      const nodes = this.chart.shapesAt({ x: p.x - p.dx, y: p.y - p.dy })
        .filter(this.props.filter);

      if (areEqual(this.state.activeNodes, nodes)) {
        return;
      }
      // Nodes are not the same, clear, if any, the active tooltip
      this.dispatcher.clear();
      this.state.activeNodes = nodes;

      if (nodes.length) {
        this.dispatcher.invoke(
          () => this.invokeRenderer(nodes),
          duration,
          delay,
        );
      }
    },
    hide() {
      this.dispatcher.clear();
      this.state.activeNodes = [];
      this.state.pointer = {};
    },
    // lookup agnostic, i.e. could be triggered from brushing or events
    show(shapes, e, duration, delay) {
      if (this.state.prevent) {
        return;
      }

      if (e) {
        this.state.pointer = toPoint(e, this);
      }

      const nodes = shapes.filter(this.props.filter);
      this.state.activeNodes = nodes;

      if (nodes.length) {
        this.dispatcher.invoke(
          () => this.invokeRenderer(nodes),
          duration,
          delay,
        );
      }
    },
    prevent(p) {
      this.state.prevent = !!p;
    },
  },
  init(settings) {
    this.state = {
      activeNodes: [],
      pointer: {},
      targetElement: this.chart.element,
      prevent: false,
    };
    this.props = settings.settings;
    this.dispatcher = timeSpanDispatcher({
      defaultDuration: this.props.duration,
      defaultDelay: this.props.delay,
    });

    const instanceId = this.dispatcher.clear;
    this.dispatcher.on('pending', () => {
      // Cancel only if the active is another instance
      cancelActive(instanceId);
      setActive(instanceId);
    });
    this.dispatcher.on(['cancelled', 'fulfilled'], () => {
      this.renderer.render([]); // Hide tooltip
      removeActive(instanceId);
    });
  },
  created() {
    this.init(this.settings);
  },
  beforeUpdate({ settings }) {
    if (this.dispatcher) {
      this.dispatcher.clear();
    }
    this.init(settings);
  },
  beforeRender(opts) {
    this.rect = opts.size;
  },
  render(h) {
    this.h = h;
    return []; // Nothing to render initially.
  },
  beforeDestroy() {
    this.dispatcher.clear();
  },
  appendTo() {
    if (this.props.appendTo) {
      // TODO Provide some kind of context for appendTo function
      this.state.targetElement = typeof this.props.appendTo === 'function' ? this.props.appendTo() : this.props.appendTo;
      const bounds = this.state.targetElement.getBoundingClientRect();
      const size = {
        x: bounds.left, // TODO should be relative to parent node?
        y: bounds.top,
        width: bounds.width,
        height: bounds.height,
        scaleRatio: this.renderer.size().scaleRatio,
      };
      this.renderer.clear(); // Work-around for the dom-renderer vnode bug on destroy
      this.renderer.destroy();
      this.rect = this.renderer.size(size);
      this.renderer.appendTo(this.state.targetElement);
    }
  },
  mounted() {
    this.appendTo();
  },
  updated() {
    // Append here to, otherwise the picasso displayOrder logic screw things up
    this.appendTo();
  },
  invokeRenderer(nodes) {
    const items = extractor(nodes, this);
    const pseudoElement = render(items, { style: { left: '0px', top: '0px', visibility: 'hidden' } }, this);
    const pos = placement(pseudoElement.getBoundingClientRect(), this);
    render(items, pos, this);
  },
};

export { component as default };
