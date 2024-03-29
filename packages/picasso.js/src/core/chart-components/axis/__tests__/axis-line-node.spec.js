import buildLine from '../axis-line-node';

describe('Axis Line Node', () => {
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

  describe('Line', () => {
    let buildOpts, expected;

    beforeEach(() => {
      innerRect.width = 50;
      innerRect.height = 100;
      innerRect.x = 0;
      innerRect.y = 0;
      outerRect.width = 50;
      outerRect.height = 100;
      outerRect.x = 0;
      outerRect.y = 0;
      buildOpts = {
        style: { stroke: 'red', strokeWidth: 1 },
        align: 'bottom',
        innerRect,
        outerRect,
        padding: 10,
      };
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
      };
    });

    it('Left align', () => {
      buildOpts.align = 'left';
      expected.x1 = innerRect.width - buildOpts.padding;
      expected.x2 = innerRect.width - buildOpts.padding;
      expected.y2 = 100;
      expect(buildLine(buildOpts)).to.deep.equal(expected);
    });

    it('Right align', () => {
      buildOpts.align = 'right';
      expected.x1 = buildOpts.padding;
      expected.x2 = buildOpts.padding;
      expected.y2 = 100;
      expect(buildLine(buildOpts)).to.deep.equal(expected);
    });

    it('Top align', () => {
      buildOpts.align = 'top';
      expected.x2 = 50;
      expected.y1 = innerRect.height - buildOpts.padding;
      expected.y2 = innerRect.height - buildOpts.padding;
      expect(buildLine(buildOpts)).to.deep.equal(expected);
    });

    it('Bottom align', () => {
      buildOpts.align = 'bottom';
      expected.x2 = 50;
      expected.y1 = buildOpts.padding;
      expected.y2 = buildOpts.padding;
      expect(buildLine(buildOpts)).to.deep.equal(expected);
    });

    describe('Within an offset container', () => {
      it('Left align', () => {
        buildOpts.align = 'left';
        innerRect.y = 125;
        outerRect.y = 100;
        expected.x1 = innerRect.width - buildOpts.padding;
        expected.x2 = innerRect.width - buildOpts.padding;
        expected.y1 = 25;
        expected.y2 = 125;
        expect(buildLine(buildOpts)).to.deep.equal(expected);
      });

      it('Right align', () => {
        buildOpts.align = 'right';
        innerRect.y = 125;
        outerRect.y = 100;
        expected.x1 = buildOpts.padding;
        expected.x2 = buildOpts.padding;
        expected.y1 = 25;
        expected.y2 = 125;
        expect(buildLine(buildOpts)).to.deep.equal(expected);
      });

      it('Top align', () => {
        buildOpts.align = 'top';
        innerRect.x = 125;
        outerRect.x = 100;
        expected.x1 = 25;
        expected.x2 = 75;
        expected.y1 = innerRect.height - buildOpts.padding;
        expected.y2 = innerRect.height - buildOpts.padding;
        expect(buildLine(buildOpts)).to.deep.equal(expected);
      });

      it('Bottom align', () => {
        buildOpts.align = 'bottom';
        innerRect.x = 125;
        outerRect.x = 100;
        expected.x1 = 25;
        expected.x2 = 75;
        expected.y1 = buildOpts.padding;
        expected.y2 = buildOpts.padding;
        expect(buildLine(buildOpts)).to.deep.equal(expected);
      });
    });
  });
});
