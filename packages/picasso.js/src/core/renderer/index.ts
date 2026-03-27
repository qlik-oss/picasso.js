import registry from '../utils/registry';
import type { RegistryFn } from '../types';

const rendererRegistry = (
  reg?: RegistryFn | null
): RegistryFn & { prio: (p?: string[]) => string[]; types: () => string[] } => {
  const f = registry(reg) as RegistryFn & { prio: (p?: string[]) => string[]; types: () => string[] };
  f.prio = (p) => (p ? [f.default(p[0])] : [f.default()]) as string[];
  f.types = () => f.getKeys();
  return f;
};

export default rendererRegistry;
