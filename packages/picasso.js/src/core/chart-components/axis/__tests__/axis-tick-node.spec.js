import buildTick from '../axis-tick-node';

describe('Axis Tick Node', () => {
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

  describe('Tick', () => {
    let buildOpts, tick, expected;

    beforeEach(() => {
      buildOpts = {
        style: { strokeWidth: 1, stroke: 'red' },
        tickSize: 5,
        align: 'bottom',
        padding: 10,
        innerRect,
        outerRect,
      };
      tick = { position: 0.5, label: 'tick-label' };
      expected = {
        type: 'line',
        strokeWidth: 1,
        stroke: 'red',
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
        collider: {
          type: null,
        },
        tickLabel: 'tick-label',
      };
    });

    describe('Left align', () => {
      beforeEach(() => {
        buildOpts.align = 'left';
        expected.x1 = innerRect.width - buildOpts.padding;
        expected.x2 = innerRect.width - buildOpts.padding - buildOpts.tickSize;
      });

      it('middle tick', () => {
        expected.y1 = 50;
        expected.y2 = 50;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });

      it('start tick', () => {
        tick.position = 0;
        expected.y1 = 0.5;
        expected.y2 = 0.5;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });

      it('end tick', () => {
        tick.position = 1;
        expected.y1 = 99.5;
        expected.y2 = 99.5;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });
    });

    describe('Right align', () => {
      beforeEach(() => {
        buildOpts.align = 'right';
        expected.x1 = buildOpts.padding;
        expected.x2 = buildOpts.padding + buildOpts.tickSize;
      });

      it('middle tick', () => {
        expected.y1 = 50;
        expected.y2 = 50;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });

      it('start tick', () => {
        tick.position = 0;
        expected.y1 = 0.5;
        expected.y2 = 0.5;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });

      it('end tick', () => {
        tick.position = 1;
        expected.y1 = 99.5;
        expected.y2 = 99.5;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });
    });

    describe('Top align', () => {
      beforeEach(() => {
        buildOpts.align = 'top';
        expected.y1 = innerRect.height - buildOpts.padding;
        expected.y2 = innerRect.height - buildOpts.padding - buildOpts.tickSize;
      });

      it('middle tick', () => {
        expected.x1 = 25;
        expected.x2 = 25;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });

      it('start tick', () => {
        tick.position = 0;
        expected.x1 = 0.5;
        expected.x2 = 0.5;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });

      it('end tick', () => {
        tick.position = 1;
        expected.x1 = 49.5;
        expected.x2 = 49.5;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });
    });

    describe('Bottom align', () => {
      beforeEach(() => {
        buildOpts.align = 'bottom';
        expected.y1 = buildOpts.padding;
        expected.y2 = buildOpts.padding + buildOpts.tickSize;
      });

      it('middle tick', () => {
        expected.x1 = 25;
        expected.x2 = 25;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });

      it('start tick', () => {
        tick.position = 0;
        expected.x1 = 0.5;
        expected.x2 = 0.5;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });

      it('end tick', () => {
        tick.position = 1;
        expected.x1 = 49.5;
        expected.x2 = 49.5;
        expect(buildTick(tick, buildOpts)).to.deep.equal(expected);
      });
    });
  });
});
