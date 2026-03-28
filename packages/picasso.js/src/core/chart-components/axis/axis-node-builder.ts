import buildLine from './axis-line-node';
import buildLabel from './axis-label-node';
import buildTick from './axis-tick-node';
import { testRectRect } from '../../math/narrow-phase-collision';
import { getClampedValue } from './axis-label-size';
import getHorizontalContinuousWidth from './get-continuous-label-rect';
import { expandRect } from '../../geometry/util';
import buildArcLine from './axis-arc-node';
import buildArcTicks from './axis-arc-tick-node';
import buildArcLabels from './axis-arc-label-node';
import type { Rect } from '../../geometry';

/** A scale with a bandwidth() method (discrete/band scale) */
interface BandScale {
  bandwidth(): number;
}

/** An axis tick with optional start/end for band scales */
interface AxisTick {
  isMinor?: boolean;
  position?: number;
  start?: number;
  end?: number;
  label?: string;
  data?: unknown;
}

interface TextMetrics {
  height: number;
  width: number;
}

interface TextStyle {
  fontSize: string;
  fontFamily: string;
}

interface AxisSettings {
  paddingStart: number;
  paddingEnd: number;
  line: { show: boolean; strokeWidth: number };
  ticks: { show: boolean; margin: number; tickSize: number };
  minorTicks: { show: boolean; margin: number; tickSize: number };
  labels: {
    show: boolean;
    margin: number;
    tiltAngle?: number;
    maxLengthPx: number;
    minLengthPx: number;
    filterOverlapping: boolean;
  };
  align?: string;
  arc?: { startAngle: number; endAngle: number; radius: number };
}

function tickSpacing(settings: AxisSettings): number {
  let spacing = 0;
  spacing += settings.paddingStart;
  spacing += settings.line.show ? settings.line.strokeWidth / 2 : 0;
  spacing += settings.ticks.show ? settings.ticks.margin : 0;
  return spacing;
}
function arcTickSpacing(settings: AxisSettings): number {
  let spacing = 0;
  spacing += settings.line.show ? settings.line.strokeWidth / 2 : 0;
  spacing += settings.ticks.show ? settings.ticks.margin : 0;
  return spacing;
}

function tickMinorSpacing(settings: AxisSettings): number {
  return settings.line.strokeWidth + settings.minorTicks.margin;
}

function labelsSpacing(settings: AxisSettings): number {
  let spacing = 0;
  spacing += settings.ticks.show ? settings.ticks.tickSize : 0;
  spacing += tickSpacing(settings) + settings.labels.margin;
  return spacing;
}

function arcLabelSpacing(settings: AxisSettings): number {
  let spacing = 0;
  spacing += settings.ticks.show ? settings.ticks.tickSize : 0;
  spacing += arcTickSpacing(settings) + settings.labels.margin;
  return spacing;
}

function calcActualTextRect({ style, measureText, tick }: { style: TextStyle; measureText: (opts: any) => TextMetrics; tick: AxisTick }): TextMetrics {
  return measureText({
    text: tick.label || '',
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
  });
}

function majorTicks(ticks: AxisTick[]): AxisTick[] {
  return ticks.filter((t) => !t.isMinor);
}

function minorTicks(ticks: AxisTick[]): AxisTick[] {
  return ticks.filter((t) => t.isMinor);
}

function tickBuilder(ticks: AxisTick[], buildOpts: any): any[] {
  return ticks.map((tick) => buildTick(tick, buildOpts));
}

function arcTickBuilder(ticks: AxisTick[], buildOpts: any): any[] {
  return ticks.map((tick) => buildArcTicks(tick, buildOpts));
}

function tickBandwidth(scale: BandScale, tick: AxisTick | null): number {
  return tick ? Math.abs((tick.end ?? 0) - (tick.start ?? 0)) : scale.bandwidth();
}

function labelBuilder(ticks: AxisTick[], buildOpts: any, resolveTickOpts: (tick: AxisTick, idx: number) => void): any[] {
  return ticks.map((tick, idx) => {
    resolveTickOpts(tick, idx);
    const label: Record<string, unknown> = buildLabel(tick, buildOpts);
    label.data = tick.data;
    return label;
  });
}

function arcLabelBuilder(ticks: AxisTick[], buildOpts: any, resolveTickOpts: (tick: AxisTick, idx: number) => void): any[] {
  return ticks.map((tick, idx) => {
    resolveTickOpts(tick, idx);
    const label: Record<string, unknown> = buildArcLabels(tick, buildOpts);
    label.data = tick.data;
    return label;
  });
}

function layeredLabelBuilder(ticks: AxisTick[], buildOpts: any, settings: AxisSettings, resolveTickOpts: (tick: AxisTick, idx: number) => void): any[] {
  const padding = buildOpts.padding;
  const spacing = labelsSpacing(settings);
  return ticks.map((tick, idx) => {
    resolveTickOpts(tick, idx);
    const padding2 = spacing + buildOpts.maxHeight + settings.labels.margin;
    buildOpts.layer = idx % 2;
    buildOpts.padding = idx % 2 === 0 ? padding : padding2;
    const label: Record<string, unknown> = buildLabel(tick, buildOpts);
    label.data = tick.data;
    return label;
  });
}

export function filterOverlappingLabels(labels: any[], ticks: AxisTick[] | undefined, buildOpts: any): void {
  let isOverlapping = (i: number, k: number): boolean => {
    const rect1 = expandRect(1, labels[i].boundingRect);
    const rect2 = expandRect(1, labels[k].boundingRect);

    return testRectRect(rect1, rect2);
  };

  if (buildOpts && buildOpts.tilted) {
    const absAngle = Math.abs(buildOpts.angle);

    isOverlapping = (i, k) => {
      const stepSize = Math.abs(labels[i].x - labels[k].x);
      const reciprocal = 1 / stepSize;
      const distanceBetweenLabels = Math.sin(absAngle * (Math.PI / 180)) / reciprocal;

      return labels[i].boundingRect.height > distanceBetweenLabels;
    };
  }

  for (let i = 0; i <= labels.length - 1; i++) {
    for (let k = i + 1; k <= Math.min(i + 5, i + (labels.length - 1)); k++) {
      // TODO Find a better way to handle exteme/layered labels then to iterare over ~5 next labels
      if (labels[i] && labels[k] && isOverlapping(i, k)) {
        if (k === labels.length - 1) {
          // On collition with last label, remove current label instead
          labels.splice(i, 1);
          if (ticks) {
            ticks.splice(i, 1);
          }
        } else {
          labels.splice(k, 1);
          if (ticks) {
            ticks.splice(k, 1);
          }
        }
        k--;
        i--;
      }
    }
  }
}

function discreteCalcMaxTextRect({
  textMetrics,
  settings,
  innerRect,
  scale,
  tilted,
  layered,
  tick,
}: {
  textMetrics: TextMetrics;
  settings: AxisSettings;
  innerRect: Rect;
  scale: BandScale;
  tilted: boolean;
  layered: boolean;
  tick: AxisTick | null;
}): TextMetrics {
  const h = textMetrics.height;

  const bandwidth = tickBandwidth(scale, tick);

  const textRect = { width: 0, height: h };
  if (settings.align === 'left' || settings.align === 'right') {
    textRect.width = innerRect.width - labelsSpacing(settings) - settings.paddingEnd;
  } else if (layered) {
    textRect.width = bandwidth * innerRect.width * 2;
  } else if (tilted) {
    const radians = Math.abs((settings.labels.tiltAngle ?? 0)) * (Math.PI / 180);
    textRect.width =
      (innerRect.height - labelsSpacing(settings) - settings.paddingEnd - h * Math.cos(radians)) / Math.sin(radians);
  } else {
    textRect.width = bandwidth * innerRect.width;
  }

  textRect.width = getClampedValue({
    value: textRect.width,
    maxValue: settings.labels.maxLengthPx,
    minValue: settings.labels.minLengthPx,
  });

  return textRect;
}

function continuousCalcMaxTextRect({
  textMetrics,
  settings,
  innerRect,
  outerRect,
  tilted,
  layered,
  tick,
  index,
  major,
}: {
  textMetrics: TextMetrics;
  settings: AxisSettings;
  innerRect: Rect;
  outerRect: Rect;
  tilted: boolean;
  layered: boolean;
  tick: AxisTick | null;
  index: number;
  major: boolean;
}): TextMetrics {
  const h = textMetrics.height;

  const textRect = { width: 0, height: h };
  if (settings.align === 'left' || settings.align === 'right') {
    textRect.width = innerRect.width - labelsSpacing(settings) - settings.paddingEnd;
  } else if (tilted) {
    const radians = Math.abs((settings.labels.tiltAngle ?? 0)) * (Math.PI / 180);
    textRect.width =
      (innerRect.height - labelsSpacing(settings) - settings.paddingEnd - h * Math.cos(radians)) / Math.sin(radians);
  } else {
    textRect.width = getHorizontalContinuousWidth({
      layered,
      major,
      innerRect,
      outerRect,
      tick,
      index,
    });
  }

  textRect.width = getClampedValue({
    value: textRect.width,
    maxValue: settings.labels.maxLengthPx,
    minValue: settings.labels.minLengthPx,
  });

  return textRect;
}

function getStepSizeFn({
  innerRect,
  scale,
  settings,
  tick,
  ticks: _ticks,
}: {
  innerRect: { width: number; height: number };
  scale: BandScale;
  settings: { align?: string };
  tick: AxisTick | null;
  ticks?: AxisTick[];
}) {
  const size = settings.align === 'top' || settings.align === 'bottom' ? innerRect.width : innerRect.height;
  const bandwidth = tickBandwidth(scale, tick);
  return size * bandwidth;
}

export default function nodeBuilder(isDiscrete: boolean): any {
  let resolveLabelRect: (opts: any) => TextMetrics;

  function continuous(): any {
    resolveLabelRect = continuousCalcMaxTextRect;
    return continuous;
  }

  function discrete(): any {
    resolveLabelRect = discreteCalcMaxTextRect;
    return discrete;
  }

  function build({
    settings,
    scale,
    innerRect,
    outerRect,
    measureText,
    ticks,
    state,
    textBounds,
  }: {
    settings: AxisSettings;
    scale: BandScale;
    innerRect: Rect;
    outerRect: Rect;
    measureText: (opts: any) => TextMetrics;
    ticks: AxisTick[];
    state: { labels: { activeMode: 'tilted' | 'layered' | 'default' } };
    textBounds?: any;
  }): any[] {
    const nodes = [];
    const major = majorTicks(ticks);
    const minor = minorTicks(ticks);
    const buildOpts: Record<string, unknown> = {
      innerRect,
      align: settings.align,
      outerRect,
    };
    const tilted = state.labels.activeMode === 'tilted';
    const layered = state.labels.activeMode === 'layered';
    let majorTickNodes;
    if (settings.arc) {
      buildOpts.startAngle = settings.arc.startAngle;
      buildOpts.endAngle = settings.arc.endAngle;
      buildOpts.radius = settings.arc.radius;
    }
    if (settings.line.show) {
      buildOpts.style = settings.line;
      buildOpts.padding = settings.paddingStart;
      if (settings.arc) {
        nodes.push(buildArcLine(buildOpts));
      } else {
        nodes.push(buildLine(buildOpts));
      }
    }
    if (settings.ticks.show) {
      buildOpts.style = settings.ticks;
      buildOpts.tickSize = settings.ticks.tickSize;
      buildOpts.padding = tickSpacing(settings);
      if (settings.arc) {
        buildOpts.padding = arcTickSpacing(settings);
        majorTickNodes = arcTickBuilder(major, buildOpts);
      } else {
        majorTickNodes = tickBuilder(major, buildOpts);
      }
    }
    if (settings.labels.show) {
      const padding = labelsSpacing(settings);
      buildOpts.style = settings.labels;
      buildOpts.padding = padding;
      buildOpts.tilted = tilted;
      buildOpts.layered = layered;
      buildOpts.angle = settings.labels.tiltAngle;
      buildOpts.paddingEnd = settings.paddingEnd;
      buildOpts.textBounds = textBounds;
      const resolveTickOpts = (tick: AxisTick, index: number): void => {
        buildOpts.textRect = calcActualTextRect({ tick, measureText, style: buildOpts.style as TextStyle });
        const maxSize = resolveLabelRect({
          textMetrics: buildOpts.textRect,
          settings,
          innerRect,
          outerRect,
          scale,
          tilted,
          layered,
          tick,
          major,
          index,
        });
        buildOpts.maxWidth = maxSize.width;
        buildOpts.maxHeight = maxSize.height;
        buildOpts.stepSize = getStepSizeFn({
          innerRect,
          scale,
          ticks,
          settings,
          tick,
        });
      };
      let labelNodes = [];
      if (settings.arc) {
        buildOpts.padding = arcLabelSpacing(settings);
        labelNodes = arcLabelBuilder(major, buildOpts, resolveTickOpts);
      } else if (layered && (settings.align === 'top' || settings.align === 'bottom')) {
        labelNodes = layeredLabelBuilder(major, buildOpts, settings, resolveTickOpts);
      } else {
        labelNodes = labelBuilder(major, buildOpts, resolveTickOpts);
      }

      // Remove labels (and paired tick) that are overlapping
      if (settings.labels.filterOverlapping) {
        filterOverlappingLabels(labelNodes, majorTickNodes, buildOpts);
      }

      nodes.push(...labelNodes);
    }

    if (settings.minorTicks && settings.minorTicks.show && minor.length > 0) {
      buildOpts.style = settings.minorTicks;
      buildOpts.tickSize = settings.minorTicks.tickSize;
      buildOpts.padding = tickMinorSpacing(settings);
      nodes.push(...tickBuilder(minor, buildOpts));
    }

    if (majorTickNodes) {
      nodes.push(...majorTickNodes);
    }

    return nodes;
  }

  continuous.build = build;
  discrete.build = build;

  return isDiscrete ? discrete() : continuous();
}
