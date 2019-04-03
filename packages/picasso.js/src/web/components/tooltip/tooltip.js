import extend from 'extend';
import extractor from './extractor';
import render from './render';
import timeSpanDispatcher from './timespan-dispatcher';
import placement from './placement';
import {
  setActive,
  removeActive,
  cancelActive,
  remove
} from './instance-handler';

/**
 * @typedef {object}
 * @alias component--tooltip.settings
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
   * Reduce incoming nodes to only a set of applicable nodes. Is called as a part of the `show` event.
   * @type {function=}
   * @returns {array} An array of nodes
   */
  filter: nodes => nodes.filter(node => node.data && typeof node.data.value !== 'undefined'),
  /**
   * Extract data from a node.
   * @type {function=}
   * @returns {object} An array of data
   */
  extract: ctx => ctx.node.data.value,
  /**
   * Content generator. Extracted data is available in the `data` property, where each value in the area is the extracted datum from a node.
   * @type {function=}
   * @returns {object[]} Array of h objects
   */
  content: ({ h, data }) => data.map(datum => h('div', {}, datum)),
  /**
   * Comparison function. If evaluted to true, the incoming nodes in the `show` event are ignored. If evaluated to false, any active tooltip is cleared and a new tooltip is queued.
   *
   * The function gets two parameters, the first is the currently active set of nodes, if any, and the second is the incoming set of nodes. By default the two set of nodes are considered equal if their data attributes are the same.
   * @type {function=}
   * @returns {boolean}
   */
  isEqual: (prev, curr) => prev.length
    && prev.length === curr.length
    && prev.every((p, i) => curr[i] && JSON.stringify(p.data) === JSON.stringify(curr[i].data)),
  /**
   * @typedef {object=}
   */
  placement: {
    /**
     * Available types: [pointer | bounds | slice]
     * @type {string=}
     */
    type: 'pointer',
    /**
     * Docking position of the tooltip. Available positions: [left | right | top | bottom | auto]
     * @type {string=}
     */
    dock: 'auto',
    /**
     * Distance from the content area to the tooltip position, in px.
     * @type {number=}
     */
    offset: 8,
    /**
     * Specify the limiting area, where target is the component area unless the appendTo property is set, in which case it referes to the appendTo element. Viewport is the browser viewport.
     *
     * Available options are: [viewport | target]
     * @type {number=}
     */
    area: 'viewport'
  },
  /**
   * Set tooltip class.
  * @type {object<string, boolean>=}
  */
  tooltipClass: {},
  /**
   * Set content class.
  * @type {object<string, boolean>=}
  */
  contentClass: {},
  /**
   * Set arrow class.
  * @type {object<string, boolean>=}
  */
  arrowClass: {},
  /**
   * Content direction [ltr | rtl]
   * @type {string=}
   */
  direction: 'ltr',
  /**
   * Explicitly set a target element. This allows the tooltip to attach itself outside the picasso container.
   * @type {HTMLElement=}
   */
  appendTo: undefined,
  /**
   * Component lifecycle hook. Called before the tooltip is displayed.
   * @type {function=}
   */
  beforeShow: undefined,
  /**
   * Component lifecycle hook. Called after the tooltip have been displayed.
   * @type {function=}
   */
  afterShow: undefined,
  /**
   * Component lifecycle hook. Called before the tooltip is hidden.
   * @type {function=}
   */
  beforeHide: undefined,
  /**
   * Component lifecycle hook. Called when the toolip is hidden. By default this deletes the tooltip element.
   * @type {function=}
   */
  onHide: undefined,
  /**
   * Component lifecycle hook. Called after the tooltip is hidden.
   * @type {function=}
   */
  afterHide: undefined
};

const DEFAULT_STYLE = {
  tooltip: {},
  content: {
    backgroundColor: '$gray-25',
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
    color: '$gray-25',
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
      this.hide();
    },
    show(event, opts = {}) {
      this.show(event, opts);
    },
    prevent(p) {
      this.prevent(p);
    }
  },
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

      if (typeof this.props.beforeShow === 'function') {
        this.props.beforeShow.call(undefined, {
          resources: {
            formatter: this.chart.formatter,
            scale: this.chart.scale
          }
        });
      }
    });

    this.dispatcher.on(['cancelled', 'fulfilled'], () => {
      const listenerCtx = {
        resources: {
          formatter: this.chart.formatter,
          scale: this.chart.scale
        }
      };

      if (typeof this.props.beforeHide === 'function') {
        this.props.beforeHide.call(undefined, extend({ element: this.state.tooltipElm }, listenerCtx));
      }

      if (typeof this.props.onHide === 'function') {
        this.props.onHide.call(undefined, extend({ element: this.state.tooltipElm }, listenerCtx));
      } else {
        this.renderer.clear([]); // Hide tooltip
      }

      if (typeof this.props.afterHide === 'function') {
        this.props.afterHide.call(undefined, listenerCtx);
      }

      removeActive(instanceId);
      this.state.tooltipElm = undefined;
    });

    this.dispatcher.on('active', () => {
      if (typeof this.props.afterShow === 'function') {
        this.props.afterShow.call(undefined, {
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
      this.dispatcher.destroy();
      remove();
    }
    this.init(settings);
  },
  render(h) {
    this.h = h;
    return []; // Nothing to render initially.
  },
  beforeDestroy() {
    this.dispatcher.destroy();
    remove();
  },
  appendTo() {
    if (this.props.appendTo) {
      this.state.targetElement = typeof this.props.appendTo === 'function' ? this.props.appendTo({
        resources: {
          formatter: this.chart.formatter,
          scale: this.chart.scale
        }
      }) : this.props.appendTo;
      const { width, height } = this.state.targetElement.getBoundingClientRect();
      this.renderer.destroy();
      this.renderer.size({ width, height });
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
