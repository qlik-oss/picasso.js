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
 * Overrides the range with the values specified in the explicit object if possible.
 * If there are no overrides, the values from explicit object will be injected into
 * the range in the order specified by the domain.
 * If the index is out of bounds, no injection or override will be performed.
 * @param {Array} range - colors
 * @param {Array} domain - values to be colored
 * @param {Object} explicit - Object containing explicit domain and range to be overriden or injected.
 * @ignore
 */
const overrideRange = (range, domain, explicit) => {
  const newRange = range.slice();
  const explicitDomain = explicit.explicitDomain;
  const explicitRange = explicit.explicitRange;

  for (let i = 0; i < explicitDomain.length; i++) {
    const index = domain.indexOf(explicitDomain[i]);
    if (index > -1) {
      if (index >= newRange.length) {
        newRange.push(explicitRange[i]);
      } else if (newRange.indexOf(explicitRange[i]) === -1 && newRange.length < domain.length) {
        newRange.splice(index, 0, explicitRange[i]);
      } else {
        newRange[index] = explicitRange[i];
      }
    }
  }
  return newRange;
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
  const haveOverride = settings.explicit && settings.explicit.override;

  let range;
  let overridenRange;
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
    const explicitRange = Array.isArray(stgns.explicit.range) ? stgns.explicit.range : [];
    const explicit = {
      explicitDomain,
      explicitRange
    };

    overridenRange = overrideRange(range, domain, explicit);

    // duplicate range values to cover entire domain
    const numCopies = Math.floor(domain.length / range.length);
    for (let i = 1; i < numCopies + 1; i *= 2) {
      range = range.concat(range);
    }

    // inject explicit colors
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

  if (haveOverride) {
    s.range(overridenRange);
  } else {
    s.range(range);
  }

  return s;
}
