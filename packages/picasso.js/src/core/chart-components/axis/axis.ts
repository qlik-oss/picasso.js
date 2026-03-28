import extend from 'extend';

import nodeBuilder from './axis-node-builder';
import { DEFAULT_CONTINUOUS_SETTINGS, DEFAULT_DISCRETE_SETTINGS } from './axis-default-settings';
import calcRequiredSize from './axis-size-calculator';
import crispify from '../../transposer/crispifier';
import { scaleWithSize } from '../../scales';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AlignTransformInput {
  align: string;
  inner: Rect;
}

function alignTransform({ align, inner }: AlignTransformInput): Rect {
  if (align === 'left') {
    return { x: inner.width + inner.x, y: inner.y, width: inner.width, height: inner.height };
  }
  if (align === 'right' || align === 'bottom') {
    return inner;
  }
  return { x: inner.x, y: inner.y + inner.height, width: inner.width, height: inner.height };
}

function resolveAlign(align: string, dock: string): string {
  const horizontal = ['top', 'bottom'];
  const vertical = ['left', 'right'];
  if (horizontal.indexOf(align) !== -1 && vertical.indexOf(dock) === -1) {
    return align;
  }
  if (vertical.indexOf(align) !== -1 && horizontal.indexOf(dock) === -1) {
    return align;
  }
  return dock; // Invalid align, return current dock as default
}

interface ResolveLocalSettingsInput {
  state: Record<string, unknown>;
  style: Record<string, unknown>;
  settings: Record<string, unknown>;
}

/**
 * @ignore
 * @param {object} context - The component context
 */
function resolveLocalSettings(input: ResolveLocalSettingsInput): Record<string, unknown> {
  const { state, style, settings } = input;
  const defaultStgns = extend(
    true,
    {},
    (state as Record<string, unknown>).isDiscrete ? DEFAULT_DISCRETE_SETTINGS : DEFAULT_CONTINUOUS_SETTINGS,
    style
  );
  const localStgns: Record<string, unknown> = extend(true, {}, defaultStgns, (settings as Record<string, unknown>).settings);

  const dock = ((settings as Record<string, unknown>).layout as Record<string, unknown>).dock || (state as Record<string, unknown>).defaultDock;
  localStgns.dock = dock;
  localStgns.align = resolveAlign(
    ((settings as Record<string, unknown>).settings as Record<string, unknown>).align as string,
    dock as string
  );
  localStgns.labels = localStgns.labels || {};
  (localStgns.labels as Record<string, unknown>).tiltAngle = Math.max(
    -90,
    Math.min((localStgns.labels as Record<string, number>).tiltAngle || 0, 90)
  );

  const { paddingStart, paddingEnd } = localStgns;
  localStgns.paddingStart = typeof paddingStart === 'function' ? (paddingStart as () => unknown).call(null) : paddingStart;
  localStgns.paddingEnd = typeof paddingEnd === 'function' ? (paddingEnd as () => unknown).call(null) : paddingEnd;

  return localStgns;
}

function updateActiveMode(state: Record<string, unknown>, settings: Record<string, unknown>, isDiscrete: boolean): string {
  const mode = (settings.labels as Record<string, unknown>).mode;

  if (!isDiscrete || !(state.isHorizontal as boolean)) {
    return 'horizontal';
  }

  if (mode === 'auto') {
    return (state.labels as Record<string, unknown>).activeMode as string;
  }
  if (
    ['layered', 'tilted'].indexOf(settings.labels as unknown as string) !== -1 &&
    ['top', 'bottom'].indexOf((settings.dock as string) || '') !== -1
  ) {
    return mode as string;
  }
  return 'horizontal';
}

interface AxisComponentState extends Record<string, unknown> {
  isDiscrete: boolean;
  isHorizontal: boolean;
  labels: { activeMode: string };
  ticks: unknown[];
  innerRect: Rect;
  outerRect: Rect;
  defaultDock: string | undefined;
  concreteNodeBuilder: unknown;
  settings: Record<string, unknown> | undefined;
  pxScale?: unknown;
}

const axisComponent: any = {
  require: ['chart', 'renderer', 'dockConfig'],
  defaultSettings: {
    layout: {
      displayOrder: 0,
      prioOrder: 0,
    },
    settings: {},
    style: {
      labels: '$label',
      ticks: '$guide-line',
      minorTicks: '$guide-line--minor',
      line: '$guide-line',
    },
  },
  created(this: any) {
    // State is a representation of properties that are private to this component defintion and may be modified by only in this context.
    this.state = {
      isDiscrete: !!(this.scale as Record<string, unknown>).bandwidth,
      isHorizontal: false,
      labels: {
        activeMode: 'horizontal',
      },
      ticks: [],
      innerRect: {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      },
      outerRect: {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      },
      defaultDock: undefined,
      concreteNodeBuilder: undefined,
      settings: undefined,
    };

    if (this.state.isDiscrete) {
      this.state.defaultDock = 'bottom';
    } else {
      this.state.defaultDock = 'left';
    }

    this.setState(this.settings as Record<string, unknown>);
  },
  setState(this: any, settings?: Record<string, unknown>) {
    this.state.isDiscrete = !!(this.scale as Record<string, unknown>).bandwidth;
    this.state.settings = resolveLocalSettings({
      state: this.state,
      style: this as unknown as Record<string, unknown>,
      settings: this as unknown as Record<string, unknown>,
    });

    this.state.concreteNodeBuilder = nodeBuilder(this.state.isDiscrete);

    (this.dockConfig as any).dock((this.state.settings as Record<string, unknown>).dock); // Override the dock setting (TODO should be removed)

    this.state.isHorizontal =
      (this.state.settings as Record<string, unknown>).align === 'top' ||
      (this.state.settings as Record<string, unknown>).align === 'bottom';
    this.state.labels.activeMode = updateActiveMode(this.state, this.state.settings as Record<string, unknown>, this.state.isDiscrete);
  },
  preferredSize(this: any, opts: Record<string, unknown>) {
    const { formatter } = this;

    const distance = this.state.isHorizontal
      ? (opts.inner as Rect).width
      : (opts.inner as Rect).height;

    this.state.pxScale = scaleWithSize(this.scale as any, distance);

    const reqSize = calcRequiredSize({
      isDiscrete: this.state.isDiscrete,
      rect: {
        inner: opts.inner,
        outer: opts.outer,
      },
      formatter,
      measureText: (this.renderer as Record<string, unknown>).measureText,
      scale: this.state.pxScale,
      settings: this.state.settings as Record<string, unknown>,
      state: this.state,
    } as any);

    return reqSize;
  },
  beforeUpdate(this: any, opts: Record<string, unknown> = {}) {
    const { settings } = opts;
    this.setState(settings as Record<string, unknown>);
  },
  resize(this: any, opts: Record<string, unknown>) {
    const { inner, outer } = opts;

    const extendedInner = extend(
      {},
      inner,
      alignTransform({
        align: (this.state.settings as Record<string, unknown>).align as string,
        inner: inner as Rect,
      })
    );

    const finalOuter = outer || extendedInner;
    extend(this.state.innerRect, extendedInner);
    extend(this.state.outerRect, finalOuter);

    return outer;
  },
  beforeRender(this: any) {
    const { formatter } = this;

    const distance = this.state.isHorizontal ? this.state.innerRect.width : this.state.innerRect.height;

    this.state.pxScale = scaleWithSize(this.scale as any, distance);
    this.state.ticks = (this.state.pxScale as any)
      .ticks({
        distance,
        formatter,
      } as Record<string, unknown>)
      .filter((t: Record<string, unknown>) => (t.position as number) >= 0 && (t.position as number) <= 1);
  },
  render(this: any) {
    const { state } = this;

    const nodes: unknown[] = [];
    nodes.push(
      ...(this.state.concreteNodeBuilder as any).build({
        settings: this.state.settings,
        scale: this.state.pxScale,
        innerRect: this.state.innerRect,
        outerRect: this.state.outerRect,
        measureText: (this.renderer as Record<string, unknown>).measureText,
        textBounds: (this.renderer as Record<string, unknown>).textBounds,
        ticks: this.state.ticks,
        state,
      } as Record<string, unknown>) as unknown[]
    );

    crispify.multiple(nodes);

    return nodes;
  },
};

export default axisComponent;
