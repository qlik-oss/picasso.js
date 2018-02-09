import GeoRect from '../../../../src/core/geometry/rect';

describe('GeoRect', () => {
  describe('constructor', () => {
    it('should set correct default values when no arguments passed', () => {
      const r = new GeoRect();

      expect(r.x).to.equal(0);
      expect(r.y).to.equal(0);
      expect(r.width).to.equal(0);
      expect(r.height).to.equal(0);
    });

    it('should set the correct values when arguments passed', () => {
      const r = new GeoRect({ x: 10, y: 20, width: 100, height: 50 });

      expect(r.x).to.equal(10);
      expect(r.y).to.equal(20);
      expect(r.width).to.equal(100);
      expect(r.height).to.equal(50);
    });

    it('should handle negative width correctly', () => {
      const r = new GeoRect({ x: 10, y: 20, width: -100, height: 50 });

      expect(r.x).to.equal(-90);
      expect(r.y).to.equal(20);
      expect(r.width).to.equal(100);
      expect(r.height).to.equal(50);
    });

    it('should handle negative height correctly', () => {
      const r = new GeoRect({ x: 10, y: 20, width: 100, height: -50 });

      expect(r.x).to.equal(10);
      expect(r.y).to.equal(-30);
      expect(r.width).to.equal(100);
      expect(r.height).to.equal(50);
    });
  });

  describe('set', () => {
    it('should set the correct values', () => {
      const r = new GeoRect();
      r.set({ x: 10, y: 20, width: 100, height: 50 });

      expect(r.x).to.equal(10);
      expect(r.y).to.equal(20);
      expect(r.width).to.equal(100);
      expect(r.height).to.equal(50);
    });

    it('should handle negative width correctly', () => {
      const r = new GeoRect();
      r.set({ x: 10, y: 20, width: -100, height: 50 });

      expect(r.x).to.equal(-90);
      expect(r.y).to.equal(20);
      expect(r.width).to.equal(100);
      expect(r.height).to.equal(50);
    });

    it('should handle negative height correctly', () => {
      const r = new GeoRect();
      r.set({ x: 10, y: 20, width: 100, height: -50 });

      expect(r.x).to.equal(10);
      expect(r.y).to.equal(-30);
      expect(r.width).to.equal(100);
      expect(r.height).to.equal(50);
    });

    it('should handle no arguments', () => {
      const r = new GeoRect({ x: 1, y: 2, width: 3, height: 4 });
      r.set();

      expect(r.x).to.equal(0);
      expect(r.y).to.equal(0);
      expect(r.width).to.equal(0);
      expect(r.height).to.equal(0);
    });
  });

  describe('points', () => {
    it('should return the correct points', () => {
      const r = new GeoRect({ x: 10, y: 20, width: 100, height: 50 });
      const points = r.points();

      expect(points.length).to.equal(4);
      expect(points[0]).to.deep.equal({ x: 10, y: 20 });
      expect(points[1]).to.deep.equal({ x: 110, y: 20 });
      expect(points[2]).to.deep.equal({ x: 110, y: 70 });
      expect(points[3]).to.deep.equal({ x: 10, y: 70 });
    });
  });

  describe('Intersection', () => {
    describe('Point', () => {
      it('should intersect if point is within the circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const p = { x: 100, y: 200 };
        expect(r.containsPoint(p)).to.equal(true);
      });

      it('should intersect if point is on the circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const p = { x: 50, y: 100 };
        expect(r.containsPoint(p)).to.equal(true);
      });

      it('should not intersect if point is outside the circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const p1 = { x: 49, y: 100 };
        const p2 = { x: 50, y: 99 };
        const p3 = { x: 201, y: 300 };
        const p4 = { x: 200, y: 301 };

        expect(r.containsPoint(p1)).to.equal(false);
        expect(r.containsPoint(p2)).to.equal(false);
        expect(r.containsPoint(p3)).to.equal(false);
        expect(r.containsPoint(p4)).to.equal(false);
      });

      it('should not intersect if the width is zero', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 0, height: 200 });
        const p = { x: 50, y: 100 };
        expect(r.containsPoint(p)).to.equal(false);
      });

      it('should not intersect if the height is zero', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 0 });
        const p = { x: 50, y: 100 };
        expect(r.containsPoint(p)).to.equal(false);
      });
    });

    describe('Rect', () => {
      it('should intersect if circumferences are crossing', () => {
        const r = new GeoRect({ x: 100, y: 200, width: 300, height: 400 });
        const collider = new GeoRect({ x: 150, y: 250, width: 300, height: 400 });
        expect(r.intersectsRect(collider.points())).to.equal(true);
      });

      it('should intersect if circumferences are touching', () => {
        const r = new GeoRect({ x: 100, y: 200, width: 300, height: 400 });
        const collider = new GeoRect({ x: 400, y: 600, width: 300, height: 400 });
        expect(r.intersectsRect(collider.points())).to.equal(true);
      });

      it('should intersect if target rect is contained within the circumference', () => {
        const r = new GeoRect({ x: 100, y: 200, width: 300, height: 400 });
        const collider = new GeoRect({ x: 150, y: 250, width: 50, height: 100 });
        expect(r.intersectsRect(collider.points())).to.equal(true);
      });

      it('should not intersect if circumferences are not crossing', () => {
        const r = new GeoRect({ x: 100, y: 200, width: 300, height: 400 });
        const collider = new GeoRect({ x: 401, y: 601, width: 100, height: 200 });
        expect(r.intersectsRect(collider.points())).to.equal(false);
      });

      it('should not intersect if the width is zero', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 0, height: 200 });
        const collider = new GeoRect({ x: 50, y: 100, width: 100, height: 200 });
        expect(r.intersectsRect(collider.points())).to.equal(false);
      });

      it('should not intersect if the height is zero', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 0 });
        const collider = new GeoRect({ x: 50, y: 100, width: 100, height: 200 });
        expect(r.intersectsRect(collider.points())).to.equal(false);
      });
    });

    describe('Line', () => {
      it('should intersect if a parrallel vertical line is crossing the circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const points = [{ x: 70, y: 0 }, { x: 70, y: 400 }];

        expect(r.intersectsLine(points)).to.equal(true);
      });

      it('should intersect if a parrallel horizontal line is crossing the circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const points = [{ x: 0, y: 250 }, { x: 250, y: 250 }];

        expect(r.intersectsLine(points)).to.equal(true);
      });

      it('should intersect if diagonal line is crossing the circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const points = [{ x: 0, y: 0 }, { x: 250, y: 400 }];

        expect(r.intersectsLine(points)).to.equal(true);
      });

      it('should intersect if line is inside the circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const points = [{ x: 100, y: 250 }, { x: 150, y: 250 }];

        expect(r.intersectsLine(points)).to.equal(true);
      });

      it('should intersect if a line point is inside the circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const points1 = [{ x: 100, y: 250 }, { x: 250, y: 250 }];
        const points2 = [{ x: 0, y: 250 }, { x: 150, y: 250 }];

        expect(r.intersectsLine(points1)).to.equal(true);
        expect(r.intersectsLine(points2)).to.equal(true);
      });

      it('should intersect if a line is on the circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const points = [{ x: 50, y: 100 }, { x: 200, y: 100 }];

        expect(r.intersectsLine(points)).to.equal(true);
      });

      it('should intersect if a line start point is on the circumference and points outwards', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const points = [{ x: 50, y: 100 }, { x: 0, y: 0 }];

        expect(r.intersectsLine(points)).to.equal(true);
      });

      it('should intersect if a line end point is on the circumference and points outwards', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const points = [{ x: 0, y: 0 }, { x: 50, y: 100 }];

        expect(r.intersectsLine(points)).to.equal(true);
      });

      it('should not intersect if the width is zero', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 0, height: 200 });
        const points = [{ x: 0, y: 0 }, { x: 50, y: 100 }];
        expect(r.intersectsLine(points)).to.equal(false);
      });

      it('should not intersect if the height is zero', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 0 });
        const points = [{ x: 0, y: 0 }, { x: 50, y: 100 }];
        expect(r.intersectsLine(points)).to.equal(false);
      });
    });

    describe('Circle', () => {
      it('should intersect if circle center is within the circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const c = { cx: 100, cy: 200, r: 10 };
        expect(r.intersectsCircle(c)).to.equal(true);
      });

      it('should intersect if circle circumference is on the rect circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const c = { cx: 40, cy: 100, r: 10 };
        expect(r.intersectsCircle(c)).to.equal(true);
      });

      it('should intersect if circle circumference is inside the rect circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const c = { cx: 40, cy: 100, r: 15 };
        expect(r.intersectsCircle(c)).to.equal(true);
      });

      it('should intersect if circle circumference is inside the rect circumference while circle is proportional with a rect bound', () => {
        const rect = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const radius = 10;
        const dX = Math.cos(45 * (Math.PI / 180)) * radius;
        const dY = Math.sin(45 * (Math.PI / 180)) * radius;

        // Circle is touching the edge
        let c = { cx: 51 - dX, cy: 101 - dY, r: radius };
        expect(rect.intersectsCircle(c)).to.equal(true);

        // Circle is just outside the edge
        c = { cx: 49 - dX, cy: 99 - dY, r: radius };
        expect(rect.intersectsCircle(c)).to.equal(false);
      });

      it('should not intersect if point is outside the circumference', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const c1 = { cx: 39, cy: 100, r: 10 };
        const c2 = { cx: 50, cy: 89, r: 10 };
        const c3 = { cx: 211, cy: 300, r: 10 };
        const c4 = { cx: 200, cy: 311, r: 10 };

        expect(r.intersectsCircle(c1)).to.equal(false);
        expect(r.intersectsCircle(c2)).to.equal(false);
        expect(r.intersectsCircle(c3)).to.equal(false);
        expect(r.intersectsCircle(c4)).to.equal(false);
      });

      it('should not intersect if the width is zero', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 0, height: 200 });
        const c = { cx: 50, cy: 100, r: 10 };
        expect(r.intersectsCircle(c)).to.equal(false);
      });

      it('should not intersect if the height is zero', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 0 });
        const c = { cx: 50, cy: 100, r: 10 };
        expect(r.intersectsCircle(c)).to.equal(false);
      });

      it('should not intersect if the radius is zero', () => {
        const r = new GeoRect({ x: 50, y: 100, width: 150, height: 200 });
        const c = { cx: 50, cy: 100, r: 0 };
        expect(r.intersectsCircle(c)).to.equal(false);
      });
    });
  });
});
