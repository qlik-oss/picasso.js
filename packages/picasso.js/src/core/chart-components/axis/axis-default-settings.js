// const DEFAULT_LAYOUT_SETTINGS = { // TODO create dis and con specific settings
//   anchor: 'auto', // TODO re-name from align..
//   // orientation: 'auto', // TODO impl. v/h/auto
//   // direction: 'auto', // TODO impl. left/right/top/bottom/auto
//   padding: { // TODO use dock layout margin instead..
//     start: 0,
//     end: 10
//   },
//   maxGlyphCount: NaN,
//   maxEdgeBleed: Infinity
//   // labelMode: 'auto' // TODO move here? auto, horizontal, layered
// };

/**
 * @typedef {object} ComponentAxis
 * @extends ComponentSettings
 * @property {'axis'} type component type
 * @property {string} scale reference to band or linear scale
 * @property {ComponentAxis~DiscreteSettings|ComponentAxis~ContinuousSettings} [settings] discrete or continuous axis settings
 * @example
 * {
 *  type: 'axis',
 *  scale: '<name-of-scale>'
 * }
 */

/**
 * Discrete axis settings
 * @typedef {object}
 * @alias ComponentAxis~DiscreteSettings
 * @example
 * {
 *  type: 'axis',
 *  scale: '<name-of-band-scale>',
 *  settings: {
 *    labels: {
 *      mode: 'tilted',
 *      tiltAngle: 40,
 *    },
 *  },
 * }
 */
const DEFAULT_DISCRETE_SETTINGS = {
  /**
   * @typedef {object}
   */
  labels: {
    /** Toggle labels on/off
     * @type {boolean=} */
    show: true,
    /** Tilting angle in degrees. Capped between -90 and 90. Only applicable when labels are in `tilted` mode.
     * @type {number=} */
    tiltAngle: 40,
    /** Threshold for toggle of tilted labels. Capped between 0 and 1. For example, if it is set to 0.7, then tilted labels will be toggled if less than 70% of the labels are visible.
     * @type {number=} */
    tiltThreshold: 0.7,
    /** Control the amount of space (in pixels) that labes can occupy outside their docking area. Only applicable when labels are in `tilted` mode.
     * @type {number=} */
    maxEdgeBleed: Infinity,
    /** Space in pixels between the tick and label.
     * @type {number=} */
    margin: 4,
    /** Max length of labels in pixels
     * @type {number=} */
    maxLengthPx: 150,
    /** Min length of labels in pixels. Labels will always at least require this much space
     * @type {number=} */
    minLengthPx: 0,
    /** Control how labels arrange themself. Availabe modes are `auto`, `horizontal`, `layered` and `tilted`. When set to `auto` the axis determines the best possible layout in the current context.
     * @type {string=} */
    mode: 'auto',
    /** When only a sub-set of data is available, ex. when paging. This property can be used to let the axis estimate how much space the labels will consume, allowing it to give a consistent space estimate over the entire dataset when paging.
     * @type {number=} */
    maxGlyphCount: NaN,
    /** Align act as a slider for the text bounding rect over the item bandwidth, given that the item have a bandwidth. Except when labels are tilted, then the align is a pure align that shifts the position of the label anchoring point.
     * @type {number=} */
    align: 0.5,
    /** Offset in pixels along the axis direction.
     * @type {number=} */
    offset: 0,
    /**
     * Toggle whether labels should be filtered if they are overlapping. Filtering may be applied in a non-sequential order.
     * If labels are overlapping and this setting is toggled off, the axis will automatically hide.
     * @type {boolean=}
     */
    filterOverlapping: false,
  },
  /**
   * @typedef {object}
   */
  ticks: {
    /** Toggle ticks on/off
     * @type {boolean=} */
    show: false,
    /** Space in pixels between the ticks and the line.
     * @type {number=} */
    margin: 0,
    /** Size of the ticks in pixels.
     * @type {number=} */
    tickSize: 4,
  },
  /**
   * @typedef {object}
   */
  line: {
    /** Toggle line on/off
     * @type {boolean=} */
    show: false,
  },
  /** Padding in direction perpendicular to the axis
   * @type {number=} */
  paddingStart: 0,
  /** Padding in direction perpendicular to the axis
   * @type {number=} */
  paddingEnd: 10,
  /** Set the anchoring point of the axis. Available options are `auto/left/right/bottom/top`. In `auto` the axis determines the best option. The options are restricted based on the axis orientation, a vertical axis may only anchor on `left` or `right`
   * @type {string=} */
  align: 'auto',
  /**
   * If set to `true`, the axis will be hidden from screen readers.
   * @type {boolean=} */
  disableScreenReader: false,
};

/**
 * @typedef {object} ArcSettings
 * @property {number} startAngle - Start of arc line, in radians
 * @property {number} endAngle - End of arc line, in radians
 * @property {number} radius - Radius of arc line
 */

/**
 * Continuous axis settings
 * @typedef {object}
 * @alias ComponentAxis~ContinuousSettings
 * @property {ArcSettings=} arc - Optional arc settings
 * @example
 * {
 *  type: 'axis',
 *  scale: '<name-of-linear-scale>',
 *  settings: {
 *    minorTicks: {
 *      show: false,
 *    },
 *  },
 * }
 */
const DEFAULT_CONTINUOUS_SETTINGS = {
  /**
   * @typedef {object}
   */
  labels: {
    /** Toggle labels on/off
     * @type {boolean=} */
    show: true,
    /** Space in pixels between the tick and label.
     * @type {number=} */
    margin: 4,
    /** Max length of labels in pixels
     * @type {number=} */
    maxLengthPx: 150,
    /** Min length of labels in pixels. Labels will always at least require this much space
     * @type {number=} */
    minLengthPx: 0,
    /** Align act as a slider for the text bounding rect over the item bandwidth, given that the item have a bandwidth.
     * @type {number=} */
    align: 0.5,
    /** Offset in pixels along the axis direction.
     * @type {number=} */
    offset: 0,
    /**
     * Toggle whether labels should be filtered if they are overlapping. Filtering may be applied in a non-sequential order.
     * If labels are overlapping and this setting is toggled off, the axis will automatically hide.
     * @type {boolean=}
     */
    filterOverlapping: true,
  },
  /**
   * @typedef {object}
   */
  ticks: {
    /** Toggle ticks on/off
     * @type {boolean=} */
    show: true,
    /** Space in pixels between the ticks and the line.
     * @type {number=} */
    margin: 0,
    /** Size of the ticks in pixels.
     * @type {number=} */
    tickSize: 8,
  },
  /**
   * @typedef {object}
   */
  minorTicks: {
    /** Toggle minor-ticks on/off
     * @type {boolean=} */
    show: false,
    /** Size of the ticks in pixels.
     * @type {number=} */
    tickSize: 3,
    /** Space in pixels between the ticks and the line.
     * @type {number=} */
    margin: 0,
  },
  /**
   * @typedef {object}
   */
  line: {
    /** Toggle line on/off
     * @type {boolean=} */
    show: true,
  },
  /** Padding in direction perpendicular to the axis
   * @type {number=} */
  paddingStart: 0,
  /** Padding in direction perpendicular to the axis
   * @type {number=} */
  paddingEnd: 10,
  /** Set the anchoring point of the axis. Available options are `auto/left/right/bottom/top`. In `auto` the axis determines the best option. The options are restricted based on the axis orientation, a vertical axis may only anchor on `left` or `right`
   * @type {string=} */
  align: 'auto',
  /**
   * If set to `true`, the axis will be hidden from screen readers.
   * @type {boolean=} */
  disableScreenReader: false,
};

export { DEFAULT_DISCRETE_SETTINGS, DEFAULT_CONTINUOUS_SETTINGS };
