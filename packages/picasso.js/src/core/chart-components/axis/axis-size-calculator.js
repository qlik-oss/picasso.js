import getLabelSize from './axis-label-size';

export default function calcRequiredSize({
  isDiscrete,
  rect,
  formatter,
  measureText,
  scale,
  settings,
  state
}) {
  let size = 0;

  const { size: labelSize, edgeBleed, isToLarge } = getLabelSize({
    isDiscrete,
    rect,
    formatter,
    measureText,
    scale,
    settings,
    state
  });

  size += labelSize;

  if (isToLarge) {
    return { size };
  }

  if (settings.ticks.show) {
    size += settings.ticks.margin;
    size += settings.ticks.tickSize;
  }
  if (settings.minorTicks && settings.minorTicks.show) {
    const minorTicksSize = settings.minorTicks.margin + settings.minorTicks.tickSize;
    if (minorTicksSize > size) {
      size = minorTicksSize;
    }
  }
  if (settings.line.show) {
    size += settings.line.strokeWidth;
  }
  size += settings.paddingStart;
  size += settings.paddingEnd;

  return { size, edgeBleed };
}
