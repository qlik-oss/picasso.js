import data from './data/dataset';
import qBrushHelper from './brush/q-brush';
import numberFormat from './formatter/numberFormat';
import timeFormat from './formatter/timeFormat';
// import qTime from './scales/qTime';

export default function initialize(picasso) {
  data.util = picasso.data('matrix').util;
  picasso.data('q', data);
  picasso.formatter('q-number', numberFormat);
  picasso.formatter('q-time', timeFormat);
  // picasso.scale('qTime', qTime);
}

initialize.qBrushHelper = qBrushHelper; // deprecated
initialize.selections = qBrushHelper;
