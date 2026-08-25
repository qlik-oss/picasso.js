const LINEBREAK_REGEX = /\n+|\r+|\r\n/;
const WHITESPACE_REGEX = /\s/;
const HYPHEN_REGEX = /[a-zA-Z\u00C0-\u00F6\u00F8-\u00FF\u00AD]/;
export const NO_BREAK = 0;
export const MANDATORY = 1;
export const BREAK_ALLOWED = 2;

export function includesLineBreak(c) {
  if (typeof c === 'string') {
    return c.search(LINEBREAK_REGEX) !== -1;
  }
  return String(c).search(LINEBREAK_REGEX) !== -1;
}

function includesWhiteSpace(c) {
  return c.search(WHITESPACE_REGEX) !== -1;
}

function hyphenationAllowed(c) {
  /* Latin character set. Excluding numbers, sign and symbol characters, but including soft hyphen */
  return c.search(HYPHEN_REGEX) !== -1;
}

function resolveBreakOpportunity(chunk, i, chunks, mandatory, noBreakAllowed) {
  if (mandatory.some((fn) => fn(chunk, i, chunks))) {
    return MANDATORY;
  }
  if (noBreakAllowed.some((fn) => fn(chunk, i, chunks))) {
    return NO_BREAK;
  }

  return BREAK_ALLOWED;
}

function cleanEmptyChunks(chunks) {
  if (chunks[0] === '') {
    chunks.shift();
  }
  if (chunks[chunks.length - 1] === '') {
    chunks.pop();
  }
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export default function stringTokenizer({
  string,
  separator = '',
  reverse = false,
  measureText = (text) => ({ width: text.length, height: 1 }),
  mandatoryBreakIdentifiers = [includesLineBreak],
  noBreakAllowedIdentifiers = [],
  suppressIdentifier = [includesWhiteSpace, includesLineBreak, (chunk) => chunk === ''],
  hyphenationIdentifiers = [hyphenationAllowed],
} = {}) {
  const chunks = String(string).split(separator);
  cleanEmptyChunks(chunks);
  const length = chunks.length;
  const isNotDone = reverse ? (p) => p >= 0 : (p) => p < length;
  let position = reverse ? length : -1; // Set init position 1 step before or after to make first next call go to first position

  function peek(peekAt) {
    const i = clamp(peekAt, 0, length - 1);
    const chunk = chunks[i];
    const textMeasure = measureText(chunk);
    const opportunity = resolveBreakOpportunity(chunk, i, chunks, mandatoryBreakIdentifiers, noBreakAllowedIdentifiers);

    return {
      index: i,
      value: chunk,
      breakOpportunity: opportunity,
      suppress: suppressIdentifier.some((fn) => fn(chunk, i, chunks)),
      hyphenation: hyphenationIdentifiers.some((fn) => fn(chunk, i, chunks)),
      width: textMeasure.width,
      height: textMeasure.height,
      done: false,
    };
  }

  function next(jumpToPosition) {
    if (isNaN(jumpToPosition)) {
      if (reverse) {
        position--;
      } else {
        position++;
      }
    } else {
      position = clamp(jumpToPosition, 0, length - 1);
    }

    if (isNotDone(position)) {
      return peek(position);
    }
    return { done: true };
  }

  return {
    next,
    peek,
    length,
  };
}
