import registry from '../utils/registry';

const typeMixins = registry();
const mixins = [];

export function add(mixin, types = []) {
  if (types.length) {
    types.forEach(type => typeMixins.add(type, mixin));
  } else {
    mixins.push(mixin);
  }
}

export function list(type) {
  return mixins.concat(typeMixins.get(type) || []);
}
