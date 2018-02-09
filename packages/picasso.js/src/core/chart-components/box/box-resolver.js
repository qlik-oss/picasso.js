import extend from 'extend';

/**
 * Resolve a complex object using the built-in resolver from this.resolver in component
 * @ignore
 */
export default function complexResolver({ keys, data, defaultSettings, style, settings, width, height, resolver }) {
  const defaults = extend(true, {}, defaultSettings || {}, style || {});
  const scaled = {
    major: settings.orientation === 'vertical' ? height : width,
    minor: settings.orientation === 'vertical' ? width : height
  };

  if (!Array.isArray(keys) || !data || !Array.isArray(data.items)) {
    return [];
  }

  let key;
  let ext = {};

  let resolved = resolver.resolve({
    data,
    defaults,
    settings,
    scaled
  });

  for (let ki = 0, len = keys.length; ki < len; ki++) {
    key = keys[ki];
    ext[key] = resolver.resolve({
      data,
      defaults: defaults[key],
      settings: settings[key],
      scaled
    }).items || [];

    for (let i = 0, extlen = ext[key].length; i < extlen; i++) {
      resolved.items[i][key] = ext[key][i];
    }
  }

  return resolved;
}
