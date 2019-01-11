export default function memoize(func, opts = {}) {
  const {
    size = 5000,
    multipleArguments = false,
    toKey = arg => arg
  } = opts;
  let cache = Object.create(null);
  let index = Object.create(null);
  let counter = 0;
  let fifo = 0; // First-In-First-Out index
  let cacher;
  let k;

  if (multipleArguments) {
    cacher = (...args) => {
      k = toKey(args);
      if (cacher.has(k)) {
        return cacher.get(k);
      }
      return cacher.set(k, func(...args));
    };
  } else {
    cacher = (arg) => {
      k = toKey(arg);
      if (cacher.has(k)) {
        return cacher.get(k);
      }
      return cacher.set(k, func(arg));
    };
  }

  cacher.set = (key, val) => {
    if (counter >= size) {
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

  cacher.get = key => cache[key];

  cacher.has = key => typeof cache[key] !== 'undefined';

  cacher.clear = () => {
    cache = Object.create(null);
    index = Object.create(null);
    counter = 0;
    fifo = 0;
  };

  cacher.size = () => counter;

  return cacher;
}
