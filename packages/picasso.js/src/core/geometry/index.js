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

/* eslint-disable import/prefer-default-export */
export function create(type, input) {
  return reg.get(type)(input);
}
/* eslint-enable import/prefer-default-export */

/**
 * @typedef {object} rect
 * @property {number} x - X-coordinate
 * @property {number} y - Y-coordinate
 * @property {number} width - Width
 * @property {number} height - Height
 */

/**
 * @typedef {object} line
 * @property {number} x1 - Start x-coordinate
 * @property {number} y1 - Start y-coordinate
 * @property {number} x2 - End x-coordinate
 * @property {number} y2 - End y-coordinate
 */

/**
 * @typedef {object} point
 * @property {number} x - X-coordinate
 * @property {number} y - Y-coordinate
 */

/**
 * @typedef {object} circle
 * @property {number} cx - Center x-coordinate
 * @property {number} cy - Center y-coordinate
 * @property {number} r - Circle radius
 */

/**
 * @typedef {object} polygon
 * @property {Array<point>} points - Array of connected points
 */

/**
 * @typedef {object} polyline
 * @property {Array<point>} points - Array of connected points
 */

/**
 * @typedef {object} path
 * @property {string} d - Path definition
 */
