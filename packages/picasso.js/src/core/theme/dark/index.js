import extend from 'extend';
import * as light from '../light';

const palettes = light.palettes;

/* eslint quote-props: 0 */
const style = extend(true, {}, light.style, {
  // BASE COLORS
  '$primary': '#c7ea8b',

  // ALIAS COLOR
  '$font-color': '$gray-90',
  '$font-color--inverted': '$gray-35',
  '$guide-color': '$gray-35',
  '$guide-color--inverted': '$gray-90',
  '$border': '$border-20',
  '$border--inverted': '$border-80',

  '$guide-line--minor': {
    strokeWidth: 1,
    stroke: '$gray-30' // needs alias
  },

  '$label-overlay': { // e.g. selection range bubble
    fill: '$gray-30' // background fill
  }

});

export {
  style,
  palettes
};
