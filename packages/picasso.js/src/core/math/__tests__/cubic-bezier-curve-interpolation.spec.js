import cubicToPoints from '../cubic-bezier-curve-interpolation';

function approxEqual(ary, expected) {
  ary.forEach((item, i) => {
    Object.keys(expected[i]).forEach((key) => {
      expect(item[key]).to.approximately(expected[i][key], 0.001);
    });
  });
}

describe('Cubic Bezier curve', () => {
  let p0;
  let p1;
  let p2;
  let p3;

  beforeEach(() => {
    p0 = { x: 0, y: 0 };
    p1 = { x: 0, y: 50 };
    p2 = { x: 50, y: 50 };
    p3 = { x: 50, y: 0 };
  });

  it('generate points on curve', () => {
    const pts = cubicToPoints(p0, p1, p2, p3);

    const exp = [
      { x: 0, y: 0 },
      { x: 2.1484375, y: 16.40625 },
      { x: 7.8125, y: 28.125 },
      { x: 25, y: 37.5 },
      { x: 42.1875, y: 28.125 },
      { x: 47.8515625, y: 16.40625 },
      { x: 50, y: 0 },
    ];

    approxEqual(pts, exp);
  });

  it('should split curve a maximum amount of times', () => {
    const m = 1e13; // Trigger max nbr of points by using a very large curve
    p2.x *= m;
    p2.y *= m;
    p3.x *= m;
    const pts = cubicToPoints(p0, p1, p2, p3);

    expect(pts).to.be.of.length(257);
  });
});
