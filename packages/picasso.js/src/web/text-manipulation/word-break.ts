import stringTokenizer, { MANDATORY, BREAK_ALLOWED, TokenActive } from './string-tokenizer';
import { HYPHENS_CHAR } from './text-const';
import { fontSizeToLineHeight } from './font-size-to-height';

function resolveMaxAllowedLines(node) {
  const maxHeight = node.maxHeight;
  const maxLines = Math.max(node.maxLines, 1) || Infinity;

  if (isNaN(maxHeight)) {
    return maxLines;
  }

  const computedLineHeight = fontSizeToLineHeight(node);

  return Math.max(1, Math.min(Math.floor(maxHeight / computedLineHeight), maxLines));
}

function initState(node, measureText) {
  return {
    lines: [],
    line: '',
    width: 0,
    maxLines: resolveMaxAllowedLines(node),
    maxWidth: node.maxWidth,
    hyphens: {
      enabled: node.hyphens === 'auto',
      char: HYPHENS_CHAR,
      metrics: measureText(HYPHENS_CHAR),
    },
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
    measureText,
  });

  while (state.lines.length < state.maxLines) {
    const charToken = charTokenIterator.next();
    if (charToken.done) {
      break;
    }
    const activeToken = charToken as TokenActive;
    if (
      state.width + activeToken.width > state.maxWidth &&
      activeToken.breakOpportunity === BREAK_ALLOWED &&
      state.line.length > 0
    ) {
      const resolvedToken = state.hyphens.enabled
        ? insertHyphenAndJump(state, activeToken, charTokenIterator)
        : activeToken;
      newLine(state);
      appendToLine(state, resolvedToken);
    } else {
      appendToLine(state, activeToken);
    }
  }
}

export function breakAll(node, measureText) {
  const text = node.text;
  const iterator = stringTokenizer({
    string: text,
    separator: '',
    measureText,
    noBreakAllowedIdentifiers: [(chunk, i) => i === 0],
  });
  const state = initState(node, measureText);
  let reduced = true;

  while (state.lines.length < state.maxLines) {
    const token = iterator.next();

    if (token.done) {
      newLine(state);
      reduced = false;
      break;
    }
    const activeToken = token as TokenActive;
    if (activeToken.breakOpportunity === MANDATORY) {
      newLine(state);
    } else if (state.width + activeToken.width > state.maxWidth && activeToken.breakOpportunity === BREAK_ALLOWED) {
      if (activeToken.suppress) {
        // Token is suppressable and can be ignored
        state.width += activeToken.width;
      } else {
        const resolvedToken = state.hyphens.enabled ? insertHyphenAndJump(state, activeToken, iterator) : activeToken;
        newLine(state);
        appendToLine(state, resolvedToken);
      }
    } else {
      appendToLine(state, activeToken);
    }
  }

  return {
    lines: state.lines,
    reduced,
  };
}

export function breakWord(node, measureText) {
  const text = node.text;
  const iterator = stringTokenizer({
    string: text,
    separator: /(\s|-|\u2010)/,
    measureText,
  });
  const state = initState(node, measureText);
  let reduced = true;

  while (state.lines.length < state.maxLines) {
    const token = iterator.next();

    if (token.done) {
      newLine(state);
      reduced = false;
      break;
    }
    const activeToken = token as TokenActive;
    if (activeToken.breakOpportunity === MANDATORY) {
      newLine(state);
    } else if (state.width + activeToken.width > state.maxWidth && activeToken.breakOpportunity === BREAK_ALLOWED) {
      if (activeToken.suppress) {
        // Token is suppressable and can be ignored
        newLine(state);
      } else if (activeToken.width > state.maxWidth) {
        // Single sequence is wider then maxWidth, break sequence into multiple lines
        breakSequence(state, activeToken, measureText);
      } else {
        newLine(state);
        appendToLine(state, activeToken);
      }
    } else {
      appendToLine(state, activeToken);
    }
  }

  return {
    lines: state.lines,
    reduced,
  };
}
