import extend from 'extend';

import nodeBuilder from './axis-node-builder';
import {
  DEFAULT_CONTINUOUS_SETTINGS,
  DEFAULT_DISCRETE_SETTINGS
} from './axis-default-settings';
import calcRequiredSize from './axis-size-calculator';
import crispify from '../../transposer/crispifier';
import { scaleWithSize } from '../../scales';

function alignTransform({ align, inner }) {
  if (align === 'left') {
    return { x: inner.width + inner.x };
  } else if (align === 'right' || align === 'bottom') {
    return inner;
  }
  return { y: inner.y + inner.height };
}

function resolveAlign(align, dock) {
  const horizontal = ['top', 'bottom'];
  const vertical = ['left', 'right'];
  if (horizontal.indexOf(align) !== -1 && vertical.indexOf(dock) === -1) {
    return align;
  } else if (vertical.indexOf(align) !== -1 && horizontal.indexOf(dock) === -1) {
    return align;
  }
  return dock; // Invalid align, return current dock as default
}

/**
 * @ignore
 * @param {object} context - The component context
 */
function resolveLocalSettings({
    state,
    style,
    settings
  }) {
  const defaultStgns = extend(true, {}, state.isDiscrete ? DEFAULT_DISCRETE_SETTINGS : DEFAULT_CONTINUOUS_SETTINGS, style);
  const localStgns = extend(true, {}, defaultStgns, settings.settings);

  const dock = settings.dock || state.defaultDock;
  localStgns.dock = dock;
  localStgns.align = resolveAlign(settings.settings.align, dock);
  localStgns.labels.tiltAngle = Math.max(-90, Math.min(localStgns.labels.tiltAngle, 90));

  return localStgns;
}

function updateActiveMode(state, settings, isDiscrete) {
  const mode = settings.labels.mode;

  if (!isDiscrete || !state.isHorizontal) {
    return 'horizontal';
  }

  if (mode === 'auto') {
    return state.labels.activeMode;
  } else if (['layered', 'tilted'].indexOf(settings.labels.mode) !== -1 && ['top', 'bottom'].indexOf(settings.dock) !== -1) {
    return mode;
  }
  return 'horizontal';
}

const axisComponent = {
  require: ['chart', 'renderer', 'dockConfig'],
  defaultSettings: {
    displayOrder: 0,
    prioOrder: 0,
    settings: {},
    style: {
      labels: '$label',
      ticks: '$guide-line',
      minorTicks: '$guide-line--minor',
      line: '$guide-line'
    }
  },
  created() {
    // State is a representation of properties that are private to this component defintion and may be modified by only in this context.
    this.state = {
      isDiscrete: !!this.scale.bandwidth,
      isHorizontal: false,
      labels: {
        activeMode: 'horizontal'
      },
      ticks: [],
      innerRect: { width: 0, height: 0, x: 0, y: 0 },
      outerRect: { width: 0, height: 0, x: 0, y: 0 },
      defaultDock: undefined,
      concreteNodeBuilder: undefined,
      settings: undefined
    };

    if (this.state.isDiscrete) {
      this.state.defaultDock = 'bottom';
    } else {
      this.state.defaultDock = 'left';
    }

    this.setState(this.settings);
  },
  setState() {
    this.state.isDiscrete = !!this.scale.bandwidth;
    this.state.settings = resolveLocalSettings(this);

    this.state.concreteNodeBuilder = nodeBuilder(this.state.isDiscrete);

    this.dockConfig.dock = this.state.settings.dock; // Override the dock setting (TODO should be removed)

    this.state.isHorizontal = this.state.settings.align === 'top' || this.state.settings.align === 'bottom';
    this.state.labels.activeMode = updateActiveMode(this.state, this.state.settings, this.state.isDiscrete);
  },
  preferredSize(opts) {
    const {
      formatter,
      state,
      scale
    } = this;

    const distance = this.state.isHorizontal ? opts.inner.width : opts.inner.height;

    this.state.pxScale = scaleWithSize(scale, distance);

    const reqSize = calcRequiredSize({
      isDiscrete: this.state.isDiscrete,
      rect: opts.inner,
      formatter,
      measureText: this.renderer.measureText,
      scale: this.state.pxScale,
      settings: this.state.settings,
      state
    });

    return reqSize;
  },
  beforeUpdate(opts = {}) {
    const {
      settings
    } = opts;
    this.setState(settings);
  },
  resize(opts) {
    const {
      inner,
      outer
    } = opts;

    const extendedInner = extend({}, inner, alignTransform({
      align: this.state.settings.align,
      inner
    }));

    const finalOuter = outer || extendedInner;
    extend(this.state.innerRect, extendedInner);
    extend(this.state.outerRect, finalOuter);

    return outer;
  },
  beforeRender() {
    const {
      scale,
      formatter
    } = this;

    const distance = this.state.isHorizontal ? this.state.innerRect.width : this.state.innerRect.height;

    this.state.pxScale = scaleWithSize(scale, distance);
    this.state.ticks = this.state.pxScale.ticks({
      distance,
      formatter
    });
  },
  render() {
    const {
      state
    } = this;

    const nodes = [];
    nodes.push(...this.state.concreteNodeBuilder.build({
      settings: this.state.settings,
      scale: this.state.pxScale,
      innerRect: this.state.innerRect,
      outerRect: this.state.outerRect,
      measureText: this.renderer.measureText,
      textBounds: this.renderer.textBounds,
      ticks: this.state.ticks,
      state
    }));

    crispify.multiple(nodes);

    return nodes;
  }
};

export default axisComponent;
