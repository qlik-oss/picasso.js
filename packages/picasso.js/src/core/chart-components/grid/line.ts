import extend from 'extend';
import Transposer, { transposer } from '../../transposer/transposer';
import { updateScaleSize } from '../../scales';

interface Tick {
  position?: number;
  value?: unknown;
  data?: Record<string, unknown>;
  isMinor?: boolean;
  flipXY?: boolean;
}

interface Scale {
  cachedTicks?(): Tick[];
  ticks(config: Record<string, unknown>): Tick[];
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GridLineComponent {
  blueprint?: Transposer;
  rect?: Rect;
  x?: Scale | null;
  y?: Scale | null;
  settings: Record<string, unknown>;
  style?: Record<string, unknown>;
  chart: {
    scale(scaleId: string): Scale;
  };
  resolver: {
    resolve(config: Record<string, unknown>): Record<string, unknown>;
  };
  lines?: {
    x: Tick[];
    y: Tick[];
  };
}

/**
 * Generate array of lines (ticks) from scale
 *
 * @param {object} scale - A scale supplied by the chart
 * @param {object} settings - The settings object from the grid line component
 * @param {object} rect - The rect containing width and height to renderer in
 * @returns {array} - Returns an array of ticks
 * @ignore
 */
function lineGen(scale: Scale | undefined, distance: number): Tick[] {
  if (!scale || !distance) {
    return [];
  }
  return (scale.cachedTicks && scale.cachedTicks()) || scale.ticks({ distance });
}

const gridLineComponent: {
  created(this: GridLineComponent): void;
  require: string[];
  defaultSettings: Record<string, unknown>;
  beforeRender(this: GridLineComponent): void;
  render(this: GridLineComponent): unknown[];
} = {
  created() {},

  require: ['chart', 'renderer', 'resolver'],
  defaultSettings: {
    layout: {
      displayOrder: 0,
    },
    style: {
      // Theming style
      ticks: '$guide-line',
      minorTicks: '$guide-line--minor',
    },
  },

  beforeRender() {
    this.blueprint = transposer();

    const rect = this.rect as Rect;
    (this.blueprint as unknown as Record<string, unknown>).width = rect.width;
    (this.blueprint as unknown as Record<string, unknown>).height = rect.height;
    (this.blueprint as unknown as Record<string, unknown>).x = rect.x;
    (this.blueprint as unknown as Record<string, unknown>).y = rect.y;
    this.blueprint.crisp = true;
  },

  render() {
    // Setup scales
    this.x = (this.settings.x as string)
      ? this.chart.scale(this.settings.x as string)
      : null;
    this.y = (this.settings.y as string)
      ? this.chart.scale(this.settings.y as string)
      : null;
    const rect = this.rect as Rect;
    updateScaleSize(this, 'x', rect.width);
    updateScaleSize(this, 'y', rect.height);

    // Return an empty array to abort rendering when no scales are available to renderer
    if (!this.x && !this.y) {
      return [];
    }

    const style = (this.style as Record<string, unknown>) || {};
    this.settings.ticks = extend(
      { show: true },
      (style.ticks as Record<string, unknown>) || {},
      (this.settings.ticks as Record<string, unknown>) || {}
    );
    this.settings.minorTicks = extend(
      { show: false },
      (style.minorTicks as Record<string, unknown>) || {},
      (this.settings.minorTicks as Record<string, unknown>) || {}
    );

    // Setup lines for X and Y
    this.lines = {
      x: [],
      y: [],
    };

    // Use the lineGen function to generate appropriate ticks
    this.lines.x = lineGen(this.x || undefined, rect.width);
    this.lines.y = lineGen(this.y || undefined, rect.height);

    // Set all Y lines to flipXY by default
    // This makes the transposer flip them individually
    this.lines.y = this.lines.y.map((i: Tick) => extend(i, { flipXY: true }));

    const addTicks = ({ dir, isMinor }: { dir: string; isMinor: boolean }): void => {
      const items = this.lines![dir as 'x' | 'y'].filter((tick: Tick) => !!tick.isMinor === isMinor);
      const settings = isMinor
        ? (this.settings.minorTicks as Record<string, unknown>)
        : (this.settings.ticks as Record<string, unknown>);
      const ticks = (this.resolver.resolve({
        settings,
        data: {
          items,
          dir,
        },
      }) as Record<string, unknown>).items as Array<Record<string, unknown>>;

      ticks.forEach((style: Record<string, unknown>) => {
        const p = style.data as Record<string, unknown>;

        // If the style's show is falsy, don't renderer this item (to respect axis settings).
        if (style.show) {
          // Use the transposer to handle actual positioning
          (this.blueprint as Transposer).push({
            type: 'line',
            x1: p.position,
            y1: 0,
            x2: p.position,
            y2: 1,
            stroke: (style.stroke as string) || 'black',
            strokeWidth: typeof style.strokeWidth !== 'undefined' ? style.strokeWidth : 1,
            strokeDasharray: typeof style.strokeDasharray !== 'undefined' ? style.strokeDasharray : undefined,
            flipXY: (p.flipXY as boolean) || false,
            value: (p.value as unknown) ?? ((p.data as Record<string, unknown>)?.value as unknown),
            dir,
          });
        }
      });
    };

    addTicks({ dir: 'x', isMinor: false });
    addTicks({ dir: 'x', isMinor: true });
    addTicks({ dir: 'y', isMinor: false });
    addTicks({ dir: 'y', isMinor: true });

    return ((this.blueprint as Transposer).output as () => unknown[])();
  },
};

export default gridLineComponent;
