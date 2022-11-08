const palettes = [
  {
    key: 'categorical',
    colors: [
      [
        '#a54343',
        '#d76c6c',
        '#ec983d',
        '#ecc43d',
        '#f9ec86',
        '#cbe989',
        '#70ba6e',
        '#578b60',
        '#79d69f',
        '#26a0a7',
        '#138185',
        '#65d3da',
      ], // breeze colors
    ],
  },
  {
    key: 'diverging',
    colors: [
      ['#3d52a1', '#3a89c9', '#77b7e5', '#b4ddf7', '#e6f5fe', '#ffe3aa', '#f9bd7e', '#ed875e', '#d24d3e', '#ae1c3e'],
    ],
  },
  {
    key: 'sequential',
    colors: [['rgb(180,221,212)', 'rgb(34, 83, 90)']],
  },
];

/* eslint quote-props: 0 */
const style = {
  // -- FOUNDATION --
  // fonts
  '$font-family': "'Source Sans Pro', Arial, sans-serif",
  '$font-size': '12px',
  '$line-height': '16px',
  '$font-size--l': '16px',
  '$font-weight': 'normal',

  // base grays
  '$gray-100': '#ffffff',
  '$gray-98': '#f9f9f9',
  '$gray-95': '#f2f2f2',
  '$gray-90': '#e6e6e6',
  '$gray-35': '#595959',
  '$gray-30': '#4d4d4d',
  '$gray-25': '#404040',
  '$gray-20': '#333333',

  // borders
  '$border-95': 'rgba(255, 255, 255, 0.05)',
  '$border-90': 'rgba(255, 255, 255, 0.1)',
  '$border-80': 'rgba(255, 255, 255, 0.2)',
  '$border-20': 'rgba(0, 0, 0, 0.2)',
  '$border-10': 'rgba(0, 0, 0, 0.1)',
  '$border-5': 'rgba(0, 0, 0, 0.05)',

  // primary colors
  '$primary-blue': '#3F8AB3',
  '$primary-green': '#6CB33F',
  '$primary-red': '#DC423F',
  '$primary-orange': '#EF960F',

  // spacing
  '$spacing--s': 4,
  $spacing: 8,
  '$spacing--l': 12,
  // -------------------------

  // -- ALIASES --
  '$font-color': '$gray-35',
  '$font-color--inverted': '$gray-90',
  '$guide-color': '$gray-90',
  '$guide-color--inverted': '$gray-35',
  $border: '$border-80',
  '$border--inverted': '$border-10',
  // -------------------------

  // -- MIXINS --
  // data points
  $shape: {
    // data shape
    fill: '$primary-blue',
    strokeWidth: 1,
    stroke: '$border',
  },

  '$shape-outline': {
    // data shape which usually does not have a fill, e.g. the line in a linechart
    stroke: '$primary-blue',
    strokeWidth: 2,
  },

  '$shape-guide': {
    // lines that somehow belongs to a data shape, e.g. whiskers in a boxplot
    stroke: '$guide-color',
    strokeWidth: 1,
  },

  '$shape-guide--inverted': {
    '@extend': '$shape-guide',
    stroke: '$guide-color--inverted',
  },

  $label: {
    fontSize: '$font-size',
    fontFamily: '$font-family',
    fill: '$font-color',
  },

  '$label--inverted': {
    $extend: '$label',
    fill: '$font-color--inverted',
  },

  // user interface
  '$label-overlay': {
    // e.g. selection range bubble
    fontSize: '$font-size--l',
    fontFamily: '$font-family',
    fill: '$gray-100', // background fill
    color: '$font-color',
    stroke: '$guide-color--inverted',
    strokeWidth: 1,
    borderRadius: 4,
  },

  $title: {
    '@extend': '$label',
    fontSize: '$font-size--l',
    fontWeight: '$font-weight',
    stroke: '$guide-color--inverted',
    strokeWidth: 0,
  },

  '$guide-line': {
    strokeWidth: 1,
    stroke: '$guide-color',
  },

  '$guide-line--minor': {
    strokeWidth: 1,
    stroke: '$gray-95', // needs alias
  },

  '$padding--s': {
    left: '$spacing--s',
    right: '$spacing--s',
    top: '$spacing--s',
    bottom: '$spacing--s',
  },

  $padding: {
    left: '$spacing',
    right: '$spacing',
    top: '$spacing',
    bottom: '$spacing',
  },

  '$selection-area-target': {
    fill: '$primary-green',
    strokeWidth: 0,
    opacity: 0.2,
  },
};

export { style, palettes };
