import extend from 'extend';
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
  constructor(...s) {
    super('path');
    this.set(...s);
  }

  set(v = {}) {
    super.set(v);
    this.segments = [];
    this.points = [];
    if (v.arcDatum) {
      const arcGen = arc();
      arcGen.innerRadius(v.desc.slice.innerRadius);
      arcGen.outerRadius(v.desc.slice.outerRadius);
      arcGen.cornerRadius(v.desc.slice.cornerRadius);
      const d = arcGen(v.arcDatum);
      this.attrs.d = d;
    } else if (v.points) {
      const { major, minor, layerObj, points, stngs, generatorType } = v;
      const areaGenerator = area();
      const defined = stngs.coordinates ? stngs.coordinates.defined : null;

      areaGenerator[major.p]((d) => d.major * major.size)
        [`${minor.p}1`]((d) => d.minor * minor.size)
        [`${minor.p}0`]((d) => d.minor0 * minor.size)
        .curve(CURVES[layerObj.curve === 'monotone' ? `monotone${major.p}` : layerObj.curve]);
      if (defined) {
        areaGenerator.defined((d) => !d.dummy && typeof d.minor === 'number' && !isNaN(d.minor) && d.defined);
      } else {
        areaGenerator.defined((d) => !d.dummy && typeof d.minor === 'number' && !isNaN(d.minor));
      }

      const filteredPoints = stngs.connect ? points.filter(areaGenerator.defined()) : points;
      const generator = generatorType === 'area' ? areaGenerator : areaGenerator[generatorType]();
      const d = generator(filteredPoints);
      this.attrs.d = d;
    } else if (v.d) {
      this.attrs.d = v.d;
    }

    this.__boundingRect = { true: null, false: null };
    this.__bounds = { true: null, false: null };

    if (Array.isArray(v.collider) || (typeof v.collider === 'object' && typeof v.collider.type !== 'undefined')) {
      this.collider = v.collider;
    } else if (this.attrs.d) {
      this.segments = pathToSegments(this.attrs.d);
      if (this.segments.length > 1 && this.segments.every((segment) => isClosed(segment))) {
        this.collider = extend(
          {
            type: 'geopolygon',
            vertices: this.segments,
          },
          v.collider
        );
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
            v.collider
          );
        } else if (typeof v.collider === 'object' && v.collider.visual) {
          const size = this.attrs['stroke-width'] / 2;
          this.collider = polylineToPolygonCollider(segment, size, v.collider);
        } else {
          this.collider = extend(
            {
              type: 'polyline',
              points: segment,
            },
            v.collider
          );
        }
      });
    }
  }

  boundingRect(includeTransform = false) {
    if (this.__boundingRect[includeTransform] !== null) {
      return this.__boundingRect[includeTransform];
    }

    if (!this.points.length) {
      this.segments = this.segments.length ? this.segments : pathToSegments(this.attrs.d);
      this.points = flatten(this.segments);
    }

    const pt =
      includeTransform && this.modelViewMatrix ? this.modelViewMatrix.transformPoints(this.points) : this.points;
    const [xMin, yMin, xMax, yMax] = getMinMax(pt);

    this.__boundingRect[includeTransform] = {
      x: xMin || 0,
      y: yMin || 0,
      width: xMax - xMin || 0,
      height: yMax - yMin || 0,
    };

    return this.__boundingRect[includeTransform];
  }

  bounds(includeTransform = false) {
    if (this.__bounds[includeTransform] !== null) {
      return this.__bounds[includeTransform];
    }
    const rect = this.boundingRect(includeTransform);

    this.__bounds[includeTransform] = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ];
    return this.__bounds[includeTransform];
  }
}

export function create(...s) {
  return new Path(...s);
}
