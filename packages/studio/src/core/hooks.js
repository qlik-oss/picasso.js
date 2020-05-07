import { useState, useEffect } from 'react';
import debounce from './debounce';

const useResize = (ref, callback) => {
  useEffect(() => {
    let resizeObserver;
    if (ref && ref.current) {
      const debouncer = debounce(callback, 200);
      resizeObserver = new ResizeObserver((entries) => {
        // should only be one
        debouncer(entries[0].contentRect);
      });

      resizeObserver.observe(ref.current);
    }
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [ref, callback]);
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error); // eslint-disable-line no-console
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error); // eslint-disable-line no-console
    }
  };

  return [storedValue, setValue];
};

export { useResize, useLocalStorage };
