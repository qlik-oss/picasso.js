import extend from 'extend';

function parseTitle(text, join, scale) {
  let title = '';
  if (typeof text === 'function') {
    title = text();
  } else if (typeof text === 'string') {
    title = text;
  } else if (scale) {
    let data = scale.data();
    const titles = (data.fields || []).map(field => field.title());
    title = titles.join(join);
  }

  return title;
}

function getTextAnchor(dock, anchor) {
  let val = 'middle';
  if (dock === 'left') {
    if (anchor === 'top') {
      val = 'end';
    } else if (anchor === 'bottom') {
      val = 'start';
    }
  } else if (dock === 'right') {
    if (anchor === 'top') {
      val = 'start';
    } else if (anchor === 'bottom') {
      val = 'end';
    }
  } else if (anchor === 'left') {
    val = 'start';
  } else if (anchor === 'right') {
    val = 'end';
  }
  return val;
}

function generateTitle({
  title,
  definitionSettings,
  dock,
  rect,
  measureText,
  style
}) {
  const struct = {
    type: 'text',
    text: title,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    anchor: getTextAnchor(dock, definitionSettings.anchor),
    baseline: 'alphabetical'
  };

  extend(struct, style.text);
  const textRect = measureText(struct);

  if (dock === 'top' || dock === 'bottom') {
    let x = rect.width / 2;
    if (definitionSettings.anchor === 'left') {
      x = definitionSettings.paddingLeft || 0;
    } else if (definitionSettings.anchor === 'right') {
      x = rect.width - (definitionSettings.paddingRight || 0);
    }

    struct.x = x;
    struct.y = dock === 'top' ? rect.height - definitionSettings.paddingStart : definitionSettings.paddingStart + textRect.height;
    struct.dy = dock === 'top' ? -(textRect.height / 6) : -(textRect.height / 3);
    struct.maxWidth = rect.width * 0.8;
  } else {
    let y = rect.height / 2;
    if (definitionSettings.anchor === 'top') {
      y = definitionSettings.paddingStart;
    } else if (definitionSettings.anchor === 'bottom') {
      y = rect.height - definitionSettings.paddingStart;
    }

    struct.y = y;
    struct.x = dock === 'left' ? rect.width - definitionSettings.paddingStart : definitionSettings.paddingStart;
    struct.dx = dock === 'left' ? -(textRect.height / 3) : (textRect.height / 3);
    const rotation = dock === 'left' ? 270 : 90;
    struct.transform = `rotate(${rotation}, ${struct.x + struct.dx}, ${struct.y + struct.dy})`;
    struct.maxWidth = rect.height * 0.8;
  }

  if (!isNaN(definitionSettings.maxLengthPx)) {
    struct.maxWidth = Math.min(struct.maxWidth, definitionSettings.maxLengthPx);
  }

  return struct;
}

/**
 * @typedef {object} component--text
 * @property {string} [type='text']
 * @property {string|function} text
 * @property {component--text-settings} settings - Text settings
 * @example
 * {
 *  type: 'text',
 *  text: 'my title',
 *  dock: 'left',
 *  settings: {
 *    anchor: 'left',
 *    style: {
 *      fill: 'red'
 *    }
 *  }
 * }
 */

/**
 * @typedef {object} component--text-settings
 * @property {number} [paddingStart=5]
 * @property {number} [paddingEnd=5]
 * @property {number} [paddingLeft=0]
 * @property {number} [paddingRight=0]
 * @property {string} [anchor='center'] - Where to v- or h-align the text. Supports `left`, `right`, `top`, `bottom` and `center`
 * @property {string} [join=', '] - String to add when joining titles from multiple sources
 * @property {number} [maxLengthPx] - Limit the text length to this value in pixels
 */
const textComponent = {
  require: ['renderer', 'chart'],
  defaultSettings: {
    layout: {
      dock: 'bottom',
      displayOrder: 0,
      prioOrder: 0
    },
    settings: {
      paddingStart: 5,
      paddingEnd: 5,
      paddingLeft: 0,
      paddingRight: 0,
      anchor: 'center',
      join: ', ',
      maxLengthPx: NaN
    },
    style: {
      text: '$title'
    }
  },

  created() {
    this.definitionSettings = this.settings.settings;

    const text = this.settings.text;
    const join = this.definitionSettings.join;
    this.title = parseTitle(text, join, this.scale);
  },

  preferredSize() {
    const height = this.renderer.measureText({
      text: this.title,
      fontSize: this.style.text.fontSize,
      fontFamily: this.style.text.fontFamily
    }).height;
    return height + this.definitionSettings.paddingStart + this.definitionSettings.paddingEnd;
  },

  render() {
    const {
      title,
      definitionSettings,
      rect
    } = this;
    const nodes = [];
    nodes.push(generateTitle({
      title,
      dock: this.settings.layout.dock,
      definitionSettings,
      rect,
      measureText: this.renderer.measureText,
      style: this.style
    }));
    return nodes;
  },

  beforeUpdate(opts) {
    if (opts.settings) {
      extend(this.settings, opts.settings);
      this.definitionSettings = opts.settings.settings;
    }
    const text = this.settings.text;
    const join = this.definitionSettings.join;
    this.title = parseTitle(text, join, this.scale);
  }
};

export default textComponent;
