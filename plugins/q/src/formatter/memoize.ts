export default function memoize(
  func: (...args: unknown[]) => unknown,
  opts: { size?: number; toKey?: (...args: unknown[]) => unknown; multipleArguments?: boolean } = {}
): ((...args: any[]) => unknown) & { set: (key: any, val: any) => any; get: (key: any) => any; has: (key: any) => boolean; clear: () => void; size: () => number } {
  const { size = 5000, multipleArguments = false, toKey = (arg: unknown) => arg } = opts;
  let cache: Record<string, any> = Object.create(null);
  let index: Record<number, any> = Object.create(null);
  let counter = 0;
  let fifo = 0; // First-In-First-Out index
  let cacher: any;
  let k: any;

  if (multipleArguments) {
    cacher = (...args: any[]) => {
      k = (toKey as any)(...args);
      if (cacher.has(k)) {
        return cacher.get(k);
      }
      return cacher.set(k, func(...args));
    };
  } else {
    cacher = (arg: any) => {
      k = (toKey as any)(arg);
      if (cacher.has(k)) {
        return cacher.get(k);
      }
      return cacher.set(k, func(arg));
    };
  }

  cacher.set = (key: any, val: any) => {
    if (counter >= (size || 5000)) {
      delete cache[index[fifo]];
      delete index[fifo];
      counter--;
      fifo++;
    }
    cache[key] = val;
    index[counter] = key;
    counter++;
    return val;
  };

  cacher.get = (key: any) => cache[key];

  cacher.has = (key: any) => key in cache;

  cacher.clear = () => {
    cache = Object.create(null);
    index = Object.create(null);
    counter = 0;
    fifo = 0;
  };

  cacher.size = () => counter;

  return cacher;
}
