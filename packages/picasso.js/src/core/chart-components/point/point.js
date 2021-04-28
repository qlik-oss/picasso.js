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
 * Component settings
 * @typedef {object}
 * @alias ComponentPoint.settings
 */
const DEFAULT_DATA_SETTINGS = {
  /** Type of shape
   * @type {DatumString=} */
  shape: 'circle',
  /** Label
   * @type {DatumString=} */
  label: '',
  /** Fill color
   * @type {DatumString=} */
  fill: '#333',
  /** Stroke color
   * @type {DatumString=} */
  stroke: '#ccc',
  /** Stroke dash array
   * @type {DatumString=} */
  strokeDasharray: '',
  /** Stroke width
   * @type {DatumNumber=} */
  strokeWidth: 0,
  /** Stroke line join
   * @type {DatumString=} */
  strokeLinejoin: 'miter',
  /** Opacity of shape
   * @type {DatumNumber=} */
  opacity: 1,
  /** Normalized x coordinate
   * @type {DatumNumber=} */
  x: 0.5,
  /** Normalized y coordinate
   * @type {DatumNumber=} */
  y: 0.5,
  /** Normalized size of shape
   * @type {DatumNumber=} */
  size: 1,
  /** Whether or not to show the point
   * @type {DatumBoolean=} */
  show: true,
};

/**
 * @typedef {object}
 * @alias ComponentPoint.settings.sizeLimits
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

function getType(s) {
  let type = DEFAULT_DATA_SETTINGS.shape;
  let props = {};
  if (typeof s.shape === 'object' && typeof s.shape.type === 'string') {
    type = s.shape.type;
    props = s.shape;
  } else if (typeof s.shape === 'string') {
    type = s.shape;
  }
  type = type === 'rect' ? 'square' : type;

  return [type, props];
}

function createDisplayPoints(dataPoints, { width, height }, pointSize, shapeFn, errorShape) {
  return dataPoints
    .filter((p) => p.show !== false && !isNaN(p.x + p.y))
    .map((p) => {
      let s = p;
      let size = PX_RX.test(p.size) ? parseInt(p.size, 10) : pointSize.min + s.size * (pointSize.max - pointSize.min);
      if (notNumber(size)) {
        s = {
          fill: p.fill,
          stroke: p.stroke,
          strokeWidth: p.strokeWidth,
          strokeDasharray: p.strokeDasharray,
          opacity: p.opacity,
          ...(errorShape || DEFAULT_ERROR_SETTINGS.errorShape),
        };
        size = PX_RX.test(s.size) ? parseInt(s.size, 10) : pointSize.min + s.size * (pointSize.max - pointSize.min);
      }

      const [type, typeProps] = getType(s);
      const shapeSpec = {
        ...typeProps,
        type,
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
      trackBy: (node) => node.data.value,
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
    const shapeFn = this.settings.shapeFn || this.symbol;
    const { errorShape } = this.settings;
    return createDisplayPoints(points, this.rect, pointSize, shapeFn, errorShape);
  },
};

export default component;
