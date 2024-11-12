import buildArcLine from '../axis-arc-node';

describe('Axis Arc Line Node', () => {
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

  describe('Arc', () => {
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
        startAngle: -Math.PI / 3,
        endAngle: Math.PI / 3,
        radius: 0.5,
      };
      expected = {
        visible: true,
        type: 'path',
        arcDatum: { startAngle: 0, endAngle: 0 },
        transform: `translate(0, 0) translate(${0}, ${0})`,
        desc: {
          share: 1,
          slice: {
            cornerRadius: 0,
            innerRadius: 0,
            outerRadius: 0,
          },
        },
        stroke: 'red',
        strokeWidth: 1,
        ticks: [],
      };
    });

    it('Structure Properties', () => {
      const rect = buildOpts.innerRect;
      const centerPoint = { cx: rect.width / 2, cy: rect.height / 2 };
      const plotSize = Math.min(rect.height, rect.width) / 2;
      expected.transform = `translate(0, 0) translate(${centerPoint.cx}, ${centerPoint.cy})`;
      expected.arcDatum.startAngle = buildOpts.startAngle;
      expected.arcDatum.endAngle = buildOpts.endAngle;
      expected.desc.slice.innerRadius = buildOpts.radius * plotSize;
      expected.desc.slice.outerRadius = buildOpts.radius * plotSize + buildOpts.style.strokeWidth;
      expect(buildArcLine(buildOpts)).to.deep.equal(expected);
    });
  });
});
