import ordinal from '../ordinal';
import resolveSettings from '../settings-resolver';

const DEFAULT_SETTINGS = {
  domain: [],
  range: [],
  unknown: undefined
};

const DEFAULT_EXPLICIT_SETTINGS = {
  domain: [],
  range: []
};

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
export default function scaleCategorical(settings = {}, data = {}, resources = {}) {
  const s = ordinal(settings, data, resources);
  const theme = resources.theme;
  const stgns = resolveSettings(settings, DEFAULT_SETTINGS, { data, resources });
  stgns.explicit = resolveSettings(settings.explicit, DEFAULT_EXPLICIT_SETTINGS, { data, resources });

  let range;
  if (!Array.isArray(stgns.range) || stgns.range.length === 0) {
    range = theme ? theme.palette('categorical', s.domain().length).slice() : [];
  } else {
    range = stgns.range.slice();
  }

  if (stgns.unknown) {
    s.unknown(stgns.unknown);
  } else if (theme && theme.palette('unknown')) {
    let un = theme.palette('unknown');
    s.unknown(un[0]);
  }

  if (Array.isArray(stgns.explicit.domain) && stgns.explicit.domain.length) {
    const domain = s.domain().slice();
    const explicitDomain = stgns.explicit.domain;
    // duplicate range values to cover entire domain
    const numCopies = Math.floor(domain.length / range.length);
    for (let i = 1; i < numCopies + 1; i *= 2) {
      range = range.concat(range);
    }
    // inject explicit colors
    const explicitRange = Array.isArray(stgns.explicit.range) ? stgns.explicit.range : [];
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
  s.range(range);

  return s;
}
