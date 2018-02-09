const mixins = [];

export function add(mixin) {
  mixins.push(mixin);
}

export function list() {
  return mixins;
}
