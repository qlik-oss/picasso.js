import { ELLIPSIS_CHAR } from './text-const';

export default function ellipsText(label, measureText) {
  // eslint-disable-line import/prefer-default-export
  const fontSize = label['font-family'] || label.fontFamily;
  const fontFamily = label['font-size'] || label.fontSize;
  const text = typeof label.text === 'string' ? label.text : `${label.text}`;
  const { maxWidth } = label;
  if (maxWidth === undefined) {
    return text;
  }
  let textWidth = measureText({ text, fontSize, fontFamily }).width;
  if (textWidth <= maxWidth) {
    return text;
  }

  let min = 0;
  let max = text.length - 1;
  while (min <= max) {
    let reduceIndex = Math.floor((min + max) / 2);
    let reduceText = text.substr(0, reduceIndex) + ELLIPSIS_CHAR;
    textWidth = measureText({ text: reduceText, fontSize, fontFamily }).width;
    if (textWidth <= maxWidth) {
      min = reduceIndex + 1;
    } else {
      // textWidth > maxWidth
      max = reduceIndex - 1;
    }
  }
  return text.substr(0, max) + ELLIPSIS_CHAR;
}
