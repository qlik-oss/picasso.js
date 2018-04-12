import extend from 'extend';

/**
 * @typedef {object}
 * @alias component--legend-cat.settings
 */
const DEFAULT_SETTINGS = {
  /**
   * @typedef {object=}
   */
  layout: {
    /**
     * Maximum number of columns (vertical) or rows (horizontal)
     * @type {number=}
     */
    size: 1,
    /**
     * Layout direction. Either `'ltr'` or `'rtl'`
     * @type {string=}
     */
    direction: 'ltr'
  },
  /**
   * Settings applied per item
   * @typedef {object=}
   */
  item: {
    /** Whether to show the current item
     * @type {boolean=} */
    show: true,
    justify: 0.5,
    align: 0.5,
    /**
     * @typedef {object=} */
    label: {
      fontSize: '12px',
      fontFamily: 'Arial',
      fill: '#595959',
      /** Word break rule, how to apply line break if label text overflows its maxWidth property. Either `'break-word'` or `'break-all'`
       * @type {string=} */
      wordBreak: 'none',
      /** Max number of lines allowed if label is broken into multiple lines (only applicable with wordBreak)
       * @type {number=} */
      maxLines: 2,
      /** Maximum width of label, in px
       * @type {number=} */
      maxWidth: 136,
      lineHeight: 1.2
    },
    /**
     * @typedef {object=} */
    shape: {
      /**
       * @type {string=} */
      type: 'square',
      /**
       * @type {number=} */
      size: 12
    }
  },
  /**
   * @typedef {object=} */
  title: {
    /** Whether to show the title
     * @type {boolean=} */
    show: true,
    /** Title text. Defaults to the title of the provided data field
     * @type {string=} */
    text: undefined,
    /** Horizontal alignment of the text. Allowed values are `'start'`, `'middle'` and `'end'`
     * @type {string}
     */
    anchor: 'start',
    fontSize: '16px',
    fontFamily: 'Arial',
    fill: '#595959',
    /** Word break rule, how to apply line break if label text overflows its maxWidth property. Either `'break-word'` or `'break-all'`
     * @type {string=} */
    wordBreak: 'none',
    /** Max number of lines allowed if label is broken into multiple lines, is only appled when `wordBreak` is not set to `'none'`
     * @type {number=} */
    maxLines: 2,
    /** Maximum width of title, in px
     * @type {number=} */
    maxWidth: 156,
    lineHeight: 1.25
  },
  /**
   * @typedef {object=} */
  navigation: {
    /**
     * @typedef {object=} */
    button: {
      /**
       * @type {object<string, boolean>=} */
      class: undefined,
      /**
       * @type {function} */
      content: undefined
    }
  }
};

/**
 * Resolve settings based on input, defaults, and data
 *
 * @ignore
 * @param {legendComponent} comp - The component instance
 */
export default function resolveSettings(comp) {
  const domain = comp.scale.domain();
  let data = { items: [] };
  if (comp.scale.type === 'threshold-color') {
    const fields = comp.scale.data().fields;
    const sourceField = fields[0];
    const formatter = sourceField ? sourceField.formatter() : v => String(v);

    for (let i = 0; i < domain.length - 1; i++) {
      const it = {
        value: domain[i],
        label: `${formatter(domain[i])} - < ${formatter(domain[i + 1])}`
      };
      if (sourceField) {
        it.source = {
          field: sourceField.id()
        };
      }
      data.items.push(it);
    }

    const orientation = comp.settings.dock === 'top' || comp.settings.dock === 'bottom' ? 'horizontal' : 'vertical';

    if (orientation === 'vertical') {
      data.items.reverse();
    }
  } else {
    const labels = comp.scale.labels ? comp.scale.labels() : null;
    data.items = domain.map((d, idx) => {
      let datum = comp.scale.datum ? extend({}, comp.scale.datum(d)) : { value: d };
      if (comp.scale.datum) {
        datum = extend({}, comp.scale.datum(d));
        datum.value = d;
      }

      if (comp.scale.label) {
        datum.label = comp.scale.label(d);
      } else if (labels) {
        datum.label = labels[idx];
      }

      return datum;
    });
  }

  const title = comp.resolver.resolve({
    data: {
      fields: comp.scale.data().fields
    },
    defaults: extend(true, {}, DEFAULT_SETTINGS.title, comp.style.title),
    settings: comp.settings.settings.title
  });

  const layout = comp.resolver.resolve({
    data: {
      fields: comp.scale.data().fields
    },
    defaults: DEFAULT_SETTINGS.layout,
    settings: comp.settings.settings.layout
  });

  const labels = comp.resolver.resolve({
    data,
    defaults: extend(true, {}, DEFAULT_SETTINGS.item.label, comp.style.item.label),
    settings: (comp.settings.settings.item || {}).label
  });

  const shapeSettings = extend(true, {}, (comp.settings.settings.item || {}).shape);

  if (typeof shapeSettings.fill === 'undefined' && comp.settings.scale) {
    shapeSettings.fill = {
      scale: comp.settings.scale
    };
  }

  const symbols = comp.resolver.resolve({
    data,
    defaults: extend(true, {}, DEFAULT_SETTINGS.item.shape, comp.style.item.shape),
    settings: shapeSettings
  });

  const items = comp.resolver.resolve({
    data,
    defaults: extend(true, {}, {
      show: DEFAULT_SETTINGS.item.show
    }),
    settings: {
      show: (comp.settings.settings.item || {}).show
    }
  });

  function range(item, i) {
    let v = item.data.value;
    let next = domain[i + 1];
    item.data.value = [v, next];
  }

  if (comp.scale.type === 'threshold-color') {
    const orientation = comp.settings.dock === 'top' || comp.settings.dock === 'bottom' ? 'horizontal' : 'vertical';

    if (orientation === 'vertical') {
      items.items.reverse().forEach(range);
      items.items.reverse();
    } else {
      items.items.forEach(range);
    }
  }

  return {
    title,
    labels,
    symbols,
    items,
    layout
  };
}
