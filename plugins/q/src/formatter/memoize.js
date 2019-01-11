export default function memoize(func, opts = {}) {
  const {
    size = 5000,
    multipleArguments = false
  } = opts;
  let cache = Object.create(null);
  let index = Object.create(null);
  let counter = 0;
  let fifo = 0; // First-In-First-Out index
  let cacher;

  if (multipleArguments) {
    cacher = (...args) => {
      if (cacher.has(args)) {
        return cacher.get(args);
      }
      return cacher.set(args, func(...args));
    };
  } else {
    cacher = (arg) => {
      if (cacher.has(arg)) {
        return cacher.get(arg);
      }
      return cacher.set(arg, func(arg));
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
