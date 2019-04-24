const BASE = 24;
const PAD = 4;
const BUMP = 1e-12;
const DEFAULT_HEIGHT = 16;
const TEXT_REGEX = /^\s*([0-9]+|[0-9]+\.{1}[0-9]+)[px]{2}\s*$/i;

function isValidFontSize(val) {
  const type = typeof val;
  if (type === 'string') {
    return TEXT_REGEX.test(val);
  }

  return false;
}

export default function fontSizeToHeight(fontSize) {
  if (isValidFontSize(fontSize)) {
    const size = parseFloat(fontSize);
    const m = PAD * Math.ceil((size + BUMP) / BASE);

    return size + m;
  }

  return DEFAULT_HEIGHT;
}
