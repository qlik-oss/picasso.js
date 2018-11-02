import extend from 'extend';
import { breakAll, breakWord } from './word-break';
import { DEFAULT_LINE_HEIGHT, ELLIPSIS_CHAR } from './text-const';
import { includesLineBreak } from './string-tokenizer';

function generateLineNodes(result, item, halfLineHeight) {
  const container = { type: 'container', children: [] };

  if (typeof item.id !== 'undefined') { // TODO also inherit data attribute and more?
    container.id = item.id;
  }

  let currentY = 0;

  result.lines.forEach((line, i) => {
    const node = extend({}, item);
    node.text = line;
    node._lineBreak = true; // Flag node as processed to avoid duplicate linebreak run
    currentY += halfLineHeight; // leading height above

    if (result.reduced && i === result.lines.length - 1) {
      node.text += ELLIPSIS_CHAR;
    } else {
      delete node.maxWidth;
    }

    node.dy = isNaN(node.dy) ? currentY : node.dy + currentY;
    currentY += halfLineHeight; // Leading height below
    container.children.push(node);
  });

  return container;
}

function shouldLineBreak(item) {
  // If type text and not already broken into lines
  return item.type === 'text' && !item._lineBreak;
}

function wrappedMeasureText(node, measureText) {
  return text => measureText({
    text,
    fontSize: node.fontSize,
    fontFamily: node.fontFamily
  });
}

export function resolveLineBreakAlgorithm(node) {
  const WORDBREAK = {
    'break-all': breakAll,
    'break-word': breakWord
  };

  return WORDBREAK[node.wordBreak];
}

/**
 * Apply wordBreak rules to text nodes.
 * @ignore
 * @param {function} measureText
 * @returns {function} Event function to convert a text node into multiple nodes
 */
export function onLineBreak(measureText) {
  return (state) => {
    const item = state.node;
    if (shouldLineBreak(item)) {
      const wordBreakFn = resolveLineBreakAlgorithm(item);
      if (!wordBreakFn) {
        return;
      }

      const tm = measureText(item);
      if (tm.width <= item.maxWidth && !includesLineBreak(item.text)) {
        return;
      }

      const halfLineHeight = (tm.height * (item.lineHeight || DEFAULT_LINE_HEIGHT)) / 2;
      const result = wordBreakFn(item, wrappedMeasureText(item, measureText));

      state.node = generateLineNodes(result, item, halfLineHeight); // Convert node to container
    }
  };
}
