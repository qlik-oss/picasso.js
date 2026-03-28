import rangeBrushComponent from './brush-range';
import brushAreaDirectionalComponent from './brush-area-dir';

/**
 * @typedef {object} ComponentBrushAreaDir
 * @extends ComponentSettings
 * @property {'brush-area-dir'} type component type
 */

/**
 * @typedef {object} ComponentBrushRange
 * @extends ComponentSettings
 * @property {'brush-range'} type component type
 */

export default function rangeBrush(picasso) {
  picasso.component('brush-range', rangeBrushComponent);
  picasso.component('brush-area-dir', brushAreaDirectionalComponent);
}
