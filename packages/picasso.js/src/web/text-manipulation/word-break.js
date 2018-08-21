import stringTokenizer, {
  MANDATORY,
  BREAK_ALLOWED
} from './string-tokenizer';
import {
  DEFAULT_LINE_HEIGHT,
  HYPHENS_CHAR
} from './text-const';

function resolveMaxAllowedLines(node, measuredLineHeight) {
  const maxHeight = node.maxHeight;
  let maxLines = Math.max(node.maxLines, 1) || Infinity;

  if (isNaN(maxHeight)) {
    return maxLines;
  }

  const lineHeight = node.lineHeight || DEFAULT_LINE_HEIGHT;
  const calcLineHeight = measuredLineHeight * lineHeight;

  return Math.max(1, Math.min(Math.floor(maxHeight / calcLineHeight), maxLines));
}

function initState(node, measureText) {
  return {
    lines: [],
    line: '',
    width: 0,
    maxLines: resolveMaxAllowedLines(node, measureText(node.text).height),
    maxWidth: node.maxWidth,
    hyphens: {
      enabled: node.hyphens === 'auto',
      char: HYPHENS_CHAR,
      metrics: measureText(HYPHENS_CHAR)
    }
  };
}

function newLine(state) {
  state.lines.push(state.line);
  state.line = '';
  state.width = 0;
}

function appendToLine(state, token) {
  state.line += token.value;
  state.width += token.width;
}

function insertHyphenAndJump(state, token, iterator) {
  if (token.width > state.maxWidth) {
    return token;
  }

  const startIndex = token.index;

  for (let i = 1; i < 5; i++) {
    const pairToken = iterator.peek(token.index - 1);

    if (!token.hyphenation || !pairToken.hyphenation || token.index === 0) {
      return token;
    }
    if (state.width + state.hyphens.metrics.width <= state.maxWidth) {
      state.line += state.hyphens.char;
      return token;
    }
    if (state.line.length === 1) {
      return token;
    }

    token = iterator.next(startIndex - i);
    state.line = state.line.slice(0, -1);
    state.width -= token.width;
  }

  return token;
}

function breakSequence(state, token, measureText) {
  const charTokenIterator = stringTokenizer({
    string: token.value,
    measureText
  });

  while (state.lines.length < state.maxLines) {
    let charToken = charTokenIterator.next();
    if (charToken.done) {
      break;
    } else if (state.width + charToken.width > state.maxWidth && charToken.breakOpportunity === BREAK_ALLOWED && state.line.length > 0) {
      charToken = state.hyphens.enabled ? insertHyphenAndJump(state, charToken, charTokenIterator) : charToken;
      newLine(state);
      appendToLine(state, charToken);
    } else {
      appendToLine(state, charToken);
    }
  }
}

export function breakAll(node, measureText) {
  const text = node.text;
  const iterator = stringTokenizer({
    string: text,
    separator: '',
    measureText,
    noBreakAllowedIdentifiers: [(chunk, i) => i === 0]
  });
  const state = initState(node, measureText);
  let reduced = true;

  while (state.lines.length < state.maxLines) {
    let token = iterator.next();

    if (token.done) {
      newLine(state);
      reduced = false;
      break;
    } else if (token.breakOpportunity === MANDATORY) {
      newLine(state);
    } else if (state.width + token.width > state.maxWidth && token.breakOpportunity === BREAK_ALLOWED) {
      if (token.suppress) { // Token is suppressable and can be ignored
        state.width += token.width;
      } else {
        token = state.hyphens.enabled ? insertHyphenAndJump(state, token, iterator) : token;
        newLine(state);
        appendToLine(state, token);
      }
    } else {
      appendToLine(state, token);
    }
  }

  return {
    lines: state.lines,
    reduced
  };
}

export function breakWord(node, measureText) {
  const text = node.text;
  const iterator = stringTokenizer({
    string: text,
    separator: /(\s|-|\u2010)/,
    measureText
  });
  const state = initState(node, measureText);
  let reduced = true;

  while (state.lines.length < state.maxLines) {
    let token = iterator.next();

    if (token.done) {
      newLine(state);
      reduced = false;
      break;
    } else if (token.breakOpportunity === MANDATORY) {
      newLine(state);
    } else if (state.width + token.width > state.maxWidth && token.breakOpportunity === BREAK_ALLOWED) {
      if (token.suppress) { // Token is suppressable and can be ignored
        newLine(state);
      } else if (token.width > state.maxWidth) { // Single sequence is wider then maxWidth, break sequence into multiple lines
        breakSequence(state, token, measureText);
      } else {
        newLine(state);
        appendToLine(state, token);
      }
    } else {
      appendToLine(state, token);
    }
  }

  return {
    lines: state.lines,
    reduced
  };
}
