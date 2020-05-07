import createElement from 'test-utils/mocks/element-mock';
import p from '../../../src';

const { chart } = p;

function simulateClick(elm, down, up = down) {
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

function simulateTap(elm, down, up = down) {
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
    preventDefault: () => {
      didPreventDefault = true;
    },
  });
  return didPreventDefault;
}

function simulateTouchSupport(elm) {
  elm.ontouchstart = true;
  elm.ontouchend = true;
}

describe('Brushing', () => {
  let data;
  let settings;
  let pointMarker;
  let boxMarker;
  let discreteAxis;
  let brush;
  let element;

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
        });

        const c = instance.findShapes('circle');
        // mousedown on first point and mouseup on second
        simulateClick(
          instance.element,
          {
            x: c[0].attrs.cx,
            y: c[0].attrs.cy,
          },
          {
            x: c[1].attrs.cx,
            y: c[1].attrs.cy,
          }
        );
        const activeShapes = instance.getAffectedShapes('test');

        expect(activeShapes).to.be.of.length(0);
      });
    });

    describe('propagation', () => {
      it('stop', () => {
        pointMarker.brush.trigger[0].propagation = 'stop';
        pointMarker.settings.x = undefined;
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
        });

        const c1 = instance.findShapes('circle')[0];
        simulateClick(instance.element, {
          x: c1.attrs.cx,
          y: c1.attrs.cy,
        });
        const activeShapes = instance.getAffectedShapes('test');
        const inactiveShapes = instance.findShapes('[fill="red"]');

        expect(activeShapes).to.be.of.length(1);
        expect(inactiveShapes).to.be.of.length(1);
        expect(activeShapes[0].attrs).to.deep.equal(c1.attrs);
      });
    });

    describe('global propagation', () => {
      it('stop', () => {
        pointMarker.brush.trigger[0].globalPropagation = 'stop';
        pointMarker.settings.x = undefined;
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
        });

        const c1 = instance.findShapes('circle')[0];
        simulateClick(instance.element, {
          x: c1.attrs.cx,
          y: c1.attrs.cy,
        });
        const activeShapes = instance.getAffectedShapes('test');
        const inactiveShapes = instance.findShapes('[fill="red"]');

        // Each component has one shape. Only one component should trigger a brush, but both should consume it
        expect(activeShapes).to.be.of.length(2);
        expect(inactiveShapes).to.be.of.length(0);
      });
    });

    describe('components', () => {
      before(() => {
        // Axis require access to document to measure text
        global.document = {
          createElement,
        };
      });

      after(() => {
        delete global.document;
      });

      it('point-component', () => {
        settings.components.push(pointMarker);

        const instance = chart({
          element,
          data: { data },
          settings,
        });

        const c = instance.findShapes('circle');
        simulateClick(instance.element, {
          x: c[0].attrs.cx,
          y: c[0].attrs.cy,
        });
        const activeShapes = instance.getAffectedShapes('test');
        const inactiveShapes = instance.findShapes('[fill="red"]');

        expect(activeShapes).to.be.of.length(1);
        expect(inactiveShapes).to.be.of.length(1);
        expect(activeShapes[0].attrs).to.deep.equal(c[0].attrs);
      });

      it('box', () => {
        data = [
          ['Product', 'm0', 'm1', 'm2', 'm3', 'm4'],
          ['Cars', 0.15, 0.3, 0.45, 0.5, 0.8],
          ['Trucks', 0.25, 0.3, 0.5, 0.7, 0.9],
          ['Planes', 0.1, 0.3, 0.6, 0.65, 0.69],
        ];
        settings.scales.mn = {
          data: {
            fields: ['m0', 'm1', 'm2', 'm3', 'm4'],
          },
          expand: 0.1,
        };
        settings.components.push(boxMarker);

        const instance = chart({
          element,
          data: { data },
          settings,
        });

        const rects = instance.findShapes('rect');
        simulateClick(instance.element, {
          x: rects[0].attrs.x + rects[0].attrs.width / 2,
          y: rects[0].attrs.y + rects[0].attrs.height / 2,
        });
        const activeShapes = instance.getAffectedShapes('test');
        const inactiveShapes = instance.findShapes('rect[fill="red"]');
        const activeRects = activeShapes.filter((s) => s.type === 'rect');

        expect(activeRects).to.be.of.length(1);
        expect(inactiveShapes).to.be.of.length(2);
        expect(activeRects[0].attrs).to.deep.equal(rects[0].attrs);
      });

      it('axis', () => {
        settings.components.push(discreteAxis);

        const instance = chart({
          element,
          data: { data },
          settings,
        });

        const texts = instance.findShapes('text');
        simulateClick(instance.element, {
          x: texts[0].bounds.x + texts[0].bounds.width / 2,
          y: texts[0].bounds.y + texts[0].bounds.height / 2,
        });
        const activeShapes = instance.getAffectedShapes('test');
        const inactiveShapes = instance.findShapes('[fill="red"]');

        expect(activeShapes).to.be.of.length(1);
        expect(inactiveShapes).to.be.of.length(1);
        expect(activeShapes[0].attrs).to.deep.equal(texts[0].attrs);
      });
    });

    describe('touch', () => {
      beforeEach(() => {
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
        });

        const c1 = instance.findShapes('circle')[0];
        simulateTap(instance.element, {
          x: c1.attrs.cx,
          y: c1.attrs.cy,
        });
        const activeShapes = instance.getAffectedShapes('test');

        expect(activeShapes).to.be.of.length(1);
      });

      it('do brush & preventDefault on when disableTriggers is not set', () => {
        p.component('custom-not-set', {
          render() {
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

        const customComponent = {
          type: 'custom-not-set',
          brush,
        };

        settings.components.push(customComponent);

        const instance = chart({
          element,
          data: { data },
          settings,
        });

        const c1 = instance.findShapes('circle')[0];
        const didPreventDefault = simulateTap(instance.element, {
          x: c1.attrs.cx,
          y: c1.attrs.cy,
        });
        const activeShapes = instance.getAffectedShapes('test');

        expect(activeShapes).to.be.of.length(1);
        expect(didPreventDefault).eql(true);
      });

      it('do not brush or preventDefault when disableTriggers is set to true', () => {
        p.component('custom-disableTriggers', {
          disableTriggers: true,
          render() {
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

        const customComponent = {
          type: 'custom-disableTriggers',
          brush,
        };

        settings.components.push(customComponent);

        const instance = chart({
          element,
          data: { data },
          settings,
        });

        const c1 = instance.findShapes('circle')[0];
        const didPreventDefault = simulateTap(instance.element, {
          x: c1.attrs.cx,
          y: c1.attrs.cy,
        });
        const activeShapes = instance.getAffectedShapes('test');

        expect(activeShapes).to.be.of.length(0);
        expect(didPreventDefault).eql(false);
      });
    });
  });
});
