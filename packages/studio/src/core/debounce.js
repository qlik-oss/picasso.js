const debouncer = (callback, delay) => {
  let handler;
  return (value) => {
    if (handler) {
      clearTimeout(handler);
    }
    handler = setTimeout(() => {
      callback(value);
    }, delay);
  };
};

export default debouncer;
