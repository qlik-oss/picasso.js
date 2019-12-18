import { create } from '../geopolygon';
import { rectToPoints, lineToPoints } from '../util';

describe('GeoPolygon', () => {
  let geopolygon;
  const convexPolygon = [[
    { x: 0, y: 25 },
    { x: 25, y: 0 },
    { x: 50, y: 25 },
    { x: 0, y: 25 }
  ]]; // Triangle
  const concavePolygon = [[
    { x: 0, y: 0 },
    { x: 0, y: 50 },
    { x: 25, y: 25 },
    { x: 50, y: 50 },
    { x: 50, y: 0 },
    { x: 0, y: 0 }
  ]];
  const selfIntersectingPolygon = [[
    { x: 0, y: 0 },
    { x: 50, y: 50 },
    { x: 50, y: 0 },
    { x: 0, y: 50 },
    { x: 0, y: 0 }
  ]]; // butterfly quadrilateral

  const squarePolygon = [[
    { x: 0, y: 0 },
    { x: 0, y: 50 },
    { x: 50, y: 50 },
    { x: 50, y: 0 },
    { x: 0, y: 0 }
  ]];

  const polygonWithHole = [[
    { x: 0, y: 0 },
    { x: 0, y: 100 },
    { x: 100, y: 100 },
    { x: 100, y: 0 },
    { x: 0, y: 0 }
  ], [
    { x: 20, y: 40 },
    { x: 20, y: 60 },
    { x: 40, y: 60 },
    { x: 40, y: 80 },
    { x: 60, y: 80 },
    { x: 60, y: 60 },
    { x: 80, y: 60 },
    { x: 80, y: 40 },
    { x: 60, y: 40 },
    { x: 60, y: 20 },
    { x: 40, y: 20 },
    { x: 40, y: 40 },
    { x: 20, y: 40 }
  ]];

  describe('constructor', () => {
    it('should set correct default values when no arguments passed', () => {
      geopolygon = create();
      expect(geopolygon.vertices).to.deep.equal([[]]);
    });

    it('should set the correct values when arguments passed', () => {
      geopolygon = create({ vertices: convexPolygon });
      expect(geopolygon.vertices).to.deep.equal(convexPolygon);
      expect(geopolygon.polygons[0].edges).to.deep.equal([
        [{ x: 0, y: 25 }, { x: 25, y: 0 }],
        [{ x: 25, y: 0 }, { x: 50, y: 25 }],
        [{ x: 50, y: 25 }, { x: 0, y: 25 }]
      ]);
    });

    it('should close edges if not already closed', () => {
      geopolygon = create({
        vertices: [[
          { x: 0, y: 25 },
          { x: 25, y: 0 },
          { x: 50, y: 25 }
        ]]
      });
      expect(geopolygon.vertices).to.deep.equal([[
        { x: 0, y: 25 },
        { x: 25, y: 0 },
        { x: 50, y: 25 },
        { x: 0, y: 25 }
      ]]);
    });
  });

  describe('set', () => {
    it('should set correct default values when no arguments passed', () => {
      geopolygon = create({ vertices: convexPolygon });
      geopolygon.set();
      expect(geopolygon.vertices).to.deep.equal([]);
      expect(geopolygon.polygons).to.deep.equal([]);
    });

    it('should set the correct values when arguments passed', () => {
      geopolygon = create();
      geopolygon.set({ vertices: convexPolygon });
      expect(geopolygon.vertices).to.deep.equal(convexPolygon);
      expect(geopolygon.polygons[0].edges).to.deep.equal([
        [{ x: 0, y: 25 }, { x: 25, y: 0 }],
        [{ x: 25, y: 0 }, { x: 50, y: 25 }],
        [{ x: 50, y: 25 }, { x: 0, y: 25 }]
      ]);
    });

    it('should remove any duplicate sibling vertices', () => {
      geopolygon = create();
      geopolygon.set({
        vertices: [[
          { x: 0, y: 0 },
          { x: 0, y: 0 }, // Remove
          { x: 10, y: 0 },
          { x: 0, y: 10 },
          { x: 10, y: 0 }, // Do not remove
          { x: 10, y: 0 }, // Remove
          { x: 0, y: 0 }
        ]]
      });
      expect(geopolygon.vertices).to.deep.equal([[
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 0 },
        { x: 0, y: 0 }
      ]]);
    });
  });

  describe('bounds', () => {
    it('should return the correct bounds', () => {
      geopolygon = create({ vertices: selfIntersectingPolygon });
      expect(geopolygon.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
        { x: 0, y: 50 }
      ]);
    });

    it('should handle negative points', () => {
      geopolygon = create({
        vertices: [[
          { x: -20, y: -10 },
          { x: 0, y: -10 },
          { x: 20, y: 10 }
        ]]
      });
      expect(geopolygon.bounds()).to.deep.equal([
        { x: -20, y: -10 },
        { x: 20, y: -10 },
        { x: 20, y: 10 },
        { x: -20, y: 10 }
      ]);
    });
  });

  describe('Intersection', () => {
    describe('Point', () => {
      const poly1 = create({
        vertices: [[
          { x: 1, y: 1 },
          { x: 5, y: 1 },
          { x: 1, y: 5 },
          { x: 1, y: 1 }
        ]]
      });
      const poly2 = create({
        vertices: [[
          { x: 1, y: 1 },
          { x: 3, y: 3 },
          { x: 1, y: 5 },
          { x: 1, y: 1 }
        ]]
      });
      const poly3 = create({
        vertices: [[
          { x: 1, y: 3 },
          { x: 3, y: 5 },
          { x: 5, y: 3 },
          { x: 3, y: 1 },
          { x: 1, y: 3 }
        ]]
      });
      const poly4 = create({
        vertices: [[
          { x: 1, y: 1 },
          { x: 1, y: 3 },
          { x: 3, y: 3 },
          { x: 5, y: 5 },
          { x: 5, y: 1 },
          { x: 1, y: 1 }
        ]]
      });
      const poly5 = create({
        vertices: [[
          { x: 1, y: 1 },
          { x: 1, y: 5 },
          { x: 3, y: 3 },
          { x: 5, y: 5 },
          { x: 7, y: 3 },
          { x: 9, y: 5 },
          { x: 9, y: 1 },
          { x: 1, y: 1 }
        ]]
      });
      const poly6 = create({
        vertices: [[
          { x: 1, y: 1 },
          { x: 1, y: 5 },
          { x: 9, y: 5 },
          { x: 9, y: 1 },
          { x: 7, y: 3 },
          { x: 5, y: 1 },
          { x: 3, y: 3 },
          { x: 1, y: 1 }
        ]]
      });

      it('convex polygon', () => {
        const inside = { x: 25, y: 12.5 }; // "center" of triangle
        const outside = { x: 75, y: 12.5 }; // "right" side of triangle

        geopolygon = create({ vertices: convexPolygon });
        expect(geopolygon.containsPoint(inside)).to.equal(true);
        expect(geopolygon.containsPoint(outside)).to.equal(false);
      });

      it('concave polygon', () => {
        const outside = { x: 25, y: 35 };
        const inside = { x: 25, y: 25 };

        geopolygon = create({ vertices: concavePolygon });
        expect(geopolygon.containsPoint(inside)).to.equal(true);
        expect(geopolygon.containsPoint(outside)).to.equal(false);
      });

      it('self-Intersecting polygon', () => {
        const outside = { x: 25, y: 15 }; // in the concave area
        const inside = { x: 35, y: 25 }; // on a polygon edge in the concave area
        const atCross = { x: 25, y: 25 };

        geopolygon = create({ vertices: selfIntersectingPolygon });
        expect(geopolygon.containsPoint(inside)).to.equal(true);
        expect(geopolygon.containsPoint(outside)).to.equal(false);
        expect(geopolygon.containsPoint(atCross)).to.equal(true);
      });

      it('polygon with hole', () => {
        geopolygon = create({ vertices: polygonWithHole });
        expect(geopolygon.containsPoint({ x: 50, y: 50 })).to.equal(false);
        expect(geopolygon.containsPoint({ x: 50, y: 60 })).to.equal(false);
        expect(geopolygon.containsPoint({ x: 60, y: 50 })).to.equal(false);
        expect(geopolygon.containsPoint({ x: 150, y: 0 })).to.equal(false);
        expect(geopolygon.containsPoint({ x: -150, y: 0 })).to.equal(false);
        expect(geopolygon.containsPoint({ x: 0, y: -150 })).to.equal(false);

        expect(geopolygon.containsPoint({ x: 0, y: 0 })).to.equal(true);
        expect(geopolygon.containsPoint({ x: 40, y: 40 })).to.equal(true);
        expect(geopolygon.containsPoint({ x: 50, y: 80 })).to.equal(true);
        expect(geopolygon.containsPoint({ x: 80, y: 50 })).to.equal(true);
        expect(geopolygon.containsPoint({ x: 100, y: 50 })).to.equal(true);
        expect(geopolygon.containsPoint({ x: 50, y: 100 })).to.equal(true);
        expect(geopolygon.containsPoint({ x: 50, y: 90 })).to.equal(true);
        expect(geopolygon.containsPoint({ x: 90, y: 50 })).to.equal(true);
      });

      it('should not intersect if polygon contains less then 2 vertices', () => {
        const p = { x: 10, y: 10 };

        geopolygon = create({
          vertices: [[
            { x: 10, y: 10 }
          ]]
        });
        expect(geopolygon.containsPoint(p)).to.equal(false);
      });

      it('should return true if the point is coincident with a vertex of the polygon', () => {
        expect(poly1.containsPoint({ x: 1, y: 1 })).to.equal(true);
        expect(poly1.containsPoint({ x: 5, y: 1 })).to.equal(true);
        expect(poly1.containsPoint({ x: 1, y: 5 })).to.equal(true);

        expect(poly2.containsPoint({ x: 1, y: 1 })).to.equal(true);
        expect(poly2.containsPoint({ x: 3, y: 3 })).to.equal(true);
        expect(poly2.containsPoint({ x: 1, y: 5 })).to.equal(true);

        expect(poly3.containsPoint({ x: 1, y: 3 })).to.equal(true);
        expect(poly3.containsPoint({ x: 3, y: 5 })).to.equal(true);
        expect(poly3.containsPoint({ x: 5, y: 3 })).to.equal(true);
        expect(poly3.containsPoint({ x: 3, y: 1 })).to.equal(true);

        expect(poly4.containsPoint({ x: 1, y: 1 })).to.equal(true);
        expect(poly4.containsPoint({ x: 1, y: 3 })).to.equal(true);
        expect(poly4.containsPoint({ x: 3, y: 3 })).to.equal(true);
        expect(poly4.containsPoint({ x: 5, y: 5 })).to.equal(true);
        expect(poly4.containsPoint({ x: 5, y: 1 })).to.equal(true);

        expect(poly5.containsPoint({ x: 1, y: 1 })).to.equal(true);
        expect(poly5.containsPoint({ x: 1, y: 5 })).to.equal(true);
        expect(poly5.containsPoint({ x: 3, y: 3 })).to.equal(true);
        expect(poly5.containsPoint({ x: 5, y: 5 })).to.equal(true);
        expect(poly5.containsPoint({ x: 7, y: 3 })).to.equal(true);
        expect(poly5.containsPoint({ x: 9, y: 5 })).to.equal(true);
        expect(poly5.containsPoint({ x: 9, y: 1 })).to.equal(true);
      });
      it('should return true if the point is on an edge of the polygon', () => {
        expect(poly1.containsPoint({ x: 2, y: 1 })).to.equal(true);
        expect(poly1.containsPoint({ x: 1, y: 2 })).to.equal(true);
        expect(poly1.containsPoint({ x: 3, y: 3 })).to.equal(true);

        expect(poly2.containsPoint({ x: 2, y: 2 })).to.equal(true);
        expect(poly2.containsPoint({ x: 1, y: 2 })).to.equal(true);
        expect(poly2.containsPoint({ x: 1, y: 3 })).to.equal(true);
        expect(poly2.containsPoint({ x: 2, y: 4 })).to.equal(true);

        expect(poly3.containsPoint({ x: 2, y: 4 })).to.equal(true);
        expect(poly3.containsPoint({ x: 4, y: 4 })).to.equal(true);
        expect(poly3.containsPoint({ x: 4, y: 2 })).to.equal(true);
        expect(poly3.containsPoint({ x: 2, y: 2 })).to.equal(true);

        expect(poly4.containsPoint({ x: 1, y: 2 })).to.equal(true);
        expect(poly4.containsPoint({ x: 2, y: 3 })).to.equal(true);
        expect(poly4.containsPoint({ x: 4, y: 4 })).to.equal(true);
        expect(poly4.containsPoint({ x: 5, y: 3 })).to.equal(true);
        expect(poly4.containsPoint({ x: 3, y: 1 })).to.equal(true);

        expect(poly5.containsPoint({ x: 1, y: 3 })).to.equal(true);
        expect(poly5.containsPoint({ x: 2, y: 4 })).to.equal(true);
        expect(poly5.containsPoint({ x: 4, y: 4 })).to.equal(true);
        expect(poly5.containsPoint({ x: 6, y: 4 })).to.equal(true);
        expect(poly5.containsPoint({ x: 8, y: 4 })).to.equal(true);
        expect(poly5.containsPoint({ x: 9, y: 3 })).to.equal(true);
        expect(poly5.containsPoint({ x: 5, y: 1 })).to.equal(true);
      });
      it('should calculate that these points are outside', () => {
        expect(poly1.containsPoint({ x: 10, y: 10 })).to.equal(false);
        expect(poly1.containsPoint({ x: 1, y: 10 })).to.equal(false);
        expect(poly1.containsPoint({ x: 4, y: 4 })).to.equal(false);
      });
      it('should return true if the point is inside and the horizontal line of the point goes through a vertex of the polygon', () => {
        expect(poly2.containsPoint({ x: 2, y: 3 })).to.equal(true);

        expect(poly3.containsPoint({ x: 3, y: 3 })).to.equal(true);

        expect(poly5.containsPoint({ x: 2, y: 3 })).to.equal(true);
        expect(poly5.containsPoint({ x: 5, y: 3 })).to.equal(true);
        expect(poly5.containsPoint({ x: 8, y: 3 })).to.equal(true);

        expect(poly6.containsPoint({ x: 2, y: 3 })).to.equal(true);
        expect(poly6.containsPoint({ x: 5, y: 3 })).to.equal(true);
        expect(poly6.containsPoint({ x: 8, y: 3 })).to.equal(true);
      });
      it('should return true if the point is inside and the horizontal line of the point goes through an edge of the polygon', () => {
        expect(poly4.containsPoint({ x: 4, y: 3 })).to.equal(true);
      });
      it('should return false if the point is outside and the horizontal line of the point goes through an edge of the polygon', () => {
        expect(poly4.containsPoint({ x: 0, y: 3 })).to.equal(false);
        expect(poly4.containsPoint({ x: 6, y: 3 })).to.equal(false);
      });
      it('should return false if the point is outside and the horizontal line of the point goes through a vertex of the polygon', () => {
        expect(poly2.containsPoint({ x: 0, y: 5 })).to.equal(false);
        expect(poly2.containsPoint({ x: 0, y: 3 })).to.equal(false);
        expect(poly2.containsPoint({ x: 0, y: 1 })).to.equal(false);
        expect(poly2.containsPoint({ x: 4, y: 5 })).to.equal(false);
        expect(poly2.containsPoint({ x: 4, y: 3 })).to.equal(false);
        expect(poly2.containsPoint({ x: 4, y: 1 })).to.equal(false);

        expect(poly3.containsPoint({ x: 0, y: 3 })).to.equal(false);
        expect(poly3.containsPoint({ x: 6, y: 3 })).to.equal(false);

        expect(poly5.containsPoint({ x: 0, y: 5 })).to.equal(false);
        expect(poly5.containsPoint({ x: 3, y: 5 })).to.equal(false);
        expect(poly5.containsPoint({ x: 7, y: 5 })).to.equal(false);
        expect(poly5.containsPoint({ x: 10, y: 5 })).to.equal(false);
        expect(poly5.containsPoint({ x: 0, y: 3 })).to.equal(false);
        expect(poly5.containsPoint({ x: 10, y: 3 })).to.equal(false);

        expect(poly6.containsPoint({ x: 0, y: 1 })).to.equal(false);
        expect(poly6.containsPoint({ x: 3, y: 1 })).to.equal(false);
        expect(poly6.containsPoint({ x: 7, y: 1 })).to.equal(false);
        expect(poly6.containsPoint({ x: 10, y: 1 })).to.equal(false);
      });
    });

    describe('intersectsCircle', () => {
      it('convex polygon', () => {
        const inside = { cx: 25, cy: 12.5, r: 2 }; // "center" of triangle
        const outside = { cx: 75, cy: 12.5, r: 2 }; // "right" side of triangle
        const circleCircumferenceIntersects = { cx: 1, cy: 1, r: 25 };

        geopolygon = create({ vertices: convexPolygon });
        expect(geopolygon.intersectsCircle(inside)).to.equal(true);
        expect(geopolygon.intersectsCircle(outside)).to.equal(false);
        expect(geopolygon.intersectsCircle(circleCircumferenceIntersects)).to.equal(true);
      });

      it('concave polygon', () => {
        const inside = { cx: 25, cy: 12.5, r: 2 }; // "center" of triangle
        const outside = { cx: 75, cy: 12.5, r: 2 }; // "right" side of triangle
        const circleCircumferenceIntersects = { cx: 75, cy: 25, r: 35 };

        geopolygon = create({ vertices: concavePolygon });
        expect(geopolygon.intersectsCircle(inside)).to.equal(true);
        expect(geopolygon.intersectsCircle(outside)).to.equal(false);
        expect(geopolygon.intersectsCircle(circleCircumferenceIntersects)).to.equal(true);
      });

      it('self-Intersecting polygon', () => {
        const inside = { cx: 35, cy: 25, r: 2 }; // "center" of triangle
        const outside = { cx: 25, cy: 12.5, r: 2 }; // "right" side of triangle
        const circleCircumferenceIntersects = { cx: 25, cy: 12.5, r: 12 };

        geopolygon = create({ vertices: selfIntersectingPolygon });
        expect(geopolygon.intersectsCircle(inside)).to.equal(true);
        expect(geopolygon.intersectsCircle(outside)).to.equal(false);
        expect(geopolygon.intersectsCircle(circleCircumferenceIntersects)).to.equal(true);
      });

      it('should not intersect if polygon contains less then 2 vertices', () => {
        const c = { cx: 0, cy: 0, r: 2 };

        geopolygon = create({
          vertices: [[
            { x: 0, y: 0 }
          ]]
        });
        expect(geopolygon.intersectsCircle(c)).to.equal(false);
      });
    });

    describe('intersectsLine', () => {
      it('should intersect line', () => {
        const line = {
          x1: 25, y1: 20, x2: 25, y2: 10
        }; // Both points inside polygon
        geopolygon = create({ vertices: convexPolygon });
        expect(geopolygon.intersectsLine(lineToPoints(line))).to.equal(true);
      });
    });

    describe('intersectsRect', () => {
      it('should intersect rect', () => {
        const rect = {
          x: 25, y: 10, width: 6, height: 6
        };
        geopolygon = create({ vertices: convexPolygon });
        expect(geopolygon.intersectsRect(rectToPoints(rect))).to.equal(true);
      });
    });

    describe('intersectsPolygon', () => {
      it('convex polygon', () => {
        geopolygon = create({ vertices: convexPolygon });
        const geopolygon2 = create({ vertices: [convexPolygon[0].map((p) => ({ x: p.x + 3, y: p.y + 3 }))] });
        expect(geopolygon.intersectsPolygon(geopolygon2.polygons[0])).to.be.true;
      });

      it('concave polygon', () => {
        geopolygon = create({ vertices: concavePolygon });
        const geopolygon2 = create({ vertices: [concavePolygon[0].map((p) => ({ x: p.x + 3, y: p.y + 3 }))] });
        expect(geopolygon.intersectsPolygon(geopolygon2.polygons[0])).to.be.true;
      });

      it('self-intersecting polygon', () => {
        geopolygon = create({ vertices: selfIntersectingPolygon });
        const geopolygon2 = create({ vertices: [selfIntersectingPolygon[0].map((p) => ({ x: p.x + 3, y: p.y + 3 }))] });
        expect(geopolygon.intersectsPolygon(geopolygon2.polygons[0])).to.be.true;
      });

      it('fully contains another polygon, case 1', () => {
        geopolygon = create({ vertices: selfIntersectingPolygon });
        const vertices = [[
          { x: 3, y: 15 },
          { x: 3, y: 25 },
          { x: 6, y: 15 }
        ]];
        const geopolygon2 = create({ vertices });
        expect(geopolygon.polygons[0].intersectsPolygon(geopolygon2.polygons[0])).to.be.true;
      });

      it('fully contains another polygon, case 2', () => {
        geopolygon = create({ vertices: squarePolygon });
        const vertices = [[
          { x: 3, y: 15 },
          { x: 3, y: 25 },
          { x: 6, y: 15 }
        ]];
        const geopolygon2 = create({ vertices });
        expect(geopolygon.intersectsPolygon(geopolygon2.polygons[0])).to.be.true;
      });

      it('fully being contained by another polygon', () => {
        geopolygon = create({ vertices: selfIntersectingPolygon });
        const vertices = [[
          { x: -10, y: -10 },
          { x: -10, y: 110 },
          { x: 110, y: 110 },
          { x: 110, y: -10 },
          { x: -10, y: -10 }
        ]];
        const geopolygon2 = create({ vertices });
        expect(geopolygon.intersectsPolygon(geopolygon2.polygons[0])).to.be.true;
      });
    });
  });
});
