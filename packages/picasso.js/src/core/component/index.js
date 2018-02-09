// import * as mixins from './component-mixins';
import registry from '../utils/registry';

const componentRegistry = registry();

// TODO - mixins?

export {
  componentRegistry as default
};

// export default function componentFactory(parentRegistry) {
//   const reg = registry(parentRegistry);

//   function component(name, definition) {
//     if (definition) {
//       reg.register(name, definition);
//     }
//     return reg.get(name);
//   }
//   component.mixin = mixins.add;

//   return component;
// }
