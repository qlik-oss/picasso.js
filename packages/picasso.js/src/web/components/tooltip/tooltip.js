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
   * Is called as a part of the `show` event.
   * @type {function=}
   * @returns {array} An array of nodes
   * @example
   * (nodes) => nodes.filter(node.key === '<target-component-key>')
   */
  filter: nodes => nodes.filter(node => node.data), // Filter SceneNodes
  /**
   * Extract data from a node.
   * @type {function=}
   * @returns {object} An array of data
   */
  extract: ctx => ctx.node.data.value,
  /**
   * Content generator. Extracted data is available in the `data` property, where each value in the area
   * is the extracted datum from a node.
   * @type {function=}
   * @returns {object[]} Array of h objects
   */
  content: ({ h, data }) => data.map(datum => h('div', {}, datum)),
  /**
   * Comparison function, if evaluted to true, the incoming nodes are ignored and any active tooltip
   * remains. If evaluated to false, any active tooltip is cleared and a new tooltip is d
   * 
   * Compare condition. A function that define if the tooltip event `over` should be debounced or not.
   * Two parameters are passed to the function, the first is a set of nodes, representing active
   * nodes displayed in the tooltip, and the second parameter is the incoming set of nodes.
   *
   * Typically if the two set of nodes are the same, it should be evaluted to true.
   * @type {function=}
   * @returns {boolean} True if the event should be debounced, false otherwise
   */
  isEqual: (prev, curr) => prev.length &&
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
  contentClass: {},
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
  tooltip: {},
  content: {
    backgroundColor: '$gray-35',
    color: '$font-color--inverted',
    fontFamily: '$font-family',
    fontSize: '$font-size',
    lineHeight: '$line-height',
    borderRadius: '4px',
    padding: '8px',
    opacity: 0.9
  },
  arrow: {
    position: 'absolute',
    width: '0px',
    height: '0px',
    borderStyle: 'solid',
    color: '$gray-35',
    opacity: 0.9
  },
  'arrow-bottom': {
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent'
  },
  'arrow-top': {
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent'
  },
  'arrow-right': {
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent'
  },
  'arrow-left': {
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent'
  }
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
    hide() {
      this.dispatcher.clear();
      this.state.activeNodes = [];
      this.state.pointer = {};
    },
    show(event, { nodes, duration, delay } = {}) {
      if (this.state.prevent) {
        return;
      }

      // Set pointer here to always expose latest pointer to invokeRenderer
      this.state.pointer = toPoint(event, this);

      let fNodes;
      if (Array.isArray(nodes)) {
        fNodes = this.props.filter(nodes);
      } else {
        fNodes = this.props.filter(this.chart.shapesAt({
          x: this.state.pointer.cx,
          y: this.state.pointer.cy
        }));
      }

      if (this.props.isEqual(this.state.activeNodes, fNodes)) {
        return;
      }

      this.dispatcher.clear();
      this.state.activeNodes = fNodes;

      if (this.state.activeNodes.length) {
        this.dispatcher.invoke(
          () => this.invokeRenderer(this.state.activeNodes),
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
