export default function resolveSettings(settings = {}, defaultSettings = {}, context = {}) {
  const stngs = {};

  Object.keys(defaultSettings).forEach((key) => {
    const type = typeof settings[key];

    if (type === 'function') {
      stngs[key] = settings[key](context);
    } else if (type === 'undefined') {
      stngs[key] = defaultSettings[key];
    } else {
      stngs[key] = settings[key];
    }
  });

  return stngs;
}
