import extend from 'extend';
import getValue from '../utils/object/get-value';
import setValue from '../utils/object/set-value';

export default function createStorage(source) {
  const content = extend(true, {}, source);

  const api = {
    getAll: () => content,
    getValue: (reference, fallback) => getValue(content, reference, fallback),
    setValue: (reference, value) => setValue(content, reference, value),
  };

  return api;
}
