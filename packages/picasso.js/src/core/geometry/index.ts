import { create as rect } from './rect';
import { create as circle } from './circle';
import { create as line } from './line';
import { create as polygon } from './polygon';
import { create as geopolygon } from './geopolygon';
import { create as polyline } from './polyline';
import registry from '../utils/registry';

const reg = registry();

reg.add('rect', rect);
reg.add('circle', circle);
reg.add('line', line);
reg.add('polygon', polygon);
reg.add('geopolygon', geopolygon);
reg.add('polyline', polyline);

export function create(type: string, input: any): picassojs.Shape {
  return reg.get(type)(input);
}

export declare namespace picassojs {
  export type Shape = Rect | Circle | Line | Polygon | Geopolygon | Polyline | Path;

  export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  export type Line = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };

  export type Point = {
    x: number;
    y: number;
  };

  export type Circle = {
    cx: number;
    cy: number;
    r: number;
  };

  export type Polygon = {
    points: Point[];
  };

  export type Geopolygon = {
    polygons: Polygon[];
  };

  export type Polyline = {
    points: Point[];
  };

  export type Path = {
    d: string;
  };
}
