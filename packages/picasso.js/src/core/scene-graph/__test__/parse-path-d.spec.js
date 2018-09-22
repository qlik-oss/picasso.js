import pathToSegments from '../parse-path-d';

function approxEqual(ary, expected) {
  ary.forEach((item, i) => {
    Object.keys(expected[i]).forEach((key) => {
      expect(item[key]).to.approximately(expected[i][key], 0.001);
    });
  });
}

function pathToPoints(path) {
  return pathToSegments(path)[0];
}

describe('Parse data path', () => {
  let path;
  let ary;

  beforeEach(() => {
    path = '';
    ary = [];
  });

  describe('moveTo', () => {
    it('M', () => {
      path = 'M1 2';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 1, y: 2 }
      ]);
    });

    it('m', () => {
      path = 'm1 2';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 1, y: 2 }
      ]);
    });

    it('M - should split multiple commands into segments', () => {
      path = 'M1 2 L 3 4, M5 6 L7 8';
      ary = pathToSegments(path);
      expect(ary).to.deep.equal([
        [
          { x: 1, y: 2 },
          { x: 3, y: 4 }
        ],
        [
          { x: 5, y: 6 },
          { x: 7, y: 8 }
        ]
      ]);
    });

    it('m - should split multiple commands into segments', () => {
      path = 'm1 2 L 3 4, m5 6 L7 8';
      ary = pathToSegments(path);
      expect(ary).to.deep.equal([
        [
          { x: 1, y: 2 },
          { x: 3, y: 4 }
        ],
        [
          { x: 3 + 5, y: 4 + 6 },
          { x: 7, y: 8 }
        ]
      ]);
    });
  });

  describe('lineTo', () => {
    it('L', () => {
      path = 'M0 0 L1 2';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 0, y: 0 },
        { x: 1, y: 2 }
      ]);
    });

    it('l', () => {
      path = 'M1 2 l3 4';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 1, y: 2 },
        { x: 1 + 3, y: 2 + 4 }
      ]);
    });

    it('H', () => {
      path = 'M0 0 H1';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 0, y: 0 },
        { x: 1, y: 0 }
      ]);
    });

    it('h', () => {
      path = 'M1 0 h1';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 1, y: 0 },
        { x: 2, y: 0 }
      ]);
    });

    it('V', () => {
      path = 'M0 0 V1';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 0, y: 0 },
        { x: 0, y: 1 }
      ]);
    });

    it('v', () => {
      path = 'M0 1 v1';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 0, y: 1 },
        { x: 0, y: 2 }
      ]);
    });
  });

  describe('closePath', () => {
    it('Z', () => {
      path = 'M1 2 L3 4 Z';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 1, y: 2 }
      ]);
    });

    it('z', () => {
      path = 'M1 2 L3 4 z';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 1, y: 2 }
      ]);
    });
  });

  describe('elliptical arc curve', () => {
    it('A', () => {
      path = 'M 0 0 A10 10 0 0 0 10 10';
      ary = pathToPoints(path);
      expect(ary[0]).to.deep.equal({ x: 0, y: 0 });
      expect(ary[1].x).to.approximately(3.42, 0.01);
      expect(ary[1].y).to.approximately(6.57, 0.01);
      expect(ary[2]).to.deep.equal({ x: 10, y: 10 });
    });

    it('a', () => {
      path = 'M 0 0 a10 10 0 0 0 10 10';
      ary = pathToPoints(path);
      expect(ary[0]).to.deep.equal({ x: 0, y: 0 });
      expect(ary[1].x).to.approximately(3.42, 0.01);
      expect(ary[1].y).to.approximately(6.57, 0.01);
      expect(ary[2]).to.deep.equal({ x: 10, y: 10 });
    });

    it('given no radius, threat as lineTo command', () => {
      path = 'M 0 0 A0 10 0 0 0 10 10';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ]);
    });

    it('ignore command if arc end at start at the same position', () => {
      path = 'M10 10 A0 10 0 0 0 10 10';
      ary = pathToPoints(path);
      expect(ary).to.deep.equal([
        { x: 10, y: 10 } // moveTo command
      ]);
    });
  });

  describe('cubic bézier curve', () => {
    it('C', () => {
      path = 'M0 0, C0 100, 100 100, 100 0';

      ary = pathToPoints(path);

      const exp = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 4.296875, y: 32.8125 },
        { x: 15.625, y: 56.25 },
        { x: 31.640625, y: 70.3125 },
        { x: 50, y: 75 },
        { x: 68.359375, y: 70.3125 },
        { x: 84.375, y: 56.25 },
        { x: 95.703125, y: 32.8125 },
        { x: 100, y: 0 }
      ];

      approxEqual(ary, exp);
    });

    it('c', () => {
      path = 'M100 100, c0 100, 100 100, 100 0';

      ary = pathToPoints(path);

      const exp = [
        { x: 100, y: 100 },
        { x: 100, y: 100 },
        { x: 104.296875, y: 132.8125 },
        { x: 115.625, y: 156.25 },
        { x: 131.640625, y: 170.3125 },
        { x: 150, y: 175 },
        { x: 168.359375, y: 170.3125 },
        { x: 184.375, y: 156.25 },
        { x: 195.703125, y: 132.8125 },
        { x: 200, y: 100 }
      ];

      approxEqual(ary, exp);
    });

    it('S - with previous cubic command', () => {
      path = 'M0 0, C0 100, 100 100, 100 0, S200 -100, 200 0';

      ary = pathToPoints(path).slice(-9);

      const exp = [
        { x: 100, y: 0 },
        { x: 104.296875, y: -32.8125 },
        { x: 115.625, y: -56.25 },
        { x: 131.640625, y: -70.3125 },
        { x: 150, y: -75 },
        { x: 168.359375, y: -70.3125 },
        { x: 184.375, y: -56.25 },
        { x: 195.703125, y: -32.8125 },
        { x: 200, y: 0 }
      ];

      approxEqual(ary, exp); // Only validate the S points
    });

    it('S - without previous cubic command', () => {
      path = 'M0 0 S100 100, 200 0';

      ary = pathToPoints(path);

      const exp = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 4.4921875, y: 4.1015625 },
        { x: 17.1875, y: 14.0625 },
        { x: 36.9140625, y: 26.3671875 },
        { x: 62.5, y: 37.5 },
        { x: 92.7734375, y: 43.9453125 },
        { x: 126.5625, y: 42.1875 },
        { x: 162.6953125, y: 28.7109375 },
        { x: 200, y: 0 }
      ];

      approxEqual(ary, exp);
    });

    it('s - with previous cubic command', () => {
      path = 'M0 0, c0 100, 100 100, 100 0, s100 -100, 100 0';

      ary = pathToPoints(path).slice(-9);

      const exp = [
        { x: 100, y: 0 },
        { x: 104.296875, y: -32.8125 },
        { x: 115.625, y: -56.25 },
        { x: 131.640625, y: -70.3125 },
        { x: 150, y: -75 },
        { x: 168.359375, y: -70.3125 },
        { x: 184.375, y: -56.25 },
        { x: 195.703125, y: -32.8125 },
        { x: 200, y: 0 }
      ];

      approxEqual(ary, exp); // Only validate the S points
    });

    it('s - without previous cubic command', () => {
      path = 'M0 0 s100 100, 200 0';

      ary = pathToPoints(path);
      const exp = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 4.4921875, y: 4.1015625 },
        { x: 17.1875, y: 14.0625 },
        { x: 36.9140625, y: 26.3671875 },
        { x: 62.5, y: 37.5 },
        { x: 92.7734375, y: 43.9453125 },
        { x: 126.5625, y: 42.1875 },
        { x: 162.6953125, y: 28.7109375 },
        { x: 200, y: 0 }
      ];

      approxEqual(ary, exp);
    });
  });

  describe('quad bézier curve', () => {
    it('Q', () => {
      path = 'M0 0, Q0 100, 100 100';

      ary = pathToPoints(path);
      const exp = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 6.250000000000002, y: 43.75 },
        { x: 25.000000000000004, y: 75 },
        { x: 56.25, y: 93.75 },
        { x: 100, y: 100 }
      ];

      approxEqual(ary, exp);
    });

    it('q', () => {
      path = 'M0 0, q0 100, 100 100';

      ary = pathToPoints(path);
      const exp = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 6.250000000000002, y: 43.75 },
        { x: 25.000000000000004, y: 75 },
        { x: 56.25, y: 93.75 },
        { x: 100, y: 100 }
      ];

      approxEqual(ary, exp);
    });

    it('T - with previous quad command', () => {
      path = 'M0 0, Q0 100, 100 100 T200 200';

      ary = pathToPoints(path).slice(-5);

      const exp = [
        { x: 100, y: 100 },
        { x: 143.75, y: 106.25 },
        { x: 175, y: 125 },
        { x: 193.75, y: 156.25 },
        { x: 200, y: 200 }
      ];

      approxEqual(ary, exp);
    });

    it('T - without previous quad command', () => {
      path = 'M0 0, T100 100';

      ary = pathToPoints(path);
      const exp = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 6.250000000000002, y: 6.250000000000002 },
        { x: 25.000000000000004, y: 25.000000000000004 },
        { x: 56.25, y: 56.25 },
        { x: 100, y: 100 }
      ];

      approxEqual(ary, exp);
    });

    it('t - with previous quad command', () => {
      path = 'M0 0, q0 100, 100 100 t100 100';

      ary = pathToPoints(path).slice(-5);
      const exp = [
        { x: 100, y: 100 },
        { x: 143.75, y: 106.25 },
        { x: 175, y: 125 },
        { x: 193.75, y: 156.25 },
        { x: 200, y: 200 }
      ];

      approxEqual(ary, exp);
    });

    it('t - without previous quad command', () => {
      path = 'M0 0, t100 100';

      ary = pathToPoints(path);
      const exp = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 6.250000000000002, y: 6.250000000000002 },
        { x: 25.000000000000004, y: 25.000000000000004 },
        { x: 56.25, y: 56.25 },
        { x: 100, y: 100 }
      ];

      approxEqual(ary, exp);
    });
  });
});
