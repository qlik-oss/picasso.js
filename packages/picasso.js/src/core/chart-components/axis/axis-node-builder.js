import buildLine from './axis-line-node';
import buildLabel from './axis-label-node';
import buildTick from './axis-tick-node';
import NarrowPhaseCollision from '../../math/narrow-phase-collision';
import { getClampedValue } from './axis-label-size';

function tickSpacing(settings) {
  let spacing = 0;
  spacing += settings.paddingStart;
  spacing += settings.line.show ? settings.line.strokeWidth : 0;
  spacing += settings.ticks.show ? settings.ticks.margin : 0;
  return spacing;
}

function tickMinorSpacing(settings) {
  return settings.line.strokeWidth + settings.minorTicks.margin;
}

function labelsSpacing(settings) {
  let spacing = 0;
  spacing += settings.ticks.show ? settings.ticks.tickSize : 0;
  spacing += tickSpacing(settings) + settings.labels.margin;
  return spacing;
}

function calcActualTextRect({ style, measureText, tick }) {
  return measureText({
    text: tick.label,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily
  });
}

function majorTicks(ticks) {
  return ticks.filter(t => !t.isMinor);
}

function minorTicks(ticks) {
  return ticks.filter(t => t.isMinor);
}

function tickBuilder(ticks, buildOpts) {
  return ticks.map(tick => buildTick(tick, buildOpts));
}

function tickBandwidth(scale, tick) {
  return tick ? Math.abs(tick.end - tick.start) : scale.bandwidth();
}

function labelBuilder(ticks, buildOpts, tickFn) {
  return ticks.map((tick) => {
    tickFn(tick);
    const label = buildLabel(tick, buildOpts);
    label.data = tick.data;
    return label;
  });
}

function layeredLabelBuilder(ticks, buildOpts, settings, tickFn) {
  const padding = buildOpts.padding;
  const spacing = labelsSpacing(settings);
  return ticks.map((tick, i) => {
    tickFn(tick);
    const padding2 = spacing + buildOpts.maxHeight + settings.labels.margin;
    buildOpts.layer = i % 2;
    buildOpts.padding = i % 2 === 0 ? padding : padding2;
    const label = buildLabel(tick, buildOpts);
    label.data = tick.data;
    return label;
  });
}

export function filterOverlappingLabels(labels, ticks) {
  const isOverlapping = (l1, l2) => { // eslint-disable-line arrow-body-style
    const rect1 = l1.boundingRect;
    const rect2 = l2.boundingRect;

    return NarrowPhaseCollision.testRectRect(rect1, rect2);
  };

  for (let i = 0; i <= labels.length - 1; i++) {
    for (let k = i + 1; k <= Math.min(i + 5, i + (labels.length - 1)); k++) { // TODO Find a better way to handle exteme/layered labels then to iterare over ~5 next labels
      if (labels[i] && labels[k] && isOverlapping(labels[i], labels[k])) {
        if (k === labels.length - 1) { // On collition with last label, remove current label instead
          labels.splice(i, 1);
          if (ticks) { ticks.splice(i, 1); }
        } else {
          labels.splice(k, 1);
          if (ticks) { ticks.splice(k, 1); }
        }
        k--;
        i--;
      }
    }
  }
}

function discreteCalcMaxTextRect({ measureText, settings, innerRect, scale, tilted, layered, tick }) {
  const h = measureText({
    text: 'M',
    fontSize: settings.labels.fontSize,
    fontFamily: settings.labels.fontFamily
  }).height;

  const bandwidth = tickBandwidth(scale, tick);

  const textRect = { width: 0, height: h };
  if (settings.align === 'left' || settings.align === 'right') {
    textRect.width = innerRect.width - labelsSpacing(settings) - settings.paddingEnd;
  } else if (layered) {
    textRect.width = (bandwidth * innerRect.width) * 2;
  } else if (tilted) {
    const radians = Math.abs(settings.labels.tiltAngle) * (Math.PI / 180);
    textRect.width = (innerRect.height - labelsSpacing(settings) - settings.paddingEnd - (h * Math.cos(radians))) / Math.sin(radians);
  } else {
    textRect.width = bandwidth * innerRect.width;
  }

  textRect.width = getClampedValue({ value: textRect.width, maxValue: settings.labels.maxLengthPx, minValue: settings.labels.minLengthPx });

  return textRect;
}

function continuousCalcMaxTextRect({ measureText, settings, innerRect, ticks, tilted, layered }) {
  const h = measureText({
    text: 'M',
    fontSize: settings.labels.fontSize,
    fontFamily: settings.labels.fontFamily
  }).height;

  const textRect = { width: 0, height: h };
  if (settings.align === 'left' || settings.align === 'right') {
    textRect.width = innerRect.width - labelsSpacing(settings) - settings.paddingEnd;
  } else if (layered) {
    textRect.width = (innerRect.width / majorTicks(ticks).length) * 0.75 * 2;
  } else if (tilted) {
    const radians = Math.abs(settings.labels.tiltAngle) * (Math.PI / 180);
    textRect.width = (innerRect.height - labelsSpacing(settings) - settings.paddingEnd - (h * Math.cos(radians))) / Math.sin(radians);
  } else {
    textRect.width = (innerRect.width / majorTicks(ticks).length) * 0.75;
  }

  textRect.width = getClampedValue({ value: textRect.width, maxValue: settings.labels.maxLengthPx, minValue: settings.labels.minLengthPx });

  return textRect;
}

function getStepSizeFn({ innerRect, scale, settings, tick }) {
  const size = settings.align === 'top' || settings.align === 'bottom' ? innerRect.width : innerRect.height;
  const bandwidth = tickBandwidth(scale, tick);
  return size * bandwidth;
}

export default function nodeBuilder(isDiscrete) {
  let calcMaxTextRectFn;
  let filterLabels = false;

  function continuous() {
    calcMaxTextRectFn = continuousCalcMaxTextRect;
    filterLabels = true;
    return continuous;
  }

  function discrete() {
    calcMaxTextRectFn = discreteCalcMaxTextRect;
    return discrete;
  }

  function build({ settings, scale, innerRect, outerRect, measureText, ticks, state, textBounds }) {
    const nodes = [];
    const major = majorTicks(ticks);
    const minor = minorTicks(ticks);
    const buildOpts = {
      innerRect,
      align: settings.align,
      outerRect
    };
    const tilted = state.labels.activeMode === 'tilted';
    const layered = state.labels.activeMode === 'layered';
    let majorTickNodes;

    if (settings.line.show) {
      buildOpts.style = settings.line;
      buildOpts.padding = settings.paddingStart;

      nodes.push(buildLine(buildOpts));
    }
    if (settings.ticks.show) {
      buildOpts.style = settings.ticks;
      buildOpts.tickSize = settings.ticks.tickSize;
      buildOpts.padding = tickSpacing(settings);

      majorTickNodes = tickBuilder(major, buildOpts);
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
      const tickFn = (tick) => {
        const maxSize = calcMaxTextRectFn({ measureText, settings, innerRect, ticks, scale, tilted, layered, tick });
        buildOpts.maxWidth = maxSize.width;
        buildOpts.maxHeight = maxSize.height;
        buildOpts.textRect = calcActualTextRect({ tick, measureText, style: buildOpts.style });
        buildOpts.stepSize = getStepSizeFn({ innerRect, scale, ticks, settings, tick });
      };

      let labelNodes = [];
      if (layered && (settings.align === 'top' || settings.align === 'bottom')) {
        labelNodes = layeredLabelBuilder(major, buildOpts, settings, tickFn);
      } else {
        labelNodes = labelBuilder(major, buildOpts, tickFn);
      }

      // Remove labels (and paired tick) that are overlapping
      if (filterLabels && !buildOpts.tilted) {
        filterOverlappingLabels(labelNodes, majorTickNodes);
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
