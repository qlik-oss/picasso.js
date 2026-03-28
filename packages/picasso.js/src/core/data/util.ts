interface CacheConfig {
  fields: Field[];
}

interface Field {
  key(): string;
  title(): string;
  value?: unknown;
  label?: unknown;
  reduce?: string | ((values: unknown[]) => unknown);
  reduceLabel?: string | ((labels: unknown[], value: unknown) => unknown);
  formatter(): (value: unknown) => unknown;
}

interface Dataset {
  field(fieldId: string | number): Field;
}

interface DataProperty {
  field?: string | number;
  value?: unknown;
  label?: unknown;
  reduce?: string | ((values: unknown[]) => unknown);
  reduceLabel?: string | ((labels: unknown[], value: unknown) => unknown);
  filter?: (values: unknown[]) => unknown[];
  fields?: DataProperty[];
}

interface FieldConfig {
  field?: string | number;
  value?: (item: unknown) => unknown;
  label?: (item: unknown) => unknown;
  reduce?: string | ((values: unknown[]) => unknown);
  reduceLabel?: string | ((labels: unknown[], value: unknown) => unknown);
  filter?: (values: unknown[]) => unknown[];
  props?: Record<string, DataProperty>;
  trackBy?: string | ((item: unknown) => unknown);
}

export function findField(query: string | number, { cache }: { cache: CacheConfig }): Field | null {
  if (typeof query === 'number') {
    return cache.fields[query];
  }

  // Find by key first
  for (let i = 0; i < cache.fields.length; i++) {
    if (cache.fields[i].key() === query) {
      return cache.fields[i];
    }
  }
  // find by title
  for (let i = 0; i < cache.fields.length; i++) {
    if (cache.fields[i].title() === query) {
      return cache.fields[i];
    }
  }
  return null;
}

const filters: {
  numeric(values: unknown[]): number[];
} = {
  numeric: (values: unknown[]): number[] =>
    (values as unknown[]).filter((v: unknown) => typeof v === 'number' && !isNaN(v as number)) as number[],
};

const unfilteredReducers: {
  sum(values: number[]): number;
} = {
  sum: (values: number[]): number => values.reduce((a: number, b: number) => a + b, 0),
};

/**
 * [reducers description]
 * @type {Object}
 * @private
 */
export const reducers: {
  first(values: unknown[]): unknown;
  last(values: unknown[]): unknown;
  min(values: unknown[]): number;
  max(values: unknown[]): number;
  sum(values: unknown[]): number;
  avg(values: unknown[]): number;
} = {
  first: (values: unknown[]): unknown => values[0],
  last: (values: unknown[]): unknown => values[values.length - 1],
  min: (values: unknown[]): number => {
    const filtered = filters.numeric(values);
    return !filtered.length ? NaN : Math.min.apply(null, filtered as unknown as number[]);
  },
  max: (values: unknown[]): number => {
    const filtered = filters.numeric(values);
    return !filtered.length ? NaN : Math.max.apply(null, filtered as unknown as number[]);
  },
  sum: (values: unknown[]): number => {
    const filtered = filters.numeric(values);
    return !filtered.length ? NaN : filtered.reduce((a: number, b: number) => a + b, 0);
  },
  avg: (values: unknown[]): number => {
    const filtered = filters.numeric(values);
    const len = filtered.length;
    return !len ? NaN : unfilteredReducers.sum(filtered) / len;
  },
};

function normalizeProperties(
  cfg: FieldConfig,
  dataset: Dataset,
  dataProperties: Record<string, DataProperty | unknown>,
  main: Record<string, unknown>
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const mainField =
    (main as Record<string, unknown>).field ||
    (typeof cfg.field !== 'undefined' ? dataset.field(cfg.field as string | number) : null);
  Object.keys(dataProperties).forEach((key: string) => {
    const pConfig = dataProperties[key];
    const prop: Record<string, unknown> = (props[key] = {} as Record<string, unknown>);
    if (['number', 'string', 'boolean'].indexOf(typeof pConfig) !== -1) {
      prop.type = 'primitive';
      prop.value = pConfig;
    } else if (typeof pConfig === 'function') {
      prop.type = 'function';
      prop.value = pConfig;
      prop.label = pConfig;
      prop.field = mainField;
    } else if (typeof pConfig === 'object') {
      const pc = pConfig as DataProperty;
      if (pc.fields) {
        prop.fields = pc.fields.map((ff: DataProperty) => {
          const normalized = normalizeProperties(cfg, dataset, { main: ff }, main) as Record<
            string,
            unknown
          >;
          return normalized.main;
        });
      } else if (typeof pc.field !== 'undefined') {
        prop.type = 'field';
        prop.field = dataset.field(pc.field);
        prop.value = (prop.field as Field).value;
        prop.label = (prop.field as Field).label;
      } else if (mainField) {
        prop.value = (mainField as Field).value;
        prop.label = (mainField as Field).label;
        prop.field = mainField;
      }

      if (typeof pc.filter === 'function') {
        prop.filter = pc.filter;
      }
      if (typeof pc.value !== 'undefined') {
        prop.value = pc.value;
      }
      if (typeof pc.label !== 'undefined') {
        prop.label = pc.label;
      }
      if (typeof pc.reduce === 'function') {
        prop.reduce = pc.reduce;
      } else if (pc.reduce) {
        prop.reduce = reducers[pc.reduce as keyof typeof reducers];
      } else if (prop.field && (prop.field as Field).reduce) {
        const fieldReduce = (prop.field as Field).reduce;
        prop.reduce =
          typeof fieldReduce === 'string'
            ? reducers[fieldReduce as keyof typeof reducers]
            : fieldReduce;
      }

      if (typeof pc.reduceLabel === 'function') {
        prop.reduceLabel = pc.reduceLabel;
      } else if (pc.reduceLabel) {
        prop.reduceLabel = reducers[pc.reduceLabel as keyof typeof reducers];
      } else if (prop.field && (prop.field as Field).reduceLabel) {
        const fieldReduceLabel = (prop.field as Field).reduceLabel;
        prop.reduceLabel =
          typeof fieldReduceLabel === 'string'
            ? reducers[fieldReduceLabel as keyof typeof reducers]
            : fieldReduceLabel;
      }
    }
  });

  return props;
}

/*
example of configuration input
cfg = {
  field: 'State', // the 'top level' values are extracted from field state
  value: d => d.qText, // the value of the output
  props: { // additional data properties ammended to each item
    a: 3, // constant value
    b: d => d.qElemNumber, // function will receive the original field value
    c: {
      field: 'Country', // reference to another field
      value: d => d.qText // extract the qText value from the referenced field
    },
    d: {
      value: d => d.qRow //  extract qRow from field 'State'
    }
  }
}

// output
[{
  value: 'CA', source: { field: 'State' },
  a: { value: 3 },
  b: { value: 26, source: 'State' },
  c: { value: 'USA', source: 'Country' },
  d: { value: 131, source: 'State' }
},
...]
*/
export function getPropsInfo(
  cfg: FieldConfig,
  dataset: Dataset
): { props: Record<string, unknown>; main: Record<string, unknown> } {
  const { main } = normalizeProperties(
    cfg,
    dataset,
    {
      main: {
        value: cfg.value,
        label: cfg.label,
        reduce: cfg.reduce,
        filter: cfg.filter,
      },
    },
    {}
  ) as { main: Record<string, unknown> };
  const props = normalizeProperties(cfg, dataset, cfg.props || {}, main);
  return { props, main };
}

function collectItems(
  items: Array<Record<string, unknown>>,
  cfg: Record<string, unknown>,
  formatter: ((value: unknown) => unknown) | undefined,
  prop?: string
): Record<string, unknown> {
  const values = Array(items.length);
  const labels = Array(items.length);
  let it;
  for (let i = 0; i < items.length; i++) {
    it = prop ? items[i][prop] : items[i];
    values[i] = (it as Record<string, unknown>).value;
    labels[i] = (it as Record<string, unknown>).label;
  }

  const reduce = cfg.reduce as ((values: unknown[]) => unknown) | undefined;
  const reduceLabel = cfg.reduceLabel as
    | ((labels: unknown[], value: unknown) => unknown)
    | undefined;
  const v = reduce ? reduce(values) : values;
  const b = reduceLabel
    ? reduceLabel(labels, v)
    : formatter
    ? formatter(v)
    : String(v); // eslint-disable-line no-nested-ternary

  const ret: Record<string, unknown> = {
    value: v,
    label: b,
  };
  if (prop && (items[0][prop] as Record<string, unknown>).source) {
    ret.source = (items[0][prop] as Record<string, unknown>).source;
    return ret;
  }
  if (!prop && (items[0] as Record<string, unknown>).source) {
    ret.source = (items[0] as Record<string, unknown>).source;
    return ret;
  }

  return ret;
}

// collect items that have been grouped and reduce per group and property
export function collect(
  trackedItems: Array<{ items: Array<Record<string, unknown>> }>,
  {
    main,
    propsArr,
    props,
  }: {
    main: Record<string, unknown>;
    propsArr: string[];
    props: Record<string, unknown>;
  }
): Array<Record<string, unknown>> {
  const dataItems: Array<Record<string, unknown>> = [];
  const mainFormatter = (main as unknown as { field: Field }).field.formatter();
  const propsFormatters: Record<string, (value: unknown) => unknown> = {};
  propsArr.forEach((prop: string) => {
    const propConfig = props[prop] as unknown as { field?: Field };
    propsFormatters[prop] = propConfig.field ? propConfig.field.formatter() : (v: unknown) => v;
  });
  dataItems.push(
    ...trackedItems.map((t: { items: Array<Record<string, unknown>> }) => {
      const ret = collectItems(t.items, main as Record<string, unknown>, mainFormatter);

      propsArr.forEach((prop: string) => {
        ret[prop] = collectItems(
          t.items,
          (props[prop] as Record<string, unknown>) || {},
          propsFormatters[prop],
          prop
        );
      });
      return ret;
    })
  );

  return dataItems;
}

export function track({
  cfg,
  itemData,
  obj,
  target,
  tracker,
  trackType,
}: {
  cfg: FieldConfig;
  itemData: Record<string, unknown>;
  obj: Record<string, unknown>;
  target: Array<Record<string, unknown>>;
  tracker: Record<string, Record<string, unknown>>;
  trackType: string;
}): void {
  const trackBy = cfg.trackBy as string | ((item: unknown) => unknown);
  const trackId =
    trackType === 'function'
      ? (trackBy as (item: unknown) => unknown)(itemData)
      : itemData[trackBy as string];
  let trackedItem = tracker[String(trackId)];
  if (!trackedItem) {
    trackedItem = tracker[String(trackId)] = {
      items: [],
      id: trackId,
    };
    target.push(trackedItem);
  }
  (trackedItem as Record<string, unknown>).items = [
    ...((trackedItem as Record<string, unknown>).items as Array<Record<string, unknown>>),
    obj,
  ];
}

const ARRAY_MAX_SIZE = 10000;

export function getMax(values: number[]): number {
  if (values.length < ARRAY_MAX_SIZE) {
    return Math.max(...values);
  }
  let max = -Infinity;
  const len = values.length;
  for (let i = 0; i < len; i++) {
    if (max < values[i]) {
      max = values[i];
    }
  }
  return max;
}

export function getMin(values: number[]): number {
  if (values.length < ARRAY_MAX_SIZE) {
    return Math.min(...values);
  }
  let min = Infinity;
  const len = values.length;
  for (let i = 0; i < len; i++) {
    if (min > values[i]) {
      min = values[i];
    }
  }
  return min;
}
