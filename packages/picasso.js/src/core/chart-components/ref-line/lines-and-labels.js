import extend from 'extend';
import { testRectRect, testRectLine } from '../../math/narrow-phase-collision';

const DOCK_CORNER = 0.8;

export function refLabelDefaultSettings() {
  return {
    fill: '#000',
    fontFamily: 'Arial',
    fontSize: '12px',
    opacity: 1,
    maxWidth: 1,
    maxWidthPx: 9999,
    padding: 5,
    background: {
      fill: '#fff',
      stroke: 'transparent',
      strokeWidth: 0,
      opacity: 0.5,
    },
  };
}

function isMaxY(chart, slope, value) {
  // when maxY exceeds the shown scale
  const scaleX = chart.scale({ scale: 'x' });
  const scaleY = chart.scale({ scale: 'y' });
  if (slope > 0) {
    const maxY = scaleX.max() * slope + value;
    if (maxY >= scaleY.max()) {
      return true;
    }
  } else if (slope < 0) {
    const minY = scaleX.min() * slope + value;
    if (minY >= scaleY.max()) {
      return true;
    }
  }
  return false;
}

function getMaxXPosition(chart, slope, value) {
  // if maxY then get maxX position available on the scale
  const scaleX = chart.scale({ scale: 'x' });
  const scaleY = chart.scale({ scale: 'y' });
  // For negative slopes
  if (slope < 0) {
    return scaleX((scaleY.max() - value) / slope);
  }
  // For positive slopes
  return scaleX((scaleY.max() - value) / slope);
}

function getFormatter(p, chart) {
  if (typeof p.formatter === 'string') {
    return chart.formatter(p.formatter);
  }
  if (typeof p.formatter === 'object') {
    return chart.formatter(p.formatter);
  }
  if (typeof p.scale !== 'undefined' && p.scale.data) {
    // TODO - Add support for array as source into formatter
    const scaleData = p.scale.data() && p.scale.data().fields;
    return scaleData && scaleData[0] ? scaleData[0].formatter() : null;
  }
  return null;
}

function isColliding(items, slopeValue, measured, xPadding, yPadding) {
  for (let i = 0, len = items.length; i < len; i++) {
    const curItem = items[i];
    if (curItem?.type === 'text') {
      if (
        Math.abs(curItem.x - slopeValue.x) < Math.max(curItem.width + xPadding, slopeValue.width + xPadding) &&
        Math.abs(curItem.y - slopeValue.y) < measured.height + yPadding
      ) {
        return true;
      }
    }
  }
  return false;
}

function calculateX(slopeLine, line, maxX, measured, blueprint, slopeStyle) {
  let neededPadding = 0;
  // calculate x for the various scenarios possible
  if (maxX !== undefined) {
    // docking at top
    if (maxX < DOCK_CORNER) {
      neededPadding = slopeLine.slope < 0 || slopeLine.isRtl ? slopeStyle.padding * 3 : slopeStyle.padding * 2;
      return slopeLine.isRtl ? maxX * blueprint.width + neededPadding : maxX * blueprint.width + neededPadding;
    }
    if (maxX === 1) {
      // dock at the corner of the data area top and right
      return slopeLine.isRtl
        ? maxX * blueprint.width - (measured.width + slopeStyle.padding * 3)
        : maxX * blueprint.width - (measured.width + slopeStyle.padding * 6);
    }
    if (maxX > DOCK_CORNER) {
      // very close to the corner when width doesn't fit
      return slopeLine.isRtl
        ? maxX * blueprint.width - (measured.width + slopeStyle.padding * 3)
        : maxX * blueprint.width - (measured.width + slopeStyle.padding * 6);
    }
  } else if (slopeLine.slope > 0) {
    // dock at right
    return line.x2 - (measured.width + slopeStyle.padding * 2);
  }
  //  Negative slope dock on left
  return slopeLine.isRtl ? line.x1 - (measured.width + slopeStyle.padding * 2) : line.x1;
}

/**
 * Converts a numerical OR string value to a normalized value
 *
 * @param {string|number} align -Description how to align (Numerical from 0-1 or 'top', 'left', 'center', 'middle', 'bottom' or 'right')
 * @returns {number} - Normalized value 0...1
 * @ignore
 */
export function alignmentToNumber(align) {
  if (typeof align === 'undefined') {
    return 0;
  }
  if (typeof align === 'number' && isFinite(align)) {
    return align;
  }
  if (typeof align === 'string') {
    switch (align) {
      case 'center':
      case 'middle':
        return 0.5;
      case 'bottom':
      case 'right':
        return 1;
      case 'top':
      case 'left':
      default:
        return 0;
    }
  }

  return 0;
}

/**
 * Create line and label (if applicable)
 * Does not return anything, modifies "items" property instead (should be re-considered)
 *
 * @param {object} p - Current point
 * @param {object} style - Applicable line styling
 * @param {object} settings - Settings object derived from parent
 * @param {object[]} items - Array of all items (for collision detection)
 * @ignore
 */
export function createLineWithLabel({ chart, blueprint, renderer, p, settings, items, slopeLine }) {
  let doesNotCollide = true;
  let line = false;
  let rect = false;
  let label = false;
  let value = false;
  let style = extend(true, {}, settings.style.line, p.line || {});
  let slopeStyle = extend(true, refLabelDefaultSettings(), settings.style.label || {}, { fill: style.stroke });

  // Use the transposer to handle actual positioning
  if (slopeLine) {
    line = blueprint.processItem({
      type: 'line',
      x1: slopeLine.x1,
      y1: slopeLine.y1,
      x2: slopeLine.x2,
      y2: slopeLine.y2,
      stroke: style.stroke || 'black',
      strokeWidth: style.strokeWidth || 1,
      strokeDasharray: style.strokeDasharray,
      flipXY: false,
      value: p.valueInfo ? p.valueInfo.id : p.value,
    });
  } else {
    line = blueprint.processItem({
      type: 'line',
      x1: p.position,
      y1: 0,
      x2: p.position,
      y2: 1,
      stroke: style.stroke || 'black',
      strokeWidth: style.strokeWidth || 1,
      strokeDasharray: style.strokeDasharray,
      flipXY: p.flipXY || false, // This flips individual points (Y-lines)
      value: p.valueInfo ? p.valueInfo.id : p.value,
    });
  }

  if (p.label) {
    const item = extend(true, refLabelDefaultSettings(), settings.style.label || {}, { fill: style.stroke }, p.label);
    let formatter;
    let measuredValue = {
      width: 0,
      height: 0,
    };
    let valueString = '';

    formatter = getFormatter(p, chart);

    if (p.label.showValue !== false) {
      if (formatter) {
        valueString = ` (${formatter(p.value)})`;
      } else if (p.scale) {
        valueString = ` (${p.value})`;
      }
    }

    if (valueString) {
      measuredValue = renderer.measureText({
        text: valueString,
        fontFamily: item.fontFamily,
        fontSize: item.fontSize,
      });
    }

    // Measure the label text
    let measuredLabel = renderer.measureText({
      text: item.text || '',
      fontFamily: item.fontFamily,
      fontSize: item.fontSize,
    });

    let measured = {
      width: measuredLabel.width + measuredValue.width,
      height: Math.max(measuredLabel.height, measuredValue.height),
    };

    let labelPadding = item.padding;

    // let anchor = item.anchor === 'end' ? 'end' : 'start';

    let align = alignmentToNumber(p.flipXY ? item.vAlign : item.align);
    let vAlign = alignmentToNumber(p.flipXY ? item.align : item.vAlign);

    let calcWidth = Math.min(1 + measured.width + labelPadding * 2, item.maxWidth * blueprint.width, item.maxWidthPx);
    let calcHeight = measured.height + labelPadding * 2;

    let rectWidth = p.flipXY ? calcHeight : calcWidth;
    let rectHeight = p.flipXY ? calcWidth : calcHeight;

    rect = blueprint.processItem({
      fn: ({ width, height }) => {
        let x = p.position * width - (p.flipXY ? calcHeight : calcWidth) * (1 - align);
        x = p.flipXY ? x : Math.max(x, 0);
        const y = Math.max(Math.abs(vAlign * height - rectHeight * vAlign), 0);
        return {
          type: 'rect',
          x,
          y,
          width: p.flipXY ? rectWidth : Math.min(rectWidth, blueprint.width - x),
          height: rectHeight,
          stroke: item.background.stroke,
          strokeWidth: item.background.strokeWidth,
          fill: item.background.fill,
          opacity: item.background.opacity,
        };
      },
      flipXY: p.flipXY || false, // This flips individual points (Y-lines)
    });

    if (
      rect.x < -1 ||
      rect.x + rect.width > blueprint.width + 1 ||
      rect.y < -1 ||
      rect.y + rect.height > blueprint.height + 1
    ) {
      // do not create labels if out of bounds
      rect = undefined;
    } else {
      // Labels are just basic objects attached to a corner of a rect,
      // and this rect needs to already be processed
      // so there is no blueprint.processItem required here
      label = {
        type: 'text',
        text: item.text || '',
        fill: item.fill,
        opacity: item.opacity,
        fontFamily: item.fontFamily,
        fontSize: item.fontSize,
        x: rect.x + labelPadding,
        y: rect.y + rect.height / 2 + measured.height / 3,
        maxWidth: rect.width - labelPadding * 2 - measuredValue.width,
        anchor: 'start',
      };

      if (valueString) {
        value = {
          type: 'text',
          text: valueString || '',
          fill: item.fill,
          opacity: item.opacity,
          fontFamily: item.fontFamily,
          fontSize: item.fontSize,
          x: label.x + 3 + (rect.width - (measuredValue.width + labelPadding * 2)),
          y: label.y,
        };
      }

      // Detect collisions with other labels/rects or lines
      for (let i = 0, len = items.length; i < len; i++) {
        let curItem = items[i];

        if (curItem.type === 'rect') {
          // We only detect rects here, since rects are always behind labels,
          // and we wouldn't want to measure text one more time
          if (testRectRect(rect, curItem)) {
            doesNotCollide = false;
          }
        } else if (curItem.type === 'line') {
          // This will only collide when flipXY are the same for both objects,
          // So it only collides on objects on the same "axis"
          if (p.flipXY === curItem.flipXY && testRectLine(rect, curItem)) {
            doesNotCollide = false;
          }
        }
      }
    }
  }

  // Always push the line,
  // but this is done after collision detection,
  // because otherwise it would collide with it's own line
  // check for slopeline if the points are almost on the blueprints edge
  if (line) {
    items.push(line);
  }

  if (slopeLine?.slope !== 0 && (slopeLine?.showLabel || slopeLine?.showValue)) {
    // create data area labels for slope line
    let valueString;
    let labelBackground;
    const maxLabelWidth = 120;

    let slopeLabelText = slopeLine.showLabel ? slopeLine.refLineLabel : '';
    if (slopeLine.showValue) {
      const formatter = getFormatter(p, chart);
      const formattedValue = formatter ? formatter(slopeLine.value) : slopeLine.value;
      valueString = `(${slopeLine.slope}x + ${formattedValue})`;
      slopeLabelText += slopeLine.refLineLabel ? ` ${valueString}` : valueString;
    }
    if (slopeLabelText.length > 1) {
      // Measure the label text
      const measured = renderer.measureText({
        text: slopeLabelText,
        fontFamily: slopeStyle.fontFamily,
        fontSize: slopeStyle.fontSize,
      });
      measured.width = measured.width > maxLabelWidth ? maxLabelWidth : measured.width;
      const maxX = isMaxY(chart, slopeLine.slope, slopeLine.value)
        ? getMaxXPosition(chart, slopeLine.slope, slopeLine.value)
        : undefined;
      const xPadding = maxX !== undefined && !slopeLine.isRtl ? slopeStyle.padding * 3 : slopeStyle.padding;
      const yPadding = maxX !== undefined || slopeLine.slope > 0 ? slopeStyle.padding * 3 : slopeStyle.padding;
      const x = calculateX(slopeLine, line, maxX, measured, blueprint, slopeStyle);
      const y = Math.min(line.y1, line.y2);
      // if coloredBackground is true make a rect
      if (slopeLine.labelStroke) {
        labelBackground = {
          type: 'rect',
          x: slopeLine.isRtl ? Math.max(x, xPadding) - 2 : Math.max(x, xPadding) + 2,
          y: Math.abs(Math.max(y, yPadding) - measured.height),
          rx: 3,
          ry: 3,
          width: measured.width + slopeStyle.padding,
          height: measured.height - 2,
          stroke: style.stroke,
          fill: style.stroke,
        };
      }
      const slopeLabel = {
        type: 'text',
        text: slopeLabelText,
        fill: slopeLine.labelStroke ?? style.stroke,
        opacity: slopeStyle.opacity,
        fontFamily: slopeStyle.fontFamily,
        fontSize: slopeStyle.fontSize,
        x: labelBackground ? labelBackground.x + 2 : Math.max(x, xPadding) + 2,
        y: labelBackground
          ? labelBackground.y + measured.height - slopeStyle.padding
          : Math.abs(Math.max(y, yPadding) - slopeStyle.padding / 2),
        anchor: 'start',
        title: slopeLabelText,
        maxWidth: maxLabelWidth,
        width: measured.width,
      };
      if (!isColliding(items, slopeLabel, measured, xPadding, yPadding)) {
        if (labelBackground) {
          items.push(labelBackground);
        }
        items.push(slopeLabel);
      }
    }
  }
  // Only push rect & label if we haven't collided and both are defined
  if (doesNotCollide && rect && label) {
    items.push(rect, label);
    if (value) {
      items.push(value);
    }
  }
}
