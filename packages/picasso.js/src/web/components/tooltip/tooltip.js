import extractor from './extractor';
import render from './render';
import timeSpanDispatcher from './timespan-dispatcher';
import placement from './placement';
import {
  setActive,
  removeActive,
  cancelActive
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
   * Delay before the tooltip is rendered, in milliseconds
   * @type {number=}
   */
  delay: 500,
  /**
   * Reduce incoming nodes to only a set of applicable nodes.
   * Is called as a part of the `over` event.
   * @type {function=}
   * @returns {array} An array of nodes
   * @example
   * (nodes) => nodes.filter(node.key === '<target-component-key>')
   */
  filter: nodes => nodes.filter(node => node.data), // Filter SceneNodes
  /**
   * Extract items from node.
   * @type {function=}
   * @returns {array} An array of data
   */
  extract: ctx => [ctx.node.data.value],
  /**
   * Content generator
   * Extracted items are available in the `items` property
   * @type {function=}
   * @returns {object[]} Array of h objects
   */
  content: ({ h, items, style }) => items.map(item => h('div', { style: style.content }, item)),
  /**
   * Debounce condition. A function that define if the tooltip event `over` should be debounced or not.
   * Two parameters are passed to the function, the first is a set of nodes, representing active
   * nodes displayed in the tooltip, and the second parameter is the incoming set of nodes. Typically
   * if the two set of nodes are the same, it should be debounced.
   * @type {function=}
   * @returns {boolean} True if the event should be debounced, false otherwise
   */
  debounce: (prev, curr) => prev.length &&
    prev.length === curr.length &&
    prev.every((p, i) => curr[i] && JSON.stringify(p.data) === JSON.stringify(curr[i].data)),
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
    offset: 8,
    area: 'viewport' // Specify the area which placement strategies should limit themself to [viewport | target]
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
  /**
   * Event listener. Called when the tooltip is displayed.
   * @type {function=}
   * @example
   * onDisplayed: ({ element }) => { debugger; }
   */
  onDisplayed: null,
  /**
   * Event listener. Called when the tooltip is hidden.
   * @type {function=}
   */
  onHidden: null
};

const DEFAULT_STYLE = {
  tooltip: {
    'background-color': '$gray-35',
    color: '$font-color--inverted',
    fontFamily: '$font-family',
    fontSize: '$font-size',
    lineHeight: '$line-height',
    borderRadius: '4px',
    padding: '8px',
    opacity: 0.9
  },
  'tooltip-arrow': {
    position: 'absolute',
    width: '0px',
    height: '0px',
    border: '8px solid',
    'border-color': 'transparent',
    'border-top-color': '$gray-35',
    opacity: 0.9
  },
  'tooltip-arrow--bottom': {
    left: 'calc(50% - 8px)',
    top: '-16px',
    transform: 'rotate(180deg)'
  },
  'tooltip-arrow--top': {
    left: 'calc(50% - 8px)',
    top: '100%'
  },
  'tooltip-arrow--right': {
    left: '-16px',
    top: 'calc(50% - 8px)',
    transform: 'rotate(90deg)'
  },
  'tooltip-arrow--left': {
    left: '100%',
    top: 'calc(50% - 8px)',
    transform: 'rotate(-90deg)'
  },
  content: {} // TODO Remove, as it's used in settings function
};

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
  // TODO Don't do getBoundingClientRect lookup here. It's performance heavy.
  const chartBounds = chart.element.getBoundingClientRect();
  const targetBounds = state.targetElement.getBoundingClientRect();
  const clientX = x;
  const clientY = y;
  const dx = chartBounds.left - targetBounds.left;
  const dy = chartBounds.top - targetBounds.top;
  const cx = x - chartBounds.left;
  const cy = y - chartBounds.top;
  x -= targetBounds.left;
  y -= targetBounds.top;
  return {
    x, // Target point relative to the target bounds
    y,
    dx, // Delta from target bounds to the chart bounds
    dy,
    cx, // Target point relative to the chart bounds
    cy,
    clientX,
    clientY,
    targetBounds, // Target bounding rect
    chartBounds // Chart bounding rect
  };
}

const component = {
  require: ['chart', 'renderer'],
  defaultSettings: {
    settings: DEFAULT_SETTINGS,
    style: DEFAULT_STYLE
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
      const nodes = this.props.filter(this.chart.shapesAt({ x: p.cx, y: p.cy }));

      if (this.props.debounce(this.state.activeNodes, nodes)) {
        return;
      }

      this.dispatcher.clear();
      this.state.activeNodes = nodes;

      if (nodes.length) {
        this.dispatcher.invoke(
          () => this.invokeRenderer(nodes),
          duration,
          delay
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

      const nodes = this.props.filter(shapes);
      this.state.activeNodes = nodes;

      if (nodes.length) {
        this.dispatcher.invoke(
          () => this.invokeRenderer(nodes),
          duration,
          delay
        );
      }
    },
    prevent(p) {
      this.state.prevent = !!p;
    }
  },
  init(settings) {
    this.state = {
      activeNodes: [],
      pointer: {},
      targetElement: null,
      prevent: false
    };
    this.props = settings.settings;
    this.dispatcher = timeSpanDispatcher({
      defaultDuration: this.props.duration,
      defaultDelay: this.props.delay
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

      if (typeof this.props.onHidden === 'function') {
        this.props.onHidden({
          resources: {
            formatter: this.chart.formatter,
            scale: this.chart.scale
          }
        });
      }

      this.state.tooltipElm = undefined;
    });

    this.dispatcher.on('active', () => {
      if (typeof this.props.onDisplayed === 'function') {
        this.props.onDisplayed({
          element: this.state.tooltipElm,
          resources: {
            formatter: this.chart.formatter,
            scale: this.chart.scale
          }
        });
      }
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
      this.state.targetElement = typeof this.props.appendTo === 'function' ? this.props.appendTo({
        resources: {
          formatter: this.chart.formatter,
          scale: this.chart.scale
        }
      }) : this.props.appendTo;
      const bounds = this.state.targetElement.getBoundingClientRect();
      const size = {
        width: bounds.width,
        height: bounds.height,
        scaleRatio: this.renderer.size().scaleRatio
      };
      this.renderer.destroy();
      this.rect = this.renderer.size(size);
      this.renderer.appendTo(this.state.targetElement);
    } else {
      this.state.targetElement = this.renderer.element();
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
    this.state.tooltipElm = render(items, pos, this);
  }
};

export { component as default };
