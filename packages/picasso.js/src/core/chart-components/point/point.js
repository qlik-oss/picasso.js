import extend from 'extend';
import { notNumber } from '../../utils/is-number';

const DEFAULT_ERROR_SETTINGS = {
  errorShape: {
    shape: 'saltire',
    width: 2,
    size: 0.5,
    fill: '#333',
    stroke: '#333',
    strokeWidth: 0,
  },
};

const PX_RX = /px$/;

/**
 * @typedef {object}
 * @alias component--point.settings
 */
const DEFAULT_DATA_SETTINGS = {
  /** Type of shape
   * @type {datum-string=} */
  shape: 'circle',
  label: '',
  /** Fill color
   * @type {datum-string=} */
  fill: '#333',
  /** Stroke color
   * @type {datum-string=} */
  stroke: '#ccc',
  /** Stroke width
   * @type {datum-number=} */
  strokeWidth: 0,
  /** Stroke line join
   * @type {string=} */
  strokeLinejoin: 'miter',
  /** Opacity of shape
   * @type {datum-number=} */
  opacity: 1,
  /** Normalized x coordinate
   * @type {datum-number=} */
  x: 0.5,
  /** Normalized y coordinate
   * @type {datum-number=} */
  y: 0.5,
  /** Normalized size of shape
   * @type {datum-number=} */
  size: 1,
  strokeDasharray: '',
  /** Whether or not to show the point
   * @type {datum-boolean=} */
  show: true,
};

/**
 * @typedef {object}
 * @alias component--point.settings.sizeLimits
 */
const SIZE_LIMITS = {
  /** Maximum size of shape, in pixels
   * @type {number=} */
  maxPx: 10000,
  /** Minimum size of shape, in pixels
   * @type {number=} */
  minPx: 1,
  /** Maximum size relative linear scale extent
   * @type {number=} */
  maxRelExtent: 0.1,
  /** Minimum size relative linear scale extent
   * @type {number=} */
  minRelExtent: 0.01,
  /** Maximum size relative discrete scale banwidth
   * @type {number=} */
  maxRelDiscrete: 1,
  /** Minimum size relative discrete scale banwidth
   * @type {number=} */
  minRelDiscrete: 0.1,
};

function getPxSpaceFromScale(s, space) {
  if (s && typeof s.bandwidth === 'function') {
    // some kind of ordinal scale
    return {
      isBandwidth: true,
      value: Math.max(1, s.bandwidth() * space),
    };
  }
  return {
    isBandwidth: false,
    value: Math.max(1, space),
  };
}

function getPointSizeLimits(x, y, width, height, limits) {
  const xSpacePx = getPxSpaceFromScale(x ? x.scale : undefined, width, limits);
  const ySpacePx = getPxSpaceFromScale(y ? y.scale : undefined, height, limits);
  let maxSizePx = Math.min(
    xSpacePx.value * limits[xSpacePx.isBandwidth ? 'maxRelDiscrete' : 'maxRelExtent'],
    ySpacePx.value * limits[ySpacePx.isBandwidth ? 'maxRelDiscrete' : 'maxRelExtent']
  );
  let minSizePx = Math.min(
    xSpacePx.value * limits[xSpacePx.isBandwidth ? 'minRelDiscrete' : 'minRelExtent'],
    ySpacePx.value * limits[ySpacePx.isBandwidth ? 'minRelDiscrete' : 'minRelExtent']
  );
  const min = Math.max(1, Math.floor(minSizePx));
  const max = Math.max(1, Math.floor(maxSizePx));
  return {
    min,
    max,
    maxGlobal: limits.maxPx,
    minGlobal: limits.minPx,
  };
}

function createDisplayPoints(dataPoints, { width, height }, pointSize, shapeFn) {
  return dataPoints
    .filter(p => p.show !== false && !isNaN(p.x + p.y))
    .map(p => {
      let s = p;
      let size = PX_RX.test(p.size) ? parseInt(p.size, 10) : pointSize.min + s.size * (pointSize.max - pointSize.min);
      if (notNumber(size)) {
        s = DEFAULT_ERROR_SETTINGS.errorShape;
        size = pointSize.min + s.size * (pointSize.max - pointSize.min);
      }
      const shapeSpec = {
        type: s.shape === 'rect' ? 'square' : s.shape,
        label: p.label,
        x: p.x * width,
        y: p.y * height,
        fill: s.fill,
        size: Math.min(pointSize.maxGlobal, Math.max(pointSize.minGlobal, size)),
        stroke: s.stroke,
        strokeWidth: s.strokeWidth,
        strokeDasharray: s.strokeDasharray,
        opacity: s.opacity,
      };
      if (s === p.errorShape) {
        shapeSpec.width = s.width;
      }
      const shape = shapeFn(shapeSpec);

      shape.data = p.data;
      return shape;
    });
}

const component = {
  require: ['chart', 'resolver', 'symbol'],
  defaultSettings: {
    settings: {},
    data: {},
    animations: {
      enabled: false,
      trackBy: node => node.data.value,
    },
    style: {
      item: '$shape',
    },
  },
  render({ data }) {
    const resolved = this.resolver.resolve({
      data,
      defaults: extend({}, DEFAULT_DATA_SETTINGS, this.style.item),
      settings: this.settings.settings,
      scaled: {
        x: this.rect.width,
        y: this.rect.height,
      },
    });
    const { width, height } = this.rect;
    const limits = extend({}, SIZE_LIMITS, this.settings.settings.sizeLimits);
    const points = resolved.items;
    const pointSize = getPointSizeLimits(resolved.settings.x, resolved.settings.y, width, height, limits);
    return createDisplayPoints(points, this.rect, pointSize, this.settings.shapeFn || this.symbol);
  },
};

export default component;
