import { scaleWithSize } from '../../scales';

const FILL = '#ccc';
const OPACITY = 1;

function ranges(state) {
  const brush = state.brush;
  if (!brush || !brush.isActive()) {
    return [];
  }

  const sourceData = state.scale.data();
  const sourceFields = sourceData ? sourceData.fields || [] : [];
  const sources = sourceFields.map(field => field.id());
  const rangeBrush = brush.brushes().filter(f => f.type === 'range' && sources.indexOf(f.id) !== -1)[0];

  if (!rangeBrush) {
    return [];
  }

  return rangeBrush.brush.ranges();
}

function shapes(state) {
  const isVertical = state.direction === 'vertical';
  const size = state.rect[isVertical ? 'height' : 'width'];
  const otherSize = state.rect[isVertical ? 'width' : 'height'];
  return ranges(state).map((range) => {
    const start = state.scale(range.min) * size;
    const end = state.scale(range.max) * size;
    const low = Math.min(start, end);
    const s = Math.abs(start - end);
    return {
      type: 'rect',
      fill: state.fill,
      opacity: state.opacity,
      x: isVertical ? 0 : low,
      width: isVertical ? otherSize : s,
      y: isVertical ? low : 0,
      height: isVertical ? s : otherSize
    };
  });
}

function onStart(state) {
  state.renderer.render(shapes(state));
}

function onUpdate(state) {
  state.renderer.render(shapes(state));
}

function onEnd(state) {
  state.renderer.render(shapes(state));
}

function setup(state, brush, scale, renderer) {
  state.brush = brush;

  if (!brush) {
    return;
  }

  function start() {
    onStart(state);
  }

  function update() {
    onUpdate(state);
  }

  function end() {
    onEnd(state);
  }

  brush.on('start', start);
  brush.on('update', update);
  brush.on('end', end);

  state.start = start;
  state.update = update;
  state.end = end;
  state.brush = brush;
  state.scale = scale;
  state.renderer = renderer;
}

function teardown(state) {
  if (state.brush) {
    state.brush.removeListener('start', state.start);
    state.brush.removeListener('update', state.update);
    state.brush.removeListener('end', state.end);
  }

  state.start = undefined;
  state.update = undefined;
  state.end = undefined;
  state.brush = undefined;
  state.scale = undefined;
  state.renderer = undefined;
}

/**
 * @typedef {object} component--range
 */

/**
 * @typedef {object} component--range.settings
 * @property {string} brush - Name of brush instance
 * @property {string} scale - Name of a scale
 * @property {string} [direction='horizontal'] - Direction of the brush
 * @property {string} [fill='#ccc'] - Fill color
 * @property {number} [opacity=1] - Layer opacity
 */

const rangeComponent = {
  require: ['chart', 'settings', 'renderer'],
  defaultSettings: {
    settings: {}
  },
  preferredSize: () => 50,
  created() {
    this.state = {};
  },
  render() {
    const stngs = this.settings.settings;
    const brush = this.chart.brush(stngs.brush);
    const direction = stngs.direction || 'horizontal';
    const distance = direction === 'horizontal' ? this.rect.width : this.rect.height;
    const scale = scaleWithSize(this.chart.scale(stngs.scale), distance);

    teardown(this.state);
    setup(this.state, brush, scale, this.renderer);

    this.state.rect = this.rect;
    this.state.fill = stngs.fill || FILL;
    this.state.opacity = typeof stngs.opacity !== 'undefined' ? stngs.opacity : OPACITY;
    this.state.direction = direction;

    return shapes(this.state);
  },
  beforeDestroy() {
    teardown(this.state);
  }
};

export default rangeComponent;
