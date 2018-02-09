import { normalizeSettings, resolveForItem } from '../chart-components/property-resolver';
import { updateScaleSize } from '../scales';

const externals = {
  normalizeSettings,
  resolveForItem,
  updateScaleSize
};

export default function (resources, deps = externals) {
  let cache = {};

  function resolve({
    data,
    settings,
    defaults = {},
    scaled
  }) {
    const norm = cache.norm = deps.normalizeSettings(settings, defaults, resources.chart);

    if (scaled) {
      Object.keys(scaled).forEach((key) => {
        if (norm[key]) {
          deps.updateScaleSize(norm, key, scaled[key]);
        }
      });
    }

    const resolved = [];

    if (data && Array.isArray(data.items)) {
      for (let i = 0, len = data.items.length; i < len; i++) {
        let obj = deps.resolveForItem(data.items[i], cache.norm, data.items);
        obj.data = data.items[i];
        resolved.push(obj);
      }
    } else {
      let obj = deps.resolveForItem(data, cache.norm);
      return {
        settings: cache.norm,
        item: obj
      };
    }

    return {
      settings: cache.norm,
      items: resolved
    };
  }

  return {
    resolve
  };
}
