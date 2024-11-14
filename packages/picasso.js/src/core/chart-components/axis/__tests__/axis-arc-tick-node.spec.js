import buildArcTicks from '../axis-arc-tick-node';

function createTick(position, value) {
  return {
    position,
    value, // just some dummy value to test node value for tracking animation
  };
}

describe('Axis Arc Tick Node', () => {
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
  describe('Tick', () => {
    let buildOpts, tick, tickValue;
    beforeEach(() => {
      innerRect.width = 400;
      innerRect.height = 417;
      innerRect.x = 0;
      innerRect.y = 417;
      outerRect.width = 400;
      outerRect.height = 417;
      outerRect.x = 0;
      outerRect.y = 0;
      buildOpts = {
        align: 'top',
        radius: 0.85,
        startAngle: (-2 * Math.PI) / 3,
        endAngle: (2 * Math.PI) / 3,
        innerRect,
        outerRect,
        padding: 2.5,
        paddingEnd: 10,
        stepSize: 0,
        style: {
          fontFamily: "'Source Sans Pro', Arial, sans-serif",
          fontSize: '12px',
          margin: 2,
          strokeWidth: 1,
          stroke: '#cdcdcd',
          tickSize: 6,
        },
        tickSize: 6,
      };
    });
    it('Start Tick', () => {
      tickValue = 0;
      tick = createTick(1, tickValue);
      const result = buildArcTicks(tick, buildOpts);
      expect(result.x1).to.be.closeTo(45, 1);
      expect(result.x2).to.be.closeTo(51, 1);
      expect(result.y1).to.be.closeTo(298, 1);
      expect(result.y2).to.be.closeTo(295, 1);
      expect(result.value).to.equal(tickValue);
    });
    it('End Tick', () => {
      tickValue = 500;
      tick = createTick(0, tickValue);
      const result = buildArcTicks(tick, buildOpts);
      expect(result.x1).to.be.closeTo(355, 1);
      expect(result.x2).to.be.closeTo(349, 1);
      expect(result.y1).to.be.closeTo(298, 1);
      expect(result.y2).to.be.closeTo(295, 1);
      expect(result.value).to.equal(tickValue);
    });
    it('Middle Tick', () => {
      tickValue = 250;
      tick = createTick(0.5, tickValue);
      buildOpts.innerRect = { width: 232, height: 390 };
      const result = buildArcTicks(tick, buildOpts);
      expect(result.x1).to.be.closeTo(115.5, 1);
      expect(result.x2).to.be.closeTo(115.5, 1);
      expect(result.y1).to.be.closeTo(87.5, 1);
      expect(result.y2).to.be.closeTo(93.5, 1);
      expect(result.value).to.equal(tickValue);
    });
  });
});
