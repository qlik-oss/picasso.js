import extend from 'extend';
import type { DisplayNodeSettings, ColliderDefinition } from './display-object';
import type { Rect } from '../../geometry/rect';
import {
  arc,
  area,
  curveLinear,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  curveBasis,
  curveCardinal,
  curveCatmullRom,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
} from 'd3-shape';
import DisplayObject from './display-object';
import { getMinMax } from '../../geometry/util';
import pathToSegments from '../parse-path-d';
import polylineToPolygonCollider from '../polyline-to-polygon-collider';
import flatten from '../../utils/flatten-array';

const EPSILON = 1e-12;

interface AxisDef {
  p: string;
  size: number;
}

interface LayerObject {
  curve: string;
}

interface AreaSettings {
  coordinates?: { defined?: boolean };
  connect?: boolean;
}

interface PointData {
  x: number;
  y: number;
  major: number;
  minor: number;
  minor0: number;
  dummy?: boolean;
  defined?: boolean;
}

interface SliceDesc {
  innerRadius: number;
  outerRadius: number;
  cornerRadius: number;
}

interface ColliderDef {
  type?: string;
  visual?: boolean;
  [key: string]: unknown;
}

const CURVES = {
  step: curveStep,
  stepAfter: curveStepAfter,
  stepBefore: curveStepBefore,
  linear: curveLinear,
  basis: curveBasis,
  cardinal: curveCardinal.tension(0),
  catmullRom: curveCatmullRom,
  monotonex: curveMonotoneX,
  monotoney: curveMonotoneY,
  natural: curveNatural,
};

/**
 * @private
 * @extends DisplayObject
 * @typedef {object} PathNode
 * @property {string} d - {@link https://www.w3.org/TR/SVG/paths.html#DAttribute}
 */

function isClosed(points) {
  if (points.length < 2) {
    return false;
  }
  const p0 = points[0];
  const p1 = points[points.length - 1];

  return Math.abs(p0.x - p1.x) < EPSILON && Math.abs(p0.y - p1.y) < EPSILON;
}

export default class Path extends DisplayObject {
  declare __boundingRect: Record<string, Rect | null>;
  declare __bounds: Record<string, Array<{ x: number; y: number }> | null>;
  declare segments: PointData[][];
  declare points: PointData[];
  constructor(...s: unknown[]) {
    super('path');
    this.boundingRect = (includeTransform: boolean = false): Rect => {
      const key = String(includeTransform);
      const cached = this.__boundingRect[key];
      if (cached !== null && cached !== undefined) {
        return cached;
      }

      if (!this.points.length) {
        this.segments = this.segments.length ? this.segments : pathToSegments(this.attrs.d as string);
        this.points = flatten(this.segments);
      }

      const pt =
        includeTransform && this.modelViewMatrix ? this.modelViewMatrix.transformPoints(this.points) : this.points;
      const [xMin, yMin, xMax, yMax] = getMinMax(pt);

      this.__boundingRect[key] = {
        x: xMin || 0,
        y: yMin || 0,
        width: xMax - xMin || 0,
        height: yMax - yMin || 0,
      };

      return this.__boundingRect[key] as Rect;
    };
    this.set(...(s as [DisplayNodeSettings?]));
  }

  set(v: DisplayNodeSettings = {}) {
    super.set(v);
    this.segments = [];
    this.points = [];
    if (v.arcDatum) {
      const arcGen = arc();
      const desc = v.desc as { slice: SliceDesc };
      arcGen.innerRadius(desc.slice.innerRadius);
      arcGen.outerRadius(desc.slice.outerRadius);
      arcGen.cornerRadius(desc.slice.cornerRadius);
      const d: string = arcGen(v.arcDatum);
      this.attrs.d = d;
    } else if (v.points) {
      const { major, minor, layerObj, points, stngs, generatorType } = v as unknown as {
        major: AxisDef;
        minor: AxisDef;
        layerObj: LayerObject;
        points: PointData[];
        stngs: AreaSettings;
        generatorType: string;
      };
      const areaGenerator = area<PointData>();
      const defined = stngs.coordinates ? stngs.coordinates.defined : null;

      const areaGen = areaGenerator as unknown as Record<string, (fn: (d: PointData) => number) => unknown>;
      areaGen[major.p]((d) => d.major * major.size);
      areaGen[`${minor.p}1`]((d) => d.minor * minor.size);
      areaGen[`${minor.p}0`]((d) => d.minor0 * minor.size);
      const curveKey = (layerObj.curve === 'monotone' ? `monotone${major.p}` : layerObj.curve) as keyof typeof CURVES;
      areaGenerator.curve(CURVES[curveKey]);
      if (defined) {
        areaGenerator.defined((d) => !d.dummy && typeof d.minor === 'number' && !isNaN(d.minor) && !!d.defined);
      } else {
        areaGenerator.defined((d) => !d.dummy && typeof d.minor === 'number' && !isNaN(d.minor));
      }

      const filteredPoints = stngs.connect ? points.filter(areaGenerator.defined()) : points;
      const generator =
        generatorType === 'area'
          ? (areaGenerator as unknown as (data: PointData[]) => string | null)
          : (areaGenerator as unknown as Record<string, () => (data: PointData[]) => string | null>)[generatorType]();
      const d = generator(filteredPoints);
      this.attrs.d = d;
    } else if (v.d) {
      this.attrs.d = v.d;
    }

    this.__boundingRect = { true: null, false: null };
    this.__bounds = { true: null, false: null };

    if (
      Array.isArray(v.collider) ||
      (typeof v.collider === 'object' && typeof (v.collider as ColliderDef).type !== 'undefined')
    ) {
      this.collider = v.collider as ColliderDefinition;
    } else if (this.attrs.d) {
      this.segments = pathToSegments(this.attrs.d);
      if (this.segments.length > 1 && this.segments.every((segment) => isClosed(segment))) {
        this.collider = extend(
          {
            type: 'geopolygon',
            vertices: this.segments,
          },
          v.collider as Record<string, unknown>
        ) as ColliderDefinition;
        return;
      }
      this.segments.forEach((segment) => {
        if (segment.length <= 1) {
          // Omit empty and single point segments
        } else if (isClosed(segment)) {
          this.collider = extend(
            {
              type: 'polygon',
              vertices: segment,
            },
            v.collider as Record<string, unknown>
          ) as ColliderDefinition;
        } else if (typeof v.collider === 'object' && (v.collider as ColliderDef).visual) {
          const size = (this.attrs['stroke-width'] as number) / 2;
          this.collider = polylineToPolygonCollider(
            segment,
            size,
            v.collider as Record<string, unknown>
          ) as ColliderDefinition;
        } else {
          this.collider = extend(
            {
              type: 'polyline',
              points: segment,
            },
            v.collider as Record<string, unknown>
          ) as ColliderDefinition;
        }
      });
    }
  }

  bounds(includeTransform = false) {
    const key = String(includeTransform);
    const cached = this.__bounds[key];
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const rect = this.boundingRect(includeTransform);

    this.__bounds[key] = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ];
    return this.__bounds[key];
  }
}

export function create(...s) {
  return new Path(...s);
}
