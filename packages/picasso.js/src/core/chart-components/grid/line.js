import extend from 'extend';
import { transposer } from '../../transposer/transposer';
import { updateScaleSize } from '../../scales';

/**
 * Generate array of lines (ticks) from scale
 *
 * @param {object} scale - A scale supplied by the chart
 * @param {object} settings - The settings object from the grid line component
 * @param {object} rect - The rect containing width and height to renderer in
 * @returns {array} - Returns an array of ticks
 * @ignore
 */
function lineGen(scale, distance) {
  if (!scale || !distance) {
    return [];
  }
  return (scale.cachedTicks && scale.cachedTicks()) || scale.ticks({ distance });
}

const gridLineComponent = {
  created() {
  },

  require: ['chart', 'renderer', 'resolver'],
  defaultSettings: {
    layout: {
      displayOrder: 0
    },
    style: { // Theming style
      ticks: '$guide-line',
      minorTicks: '$guide-line--minor'
    }
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
    // Setup scales
    this.x = this.userSettings.x ? this.chart.scale(this.userSettings.x) : null;
    this.y = this.userSettings.y ? this.chart.scale(this.userSettings.y) : null;
    updateScaleSize(this, 'x', this.rect.width);
    updateScaleSize(this, 'y', this.rect.height);

    // Return an empty array to abort rendering when no scales are available to renderer
    if (!this.x && !this.y) {
      return [];
    }

    this.userSettings.ticks = extend({ show: true }, this.style.ticks, this.userSettings.ticks || {});
    this.userSettings.minorTicks = extend({ show: false }, this.style.minorTicks, this.userSettings.minorTicks || {});

    // Setup lines for X and Y
    this.lines = {
      x: [],
      y: []
    };

    // Use the lineGen function to generate appropriate ticks
    this.lines.x = lineGen(this.x, this.rect.width);
    this.lines.y = lineGen(this.y, this.rect.height);

    // Set all Y lines to flipXY by default
    // This makes the transposer flip them individually
    this.lines.y = this.lines.y.map(i => extend(i, { flipXY: true }));

    let addTicks = ({ dir, isMinor }) => {
      let items = this.lines[dir].filter(tick => !!tick.isMinor === isMinor);
      let settings = isMinor ? this.userSettings.minorTicks : this.userSettings.ticks;
      let ticks = this.resolver.resolve({
        settings,
        data: {
          items,
          dir
        }
      }).items;

      ticks.forEach((style) => {
        let p = style.data;

        // If the style's show is falsy, don't renderer this item (to respect axis settings).
        if (style.show) {
          // Use the transposer to handle actual positioning
          this.blueprint.push({
            type: 'line',
            x1: p.position,
            y1: 0,
            x2: p.position,
            y2: 1,
            stroke: style.stroke || 'black',
            strokeWidth: typeof style.strokeWidth !== 'undefined' ? style.strokeWidth : 1,
            strokeDasharray: typeof style.strokeDasharray !== 'undefined' ? style.strokeDasharray : undefined,
            flipXY: p.flipXY || false // This flips individual points (Y-lines)
          });
        }
      });
    };

    addTicks({ dir: 'x', isMinor: false });
    addTicks({ dir: 'x', isMinor: true });
    addTicks({ dir: 'y', isMinor: false });
    addTicks({ dir: 'y', isMinor: true });

    return this.blueprint.output();
  }
};

export default gridLineComponent;
