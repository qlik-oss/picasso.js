import brush from './brush';
import registry from '../utils/registry';

const reg = registry();

export function register(type, b) {
  if (b) {
    reg.add(type, b);
  }
  return reg.get(type);
}

export default brush;
