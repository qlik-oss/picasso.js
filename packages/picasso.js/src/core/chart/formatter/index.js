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

export default function builder(obj, data, deps) {
  const formatters = {};
  for (const f in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, f)) {
      formatters[f] = create(obj[f], data, deps);
    }
  }
  return formatters;
}

export function getOrCreateFormatter(v, formatters, data, deps) {
  let f;
  if (typeof v === 'string' && formatters[v]) { // return by name
    f = formatters[v];
  } else if (typeof v === 'object' && 'formatter' in v && formatters[v.formatter]) { // return by { formatter: "name" }
    f = formatters[v.formatter];
  } else if (typeof v === 'object' && 'type' in v && formatters[v.type]) { // return by { formatter: "name" }
    f = formatters[v.type];
  }

  return f || create(v, data, deps);
}
