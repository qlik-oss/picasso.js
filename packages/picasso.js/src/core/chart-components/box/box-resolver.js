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

  const majorSettings = settings.major;

  let majorResolved;

  if (typeof majorSettings === 'object' && typeof majorSettings.ref === 'object' && (typeof majorSettings.ref.start !== 'undefined' && typeof majorSettings.ref.end !== 'undefined')) {
    // temporary backwards compatibility
    majorResolved = resolver.resolve({
      data,
      defaults: {
        start: 0,
        end: 1
      },
      scaled,
      settings: extend(true, {}, {
        binStart: { scale: settings.major.scale, ref: settings.major.ref.start },
        binEnd: { scale: settings.major.scale, ref: settings.major.ref.end }
      })
    });
  } else if (typeof majorSettings === 'object' && (typeof majorSettings.binStart !== 'undefined' && typeof majorSettings.binEnd !== 'undefined')) {
    majorResolved = resolver.resolve({
      data,
      defaults: {
        start: 0,
        end: 1
      },
      scaled,
      settings: extend(true, {}, {
        binStart: { scale: settings.major.scale, ref: 'binStart' },
        binEnd: { scale: settings.major.scale, ref: 'binEnd' }
      }, settings.major)
    });
  } else {
    majorResolved = resolver.resolve({
      data,
      scaled,
      defaults: {
        major: 0.5
      },
      settings: {
        major: settings.major
      }
    });
  }

  const minorSettings = settings.minor || {};

  const minorResolved = resolver.resolve({
    data,
    defaults: {
      start: 0,
      end: 1
    },
    scaled,
    settings: extend(true, {}, {
      start: { scale: minorSettings.scale, ref: 'start' },
      end: { scale: minorSettings.scale, ref: 'end' },
      min: { scale: minorSettings.scale, ref: 'min' },
      max: { scale: minorSettings.scale, ref: 'max' },
      med: { scale: minorSettings.scale, ref: 'med' }
    }, minorSettings)
  });

  let key;
  let ext = {
    major: majorResolved,
    minor: minorResolved
  };

  for (let ki = 0, len = keys.length; ki < len; ki++) {
    key = keys[ki];
    ext[key] = resolver.resolve({
      data,
      defaults: defaults[key],
      settings: settings[key],
      scaled
    });
  }

  return ext;
}
