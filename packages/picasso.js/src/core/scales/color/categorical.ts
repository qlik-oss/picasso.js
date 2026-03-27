import type { ScaleSettings, ScaleData, ScaleResources } from '../settings-resolver';
import ordinal from '../ordinal';
import resolveSettings from '../settings-resolver';

const DEFAULT_SETTINGS = {
  domain: [],
  range: [],
  unknown: undefined,
};

const DEFAULT_EXPLICIT_SETTINGS = {
  domain: [],
  range: [],
  override: false,
};

/**
 * @typedef {object} ScaleCategoricalColor
 * @property {string} [type='categorical-color']
 * @property {string[]} [range=false] - CSS color values of the output range
 * @property {string} [unknown] - Value to return when input value is unknown
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
export default function scaleCategorical(
  settings: ScaleSettings = {},
  data: ScaleData = {},
  resources: ScaleResources = {}
) {
  const s = ordinal(settings, data, resources);
  const theme = resources.theme;
  const stgns: Record<string, unknown> = resolveSettings(settings, DEFAULT_SETTINGS, { data, resources });
  stgns.explicit = resolveSettings(settings.explicit, DEFAULT_EXPLICIT_SETTINGS, {
    data,
    resources,
  }) as typeof DEFAULT_EXPLICIT_SETTINGS & Record<string, unknown>;

  let range: unknown[];
  if (!Array.isArray(stgns.range) || (stgns.range as unknown[]).length === 0) {
    range = theme
      ? (
          (theme as Record<string, (...args: unknown[]) => unknown>).palette(
            'categorical',
            (s.domain as () => unknown[])().length
          ) as unknown[]
        ).slice()
      : [];
  } else {
    range = (stgns.range as unknown[]).slice();
  }

  if (stgns.unknown) {
    (s as Record<string, (v: unknown) => void>).unknown(stgns.unknown);
  } else if (theme && (theme as Record<string, (...args: unknown[]) => unknown>).palette('unknown')) {
    let un = (theme as Record<string, (...args: unknown[]) => unknown>).palette('unknown') as unknown[];
    (s as Record<string, (v: unknown) => void>).unknown(un[0]);
  }

  if (
    Array.isArray((stgns.explicit as Record<string, unknown>).domain) &&
    ((stgns.explicit as Record<string, unknown>).domain as unknown[]).length
  ) {
    const domain = (s.domain as () => unknown[])().slice();
    const explicitDomain = (stgns.explicit as Record<string, unknown>).domain as unknown[];
    const explicitRange = Array.isArray((stgns.explicit as Record<string, unknown>).range)
      ? ((stgns.explicit as Record<string, unknown>).range as unknown[])
      : [];

    // duplicate range values to cover entire domain
    const numCopies = Math.floor(domain.length / range.length);
    for (let i = 1; i < numCopies + 1; i *= 2) {
      range = range.concat(range);
    }

    if ((stgns.explicit as Record<string, unknown>).override) {
      for (let i = 0; i < explicitDomain.length; i++) {
        const index = domain.indexOf(explicitDomain[i]);
        if (index > -1) {
          range[index] = explicitRange[i];
        }
      }
    } else {
      // inject explicit colors
      const order = explicitDomain
        .map((d, i) => [domain.indexOf(d), d, explicitRange[i]])
        .sort((a, b) => (((a as unknown[])[0] as number) - (b as unknown[])[0]) as number);
      order.forEach((v) => {
        const idx = domain.indexOf((v as unknown[])[1]);
        if (idx !== -1) {
          range.splice(idx, 0, (v as unknown[])[2]);
        }
      });
    }

    // cutoff excess range values
    range.length = domain.length;
  }

  s.range(range);
  return s;
}
