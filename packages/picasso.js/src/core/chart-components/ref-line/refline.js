import extend from 'extend';
import { transposer } from '../../transposer/transposer';
import { oobManager } from './oob';
import { createLineWithLabel } from './lines-and-labels';

function createOobData(line) {
  const data = {
    value: line.value,
  };

  if (line.label) {
    data.label = line.label.text;
  }

  return data;
}

function filterUndefinedValue(line) {
  const value = typeof line.value === 'function' ? line.value() : line.value;
  return typeof value !== 'undefined';
}

function isInvert(scale) {
  const range = scale.range();
  return range?.length === 2 && range[0] > range[1];
}

function getPosition(scale, value) {
  const min = scale.min();
  const max = scale.max();
  if (min === max) {
    const invert = isInvert(scale);
    if (value < min) {
      return invert ? 2 : -1;
    }
    if (value > min) {
      return invert ? -1 : 2;
    }
  }
  return scale(value);
}

/**
 * Component settings
 * @typedef {object} ComponentRefLine.settings
 * @property {object} lines - X & Y Lines
 * @property {ComponentRefLine~Line[]} [lines.x=[]] - Reference lines along X axis
 * @property {ComponentRefLine~Line[]} [lines.y=[]] - Reference lines along Y axis
 */

/**
 * @private
 * @typedef {object} ComponentRefLine.style
 * @property {refline-oob-style} [oob=ComponentRefLine.style.oob] - Style for out of bounds object (oob)
 * @property {ComponentRefLine~Line} [line=ComponentRefLine~Line] - Generic style for lines
 * @property {ComponentRefLine~LineLabel} [label=ComponentRefLine~LineLabel] - Generic style for labels
 */

/**
 * @typedef {object} ComponentRefLine.style.oob
 * @property {boolean} [show=true] - Show out of bounds items
 * @property {string} [type=undefined] - EXPERIMENTAL:  Set this to 'arc' for an experimental out of bounds shape (only works with SVG)
 * @property {number} [width=10] - Width of the out of bounds object
 * @property {string} [fill='#1A1A1A'] - Fill color of the OOB object
 * @property {string} [stroke='transparent'] - Stroke of the OOB object
 * @property {number} [strokeWidth=0] - Stroke width of the OOB object
 * @property {number} [opacity=1] - Opacity of the OOB object
 * @property {ComponentRefLine~GenericText} [text=ComponentRefLine~GenericText] - Text configuration for out of bounds
 * @property {ComponentRefLine~GenericObject} [triangle=ComponentRefLine~GenericObject] - The triangle in OOB
 * @property {object} [padding] - Padding on X
 * @property {number} [padding.x=28] - Padding on X
 * @property {number} [padding.y=5] - Padding on X
 */

/**
 * @typedef {object} ComponentRefLine~GenericText
 * @property {string} [text=''] - Text (if applicable)
 * @property {string} [fontSize='12px'] - Font size (if applicable)
 * @property {string} [fontFamily='Arial'] - Font family
 * @property {string} [fill='#fff'] - Fill color
 * @property {string} [stroke='transparent'] - Stroke
 * @property {number} [strokeWidth=0] - Stroke width
 * @property {string} [strokeDasharray] - Stroke dash array
 * @property {number} [opacity=1] - Opacity
 */

/**
 * @typedef {object} ComponentRefLine~Line
 * @property {number|function} value - The value of the reference line. If a scale is specified, it is applied.
 * @property {string} [scale] - Scale to use (if undefined will use normalized value 0-1)
 * @property {ComponentRefLine~GenericObject} [line=ComponentRefLine~GenericObject] - The style of the line
 * @property {ComponentRefLine~LineLabel} [label=ComponentRefLine~LineLabel] - The label style of the line
 * @property {ComponentRefLine~Slope} [slope=ComponentRefLine~Slope] - The slope for the reference line
 */

/**
 * @typedef {object} ComponentRefLine~LineLabel
 * @property {number} padding=5 - Padding inside the label
 * @property {string} [text=''] - Text
 * @property {string} [fontSize='12px'] - Font size
 * @property {string} [fontFamily='Arial'] - Font family
 * @property {string} [stroke='transparent'] - Stroke
 * @property {number} [strokeWidth=0] - Stroke width
 * @property {number} [opacity=1] - Opacity
 * @property {number|string} [align=0] - Alignment property left to right (0 = left, 1 = right). Also supports string ('left', 'center', 'middle', 'right')
 * @property {number|string} [vAlign=0] - Alignment property top to bottom (0 = top, 1 = bottom). Also supports string ('top', 'center', 'middle', 'bottom')
 * @property {number} [maxWidth=1] - The maximum relative width to the width of the rendering area (see maxWidthPx as well)
 * @property {number} [maxWidthPx=9999] - The maximum width in pixels. Labels will be rendered with the maximum size of the smallest value of maxWidth and maxWidthPx size, so you may specify maxWidth 0.8 but maxWidthPx 100 and will never be over 100px and never over 80% of the renderable area
 * @property {ComponentRefLine~LineLabelBackground} [background=ComponentRefLine~LineLabelBackground] - The background style (rect behind text)
 * @property {boolean} [showValue=true] - Show value label
 */

/**
 * @typedef {object} ComponentRefLine~LineLabelBackground
 * @property {string} [fill='#fff'] - Fill color
 * @property {string} [stroke='transparent'] - Stroke
 * @property {number} [strokeWidth=0] - Stroke width
 * @property {number} [opacity=0.5] - Opacity
 */

/**
 * @typedef {object} ComponentRefLine~GenericObject
 * @property {string} [fill='#fff'] - Fill color
 * @property {string} [stroke='transparent'] - Stroke
 * @property {number} [strokeWidth=0] - Stroke width
 * @property {number} [opacity=1] - Opacity
 */

/**
 * @typedef {object} ComponentRefLine~Slope
 * @property {number} [value=1] - Slope value
 */

const refLineComponent = {
  require: ['chart', 'renderer'],
  defaultSettings: {
    layout: {
      displayOrder: 0,
    },
    style: {
      oob: {
        show: true,
        width: 10,
        fill: '#1A1A1A',
        stroke: 'transparent',
        strokeWidth: 0,
        opacity: 1,
        text: {
          fontFamily: 'Arial',
          stroke: 'transparent',
          fill: '#fff',
          strokeWidth: 0,
          opacity: 1,
        },
        triangle: {
          fill: '#4D4D4D',
          stroke: 'transparent',
          strokeWidth: 0,
          opacity: 1,
        },
        padding: {
          x: 28,
          y: 5,
        },
      },
      line: {
        stroke: '#000',
      },
      label: {
        strokeWidth: 0,
      },
    },
  },

  preferredSize() {
    return 30;
  },

  beforeRender() {
    this.blueprint = transposer();

    this.blueprint.width = this.rect.width;
    this.blueprint.height = this.rect.height;
    this.blueprint.x = this.rect.x;
    this.blueprint.y = this.rect.y;
    this.blueprint.crisp = true;
  },

  render() {
    let settings = this.settings;
    let slopeLine;

    // Setup lines for X and Y
    this.lines = {
      x: [],
      y: [],
    };

    this.lines.x = (settings.lines && settings.lines.x) || [];
    this.lines.y = (settings.lines && settings.lines.y) || [];

    if (this.lines.x.length === 0 && this.lines.y.length === 0) {
      return [];
    }

    const oob = {
      x0: [],
      x1: [],
      y0: [],
      y1: [],
    };

    // Convert a value to an actual position using the scale
    this.lines.x = this.lines.x.filter(filterUndefinedValue).map((line) => {
      if (typeof line.value === 'function') {
        line.value = line.value();
      }

      if (line.scale) {
        let scale = this.chart.scale(line.scale);
        const position = getPosition(scale, line.value);
        return extend(line, { scale, position });
      }

      return extend(line, { position: line.value });
    });
    // Set all Y lines to flipXY by default
    // This makes the transposer flip them individually
    this.lines.y = this.lines.y.filter(filterUndefinedValue).map((line) => {
      if (typeof line.value === 'function') {
        line.value = line.value();
      }

      if (line.scale) {
        let scale = this.chart.scale(line.scale);
        const position = getPosition(scale, line.value);
        return extend(line, { scale, position, flipXY: true });
      }

      return extend(line, { position: line.value, flipXY: true });
    });

    // Move out of bounds lines (OOB) to separate rendering
    this.lines.x = this.lines.x.filter((line) => {
      if (line.position < 0 || line.position > 1) {
        oob[`x${line.position > 1 ? 1 : 0}`].push(createOobData(line));
        return false;
      }
      return true;
    });

    this.lines.y = this.lines.y.filter((line) => {
      if (line.slope && line.slope.value !== 0) {
        return true;
      }
      if (line.position < 0 || line.position > 1) {
        oob[`y${line.position > 1 ? 1 : 0}`].push(createOobData(line));
        return false;
      }
      return true;
    });

    let items = [];

    // Loop through all X and Y lines
    [...this.lines.x, ...this.lines.y].forEach((p) => {
      let show = p.show === true || typeof p.show === 'undefined';

      if (show) {
        // Create slope line with labels
        if (p.slope && p.slope.value !== 0) {
          const scaleX = this.chart.scale('x');
          const scaleY = this.chart.scale('y');
          const minX = scaleX.min();
          const maxX = scaleX.max();
          slopeLine = { ...p };
          slopeLine.x1 = getPosition(scaleX, minX);
          slopeLine.x2 = getPosition(scaleX, maxX);
          const y1 = minX * p.slope.value + p.value;
          const y2 = maxX * p.slope.value + p.value;
          slopeLine.y1 = getPosition(scaleY, y1);
          slopeLine.y2 = getPosition(scaleY, y2);
          if (slopeLine.y1 > 1 && slopeLine.y2 > 1) {
            if (p.slope.value > 0) {
              oob[`y${slopeLine.y1 > 1 ? 1 : 0}`].push(createOobData(p));
            } else {
              oob[`y${slopeLine.y1 > 1 ? 1 : 0}`].push(createOobData(p));
            }
            return;
          }
          if (slopeLine.y1 < 0) {
            oob[`y${slopeLine.y1 > 1 ? 1 : 0}`].push(createOobData(p));
            return;
          }
        } else {
          slopeLine = undefined;
        }
        // Create line with labels
        createLineWithLabel({
          chart: this.chart,
          blueprint: this.blueprint,
          renderer: this.renderer,
          p,
          settings,
          items,
          slopeLine,
        });
      }
    });

    // Handle out of bounds
    if (settings.style.oob.show) {
      oobManager({
        blueprint: this.blueprint,
        oob,
        settings,
        items,
      });
    }

    return items;
  },
};

export default refLineComponent;
