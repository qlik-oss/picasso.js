import registry from '../utils/registry';

const rendererRegistry = (reg) => {
  let f = registry(reg);
  f.prio = (p) => (p ? f.default(p[0]) : [f.default()]);
  f.types = () => f.getKeys();
  return f;
};

export { rendererRegistry as default };
