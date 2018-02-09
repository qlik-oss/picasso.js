import quadToPoints from '../../../../src/core/math/quad-bezier-curve-interpolation';

function approxEqual(ary, expected) {
  ary.forEach((item, i) => {
    Object.keys(expected[i]).forEach((key) => {
      expect(item[key]).to.approximately(expected[i][key], 0.001);
    });
  });
}

describe('Quad Bezier curve', () => {
  let p0;
  let p1;
  let p2;

  beforeEach(() => {
    p0 = { x: 0, y: 0 };
    p1 = { x: 0, y: 50 };
    p2 = { x: 50, y: 50 };
  });

  it('generate points on curve', () => {
    const pts = quadToPoints(p0, p1, p2);

    const exp = [
      { x: 0, y: 0 },
      { x: 3.125000000000001, y: 21.875 },
      { x: 12.500000000000002, y: 37.5 },
      { x: 28.125, y: 46.875 },
      { x: 50, y: 50 }
    ];

    approxEqual(pts, exp);
  });
});
