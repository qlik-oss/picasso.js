/** A data cell value */
export type DataValue = string | number | null | undefined;

/** A data field accessor */
export interface DataField {
  key(): string;
  title(): string;
  type(): string;
  values(): DataValue[];
  formatter(): unknown;
  min(): number;
  max(): number;
  raw(): unknown;
}

/** Generic scale factory settings */
export interface ScaleSettings {
  [key: string]: unknown;
}

/** Scale data input */
export interface ScaleData {
  items?: unknown[];
  fields?: DataField[];
  [key: string]: unknown;
}

/** Scale resources (chart context) */
export interface ScaleResources {
  chart?: unknown;
  [key: string]: unknown;
}

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
