import ordinal from '../ordinal';

/**
 * @typedef {object} scale--categorical-color
 * @property {string} [type='categorical-color']
 * @property {string[]} [range=false] - CSS color values of the output range
 * @property {string} [unknown] - {@link https://github.com/d3/d3-scale#ordinal_unknown}
 * @property {object} [explicit] - Explicitly bind values to an output
 * @property {object[]} [explicit.domain[]] - Values to bind
 * @property {string[]} [explicit.range[]] - Output range
 */

 /**
 * An ordinal scale with the output range set to default colors, as defined by *scaleCategorical.range*
 * @alias scaleCategorical
 * @private
 * @param { Object } settings
 * @param { field[] } [fields]
 * @param { dataset } [dataset]
 * @return { ordinal }
 */
export default function scaleCategorical(settings = {}, dataset = {}, { theme } = {}) {
  const s = ordinal(settings, dataset);

  let range;
  if (!settings.range) {
    range = theme ? theme.palette('categorical', s.domain().length).slice() : [];
  } else {
    range = settings.range.slice();
  }
  if (settings.unknown) {
    s.unknown(settings.unknown);
  } else if (theme && theme.palette('unknown')) {
    let un = theme.palette('unknown');
    s.unknown(un[0]);
  }
  if (settings.explicit && settings.explicit.domain) {
    let domain = s.domain().slice();
    let explicitDomain = (settings.explicit.domain || []);
    if (explicitDomain.length) {
      // duplicate range values to cover entire domain
      let numCopies = Math.floor(domain.length / range.length);
      for (let i = 1; i < numCopies + 1; i *= 2) {
        range = range.concat(range);
      }
      // inject explicit colors
      let explicitRange = (settings.explicit.range || []);
      const order = explicitDomain.map((d, i) => [domain.indexOf(d), d, explicitRange[i]]).sort((a, b) => a[0] - b[0]);
      order.forEach((v) => {
        const idx = domain.indexOf(v[1]);
        if (idx !== -1) {
          range.splice(idx, 0, v[2]);
        }
      });
      // cutoff excess range values
      range.length = domain.length;
    }
  }
  s.range(range);

  return s;
}
