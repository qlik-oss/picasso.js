const BASE = 24;
const PAD = 4;
const BUMP = 1e-12;
const DEFAULT_FONT_HEIGHT = 16;
const DEFAULT_LINE_HEIGHT = 1.2;
const TEXT_REGEX = /^\s*\d+(\.\d+)?px\s*$/i;

function isValidFontSize(val) {
  const type = typeof val;
  if (type === 'string') {
    return TEXT_REGEX.test(val);
  }

  return false;
}

export function fontSizeToHeight(fontSize) {
  if (isValidFontSize(fontSize)) {
    const size = parseFloat(fontSize);
    const m = PAD * Math.ceil((size + BUMP) / BASE);

    return size + m;
  }

  return DEFAULT_FONT_HEIGHT;
}

export function fontSizeToLineHeight(node) {
  const fontSize = node['font-size'] || node.fontSize;
  if (isValidFontSize(fontSize)) {
    return parseFloat(fontSize) * Math.max(isNaN(node.lineHeight) ? DEFAULT_LINE_HEIGHT : node.lineHeight, 0);
  }

  return DEFAULT_FONT_HEIGHT * DEFAULT_LINE_HEIGHT;
}
