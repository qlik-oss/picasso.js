import extend from 'extend';
import { breakAll, breakWord } from './word-break';
import { ELLIPSIS_CHAR } from './text-const';
import { includesLineBreak } from './string-tokenizer';
import { fontSizeToLineHeight } from './font-size-to-height';

function generateLineNodes(result, item, halfLead, height) {
  const container = { type: 'container', children: [] };

  if (typeof item.id !== 'undefined') {
    // TODO also inherit data attribute and more?
    container.id = item.id;
  }

  // When the text node lives in a sized slot (maxHeight is set) and is not rotated,
  // center the multi-line block vertically within the reserved slot.
  //
  // Two coordinate models:
  //
  //   text-before-edge (left/right axis): axis-label-node's wiggle() already shifts y
  //     down by (maxHeight − h) / 2 to pre-center a single line. We only need to
  //     compensate for the extra spread of N lines:
  //     centeringOffset = (height − N×lineHeight) / 2
  //
  //   alphabetic baseline (bottom/top axis): appendPadding sets y = padding + maxHeight
  //     (bottom of slot); text renders upward. No wiggle pre-centering, so:
  //     centeringOffset = height − (maxHeight + N×lineHeight) / 2
  //
  // Rotated (tilted) labels have a transform set and use a different positioning model.
  const lineHeight = height + 2 * halfLead;
  let centeringOffset = 0;
  if (!isNaN(item.maxHeight) && !item.transform) {
    const N = result.lines.length;
    if (item.baseline === 'text-before-edge') {
      // Wiggle pre-centers; adjust only for N-line spread relative to single line.
      centeringOffset = (height - N * lineHeight) / 2;
    } else {
      // No pre-centering; y is at slot bottom, center the full block.
      centeringOffset = height - (item.maxHeight + N * lineHeight) / 2;
    }
  }
  let currentY = centeringOffset;

  result.lines.forEach((line, i) => {
    const node = extend({}, item);
    node.text = line;
    node._lineBreak = true; // Flag node as processed to avoid duplicate linebreak run
    currentY += halfLead; // leading height above

    if (result.reduced && i === result.lines.length - 1) {
      node.text += ELLIPSIS_CHAR;
    } else {
      delete node.maxWidth;
    }

    node.dy = isNaN(node.dy) ? currentY : node.dy + currentY;
    currentY += height;
    currentY += halfLead; // Leading height below
    container.children.push(node);
  });

  return container;
}

function shouldLineBreak(item) {
  // If type text and not already broken into lines
  return item.type === 'text' && !item._lineBreak;
}

function wrappedMeasureText(node, measureText) {
  return (text) =>
    measureText({
      text,
      fontSize: node.fontSize,
      fontFamily: node.fontFamily,
    });
}

export function resolveLineBreakAlgorithm(node) {
  const WORDBREAK = {
    'break-all': breakAll,
    'break-word': breakWord,
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
      if (tm.width > item.maxWidth || includesLineBreak(item.text)) {
        const diff = fontSizeToLineHeight(item) - tm.height;
        const halfLead = diff / 2;
        const result = wordBreakFn(item, wrappedMeasureText(item, measureText));

        state.node = generateLineNodes(result, item, halfLead, tm.height); // Convert node to container
      }
    }
  };
}
