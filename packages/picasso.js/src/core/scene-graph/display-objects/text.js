import extend from 'extend';
import DisplayObject from './display-object';
import { rectToPoints, getMinMax } from '../../geometry/util';

function hasData({ data, _boundingRect, _textBoundsFn }) {
  return typeof data !== 'undefined' && data !== null && (_boundingRect || _textBoundsFn);
}

/**
 * @extends node-def
 * @typedef {object} node--text-def
 * @property {string} text
 * @property {number} x - {@link https://www.w3.org/TR/SVG/text.html#TextElementXAttribute}
 * @property {number} y - {@link https://www.w3.org/TR/SVG/text.html#TextElementYAttribute}
 * @property {number} [dx] - {@link https://www.w3.org/TR/SVG/text.html#TextElementDXAttribute}
 * @property {number} [dy] - {@link https://www.w3.org/TR/SVG/text.html#TextElementDYAttribute}
 * @property {string} [fontSize] - {@link https://www.w3.org/TR/SVG/text.html#FontPropertiesUsedBySVG}
 * @property {string} [fontFamily] - {@link https://www.w3.org/TR/SVG/text.html#FontPropertiesUsedBySVG}
 * @property {rect} [boundingRect] - Explicitly set the bounding rectangle of the node. Has predence over textBoundsFn
 * @property {function} [textBoundsFn] - Implicitly set the bounding rectangle of the node, the function must return an object with x, y, width and height attributes
 * @property {string} [baseline] - Alias for dominantBaseline
 * @property {string} [dominantBaseline] - {@link https://www.w3.org/TR/SVG/text.html#BaselineAlignmentProperties}
 * @property {string} [anchor] - Alias for textAnchor
 * @property {string} [textAnchor] - {@link https://www.w3.org/TR/SVG/text.html#TextAnchorProperty}
 * @property {string} [wordBreak] - Word-break option
 * @property {number} [maxWidth] - Maximum allowed text width
 * @property {number} [maxHeight] - Maximum allowed text height. If both maxLines and maxHeight are set, the property that results in the fewest number of lines is used
 * @property {number} [maxLines] - Maximum number of lines allowed
 * @property {number} [lineHeight=1.2] - Line height
 */

export default class Text extends DisplayObject {
  constructor(...s) {
    super('text');
    this.set(...s);
  }

  set(v = {}) {
    const { x = 0, y = 0, dx = 0, dy = 0, textBoundsFn, text, title, collider, boundingRect, ellipsed } = v;

    super.set(v);
    this.attrs.x = x;
    this.attrs.y = y;
    this.attrs.dx = dx;
    this.attrs.dy = dy;
    this.attrs.text = text;
    if (typeof title !== 'undefined') {
      this.attrs.title = String(title);
    }
    if (typeof boundingRect === 'object') {
      this._textBoundsFn = () => boundingRect;
    } else if (typeof textBoundsFn === 'function') {
      this._textBoundsFn = textBoundsFn;
    }

    if (typeof ellipsed === 'string') {
      this.ellipsed = ellipsed;
    }

    this.collider = extend({ type: hasData(this) ? 'bounds' : null }, collider);

    this.__boundingRect = { true: null, false: null };
    this.__bounds = { true: null, false: null };
  }

  boundingRect(includeTransform = false) {
    if (this.__boundingRect[includeTransform] !== null) {
      return this.__boundingRect[includeTransform];
    }

    let rect;
    if (typeof this._textBoundsFn === 'function') {
      rect = this._textBoundsFn(this.attrs);
    } else {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
    }

    const p = rectToPoints(rect);
    const pt = includeTransform && this.modelViewMatrix ? this.modelViewMatrix.transformPoints(p) : p;
    const [xMin, yMin, xMax, yMax] = getMinMax(pt);

    this.__boundingRect[includeTransform] = {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin,
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
  return new Text(...s);
}
