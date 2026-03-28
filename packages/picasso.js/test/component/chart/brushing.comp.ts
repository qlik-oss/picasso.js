import createElement from 'test-utils/mocks/element-mock';
import p from '../../../src';

const { chart } = p;

// Test-specific types for component configurations
interface ComponentSettings {
  x?: { scale: string; ref: string };
  y?: { scale: string; ref: string };
  major?: { scale: string };
  minor?: { scale: string };
  fill?: string;
  [key: string]: unknown;
}

interface DataExtract {
  field: number;
  props?: Record<string, { field: number }>;
  fields?: string[];
}

interface MarkerConfig {
  type: string;
  data?: { extract: DataExtract };
  settings?: ComponentSettings;
  brush?: BrushConfig;
  scale?: string;
  layout?: { dock?: string };
}

interface BrushConfig {
  trigger?: Array<{ on?: string; contexts?: string[]; propagation?: string; globalPropagation?: string }>;
  consume?: Array<{ context: string; style?: Record<string, Record<string, string>> }>;
}

interface ChartSettings {
  scales?: Record<string, unknown>;
  components: MarkerConfig[];
}

interface Coordinate {
  x: number;
  y: number;
}

interface MockElement {
  trigger: (event: string, arg: unknown) => void;
  ontouchstart?: boolean;
  ontouchend?: boolean;
}

interface ShapeAttrs {
  cx?: number;
  cy?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  [key: string]: unknown;
}

interface Shape {
  attrs: ShapeAttrs;
  type?: string;
  bounds?: { x: number; y: number; width: number; height: number };
}

interface ChartInstance {
  element: MockElement;
  findShapes: (selector: string) => Shape[];
  getAffectedShapes: (ctx: string) => Shape[];
  [key: string]: unknown;
}

function simulateClick(elm: MockElement, down: Coordinate, up: Coordinate = down): void {
  elm.trigger('mousedown', {
    clientX: down.x,
    clientY: down.y,
    button: 0,
  });
  elm.trigger('mouseup', {
    clientX: up.x,
    clientY: up.y,
    button: 0,
  });
}

function simulateTap(elm: MockElement, down: Coordinate, up: Coordinate = down): boolean {
  let didPreventDefault = false;
  elm.trigger('touchstart', {
    type: 'touchstart',
    touches: [
      {
        clientX: down.x,
        clientY: down.y,
      },
    ],
    changedTouches: [
      {
        clientX: down.x,
        clientY: down.y,
      },
    ],
  });
  elm.trigger('touchend', {
    type: 'touchend',
    touches: [],
    changedTouches: [
      {
        clientX: up.x,
        clientY: up.y,
      },
    ],
    preventDefault: (): void => {
      didPreventDefault = true;
    },
  });
  return didPreventDefault;
}

function simulateTouchSupport(elm: MockElement): void {
  elm.ontouchstart = true;
  elm.ontouchend = true;
}

describe('Brushing', () => {
  let data: (string | number)[][];
  let settings: ChartSettings;
  let pointMarker: MarkerConfig;
  let boxMarker: MarkerConfig;
  let discreteAxis: MarkerConfig;
  let brush: BrushConfig;
  let element: MockElement;

  describe('tap', () => {
    beforeEach(() => {
      element = createElement();

      data = [
        ['Product', 'Cost'],
        ['Cars', 1],
        ['Trucks', 2],
      ];

      brush = {
        trigger: [
          {
            on: 'tap',
            contexts: ['test'],
          },
        ],
        consume: [
          {
            context: 'test',
            style: {
              inactive: {
                fill: 'red',
              },
            },
          },
        ],
      };

      pointMarker = {
        type: 'point',
        data: {
          extract: {
            field: 0,
            props: {
              x: {
                field: 0,
              },
              y: {
                field: 1,
              },
            },
          },
          // mapTo: {
          //   x: {
          //     source: '/0/0', reducer: 'first', type: 'qual'
          //   },
          //   y: {
          //     source: '/0/1'
          //   }
          // },
          // groupBy: {
          //   source: '/0/0',
          //   attribute: '$index'
          // }
        },
        settings: {
          x: {
            scale: 'd0',
            ref: 'x',
          },
          y: {
            scale: 'm0',
            ref: 'y',
          },
        },
        brush,
      };

      boxMarker = {
        type: 'box',
        data: {
          extract: {
            field: 0,
            props: {
              self: { field: 0 },
              min: { field: 1 },
              start: { field: 2 },
              med: { field: 3 },
              end: { field: 4 },
              max: { field: 5 },
            },
          },
        },
        settings: {
          major: {
            scale: 'd0',
          },
          minor: {
            scale: 'mn',
          },
        },
        brush,
      };

      discreteAxis = {
        type: 'axis',
        scale: 'd0',
        brush,
        layout: {
          dock: 'top',
        },
      };

      settings = {
        scales: {
          d0: {
            data: { field: 0 },
          },
          m0: {
            data: { field: 1 },
            expand: 1, // Expand so that shapes dont end up at the boundaries
          },
        },
        components: [],
      };
    });

    describe('thresholds', () => {
      it('should not tap if delta distance is greater the limit', () => {
        settings.components.push(pointMarker);

        const instance = chart({
          element,
          data: { data },
          settings,
        }) as unknown as ChartInstance;

        const c = instance.findShapes('circle');
        // mousedown on first point and mouseup on second
        simulateClick(
          instance.element,
          {
            x: (c[0]?.attrs.cx ?? 0) as number,
            y: (c[0]?.attrs.cy ?? 0) as number,
          },
          {
            x: (c[1]?.attrs.cx ?? 0) as number,
            y: (c[1]?.attrs.cy ?? 0) as number,
          }
        );
        const activeShapes = instance.getAffectedShapes('test');

        expect(activeShapes).to.be.of.length(0);
      });
    });

    describe('propagation', () => {
      it('stop', () => {
        if (!pointMarker.brush?.trigger?.[0]) return;
        pointMarker.brush.trigger[0].propagation = 'stop';
        if (pointMarker.settings) {
          pointMarker.settings.x = undefined;
        }
        settings.components.push(pointMarker);
        data = [
          ['Product', 'Cost'],
          ['Cars', 1],
          ['Trucks', 1],
        ];

        const instance = chart({
          element,
          data: { data },
          settings,
        }) as unknown as ChartInstance;

        const shapes = instance.findShapes('circle');
        const c1 = shapes[0];
        if (!c1 || c1.attrs.cx === undefined || c1.attrs.cy === undefined) return;
        simulateClick(instance.element, {
          x: c1.attrs.cx as number,
          y: c1.attrs.cy as number,
        });
        const activeShapes = instance.getAffectedShapes('test');
        const inactiveShapes = instance.findShapes('[fill="red"]');

        expect(activeShapes).to.be.of.length(1);
        expect(inactiveShapes).to.be.of.length(1);
        expect(activeShapes[0]?.attrs).to.deep.equal(c1.attrs);
      });
    });

    describe('global propagation', () => {
      it('stop', () => {
        if (!pointMarker.brush?.trigger?.[0]) return;
        pointMarker.brush.trigger[0].globalPropagation = 'stop';
        if (pointMarker.settings) {
          pointMarker.settings.x = undefined;
        }
        settings.components.push(pointMarker);
        settings.components.push(pointMarker);
        data = [
          ['Product', 'Cost'],
          ['Cars', 1],
        ];

        const instance = chart({
          element,
          data: { data },
          settings,
        }) as unknown as ChartInstance;

        const shapes = instance.findShapes('circle');
        const c1 = shapes[0];
        if (!c1 || c1.attrs.cx === undefined || c1.attrs.cy === undefined) return;
        simulateClick(instance.element, {
          x: c1.attrs.cx as number,
          y: c1.attrs.cy as number,
        });
        const activeShapes = instance.getAffectedShapes('test');
        const inactiveShapes = instance.findShapes('[fill="red"]');

        // Each component has one shape. Only one component should trigger a brush, but both should consume it
        expect(activeShapes).to.be.of.length(2);
        expect(inactiveShapes).to.be.of.length(0);
      });
    });

    describe('components', () => {
      beforeAll((): void => {
        // Axis require access to document to measure text
        (global.document as any).createElement = createElement;
      });

      afterAll((): void => {
        delete (global.document as any).createElement;
      });

      it('point-component', () => {
        settings.components.push(pointMarker);

        const instance = chart({
          element,
          data: { data },
          settings,
        }) as unknown as ChartInstance;

        const c = instance.findShapes('circle');
        if (!c[0] || c[0].attrs.cx === undefined || c[0].attrs.cy === undefined) return;
        simulateClick(instance.element, {
          x: c[0].attrs.cx as number,
          y: c[0].attrs.cy as number,
        });
        const activeShapes = instance.getAffectedShapes('test');
        const inactiveShapes = instance.findShapes('[fill="red"]');

        expect(activeShapes).to.be.of.length(1);
        expect(inactiveShapes).to.be.of.length(1);
        expect(activeShapes[0]?.attrs).to.deep.equal(c[0].attrs);
      });

      it('box', () => {
        data = [
          ['Product', 'm0', 'm1', 'm2', 'm3', 'm4'],
          ['Cars', 0.15, 0.3, 0.45, 0.5, 0.8],
          ['Trucks', 0.25, 0.3, 0.5, 0.7, 0.9],
          ['Planes', 0.1, 0.3, 0.6, 0.65, 0.69],
        ];
        if (settings.scales) {
          settings.scales.mn = {
            data: {
              fields: ['m0', 'm1', 'm2', 'm3', 'm4'],
            },
            expand: 0.1,
          };
        }
        settings.components.push(boxMarker);

        const instance = chart({
          element,
          data: { data },
          settings,
        }) as unknown as ChartInstance;

        const rects = instance.findShapes('rect');
        if (!rects[0] || rects[0].attrs.x === undefined || rects[0].attrs.y === undefined || rects[0].attrs.width === undefined || rects[0].attrs.height === undefined) return;
        simulateClick(instance.element, {
          x: (rects[0].attrs.x as number) + ((rects[0].attrs.width as number) / 2),
          y: (rects[0].attrs.y as number) + ((rects[0].attrs.height as number) / 2),
        });
        const activeShapes = instance.getAffectedShapes('test');
        const inactiveShapes = instance.findShapes('rect[fill="red"]');
        const activeRects = activeShapes.filter((s: Shape): boolean => s.type === 'rect');

        expect(activeRects).to.be.of.length(1);
        expect(inactiveShapes).to.be.of.length(2);
        expect(activeRects[0]?.attrs).to.deep.equal(rects[0].attrs);
      });

      it('axis', () => {
        settings.components.push(discreteAxis);

        const instance = chart({
          element,
          data: { data },
          settings,
        }) as unknown as ChartInstance;

        const texts = instance.findShapes('text');
        if (!texts[0]?.bounds) return;
        simulateClick(instance.element, {
          x: texts[0].bounds.x + texts[0].bounds.width / 2,
          y: texts[0].bounds.y + texts[0].bounds.height / 2,
        });
        const activeShapes = instance.getAffectedShapes('test');
        const inactiveShapes = instance.findShapes('[fill="red"]');

        expect(activeShapes).to.be.of.length(1);
        expect(inactiveShapes).to.be.of.length(1);
        expect(activeShapes[0]?.attrs).to.deep.equal(texts[0].attrs);
      });
    });

    describe('touch', () => {
      beforeEach((): void => {
        simulateTouchSupport(element);
      });

      it('tap', () => {
        settings.components.push(pointMarker);
        data = [
          ['Product', 'Cost'],
          ['Cars', 1],
        ];

        const instance = chart({
          element,
          data: { data },
          settings,
        }) as unknown as ChartInstance;

        const shapes = instance.findShapes('circle');
        const c1 = shapes[0];
        if (!c1 || c1.attrs.cx === undefined || c1.attrs.cy === undefined) return;
        simulateTap(instance.element, {
          x: c1.attrs.cx as number,
          y: c1.attrs.cy as number,
        });
        const activeShapes = instance.getAffectedShapes('test');

        expect(activeShapes).to.be.of.length(1);
      });

      it('do brush & preventDefault on when disableTriggers is not set', () => {
        (p as any).component('custom-not-set', {
          render(): unknown[] {
            const pointData = { source: { key: 'k', field: 'f' }, value: 'v' };
            return [
              {
                type: 'circle',
                cx: 50,
                cy: 50,
                r: 50,
                data: pointData,
              },
            ];
          },
        });

        const customComponent: MarkerConfig = {
          type: 'custom-not-set',
          brush,
        };

        settings.components.push(customComponent);

        const instance = chart({
          element,
          data: { data },
          settings,
        }) as unknown as ChartInstance;

        const shapes = instance.findShapes('circle');
        const c1 = shapes[0];
        if (!c1 || c1.attrs.cx === undefined || c1.attrs.cy === undefined) return;
        const didPreventDefault = simulateTap(instance.element, {
          x: c1.attrs.cx as number,
          y: c1.attrs.cy as number,
        });
        const activeShapes = instance.getAffectedShapes('test');

        expect(activeShapes).to.be.of.length(1);
        expect(didPreventDefault).eql(true);
      });

      it('do not brush or preventDefault when disableTriggers is set to true', () => {
        (p as any).component('custom-disableTriggers', {
          disableTriggers: true,
          render(): unknown[] {
            const pointData = { source: { key: 'k', field: 'f' }, value: 'v' };
            return [
              {
                type: 'circle',
                cx: 50,
                cy: 50,
                r: 50,
                data: pointData,
              },
            ];
          },
        });

        const customComponent: MarkerConfig = {
          type: 'custom-disableTriggers',
          brush,
        };

        settings.components.push(customComponent);

        const instance = chart({
          element,
          data: { data },
          settings,
        }) as unknown as ChartInstance;

        const shapes = instance.findShapes('circle');
        const c1 = shapes[0];
        if (!c1 || c1.attrs.cx === undefined || c1.attrs.cy === undefined) return;
        const didPreventDefault = simulateTap(instance.element, {
          x: c1.attrs.cx as number,
          y: c1.attrs.cy as number,
        });
        const activeShapes = instance.getAffectedShapes('test');

        expect(activeShapes).to.be.of.length(0);
        expect(didPreventDefault).eql(false);
      });
    });
  });
});
