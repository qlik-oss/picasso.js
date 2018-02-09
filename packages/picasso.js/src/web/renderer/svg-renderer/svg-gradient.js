import { degreesToPoints } from '../../../core/math/angles';
import { hashObject } from '../../../core/utils/crypto';

let gradients = [];
let gradientHashMap = {};

/**
 * If this attr (fill or stroke) has a gradient, apply it.
 * @ignore
 * @param  {Object} item Item with item[attr]
 * @param  {String} attr The attribute to search for gradient (fill or stroke)
 * @param  {String} url  URL for handling base href
 */
function checkGradient(item = {}, attr = 'fill', url = '') {
  let gradientHash = hashObject(item[attr]);
  let gradientId = '';

  if (gradientHashMap[gradientHash] !== undefined) {
    gradientId = gradientHashMap[gradientHash];
  } else {
    let { orientation, degree, stops = [] } = item[attr];
    let gradient = {};

    if (degree === undefined) {
      degree = 90;
    }

    // Default to linear
    if (orientation === 'radial') {
      gradient.type = 'radialGradient';
    } else {
      gradient = degreesToPoints(degree);
      gradient.type = 'linearGradient';
    }

    gradient.id = `picasso-gradient-${gradientHash}`;
    gradient.children = stops.map(({ offset, color, opacity }) => ({
      type: 'stop',
      offset: `${offset * 100}%`,
      style: `stop-color:${color};stop-opacity:${opacity || 1}`
    }));

    gradients.push(gradient);
    gradientHashMap[gradientHash] = gradient.id;
    gradientId = gradient.id;
  }

  return `url(${url}#${gradientId})`;
}

/**
 * Reset the gradients between rendering
 * @ignore
 */
export function resetGradients() {
  gradients = [];
  gradientHashMap = {};
}

export function onGradient(state) {
  let url = '';
  if (typeof window !== 'undefined') {
    url = window.location.href.split('#')[0];
  }

  const item = state.node;
  if (item.fill && typeof item.fill === 'object' && item.fill.type === 'gradient') {
    item.fill = checkGradient(item, 'fill', url);
  }

  if (item.stroke && typeof item.stroke === 'object' && item.stroke.type === 'gradient') {
    item.stroke = checkGradient(item, 'stroke', url);
  }
}

export function createDefsNode() {
  return {
    type: 'defs',
    children: gradients,
    disabled: () => gradients.length === 0
  };
}
