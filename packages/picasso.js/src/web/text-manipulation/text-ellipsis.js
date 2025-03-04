import { ELLIPSIS_CHAR } from './text-const';

export default function ellipsText(
  { text, 'font-size': fontSizeKebab, 'font-family': fontFamilyKebab, fontSize, fontFamily, maxWidth },
  measureText
) {
  // eslint-disable-line import/prefer-default-export
  const finalFontSize = fontSizeKebab || fontSize;
  const finalFontFamily = fontFamilyKebab || fontFamily;
  text = typeof text === 'string' ? text : `${text}`;
  if (maxWidth === undefined) {
    return text;
  }
  let textWidth = measureText({ text, finalFontSize, finalFontFamily }).width;
  if (textWidth <= maxWidth) {
    return text;
  }

  let min = 0;
  let max = text.length - 1;
  while (min <= max) {
    let reduceIndex = Math.floor((min + max) / 2);
    let reduceText = text.substr(0, reduceIndex) + ELLIPSIS_CHAR;
    textWidth = measureText({ text: reduceText, finalFontSize, finalFontFamily }).width;
    if (textWidth <= maxWidth) {
      min = reduceIndex + 1;
    } else {
      // textWidth > maxWidth
      max = reduceIndex - 1;
    }
  }
  return text.substr(0, max) + ELLIPSIS_CHAR;
}
