import polylineToPolygonCollider from '../polyline-to-polygon-collider';

describe('polygon to polygon collider', () => {
  let points;
  let radius;
  let opts;

  beforeEach(() => {
    radius = 10;
    opts = {};
  });

  it('should handle empty array of points', () => {
    points = [];

    const out = polylineToPolygonCollider(points, radius, opts);

    expect(out).to.eql({
      type: 'polygon',
      vertices: [],
    });
  });

  it('should ignore array if it contains less than 3 points', () => {
    points = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];

    const out = polylineToPolygonCollider(points, radius, opts);

    expect(out).to.eql({
      type: 'polygon',
      vertices: [],
    });
  });

  it('left to right line', () => {
    /**
     * o-----o---->o
     */
    points = [
      { x: 10, y: 10 },
      { x: 20, y: 10 },
      { x: 30, y: 10 },
    ];

    const expected = [
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 0 },
      { x: 30, y: 20 },
      { x: 20, y: 20 },
      { x: 10, y: 20 },
    ];

    const out = polylineToPolygonCollider(points, radius, opts);

    out.vertices.forEach((p, i) => {
      Object.keys(p).forEach((coord) => {
        expect(p[coord]).to.approximately(expected[i][coord], 0.0001);
      });
    });
  });

  it('left to right line with forceOrientation', () => {
    /**
     * o-----o---->o
     */
    points = [
      { x: 10, y: 10 },
      { x: 20, y: 10 },
      { x: 30, y: 10 },
    ];

    opts = {
      forceOrientation: 'h',
    };

    const expected = [
      { x: 9, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 0 },
      { x: 31, y: 0 },
      { x: 31, y: 20 },
      { x: 30, y: 20 },
      { x: 20, y: 20 },
      { x: 10, y: 20 },
      { x: 9, y: 20 },
    ];

    const out = polylineToPolygonCollider(points, radius, opts);

    out.vertices.forEach((p, i) => {
      Object.keys(p).forEach((coord) => {
        expect(p[coord]).to.approximately(expected[i][coord], 0.0001);
      });
    });
  });

  it('right to left line', () => {
    /**
     * o<----o-----o
     */
    points = [
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: -10, y: 10 },
    ];

    const expected = [
      { x: 10, y: 20 },
      { x: 0, y: 20 },
      { x: -10, y: 20 },
      { x: -10, y: 0 },
      { x: -0, y: 0 },
      { x: 10, y: 0 },
    ];

    const out = polylineToPolygonCollider(points, radius, opts);

    out.vertices.forEach((p, i) => {
      Object.keys(p).forEach((coord) => {
        expect(p[coord]).to.approximately(expected[i][coord], 0.0001);
      });
    });
  });

  it('right to left line with forceOrientation', () => {
    /**
     * o<----o-----o
     */
    points = [
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: -10, y: 10 },
    ];

    opts = {
      forceOrientation: 'h',
    };

    const expected = [
      { x: 11, y: 20 },
      { x: 10, y: 20 },
      { x: 0, y: 20 },
      { x: -10, y: 20 },
      { x: -11, y: 20 },
      { x: -11, y: 0 },
      { x: -10, y: 0 },
      { x: -0, y: 0 },
      { x: 10, y: 0 },
      { x: 11, y: 0 },
    ];

    const out = polylineToPolygonCollider(points, radius, opts);

    out.vertices.forEach((p, i) => {
      Object.keys(p).forEach((coord) => {
        expect(p[coord]).to.approximately(expected[i][coord], 0.0001);
      });
    });
  });

  it('top to bottom line', () => {
    points = [
      { x: 10, y: 10 },
      { x: 10, y: 20 },
      { x: 10, y: 30 },
    ];

    const expected = [
      { x: 20, y: 10 },
      { x: 20, y: 20 },
      { x: 20, y: 30 },
      { x: 0, y: 30 },
      { x: 0, y: 20 },
      { x: 0, y: 10 },
    ];

    const out = polylineToPolygonCollider(points, radius, opts);

    out.vertices.forEach((p, i) => {
      Object.keys(p).forEach((coord) => {
        expect(p[coord]).to.approximately(expected[i][coord], 0.0001);
      });
    });
  });

  it('top to bottom line with forceOrientation', () => {
    points = [
      { x: 10, y: 10 },
      { x: 10, y: 20 },
      { x: 10, y: 30 },
    ];

    opts = {
      forceOrientation: 'v',
    };

    const expected = [
      { x: 20, y: 9 },
      { x: 20, y: 10 },
      { x: 20, y: 20 },
      { x: 20, y: 30 },
      { x: 20, y: 31 },
      { x: 0, y: 31 },
      { x: 0, y: 30 },
      { x: 0, y: 20 },
      { x: 0, y: 10 },
      { x: 0, y: 9 },
    ];

    const out = polylineToPolygonCollider(points, radius, opts);

    out.vertices.forEach((p, i) => {
      Object.keys(p).forEach((coord) => {
        expect(p[coord]).to.approximately(expected[i][coord], 0.01);
      });
    });
  });

  it('bottom to top line', () => {
    points = [
      { x: 10, y: 10 },
      { x: 10, y: 0 },
      { x: 10, y: -10 },
    ];

    const expected = [
      { x: 0, y: 10 },
      { x: 0, y: 0 },
      { x: 0, y: -10 },
      { x: 20, y: -10 },
      { x: 20, y: -0 },
      { x: 20, y: 10 },
    ];

    const out = polylineToPolygonCollider(points, radius, opts);

    out.vertices.forEach((p, i) => {
      Object.keys(p).forEach((coord) => {
        expect(p[coord]).to.approximately(expected[i][coord], 0.0001);
      });
    });
  });

  it('bottom to top line with forceOrientation', () => {
    points = [
      { x: 10, y: 10 },
      { x: 10, y: 0 },
      { x: 10, y: -10 },
    ];

    opts = {
      forceOrientation: 'v',
    };

    const expected = [
      { x: 0, y: 11 },
      { x: 0, y: 10 },
      { x: 0, y: 0 },
      { x: 0, y: -10 },
      { x: 0, y: -11 },
      { x: 20, y: -11 },
      { x: 20, y: -10 },
      { x: 20, y: -0 },
      { x: 20, y: 10 },
      { x: 20, y: 11 },
    ];

    const out = polylineToPolygonCollider(points, radius, opts);

    out.vertices.forEach((p, i) => {
      Object.keys(p).forEach((coord) => {
        expect(p[coord]).to.approximately(expected[i][coord], 0.001);
      });
    });
  });

  it('turn around vertical line', () => {
    points = [
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 10, y: 10 },
      { x: 10, y: 0 },
    ];

    const expected = [
      { x: 10, y: 0 },
      { x: 7.07, y: 2.929 },
      { x: 2.929, y: 2.929 },
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 17.071, y: 17.071 },
      { x: -7.071, y: 17.071 },
      { x: -10, y: 0 },
    ];

    const out = polylineToPolygonCollider(points, radius, opts);

    out.vertices.forEach((p, i) => {
      Object.keys(p).forEach((coord) => {
        expect(p[coord]).to.approximately(expected[i][coord], 0.01);
      });
    });
  });

  it('turn around hoprizontal line', () => {
    points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];

    const expected = [
      { x: 0, y: -10 },
      { x: 17.071, y: -7.071 },
      { x: 17.071, y: 17.071 },
      { x: 0, y: 20 },
      { x: 0, y: 0 },
      { x: 2.929, y: 2.929 },
      { x: 2.929, y: 7.071 },
      { x: 0, y: 10 },
    ];

    const out = polylineToPolygonCollider(points, radius, opts);

    out.vertices.forEach((p, i) => {
      Object.keys(p).forEach((coord) => {
        expect(p[coord]).to.approximately(expected[i][coord], 0.01);
      });
    });
  });
});
