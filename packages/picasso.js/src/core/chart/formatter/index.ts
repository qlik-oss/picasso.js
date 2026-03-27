import extractData from '../../data/extractor';

export function create(options, data, deps, extractor = extractData) {
  if (options.data) {
    const d = extractor(options.data, data, deps);
    if (d && d.fields && d.fields[0]) {
      // TODO Have some magic to handle and merge formatters from multiple sources
      return d.fields[0].formatter();
    }
  }

  let formatterType;
  if (options.formatter) {
    formatterType = `${options.formatter}-${options.type || 'number'}`;
  } else {
    formatterType = options.type || 'd3-number';
  }

  if (deps.formatter.has(formatterType)) {
    const f = deps.formatter.get(formatterType)(options.format || '');
    return f;
  }

  throw new Error(`Formatter of type '${formatterType}' was not found`);
}

export function collection(formattersConfig, data, deps, fn = create) {
  const formatters = {};
  return {
    get(def) {
      let key;
      if (typeof def === 'string' && formattersConfig[def]) {
        key = def;
      } else if (typeof def === 'object' && 'formatter' in def && formattersConfig[def.formatter]) {
        key = def.formatter;
      } else if (typeof def === 'object' && 'type' in def && formattersConfig[def.type]) {
        key = def.type;
      }

      if (key) {
        formatters[key] = formatters[key] || fn(formattersConfig[key], data, deps);
        return formatters[key];
      }

      return fn(def || {}, data, deps);
    },
    all() {
      Object.keys(formattersConfig).forEach(this.get);
      return formatters;
    },
  };
}
