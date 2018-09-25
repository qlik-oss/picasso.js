import extend from 'extend';
import {
  testRectRect,
  testRectLine
} from '../../math/narrow-phase-collision';

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
      opacity: 0.5
    }
  };
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
export function createLineWithLabel({
  chart, blueprint, renderer, p, settings, items
}) {
  let doesNotCollide = true;
  let line = false;
  let rect = false;
  let label = false;
  let value = false;
  let style = extend(true, {}, settings.style.line, p.line || {});

  // Use the transposer to handle actual positioning
  line = blueprint.processItem({
    type: 'line',
    x1: p.position,
    y1: 0,
    x2: p.position,
    y2: 1,
    stroke: style.stroke || 'black',
    strokeWidth: style.strokeWidth || 1,
    flipXY: p.flipXY || false // This flips individual points (Y-lines)
  });

  if (p.label) {
    const item = extend(true, refLabelDefaultSettings(), settings.style.label || {}, { fill: style.stroke }, p.label);
    let formatter;
    let measuredValue = {
      width: 0,
      height: 0
    };
    let valueString = '';

    if (typeof p.formatter === 'string') {
      formatter = chart.formatter(p.formatter);
    } else if (typeof p.formatter === 'object') {
      formatter = chart.formatter(p.formatter);
    } else if (typeof p.scale !== 'undefined' && p.scale.data) {
      // TODO - Add support for array as source into formatter
      const scaleData = p.scale.data() && p.scale.data().fields;
      formatter = scaleData && scaleData[0] ? scaleData[0].formatter() : null;
    }

    if (formatter) {
      valueString = ` (${formatter(p.value)})`;
    } else if (p.scale) {
      valueString = ` (${p.value})`;
    }

    if (valueString) {
      measuredValue = renderer.measureText({
        text: valueString,
        fontFamily: item.fontFamily,
        fontSize: item.fontSize
      });
    }

    // Measure the label text
    let measuredLabel = renderer.measureText({
      text: item.text || '',
      fontFamily: item.fontFamily,
      fontSize: item.fontSize
    });

    let measured = {
      width: measuredLabel.width + measuredValue.width,
      height: Math.max(measuredLabel.height, measuredValue.height)
    };

    let labelPadding = item.padding;

    // let anchor = item.anchor === 'end' ? 'end' : 'start';

    let align = alignmentToNumber(p.flipXY ? item.vAlign : item.align);
    let vAlign = alignmentToNumber(p.flipXY ? item.align : item.vAlign);

    let calcWidth = Math.min(1 + measured.width + (labelPadding * 2), item.maxWidth * blueprint.width, item.maxWidthPx);
    let calcHeight = measured.height + (labelPadding * 2);

    let rectWidth = (p.flipXY ? calcHeight : calcWidth);
    let rectHeight = (p.flipXY ? calcWidth : calcHeight);

    rect = blueprint.processItem({
      fn: ({ width, height }) => {
        let x = (p.position * width) - ((p.flipXY ? calcHeight : calcWidth) * (1 - align));
        x = p.flipXY ? x : Math.max(x, 0);
        const y = Math.max(Math.abs((vAlign * height) - (rectHeight * vAlign)), 0);
        return {
          type: 'rect',
          x,
          y,
          width: p.flipXY ? rectWidth : Math.min(rectWidth, blueprint.width - x),
          height: rectHeight,
          stroke: item.background.stroke,
          strokeWidth: item.background.strokeWidth,
          fill: item.background.fill,
          opacity: item.background.opacity
        };
      },
      flipXY: p.flipXY || false // This flips individual points (Y-lines)
    });

    if (
      rect.x < -1 || (rect.x + rect.width) > (blueprint.width + 1)
      || rect.y < -1 || (rect.y + rect.height) > (blueprint.height + 1)
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
        y: rect.y + (rect.height / 2) + (measured.height / 3),
        maxWidth: rect.width - (labelPadding * 2) - measuredValue.width,
        anchor: 'start'
      };

      if (valueString) {
        value = {
          type: 'text',
          text: valueString || '',
          fill: item.fill,
          opacity: item.opacity,
          fontFamily: item.fontFamily,
          fontSize: item.fontSize,
          x: label.x + 3 + (rect.width - (measuredValue.width + (labelPadding * 2))),
          y: label.y
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
  items.push(line);

  // Only push rect & label if we haven't collided and both are defined
  if (doesNotCollide && rect && label) {
    items.push(rect, label);
    if (value) {
      items.push(value);
    }
  }
}
