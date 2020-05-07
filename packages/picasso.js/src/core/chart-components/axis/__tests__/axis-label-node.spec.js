import buildLabel from '../axis-label-node';
import { textBounds } from '../../../../web/text-manipulation';

function createTick(start, end) {
  const position = start + (end - start) / 2;
  return {
    start,
    end,
    position,
    label: '50%',
  };
}

describe('Axis Label Node', () => {
  const innerRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  const outerRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  const textRect = { width: 10, height: 10 };
  const measureTextMock = ({ text }) => ({ width: text.length, height: 1 });

  beforeEach(() => {
    innerRect.width = 50;
    innerRect.height = 100;
    innerRect.x = 0;
    innerRect.y = 0;
    outerRect.width = 50;
    outerRect.height = 100;
    outerRect.x = 0;
    outerRect.y = 0;
  });

  describe('Label', () => {
    let buildOpts, tick, expected;

    beforeEach(() => {
      buildOpts = {
        style: { fontFamily: 'Arial', fill: 'red', fontSize: 10 },
        align: 'bottom',
        padding: 10,
        innerRect,
        outerRect,
        maxWidth: textRect.width,
        maxHeight: textRect.height,
        textRect,
        textBounds: (node) => textBounds(node, measureTextMock),
        stepSize: 0,
      };
      tick = createTick(0.5, 0.5);
      expected = {
        type: 'text',
        text: '50%',
        x: 0,
        y: 0,
        fill: 'red',
        fontFamily: 'Arial',
        fontSize: 10,
        anchor: 'end',
        maxWidth: textRect.width,
        maxHeight: textRect.height,
      };
    });

    describe('Style align', () => {
      it('align start with vertical orientation', () => {
        buildOpts.align = 'right';
        buildOpts.style.align = 0;
        buildOpts.stepSize = 0.2 * innerRect.height; // 20px
        tick = createTick(0.2, 0.4);
        expected.x = 10;
        expected.y = 20;
        expected.anchor = 'start';
        expected.baseline = 'text-before-edge';

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('align middle with vertical orientation', () => {
        buildOpts.align = 'right';
        buildOpts.style.align = 0.5;
        buildOpts.stepSize = 0.2 * innerRect.height; // 20px
        tick = createTick(0.2, 0.4);
        expected.x = 10;
        expected.y = 25;
        expected.anchor = 'start';
        expected.baseline = 'text-before-edge';

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('align end with vertical orientation', () => {
        buildOpts.align = 'right';
        buildOpts.style.align = 1;
        buildOpts.stepSize = 0.2 * innerRect.height; // 20px
        tick = createTick(0.2, 0.4);
        expected.x = 10;
        expected.y = 30;
        expected.anchor = 'start';
        expected.baseline = 'text-before-edge';

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('align start with horizontal orientation', () => {
        buildOpts.align = 'bottom';
        buildOpts.style.align = 0;
        buildOpts.stepSize = 0.4 * innerRect.width; // 20px, i.e. twice as much as textRect.width
        tick = createTick(0.2, 0.4);
        expected.x = 10;
        expected.y = 20;
        expected.anchor = 'start';

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('align middle with horizontal orientation', () => {
        buildOpts.align = 'bottom';
        buildOpts.style.align = 0.5;
        buildOpts.stepSize = 0.4 * innerRect.width; // 20px, i.e. twice as much as textRect.width
        tick = createTick(0.2, 0.6);
        expected.x = 15;
        expected.y = 20;
        expected.anchor = 'start';

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('align end with horizontal orientation', () => {
        buildOpts.align = 'bottom';
        buildOpts.style.align = 1;
        buildOpts.stepSize = 0.4 * innerRect.width; // 20px, i.e. twice as much as textRect.width
        tick = createTick(0.2, 0.6);
        expected.x = 20;
        expected.y = 20;
        expected.anchor = 'start';

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('align end with horizontal orientation and tilted labels', () => {
        buildOpts.align = 'bottom';
        buildOpts.tilted = true;
        buildOpts.angle = 90;
        buildOpts.style.align = 1;
        buildOpts.stepSize = 0.4 * innerRect.width; // 20px, i.e. twice as much as textRect.width
        tick = createTick(0.2, 0.6);
        expected.x = 35;
        expected.y = 10;
        expected.anchor = 'end';

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });
    });

    describe('Left align', () => {
      beforeEach(() => {
        buildOpts.align = 'left';
        expected.x = innerRect.width - buildOpts.padding;
        expected.baseline = 'central';
      });

      it('middle label', () => {
        expected.y = 50;
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('end label', () => {
        tick = createTick(1, 1);
        expected.y = 100;
        expected.baseline = 'text-after-edge';

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('end label with margin', () => {
        outerRect.height = 105;
        tick = createTick(1, 1);
        expected.y = 100;

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('start label', () => {
        tick = createTick(0, 0);
        expected.y = 0;
        expected.baseline = 'text-before-edge';

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('start label with margin', () => {
        innerRect.y = 5;
        tick = createTick(0, 0);
        expected.y = 5;

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });
    });

    describe('Right align', () => {
      beforeEach(() => {
        buildOpts.align = 'right';
        expected.x = 10;
        expected.anchor = 'start';
        expected.baseline = 'central';
      });

      it('middle label', () => {
        expected.y = 50;
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('end label', () => {
        tick = createTick(1, 1);
        expected.y = 100;
        expected.baseline = 'text-after-edge';
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('end label with margin', () => {
        outerRect.height = 105;
        tick = createTick(1, 1);
        expected.y = 100;

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('start label', () => {
        tick = createTick(0, 0);
        expected.y = 0;
        expected.baseline = 'text-before-edge';
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('start label with margin', () => {
        innerRect.y = 5;
        tick = createTick(0, 0);
        expected.y = 5;

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });
    });

    describe('Top align', () => {
      beforeEach(() => {
        buildOpts.align = 'top';
        expected.y = innerRect.height - buildOpts.padding;
        expected.anchor = 'middle';
      });

      it('middle label', () => {
        expected.x = 25;
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('start label', () => {
        tick = createTick(0, 0);
        expected.x = 0;
        expected.anchor = 'start';
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('start label with margin', () => {
        tick = createTick(0, 0);
        innerRect.x = 5;
        expected.x = 5;
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('end label', () => {
        tick = createTick(1, 1);
        expected.x = 50;
        expected.anchor = 'end';
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('end label with margin', () => {
        tick = createTick(1, 1);
        outerRect.width = 65;
        expected.x = 50;
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });
    });

    describe('Bottom align', () => {
      beforeEach(() => {
        buildOpts.align = 'bottom';
        expected.y = 20;
        expected.anchor = 'middle';
      });

      it('middle label', () => {
        expected.x = 25;
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('start label', () => {
        tick = createTick(0, 0);
        expected.x = 0;
        expected.anchor = 'start';
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('start label with margin', () => {
        tick = createTick(0, 0);
        innerRect.x = 5;
        expected.x = 5;
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('end label', () => {
        tick = createTick(1, 1);
        expected.x = 50;
        expected.anchor = 'end';
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('end label with margin', () => {
        tick = createTick(1, 1);
        outerRect.width = 65;
        expected.x = 50;
        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });
    });

    describe('Tilted', () => {
      const rad45 = -45 * (Math.PI / 180);
      const rad60 = -60 * (Math.PI / 180);
      beforeEach(() => {
        buildOpts.tilted = true;
        buildOpts.angle = 45;
        expected.y = 10 + (buildOpts.maxHeight * Math.cos(rad45)) / 2; // 10 is top of rect + padding
        expected.x = 25 - (buildOpts.maxHeight * Math.sin(rad45)) / 2; // 25 is in the middle: width * tick.position
        expected.transform = `rotate(-45, ${expected.x}, ${expected.y})`;
        tick = createTick(0.5, 0.5);
        tick.label = 'mmmmmm';
        expected.text = tick.label;
      });
      describe('align bottom', () => {
        beforeEach(() => {
          buildOpts.align = 'bottom';
          expected.anchor = 'end';
        });

        it('45deg', () => {
          expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
        });

        it('60deg', () => {
          expected.y = 10 + (buildOpts.maxHeight * Math.cos(rad60)) / 2;
          expected.x = 25 - (buildOpts.maxHeight * Math.sin(rad60)) / 2;
          expected.transform = `rotate(-60, ${expected.x}, ${expected.y})`;
          buildOpts.angle = 60;
          expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
        });

        it('-45deg', () => {
          expected.y = 10 + (buildOpts.maxHeight * Math.cos(-rad45)) / 2;
          expected.x = 25 - (buildOpts.maxHeight * Math.sin(-rad45)) / 2;
          expected.transform = `rotate(45, ${expected.x}, ${expected.y})`;
          expected.anchor = 'start';
          buildOpts.angle = -45;
          expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
        });
      });

      describe('align top', () => {
        beforeEach(() => {
          buildOpts.align = 'top';
          expected.anchor = 'start';
        });

        it('45deg', () => {
          buildOpts.angle = 45;
          expected.x = 25 - (buildOpts.maxHeight * Math.sin(rad45)) / 3;
          expected.y = 90; // Bottom of the rect - padding
          expected.transform = `rotate(-45, ${expected.x}, 90)`;
          expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
        });

        it('60deg', () => {
          buildOpts.angle = 60;
          expected.x = 25 - (buildOpts.maxHeight * Math.sin(rad60)) / 3;
          expected.y = 90;
          expected.transform = `rotate(-60, ${expected.x}, ${expected.y})`;
          expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
        });

        it('-45deg', () => {
          buildOpts.angle = -45;
          expected.anchor = 'end';
          expected.x = 25 - (buildOpts.maxHeight * Math.sin(-rad45)) / 3;
          expected.y = 90; // Bottom of the rect - padding
          expected.transform = `rotate(45, ${expected.x}, 90)`;
          expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
        });
      });
    });

    describe('Collider', () => {
      it('should have a bounds collider if stepSize is zero', () => {
        buildOpts.stepSize = 0;
        const label = buildLabel(tick, buildOpts);

        expect(label.collider).to.be.an('object');
      });

      describe('align left', () => {
        beforeEach(() => {
          buildOpts.align = 'left';
        });

        it('should have a collider', () => {
          buildOpts.stepSize = 0.2 * innerRect.height;
          tick = createTick(0.4, 0.6);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 0,
            y: 40,
            width: buildOpts.innerRect.width,
            height: buildOpts.stepSize,
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should clip collider at the bottom boundary of outerRect', () => {
          buildOpts.stepSize = 0.2 * innerRect.height;
          tick = createTick(0, 0.2);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 0,
            y: 0,
            width: buildOpts.innerRect.width,
            height: buildOpts.stepSize,
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should clip collider at the top boundary of outerRect', () => {
          buildOpts.stepSize = 0.2 * innerRect.height;
          tick = createTick(0.8, 1);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 0,
            y: 80,
            width: buildOpts.innerRect.width,
            height: 20,
          };

          expect(label.collider).to.deep.equal(expected);
        });
      });

      describe('align right', () => {
        beforeEach(() => {
          buildOpts.align = 'right';
        });

        it('should have a collider', () => {
          buildOpts.stepSize = 0.2 * innerRect.height;
          tick = createTick(0.4, 0.6);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 0,
            y: 40,
            width: buildOpts.innerRect.width,
            height: buildOpts.stepSize,
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should clip collider at the bottom boundary of outerRect', () => {
          buildOpts.stepSize = 0.2 * innerRect.height;
          tick = createTick(0, 0.2);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 0,
            y: 0,
            width: buildOpts.innerRect.width,
            height: buildOpts.stepSize,
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should clip collider at the top boundary of outerRect', () => {
          buildOpts.stepSize = 0.2 * innerRect.height;
          tick = createTick(0.8, 1);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 0,
            y: 80,
            width: buildOpts.innerRect.width,
            height: 20,
          };

          expect(label.collider).to.deep.equal(expected);
        });
      });

      describe('align top', () => {
        beforeEach(() => {
          buildOpts.align = 'top';
        });

        it('should have a collider for horizontal labels', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0.4, 0.6);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 20,
            y: 0,
            width: buildOpts.stepSize,
            height: buildOpts.innerRect.height,
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should have a collider for layered labels', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0.4, 0.6);
          buildOpts.layered = true;
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'polygon',
            vertices: [
              { x: 20, y: 89.25 },
              { x: 23, y: 89.25 },
              { x: 23, y: 90.25 },
              { x: 20, y: 90.25 },
            ],
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should have a collider for tilted labels', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0.4, 0.6);
          buildOpts.tilted = true;
          buildOpts.angle = 45;
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'polygon',
            vertices: [
              { x: 23.644712002725782, y: 86.6412427893639 },
              { x: 30.715779814591258, y: 93.71231060122938 },
              { x: 40.35702260395516, y: 90.25 },
              { x: 40.35702260395516, y: 89.25 },
            ],
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should have a collider for tilted labels with a negative angle', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0.4, 0.6);
          buildOpts.tilted = true;
          buildOpts.angle = -45;
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'polygon',
            vertices: [
              { x: 19.284220185408742, y: 93.71231060122938 },
              { x: 26.355287997274218, y: 86.6412427893639 },
              { x: 9.642977396044841, y: 89.25 },
              { x: 9.642977396044841, y: 90.25 },
            ],
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should clip collider at the bottom boundary of outerRect', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0, 0.2);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 0,
            y: 0,
            width: buildOpts.stepSize,
            height: buildOpts.innerRect.height,
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should clip collider at the top boundary of outerRect', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0.8, 1);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 40,
            y: 0,
            width: 10,
            height: buildOpts.innerRect.height,
          };

          expect(label.collider).to.deep.equal(expected);
        });
      });

      describe('align bottom', () => {
        beforeEach(() => {
          buildOpts.align = 'bottom';
        });

        it('should have a collider for horizontal labels', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0.4, 0.6);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 20,
            y: 0,
            width: buildOpts.stepSize,
            height: buildOpts.innerRect.height,
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should have a collider for layered labels', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0.4, 0.6);
          buildOpts.layered = true;
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'polygon',
            vertices: [
              { x: 20, y: 19.25 },
              { x: 23, y: 19.25 },
              { x: 23, y: 20.25 },
              { x: 20, y: 20.25 },
            ],
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should have a collider for tilted labels', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0.4, 0.6);
          buildOpts.tilted = true;
          buildOpts.angle = 45;
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'polygon',
            vertices: [
              { x: 25.53033008588991, y: 9.469669914110089 },
              { x: 32.60139789775538, y: 16.540737725975564 },
              { x: 15.535533905932738, y: 13.785533905932738 },
              { x: 15.535533905932738, y: 12.785533905932738 },
            ],
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should have a collider for tilted labels with a negative angle', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0.4, 0.6);
          buildOpts.tilted = true;
          buildOpts.angle = -45;
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'polygon',
            vertices: [
              { x: 17.398602102244613, y: 16.540737725975564 },
              { x: 24.46966991411009, y: 9.469669914110089 },
              { x: 34.46446609406726, y: 12.785533905932738 },
              { x: 34.46446609406726, y: 13.785533905932738 },
            ],
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should clip collider at the bottom boundary of outerRect', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0, 0.2);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 0,
            y: 0,
            width: buildOpts.stepSize,
            height: buildOpts.innerRect.height,
          };

          expect(label.collider).to.deep.equal(expected);
        });

        it('should clip collider at the top boundary of outerRect', () => {
          buildOpts.stepSize = 0.2 * innerRect.width;
          tick = createTick(0.8, 1);
          const label = buildLabel(tick, buildOpts);

          expected = {
            type: 'rect',
            x: 40,
            y: 0,
            width: 10,
            height: buildOpts.innerRect.height,
          };

          expect(label.collider).to.deep.equal(expected);
        });
      });
    });

    describe('Offset', () => {
      it('should set offset along y-axis', () => {
        buildOpts.align = 'right';
        buildOpts.style.offset = 1.337;

        expected.x = 10;
        expected.y = 51.337;
        expected.anchor = 'start';

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });

      it('should set offset along x-axis', () => {
        buildOpts.align = 'top';
        buildOpts.style.offset = 1.337;

        expected.x = 26.337;
        expected.y = 90;
        expected.anchor = 'middle';

        expect(buildLabel(tick, buildOpts)).to.deep.include(expected);
      });
    });
  });
});
