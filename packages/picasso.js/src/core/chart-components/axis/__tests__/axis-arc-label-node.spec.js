import { textBounds } from '../../../../web/text-manipulation';
import buildArcLabels from '../axis-arc-label-node';

function createTick(position, label) {
  return {
    position,
    label,
    value: 1.23, // just some dummy value to test node value for tracking animation
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
  const textRect = { height: 16, width: 18 };
  const measureTextMock = ({ text }) => ({ width: text.length, height: 1 });

  beforeEach(() => {
    innerRect.width = 400;
    innerRect.height = 425;
    innerRect.x = 0;
    innerRect.y = 425;
    outerRect.width = 400;
    outerRect.height = 425;
    outerRect.x = 0;
    outerRect.y = 0;
  });

  describe('Label', () => {
    let buildOpts, tick;

    beforeEach(() => {
      buildOpts = {
        align: 'top',
        radius: 0.85,
        startAngle: (-2 * Math.PI) / 3,
        endAngle: (2 * Math.PI) / 3,
        innerRect,
        outerRect,
        padding: 3.5,
        paddingEnd: 10,
        stepSize: 0,
        style: {
          align: 0.5,
          fontFamily: 'Arial',
          fontSize: '12px',
          margin: -5,
        },
        textBounds: (node) => textBounds(node, measureTextMock),
        textRect,
        tickSize: 6,
      };
      tick = createTick(0);
    });

    describe('Style align', () => {
      it('start on left side of tick', () => {
        buildOpts.align = 'top';
        tick = createTick(1, '0');
        const result = buildArcLabels(tick, buildOpts);
        expect(result.x).to.be.closeTo(40, 2);
        expect(result.y).to.be.closeTo(305, 2);
        expect(result.anchor).to.equal('end');
      });

      it('start on left side of tick', () => {
        buildOpts.align = 'top';
        tick = createTick(0.7, '100');
        const result = buildArcLabels(tick, buildOpts);
        expect(result.x).to.be.closeTo(62, 2);
        expect(result.y).to.be.closeTo(88, 2);
        expect(result.anchor).to.equal('end');
      });

      it('start on right side of tick', () => {
        buildOpts.align = 'top';
        tick = createTick(0.4, '250');
        const result = buildArcLabels(tick, buildOpts);
        expect(result.x).to.be.closeTo(275, 2);
        expect(result.y).to.be.closeTo(43, 2);
        expect(result.anchor).to.equal('start');
      });
      it('the label should be centered on the tick', () => {
        buildOpts.align = 'top';
        buildOpts.innerRect = { width: 213, height: 595 };
        tick = createTick(0.5, '300');
        const result = buildArcLabels(tick, buildOpts);
        console.log(result);
        expect(result.x).to.be.closeTo(106.5, 2);
        expect(result.y).to.be.closeTo(191, 2);
        expect(result.anchor).to.equal('middle');
      });
    });

    describe('Not text in tick label', () => {
      it('tick.label is undefined', () => {
        buildOpts.align = 'top';
        tick = createTick(0, undefined);
        const result = buildArcLabels(tick, buildOpts);
        expect(result.text).to.equal('-');
      });
    });
  });
});
