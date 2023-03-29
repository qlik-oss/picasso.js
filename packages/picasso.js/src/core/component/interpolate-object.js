/* eslint-disable no-cond-assign */
/* eslint-disable no-use-before-define */
/* eslint-disable no-nested-ternary */
import { color } from 'd3-color';
import {
  interpolateRgb as rgb,
  interpolateDate as date,
  interpolateNumber as number,
  interpolateString as string,
  interpolateNumberArray as numberArray,
} from 'd3-interpolate';

const colorKeys = ['stroke', 'fill', 'color', 'backgroundColor', 'thumbColor'];

export function constant(x) {
  return () => x;
}

export function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

export function genericArray(a, b) {
  const nb = b ? b.length : 0;
  const na = a ? Math.min(nb, a.length) : 0;
  const x = new Array(na);
  const c = new Array(nb);
  let i;

  for (i = 0; i < na; ++i) {
    x[i] = value(a[i], b[i]);
  }

  for (; i < nb; ++i) {
    c[i] = b[i];
  }

  return function interplolate(t) {
    for (i = 0; i < na; ++i) {
      c[i] = x[i](t);
    }
    return c;
  };
}

export function value(a, b, k) {
  const t = typeof b;
  let c;
  return b == null || t === 'boolean'
    ? constant(b)
    : (t === 'number'
        ? number
        : t === 'string'
        ? (c = color(b)) && colorKeys.includes(k)
          ? ((b = c), rgb)
          : string
        : b instanceof color
        ? rgb
        : b instanceof Date
        ? date
        : isNumberArray(b)
        ? numberArray
        : Array.isArray(b)
        ? genericArray
        : (typeof b.valueOf !== 'function' && typeof b.toString !== 'function') || isNaN(b)
        ? object
        : number)(a, b);
}

export default function object(a, b) {
  const i = {};
  const c = {};
  let k;

  if (a === null || typeof a !== 'object') {
    a = {};
  }

  if (b === null || typeof b !== 'object') {
    b = {};
  }

  for (k in b) {
    if (k in a) {
      i[k] = value(a[k], b[k], k);
    } else {
      c[k] = b[k];
    }
  }

  return function interplolate(t) {
    // eslint-disable-next-line guard-for-in
    for (k in i) {
      c[k] = i[k](t);
    }
    return c;
  };
}
