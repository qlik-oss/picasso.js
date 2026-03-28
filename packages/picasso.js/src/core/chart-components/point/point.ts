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
 * @typedef {object=}
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
 * Image settings. Applies only when point shape is set to 'image'.
 * @typedef {object=}
 * @alias ComponentPoint.settings.imageSettings
 */
const DEFAULT_IMAGE_SETTINGS = {
  /** Image source
   * @type {string=} */
  imageSrc: undefined,
  /** Image scaling factor
   * @type {number=} */
  imageScalingFactor: undefined,
  /** Position of image
   * @type {string=} */
  position: 'center-center',
  /** Shape of image: 'rectangle' or 'circle'
   * @type {string=} */
  symbol: 'rectangle',
  /** Image width. If not set, the image's natural width is used
   * @type {number=} */
  width: undefined,
  /** Image height. If not set, the image's natural height is used
   * @type {number=} */
  height: undefined,
};

/**
 * @typedef {object=}
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

function getPxSpaceFromScale(s: any, space: number): { isBandwidth: boolean; value: number } {
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

function getPointSizeLimits(x: any, y: any, width: number, height: number, limits: any): { min: number; max: number; maxGlobal: number; minGlobal: number } {
  const xSpacePx = getPxSpaceFromScale(x ? x.scale : undefined, width);
  const ySpacePx = getPxSpaceFromScale(y ? y.scale : undefined, height);
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

function getType(s: any): [string, Record<string, any>] {
  let type = DEFAULT_DATA_SETTINGS.shape;
  let props: Record<string, any> = {};
  if (typeof s.shape === 'object' && typeof s.shape.type === 'string') {
    type = s.shape.type;
    props = s.shape;
  } else if (typeof s.shape === 'string') {
    type = s.shape;
  }

  return [type, props];
}

function createDisplayPoints(dataPoints: any[], { width, height }: { width: number; height: number }, pointSize: any, shapeFn: (spec: Record<string, unknown>) => Record<string, unknown>): any[] {
  return dataPoints
    .filter((p: any) => p.show !== false && !isNaN(p.x + p.y))
    .map((p: any) => {
      let s = p;
      let size = PX_RX.test(p.size) ? parseInt(p.size, 10) : pointSize.min + s.size * (pointSize.max - pointSize.min);
      if (notNumber(size)) {
        s = DEFAULT_ERROR_SETTINGS.errorShape;
        size = pointSize.min + s.size * (pointSize.max - pointSize.min);
      }
      const [type, typeProps] = getType(s);
      const shapeSpec: Record<string, unknown> = {
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
        imageSettings: s.imageSettings,
      };
      if (s === p.errorShape) {
        shapeSpec.width = s.width;
      }
      const shape: Record<string, unknown> = shapeFn(shapeSpec);
      shape.data = p.data;
      return shape;
    });
}

const component: Record<string, any> = {
  require: ['chart', 'resolver', 'symbol'],
  defaultSettings: {
    settings: {},
    data: {},
    animations: {
      enabled: false,
      trackBy: (node: any) => node.data.value,
    },
    style: {
      item: '$shape',
    },
  },
  render({ data }: { data: any }): any[] {
    const resolved: any = (this as any).resolver.resolve({
      data,
      defaults: extend({}, DEFAULT_DATA_SETTINGS, (this as any).style.item),
      settings: (this as any).settings.settings,
      scaled: {
        x: (this as any).rect.width,
        y: (this as any).rect.height,
      },
    });
    const { width, height } = (this as any).rect;
    const limits = extend({}, SIZE_LIMITS, (this as any).settings.settings.sizeLimits);
    const points: any[] = resolved.items;
    if (points.length > 0 && points[0].shape === 'image') {
      data.items.forEach((d: any, i: number) => {
        points[i].imageSettings = extend({}, DEFAULT_IMAGE_SETTINGS, (this as any).settings.settings.imageSettings);
      });
    }

    const pointSize = getPointSizeLimits(resolved.settings.x, resolved.settings.y, width, height, limits);
    return createDisplayPoints(points, (this as any).rect, pointSize, (this as any).settings.shapeFn || (this as any).symbol);
  },
};
export default component;
