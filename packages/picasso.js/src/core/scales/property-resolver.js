export default function resolveSettings(settings, defaultSettings, context) {
  const stngs = {};

  Object.keys(settings).forEach((key) => {
    stngs[key] = typeof settings[key] === 'function' ? settings[key](context) : settings[key];
  });

  Object.keys(defaultSettings).forEach((key) => {
    if (!(key in stngs)) {
      stngs[key] = defaultSettings[key];
    }
  });

  return stngs;
}
