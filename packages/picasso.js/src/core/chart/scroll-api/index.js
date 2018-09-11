import scrollApi from '../../scroll-api';

export function createOrUpdate(options, oldApi) {
  const min = options.min || 0;
  const max = options.max || 0;
  const viewSize = options.viewSize || 0;

  const s = oldApi || scrollApi();
  s.update({ min, max, viewSize });

  return s;
}

export default function builder(obj, oldScrollApis) {
  const scrollApis = {};
  for (const n in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, n)) {
      scrollApis[n] = createOrUpdate(obj[n], oldScrollApis ? oldScrollApis[n] : null);
    }
  }
  return scrollApis;
}

export function getOrCreateScrollApi(v, scrollApis) {
  if (!scrollApis[v]) {
    scrollApis[v] = scrollApi();
  }
  return scrollApis[v];
}
