import extend from 'extend';

/**
 * Resolve a complex object using the built-in resolver from this.resolver in component
 * @ignore
 */
export default function complexResolver({ keys, data, defaultSettings, style, settings, width, height, resolver }) {
  const defaults = extend(true, {}, defaultSettings || {}, style || {});
  const scaled = {
    major: settings.orientation === 'horizontal' ? height : width,
    minor: settings.orientation === 'horizontal' ? width : height,
  };

  const majorSettings = settings.major;

  let majorResolved;

  if (
    typeof majorSettings === 'object' &&
    typeof majorSettings.ref === 'object' &&
    typeof majorSettings.ref.start !== 'undefined' &&
    typeof majorSettings.ref.end !== 'undefined'
  ) {
    // temporary backwards compatibility
    majorResolved = resolver.resolve({
      data,
      defaults: {
        start: 0,
        end: 1,
      },
      scaled,
      settings: extend(
        true,
        {},
        {
          binStart: { scale: settings.major.scale, ref: settings.major.ref.start },
          binEnd: { scale: settings.major.scale, ref: settings.major.ref.end },
        }
      ),
    });
  } else if (
    typeof majorSettings === 'object' &&
    typeof majorSettings.binStart !== 'undefined' &&
    typeof majorSettings.binEnd !== 'undefined'
  ) {
    majorResolved = resolver.resolve({
      data,
      defaults: {
        start: 0,
        end: 1,
      },
      scaled,
      settings: extend(
        true,
        {},
        {
          binStart: { scale: settings.major.scale, ref: 'binStart' },
          binEnd: { scale: settings.major.scale, ref: 'binEnd' },
        },
        settings.major
      ),
    });
  } else {
    majorResolved = resolver.resolve({
      data,
      scaled,
      defaults: {
        major: 0.5,
      },
      settings: {
        major: settings.major,
      },
    });
  }

  const minorSettings = settings.minor || {};
  const defaultMinorSettings = {};
  ['start', 'end', 'min', 'max', 'med'].forEach(prop => {
    if (minorSettings[prop] || (data.items && data.items.length && data.items[0][prop])) {
      defaultMinorSettings[prop] = { scale: minorSettings.scale, ref: prop };
    }
  });

  const minorResolved = resolver.resolve({
    data,
    defaults: {
      start: 0,
      end: 1,
    },
    scaled,
    settings: extend(true, {}, defaultMinorSettings, minorSettings),
  });

  let key;
  let ext = {
    major: majorResolved,
    minor: minorResolved,
  };

  for (let ki = 0, len = keys.length; ki < len; ki++) {
    if (!settings[key] || settings[key].show !== false) {
      key = keys[ki];
      ext[key] = resolver.resolve({
        data,
        defaults: defaults[key],
        settings: settings[key],
        scaled,
      });
    }
  }

  return ext;
}
