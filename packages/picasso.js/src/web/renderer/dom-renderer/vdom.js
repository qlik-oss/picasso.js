import snabbdom from 'snabbdom';
import snabbdomAttributes from 'snabbdom/modules/attributes';
import snabbdomClass from 'snabbdom/modules/class';
import snabbdomStyle from 'snabbdom/modules/style';
import snabbdomEventlisteners from 'snabbdom/modules/eventlisteners';
import h from 'snabbdom/h';

const patch = snabbdom.init([
  snabbdomAttributes,
  snabbdomClass,
  snabbdomStyle,
  snabbdomEventlisteners
]);

export {
  h,
  patch
};
