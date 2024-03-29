import extend from 'extend';
import { pie, arc } from 'd3-shape';

/**
 * Component settings
 * @typedef {object}
 * @alias ComponentPie.settings
 */
const DEFAULT_DATA_SETTINGS = {
  /** Start angle of the pie, in radians
   * @type {number=} */
  startAngle: 0,
  /** End angle of the pie, in radians
   * @type {number=} */
  endAngle: 2 * Math.PI,
  /**
   * @typedef {object}
   */
  slice: {
    label: '',
    /** Absolute value of the slice's arc length
     * @type {number=} */
    arc: 1,
    /** Visibility of the slice
     * @type {boolean=} */
    show: true,
    /** Fill color of the slice
     * @type {string=} */
    fill: '#333',
    /** Stroke color of the slice
     * @type {string=} */
    stroke: '#ccc',
    /** Stroke width of the slice
     * @type {number=} */
    strokeWidth: 1,
    /** Stroke line join
     * @type {string=} */
    strokeLinejoin: 'round',
    /** Opacity of the slice
     * @type {number=} */
    opacity: 1,
    /** Inner radius of the slice
     * @type {number=} */
    innerRadius: 0,
    /** Outer radius of the slice
     * @type {number=} */
    outerRadius: 0.8,
    /** Corner radius of the slice, in pixels
     * @type {number=} */
    cornerRadius: 0,
    /** Radial offset of the slice
     * @type {number=} */
    offset: 0,
  },
};

/**
 * @typedef {object} ComponentPie
 * @extends ComponentSettings
 * @property {'pie'} type component type
 * @example
 * {
 *   type: 'pie',
 *   data: {
 *     extract: {
 *       field: 'Region',
 *       props: {
 *         num: { field: 'Population' }
 *       }
 *     }
 *   },
 *   settings: {
 *     startAngle: Math.PI / 2,
 *     endAngle: -Math.PI / 2,
 *     slice: {
 *       arc: { ref: 'num' },
 *       fill: 'green',
 *       stroke: 'red',
 *       strokeWidth: 2,
 *       strokeLinejoin: 'round',
 *       innerRadius: 0.6,
 *       outerRadius 0.8,
 *       opacity: 0.8,
 *       offset: 0.2
 *     }
 *   }
 * }
 */

function offsetSlice(centroid, offset, outerRadius, innerRadius) {
  let [vx, vy] = centroid;
  const vlen = Math.sqrt(vx * vx + vy * vy);
  vx /= vlen;
  vy /= vlen;
  const diff = outerRadius - innerRadius;
  return { x: vx * offset * diff, y: vy * offset * diff };
}

function createDisplayPies(arcData, { x, y, width, height }, slices, sum) {
  const arcGen = arc();
  const center = { x: x + width / 2, y: y + height / 2 };
  const innerRadius = Math.min(width, height) / 2;
  const outerRadius = Math.min(width, height) / 2;
  const cornerRadius = outerRadius / 100;
  return arcData.map((a, i) => {
    const slice = slices[i];
    slice.type = 'path';
    const or = outerRadius * slice.outerRadius;
    const ir = innerRadius * slice.innerRadius;
    const cr = cornerRadius * slice.cornerRadius;
    arcGen.innerRadius(ir);
    arcGen.outerRadius(or);
    arcGen.cornerRadius(cr);
    slice.arcDatum = a;
    const centroid = arcGen.centroid(a);
    const offset = slice.offset ? offsetSlice(centroid, slice.offset, or, ir) : { x: 0, y: 0 };
    slice.transform = `translate(${offset.x}, ${offset.y}) translate(${center.x}, ${center.y})`;
    slice.desc = {
      share: a.value / sum,
      slice: {
        start: a.startAngle,
        end: a.endAngle,
        innerRadius: ir,
        outerRadius: or,
        cornerRadius: cr,
        offset: { x: center.x + offset.x, y: center.y + offset.y },
      },
    };

    return slice;
  });
}

export function arcValue(stngs, item) {
  if (stngs.slice && 'arc' in stngs.slice) {
    return item.arc;
  }
  return item.data.value;
}

const pieComponent = {
  require: ['chart', 'resolver'],
  defaultSettings: {
    settings: {
      startAngle: 0,
      endAngle: 2 * Math.PI,
      padAngle: 0,
      slice: {},
    },
    style: {
      slice: '$shape',
    },
    data: {},
  },
  render({ data }) {
    const arcValues = [];
    const slices = [];
    const stngs = this.settings.settings;
    const { items } = this.resolver.resolve({
      data,
      defaults: extend({}, DEFAULT_DATA_SETTINGS.slice, this.style.slice),
      settings: stngs.slice,
    });

    let sum = 0;
    for (let i = 0, len = items.length; i < len; i++) {
      const val = arcValue(stngs, items[i]);
      if (val > 0 && items[i].outerRadius >= items[i].innerRadius) {
        arcValues.push(val);
        slices.push(items[i]);
        sum += val;
      }
    }

    const pieGen = pie().sortValues(null);
    pieGen.startAngle(stngs.startAngle);
    pieGen.endAngle(stngs.endAngle);
    pieGen.padAngle(stngs.padAngle);
    const arcData = pieGen(arcValues);

    return createDisplayPies(arcData, extend({}, this.rect, { x: 0, y: 0 }), slices, sum);
  },
};

export default pieComponent;
