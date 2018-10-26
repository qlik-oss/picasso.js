function isMajorTick(tick) {
  return !tick.isMinor && tick.position >= 0 && tick.position <= 1;
}

function isVerticalLabelOverlapping({
  majorTicks,
  measureText,
  rect
}) {
  const size = rect.height;
  const textHeight = measureText('M').height;
  if (majorTicks.length < 2) {
    return false;
  }

  const d = size * Math.abs(majorTicks[0].position - majorTicks[1].position);
  if (d < textHeight) {
    return true;
  }

  return false;
}

function isHorizontalLabelOverlapping({
  majorTicks,
  measureText,
  rect,
  state
}) {
  /*
   * Currently isn't any good way of doing a accurate measurement on size available (bandWidth * width) for labels.
   * It's a lifecycle limitation as components docked either left or right can affect the width available after the calculation is done.
   * <number of components docked left/right> * <width of components> => Less accurate ===> Can result in only ellips char rendered as labels.
   */
  const m = state.labels.activeMode === 'layered' ? 2 : 1;
  const size = rect.width;
  const tickSize = majorTicks
    .map(tick => tick.label)
    .map(l => `${l.slice(0, 1)}${l.length > 1 ? '…' : ''}`) // Measure the size of 1 chars + the ellips char.
    .map(measureText)
    .map(r => r.width);
  for (let i = 0; i < majorTicks.length; ++i) {
    const tick = majorTicks[i];
    const d1 = m * size * Math.abs(tick.start - tick.end);
    const d2 = tickSize[i];
    if (d1 < d2) {
      return true;
    }
  }
  return false;
}

function shouldAutoTilt({
  majorTicks,
  measure,
  rect,
  state,
  settings
}) {
  const glyphCount = settings.labels.maxGlyphCount;
  const m = state.labels.activeMode === 'layered' ? 2 : 1;
  const magicSizeRatioMultipler = 0.7; // So that if less the 70% of labels are visible, toggle on tilt
  const ellipsCharSize = measure('…').width; // include ellipsed char in calc as it's generally large then the char it replaces
  const size = rect.width;
  let maxLabelWidth = 0;
  let d1 = 0;

  if (!isNaN(glyphCount)) {
    const minBandwidth = majorTicks.reduce((prev, curr) => Math.min(Math.abs(curr.start - curr.end), prev), Infinity);
    d1 = m * size * minBandwidth;
    maxLabelWidth = measure('M').width * magicSizeRatioMultipler * glyphCount;
    if (maxLabelWidth + ellipsCharSize > d1) {
      return true;
    }
  } else {
    for (let i = 0; i < majorTicks.length; i++) {
      const tick = majorTicks[i];
      const label = tick.label;
      const width = measure(label).width * (label.length > 1 ? magicSizeRatioMultipler : 1);
      d1 = m * size * Math.abs(tick.start - tick.end);
      if (width + ellipsCharSize > d1) {
        return true;
      }
    }
  }

  return false;
}

function isTiltedLabelOverlapping({
  majorTicks,
  measureText,
  rect,
  bleedSize,
  angle
}) {
  if (majorTicks.length < 2) {
    return false;
  }
  if (angle === 0) {
    return true; // TODO 0 angle should be considered non-tilted
  }
  const absAngle = Math.abs(angle);
  const size = rect.width - bleedSize;
  const stepSize = size * Math.abs(majorTicks[0].position - majorTicks[1].position);
  const textHeight = measureText('M').height;
  const reciprocal = 1 / stepSize; // 1 === Math.sin(90 * (Math.PI / 180))
  const distanceBetweenLabels = Math.sin(absAngle * (Math.PI / 180)) / reciprocal;

  return textHeight > distanceBetweenLabels;
}

function isToLarge({
  rect,
  state,
  majorTicks,
  measure,
  horizontal
}) {
  if (horizontal) {
    return isHorizontalLabelOverlapping({
      majorTicks,
      measureText: measure,
      rect,
      state
    });
  }

  return isVerticalLabelOverlapping({
    majorTicks,
    measureText: measure,
    rect,
    state
  });
}

export function getClampedValue({
  value, maxValue, minValue, range, modifier
}) {
  if (!isNaN(range) && !isNaN(modifier)) {
    value = range * modifier;
  }

  if (value > maxValue) {
    value = maxValue;
  }

  if (value < minValue) {
    value = minValue;
  }

  return value;
}

export default function getSize({
  isDiscrete,
  rect,
  formatter,
  measureText,
  scale,
  settings,
  state
}) {
  let size = 0;
  const edgeBleed = {
    left: 0, top: 0, right: 0, bottom: 0
  };
  const {
    maxLengthPx: maxValue,
    minLengthPx: minValue
  } = settings.labels;

  if (settings.labels.show) {
    const align = settings.align;
    const horizontal = align === 'top' || align === 'bottom';
    const distance = horizontal ? rect.width : rect.height;
    const majorTicks = scale.ticks({
      settings,
      distance,
      formatter
    }).filter(isMajorTick);

    const measure = (text) => {
      const m = measureText({
        text,
        fontSize: settings.labels.fontSize,
        fontFamily: settings.labels.fontFamily
      });
      m.width = getClampedValue({ value: m.width, maxValue, minValue });
      return m;
    };

    if (isDiscrete && horizontal && settings.labels.mode === 'auto') {
      if (shouldAutoTilt({
        majorTicks, measure, rect, state, settings
      })) {
        state.labels.activeMode = 'tilted';
      } else {
        state.labels.activeMode = 'horizontal';
      }
    }

    if (isDiscrete && state.labels.activeMode !== 'tilted' && isToLarge({
      rect, state, majorTicks, measure, horizontal
    })) {
      const toLargeSize = Math.max(rect.width, rect.height); // used to hide the axis
      return { size: toLargeSize, isToLarge: true };
    }

    let sizeFromTextRect;
    if (state.labels.activeMode === 'tilted') {
      const radians = Math.abs(settings.labels.tiltAngle) * (Math.PI / 180); // angle in radians
      sizeFromTextRect = r => (getClampedValue({ value: r.width, maxValue, minValue }) * Math.sin(radians)) + (r.height * Math.cos(radians));
    } else if (horizontal) {
      sizeFromTextRect = r => r.height;
    } else {
      sizeFromTextRect = r => getClampedValue({ value: r.width, maxValue, minValue });
    }

    let labels;
    if (horizontal && state.labels.activeMode !== 'tilted') {
      labels = ['M'];
    } else if (!isNaN(settings.labels.maxGlyphCount)) {
      let label = '';
      for (let i = 0; i < settings.labels.maxGlyphCount; i++) {
        label += 'M';
      }
      labels = [label];
    } else {
      labels = majorTicks.map(tick => tick.label);
    }
    const tickMeasures = labels.map(measure);
    const labelSizes = tickMeasures.map(sizeFromTextRect);
    const textSize = Math.max(...labelSizes, 0);
    size += textSize;
    size += settings.labels.margin;

    if (state.labels.activeMode === 'layered') {
      size *= 2;
    }

    if (state.labels.activeMode === 'tilted') {
      const extendLeft = (settings.align === 'bottom') === (settings.labels.tiltAngle >= 0);
      const radians = Math.abs(settings.labels.tiltAngle) * (Math.PI / 180); // angle in radians
      const h = measureText('M').height;
      const maxWidth = (textSize - (h * Math.cos(radians))) / Math.sin(radians);
      const labelWidth = r => (Math.min(maxWidth, r.width) * Math.cos(radians)) + r.height;
      const adjustByPosition = (s, i) => {
        const pos = majorTicks[i] ? majorTicks[i].position : 0;
        if (extendLeft) {
          return s - (pos * rect.width);
        }
        return s - ((1 - pos) * rect.width);
      };
      const bleedSize = Math.min(settings.labels.maxEdgeBleed, Math.max(...tickMeasures.map(labelWidth).map(adjustByPosition), 0)) + settings.paddingEnd;
      const bleedDir = extendLeft ? 'left' : 'right';
      edgeBleed[bleedDir] = bleedSize;

      if (isDiscrete && isTiltedLabelOverlapping({
        majorTicks, measureText, rect, bleedSize, angle: settings.labels.tiltAngle
      })) {
        return { size: Math.max(rect.width, rect.height), isToLarge: true };
      }
    }
  }

  return { size, edgeBleed };
}
