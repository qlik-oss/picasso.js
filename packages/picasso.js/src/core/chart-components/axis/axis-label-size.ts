/** An axis tick with position, label and bandwidth info */
interface AxisTick {
  isMinor?: boolean;
  position: number;
  start?: number;
  end?: number;
  label?: string;
  data?: unknown;
}

interface MeasureTextResult {
  width: number;
  height: number;
}

interface MeasureTextFn {
  (text: string): MeasureTextResult;
}

interface AxisLabelSize {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width?: number;
  height?: number;
}

interface InnerOuterRect {
  outer: { width: number; height: number };
  inner: { width: number; height: number };
}

interface EdgeBleed {
  bool: boolean;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface AxisRect {
  inner: { width: number; height: number };
  outer: { width: number; height: number };
  scaleRatio: { x: number; y: number };
  computedPhysical: { x: number; y: number; width: number; height: number };
  edgeBleed: EdgeBleed;
}

interface AxisState {
  labels: {
    activeMode: string;
  };
}

interface AxisSettings {
  align: string;
  labels: {
    show: boolean;
    fontSize: string;
    fontFamily: string;
    maxGlyphCount: number;
    tiltThreshold?: number;
    tiltAngle: number;
    margin: number;
    maxEdgeBleed: number;
    filterOverlapping: boolean;
    mode: string;
    maxLengthPx: number;
    minLengthPx: number;
  };
  paddingEnd: number;
}

interface GetSizeParams {
  isDiscrete: boolean;
  rect: AxisRect;
  formatter: (value: unknown) => string;
  measureText: (opts: Record<string, unknown>) => MeasureTextResult;
  scale: { ticks: (opts: Record<string, unknown>) => AxisTick[] };
  settings: AxisSettings;
  state: AxisState;
}

function isMajorTick(tick: AxisTick): boolean {
  return !tick.isMinor && tick.position >= 0 && tick.position <= 1;
}

function isVerticalLabelOverlapping({
  majorTicks,
  measureText,
  rect,
}: {
  majorTicks: AxisTick[];
  measureText: MeasureTextFn;
  rect: { height: number };
  state?: AxisState;
}): boolean {
  const size = rect.height;
  const textHeight = measureText('M').height;
  if (majorTicks.length < 2) {
    return false;
  }

  const d =
    size *
    Math.abs(majorTicks[0].position - majorTicks[1].position);
  if (d < textHeight) {
    return true;
  }

  return false;
}

function isHorizontalLabelOverlapping({ majorTicks, measureText, rect, state }: { majorTicks: AxisTick[]; measureText: MeasureTextFn; rect: { width: number }; state: AxisState }): boolean {
  /*
   * Currently isn't any good way of doing a accurate measurement on size available (bandWidth * width) for labels.
   * It's a lifecycle limitation as components docked either left or right can affect the width available after the calculation is done.
   * <number of components docked left/right> * <width of components> => Less accurate ===> Can result in only ellips char rendered as labels.
   */
  const m = state.labels.activeMode === 'layered' ? 2 : 1;
  const size = rect.width;
  const tickSize = majorTicks
    .map((tick: AxisTick) => tick.label)
    .map((l: string | undefined) => `${(l || '').slice(0, 1)}${(l || '').length > 1 ? '…' : ''}`) // Measure the size of 1 chars + the ellips char.
    .map((label: string) => measureText(label))
    .map((r: MeasureTextResult) => r.width);
  for (let i = 0; i < majorTicks.length; ++i) {
    const tick = majorTicks[i];
    const d1 = m * size * Math.abs((tick.start || 0) - (tick.end || 0));
    const d2 = tickSize[i];
    if (d1 < d2) {
      return true;
    }
  }
  return false;
}

function shouldAutoTilt({ majorTicks, measure, rect, state, settings }: { majorTicks: AxisTick[]; measure: MeasureTextFn; rect: { width: number }; state: AxisState; settings: AxisSettings }): boolean {
  const glyphCount = settings.labels.maxGlyphCount;
  const m = state.labels.activeMode === 'layered' ? 2 : 1;
  const magicSizeRatioMultipler = settings.labels.tiltThreshold ? settings.labels.tiltThreshold : 0.7; // So that if less the 70% of labels are visible, toggle on tilt or use variable tiltThreshold
  const ellipsCharSize = measure('…').width; // include ellipsed char in calc as it's generally large then the char it replaces
  const size = rect.width;
  let maxLabelWidth = 0;
  let d1 = 0;

  if (!isNaN(glyphCount)) {
    const minBandwidth = majorTicks.reduce((prev: number, curr: AxisTick) => Math.min(Math.abs((curr.start || 0) - (curr.end || 0)), prev), Infinity);
    d1 = m * size * minBandwidth;
    maxLabelWidth = measure('M').width * magicSizeRatioMultipler * glyphCount;
    if (maxLabelWidth + ellipsCharSize > d1) {
      return true;
    }
  } else {
    for (let i = 0; i < majorTicks.length; i++) {
      const tick = majorTicks[i];
      const label = tick.label || '';
      const width = measure(label).width * (label.length > 1 ? magicSizeRatioMultipler : 1);
      d1 = m * size * Math.abs((tick.start || 0) - (tick.end || 0));
      if (width + ellipsCharSize > d1) {
        return true;
      }
    }
  }

  return false;
}

function isTiltedLabelOverlapping({ majorTicks, measureText, rect, bleedSize, angle }: { majorTicks: AxisTick[]; measureText: MeasureTextFn; rect: AxisRect; bleedSize: number; angle: number }): boolean {
  if (majorTicks.length < 2) {
    return false;
  }
  if (angle === 0) {
    return true; // TODO 0 angle should be considered non-tilted
  }
  const absAngle = Math.abs(angle);
  const size = Math.min(rect.outer.width - bleedSize, rect.inner.width);
  const stepSize = size * Math.abs(majorTicks[0].position - majorTicks[1].position);
  const textHeight = measureText('M').height;
  const reciprocal = 1 / stepSize; // 1 === Math.sin(90 * (Math.PI / 180))
  const distanceBetweenLabels = Math.sin(absAngle * (Math.PI / 180)) / reciprocal;

  return textHeight > distanceBetweenLabels;
}

function isToLarge({ rect, state, majorTicks, measure, horizontal }: { rect: { width: number; height: number }; state: AxisState; majorTicks: AxisTick[]; measure: MeasureTextFn; horizontal: boolean }): boolean {
  if (horizontal) {
    return isHorizontalLabelOverlapping({
      majorTicks,
      measureText: measure,
      rect,
      state,
    });
  }

  return isVerticalLabelOverlapping({
    majorTicks,
    measureText: measure,
    rect,
    state,
  });
}

export function getClampedValue({
  value,
  maxValue,
  minValue,
  range,
  modifier,
}: {
  value: number;
  maxValue: number;
  minValue: number;
  range?: number;
  modifier?: number;
}): number {
  if (!isNaN(range!) && !isNaN(modifier!)) {
    value = range! * modifier!;
  }

  if (value > maxValue) {
    value = maxValue;
  }

  if (value < minValue) {
    value = minValue;
  }

  return value;
}

export default function getSize({ isDiscrete, rect, formatter, measureText, scale, settings, state }: GetSizeParams): { size: number; edgeBleed: Record<string, number>; isToLarge?: boolean } {
  let size = 0;
  const edgeBleed: Record<string, number> = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };
  const { maxLengthPx: maxValue, minLengthPx: minValue } = settings.labels;

  if (settings.labels.show) {
    const align = settings.align;
    const horizontal = align === 'top' || align === 'bottom';
    const distance = horizontal ? rect.inner.width : rect.inner.height;
    const majorTicks = scale
      .ticks({
        settings,
        distance,
        formatter,
      })
      .filter(isMajorTick);

    const measure = (text: string): MeasureTextResult => {
      const m = measureText({
        text,
        fontSize: settings.labels.fontSize,
        fontFamily: settings.labels.fontFamily,
      });
      const clampedWidth = getClampedValue({ value: m.width, maxValue, minValue });
      return { ...m, width: clampedWidth } as MeasureTextResult;
    };

    if (isDiscrete && horizontal && settings.labels.mode === 'auto') {
      if (
        shouldAutoTilt({
          majorTicks,
          measure,
          rect: rect.inner,
          state,
          settings,
        })
      ) {
        state.labels.activeMode = 'tilted';
      } else {
        state.labels.activeMode = 'horizontal';
      }
    }

    if (
      !settings.labels.filterOverlapping &&
      state.labels.activeMode !== 'tilted' &&
      isToLarge({
        rect: rect.inner,
        state,
        majorTicks,
        measure,
        horizontal,
      })
    ) {
      const toLargeSize = Math.max(rect.outer.width, rect.outer.height); // used to hide the axis
      return { size: toLargeSize, edgeBleed, isToLarge: true };
    }

    let sizeFromTextRect: (r: MeasureTextResult) => number;
    if (state.labels.activeMode === 'tilted') {
      const radians = Math.abs(settings.labels.tiltAngle) * (Math.PI / 180); // angle in radians
      sizeFromTextRect = (r: MeasureTextResult) =>
        getClampedValue({ value: r.width, maxValue, minValue }) * Math.sin(radians) + r.height * Math.cos(radians);
    } else if (horizontal) {
      sizeFromTextRect = (r: MeasureTextResult) => r.height;
    } else {
      sizeFromTextRect = (r: MeasureTextResult) => getClampedValue({ value: r.width, maxValue, minValue });
    }

    let labels: string[];
    if (horizontal && state.labels.activeMode !== 'tilted') {
      labels = ['M'];
    } else if (!isNaN(settings.labels.maxGlyphCount)) {
      let label = '';
      for (let i = 0; i < settings.labels.maxGlyphCount; i++) {
        label += 'M';
      }
      labels = [label];
    } else {
      labels = majorTicks.map((tick: AxisTick) => tick.label || '');
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
      const h = measure('M').height;
      const maxWidth = (textSize - h * Math.cos(radians)) / Math.sin(radians);
      const labelWidth = (r: MeasureTextResult): number => Math.min(maxWidth, r.width) * Math.cos(radians) + r.height;
      const adjustByPosition = (s: number, i: number): number => {
        const pos = majorTicks[i] ? majorTicks[i].position : 0;
        if (extendLeft) {
          return s - pos * rect.inner.width;
        }
        return s - (1 - pos) * rect.inner.width;
      };
      const bleedSize =
        Math.min(settings.labels.maxEdgeBleed, Math.max(...tickMeasures.map(labelWidth).map(adjustByPosition), 0)) +
        settings.paddingEnd;
      const bleedDir = extendLeft ? 'left' : 'right';
      edgeBleed[bleedDir] = bleedSize;

      if (
        !settings.labels.filterOverlapping &&
        isTiltedLabelOverlapping({
          majorTicks,
          measureText: measure,
          rect,
          bleedSize,
          angle: settings.labels.tiltAngle,
        })
      ) {
        const toLargeSize = Math.max(rect.outer.width, rect.outer.height); // used to hide the axis
        return { size: toLargeSize, edgeBleed, isToLarge: true };
      }
    }
  }

  return { size, edgeBleed };
}
