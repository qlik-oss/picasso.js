import data from './data/dataset';
import qBrushHelper from './brush/q-brush';
// import qTime from './scales/qTime';

export default function initialize(picasso) {
  data.util = picasso.data('matrix').util;
  picasso.data('q', data);
  // picasso.scale('qTime', qTime);
}

initialize.qBrushHelper = qBrushHelper; // deprecated
initialize.selections = qBrushHelper;
