import registry from '../../utils/registry';
import linear from '../../scales/linear';
import band from '../../scales/band';
import hBand from '../../scales/h-band';
import sequential from '../../scales/color/sequential';
import threshold from '../../scales/color/threshold';
import categorical from '../../scales/color/categorical';
import extractData from '../../data/extractor';

/**
 * Definition for creating a scale. Additional properties, specific for a type of scale, can be addded as key/value pairs
 * @typedef {object} ScaleDefinition
 * @property {string} [type] Type of scale
 * @property {DataExtractConfig} [data] Data configuration
 */

/**
 * Scale instance
 * @typedef {object} Scale
 * @interface
 * @property {string} type Type of scale
 */

const scaleRegistry = registry();

scaleRegistry('linear', linear);
scaleRegistry('band', band);
scaleRegistry('h-band', hBand);
scaleRegistry('sequential-color', sequential);
scaleRegistry('threshold-color', threshold);
scaleRegistry('categorical-color', categorical);

export { scaleRegistry as default };

function getTypeFromMeta(fields) {
  const types = fields.map((field) => (field.type() === 'dimension' ? 'band' : 'linear'));
  return types.indexOf('linear') !== -1 ? 'linear' : 'band';
}

function deduceScaleTypeFromData(data) {
  if (data.root) {
    return 'h-band';
  }

  if (data.fields && data.fields[0]) {
    return getTypeFromMeta(data.fields);
  }
  return 'linear';
}

export function create(options, d, deps) {
  let dataSourceConfig = options.data;
  if (options.source) {
    // DEPRECATION
    deps.logger.warn('Deprecated: Scale data source configuration');
    dataSourceConfig = {
      extract: [],
    };
    (Array.isArray(options.source) ? options.source : [options.source]).forEach((source) => {
      dataSourceConfig.extract.push({
        field: source,
      });
    });
  }

  const data = extractData(dataSourceConfig, d, deps);
  let type = options.type || deduceScaleTypeFromData(data);
  let s;

  if (type === 'color') {
    if (data.fields && data.fields[0] && data.fields[0].type() === 'dimension') {
      type = 'categorical-color';
    } else {
      type = 'sequential-color';
    }
  }

  if (deps.scale.has(type)) {
    s = deps.scale.get(type);
    s = s(options, data, { theme: deps.theme, logger: deps.logger });
    s.type = type;
  }
  return s;
}

export function collection(scalesConfig, data, deps, fn = create) {
  const scales = {};

  return {
    get(def) {
      let key;
      if (typeof def === 'string' && scalesConfig[def]) {
        key = def;
      } else if (typeof def === 'object' && 'scale' in def && scalesConfig[def.scale]) {
        key = def.scale;
      }

      if (key) {
        scales[key] = scales[key] || fn(scalesConfig[key], data, deps);
        return scales[key];
      }

      return fn(def, data, deps);
    },
    all() {
      Object.keys(scalesConfig).forEach(this.get);
      return scales;
    },
  };
}
