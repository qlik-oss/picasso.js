import { create } from '../polygon';
import { rectToPoints, lineToPoints } from '../util';

describe('Polygon', () => {
  let polygon;
  const convexPolygon = [
    { x: 0, y: 25 },
    { x: 25, y: 0 },
    { x: 50, y: 25 },
    { x: 0, y: 25 },
  ]; // Triangle
  const concavePolygon = [
    { x: 0, y: 0 },
    { x: 0, y: 50 },
    { x: 25, y: 25 },
    { x: 50, y: 50 },
    { x: 50, y: 0 },
    { x: 0, y: 0 },
  ];
  const selfIntersectingPolygon = [
    { x: 0, y: 0 },
    { x: 50, y: 50 },
    { x: 50, y: 0 },
    { x: 0, y: 50 },
    { x: 0, y: 0 },
  ]; // butterfly quadrilateral

  describe('constructor', () => {
    it('should set correct default values when no arguments passed', () => {
      polygon = create();
      expect(polygon.vertices).to.deep.equal([]);
      expect(polygon.edges).to.deep.equal([]);
    });

    it('should set the correct values when arguments passed', () => {
      polygon = create({ vertices: convexPolygon });
      expect(polygon.vertices).to.deep.equal(convexPolygon);
      expect(polygon.edges).to.deep.equal([
        [
          { x: 0, y: 25 },
          { x: 25, y: 0 },
        ],
        [
          { x: 25, y: 0 },
          { x: 50, y: 25 },
        ],
        [
          { x: 50, y: 25 },
          { x: 0, y: 25 },
        ],
      ]);
    });

    it('should close edges if not already closed', () => {
      polygon = create({
        vertices: [
          { x: 0, y: 25 },
          { x: 25, y: 0 },
          { x: 50, y: 25 },
        ],
      });
      expect(polygon.vertices).to.deep.equal([
        { x: 0, y: 25 },
        { x: 25, y: 0 },
        { x: 50, y: 25 },
        { x: 0, y: 25 },
      ]);
    });
  });

  describe('set', () => {
    it('should set correct default values when no arguments passed', () => {
      polygon = create({ vertices: convexPolygon });
      polygon.set();
      expect(polygon.vertices).to.deep.equal([]);
      expect(polygon.edges).to.deep.equal([]);
    });

    it('should set the correct values when arguments passed', () => {
      polygon = create();
      polygon.set({ vertices: convexPolygon });
      expect(polygon.vertices).to.deep.equal(convexPolygon);
      expect(polygon.edges).to.deep.equal([
        [
          { x: 0, y: 25 },
          { x: 25, y: 0 },
        ],
        [
          { x: 25, y: 0 },
          { x: 50, y: 25 },
        ],
        [
          { x: 50, y: 25 },
          { x: 0, y: 25 },
        ],
      ]);
    });

    it('should remove any duplicate sibling vertices', () => {
      polygon = create();
      polygon.set({
        vertices: [
          { x: 0, y: 0 },
          { x: 0, y: 0 }, // Remove
          { x: 10, y: 0 },
          { x: 0, y: 10 },
          { x: 10, y: 0 }, // Do not remove
          { x: 10, y: 0 }, // Remove
          { x: 0, y: 0 },
        ],
      });
      expect(polygon.vertices).to.deep.equal([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 0 },
        { x: 0, y: 0 },
      ]);
    });
  });

  describe('bounds', () => {
    it('should return the correct bounds', () => {
      polygon = create({ vertices: selfIntersectingPolygon });
      expect(polygon.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
        { x: 0, y: 50 },
      ]);
    });

    it('should handle negative points', () => {
      polygon = create({
        vertices: [
          { x: -20, y: -10 },
          { x: 0, y: -10 },
          { x: 20, y: 10 },
        ],
      });
      expect(polygon.bounds()).to.deep.equal([
        { x: -20, y: -10 },
        { x: 20, y: -10 },
        { x: 20, y: 10 },
        { x: -20, y: 10 },
      ]);
    });
  });

  describe('Intersection', () => {
    describe('Point', () => {
      const poly1 = create({
        vertices: [
          { x: 1, y: 1 },
          { x: 5, y: 1 },
          { x: 1, y: 5 },
          { x: 1, y: 1 },
        ],
      });
      const poly2 = create({
        vertices: [
          { x: 1, y: 1 },
          { x: 3, y: 3 },
          { x: 1, y: 5 },
          { x: 1, y: 1 },
        ],
      });
      const poly3 = create({
        vertices: [
          { x: 1, y: 3 },
          { x: 3, y: 5 },
          { x: 5, y: 3 },
          { x: 3, y: 1 },
          { x: 1, y: 3 },
        ],
      });
      const poly4 = create({
        vertices: [
          { x: 1, y: 1 },
          { x: 1, y: 3 },
          { x: 3, y: 3 },
          { x: 5, y: 5 },
          { x: 5, y: 1 },
          { x: 1, y: 1 },
        ],
      });
      const poly5 = create({
        vertices: [
          { x: 1, y: 1 },
          { x: 1, y: 5 },
          { x: 3, y: 3 },
          { x: 5, y: 5 },
          { x: 7, y: 3 },
          { x: 9, y: 5 },
          { x: 9, y: 1 },
          { x: 1, y: 1 },
        ],
      });
      const poly6 = create({
        vertices: [
          { x: 1, y: 1 },
          { x: 1, y: 5 },
          { x: 9, y: 5 },
          { x: 9, y: 1 },
          { x: 7, y: 3 },
          { x: 5, y: 1 },
          { x: 3, y: 3 },
          { x: 1, y: 1 },
        ],
      });

      it('convex polygon', () => {
        const inside = { x: 25, y: 12.5 }; // "center" of triangle
        const outside = { x: 75, y: 12.5 }; // "right" side of triangle

        polygon = create({ vertices: convexPolygon });
        expect(polygon.containsPoint(inside)).to.equal(true);
        expect(polygon.containsPoint(outside)).to.equal(false);
      });

      it('concave polygon', () => {
        const outside = { x: 25, y: 35 };
        const inside = { x: 25, y: 25 };

        polygon = create({ vertices: concavePolygon });
        expect(polygon.containsPoint(inside)).to.equal(true);
        expect(polygon.containsPoint(outside)).to.equal(false);
      });

      it('self-Intersecting polygon', () => {
        const outside = { x: 25, y: 15 }; // in the concave area
        const inside = { x: 35, y: 25 }; // on a polygon edge in the concave area
        const atCross = { x: 25, y: 25 };

        polygon = create({ vertices: selfIntersectingPolygon });
        expect(polygon.containsPoint(inside)).to.equal(true);
        expect(polygon.containsPoint(outside)).to.equal(false);
        expect(polygon.containsPoint(atCross)).to.equal(true);
      });

      it('should not intersect if polygon contains less then 2 vertices', () => {
        const p = { x: 10, y: 10 };

        polygon = create({
          vertices: [{ x: 10, y: 10 }],
        });
        expect(polygon.containsPoint(p)).to.equal(false);
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

        polygon = create({ vertices: convexPolygon });
        expect(polygon.intersectsCircle(inside)).to.equal(true);
        expect(polygon.intersectsCircle(outside)).to.equal(false);
        expect(polygon.intersectsCircle(circleCircumferenceIntersects)).to.equal(true);
      });

      it('concave polygon', () => {
        const inside = { cx: 25, cy: 12.5, r: 2 }; // "center" of triangle
        const outside = { cx: 75, cy: 12.5, r: 2 }; // "right" side of triangle
        const circleCircumferenceIntersects = { cx: 75, cy: 25, r: 35 };

        polygon = create({ vertices: concavePolygon });
        expect(polygon.intersectsCircle(inside)).to.equal(true);
        expect(polygon.intersectsCircle(outside)).to.equal(false);
        expect(polygon.intersectsCircle(circleCircumferenceIntersects)).to.equal(true);
      });

      it('self-Intersecting polygon', () => {
        const inside = { cx: 35, cy: 25, r: 2 }; // "center" of triangle
        const outside = { cx: 25, cy: 12.5, r: 2 }; // "right" side of triangle
        const circleCircumferenceIntersects = { cx: 25, cy: 12.5, r: 12 };

        polygon = create({ vertices: selfIntersectingPolygon });
        expect(polygon.intersectsCircle(inside)).to.equal(true);
        expect(polygon.intersectsCircle(outside)).to.equal(false);
        expect(polygon.intersectsCircle(circleCircumferenceIntersects)).to.equal(true);
      });

      it('should not intersect if polygon contains less then 2 vertices', () => {
        const c = { cx: 0, cy: 0, r: 2 };

        polygon = create({
          vertices: [{ x: 0, y: 0 }],
        });
        expect(polygon.intersectsCircle(c)).to.equal(false);
      });
    });

    describe('intersectsLine', () => {
      it('should intersect line', () => {
        const line = {
          x1: 25,
          y1: 20,
          x2: 25,
          y2: 10,
        }; // Both points inside polygon
        polygon = create({ vertices: convexPolygon });
        expect(polygon.intersectsLine(lineToPoints(line))).to.equal(true);
      });
    });

    describe('intersectsRect', () => {
      it('should intersect rect', () => {
        const rect = {
          x: 25,
          y: 10,
          width: 6,
          height: 6,
        };
        polygon = create({ vertices: convexPolygon });
        expect(polygon.intersectsRect(rectToPoints(rect))).to.equal(true);
      });
    });

    describe('intersectsPolygon', () => {
      it('convex polygon', () => {
        polygon = create({ vertices: convexPolygon });
        const pgon2 = create({ vertices: convexPolygon.map(p => ({ x: p.x + 3, y: p.y + 3 })) });
        expect(polygon.intersectsPolygon(pgon2)).to.be.true;
      });

      it('concave polygon', () => {
        polygon = create({ vertices: concavePolygon });
        const pgon2 = create({ vertices: concavePolygon.map(p => ({ x: p.x + 3, y: p.y + 3 })) });
        expect(polygon.intersectsPolygon(pgon2)).to.be.true;
      });

      it('self-intersecting polygon', () => {
        polygon = create({ vertices: selfIntersectingPolygon });
        const pgon2 = create({ vertices: selfIntersectingPolygon.map(p => ({ x: p.x + 3, y: p.y + 3 })) });
        expect(polygon.intersectsPolygon(pgon2)).to.be.true;
      });

      it('fully contains another polygon', () => {
        polygon = create({ vertices: selfIntersectingPolygon });
        const vertices = [
          { x: 3, y: 15 },
          { x: 3, y: 25 },
          { x: 6, y: 15 },
        ];
        const pgon2 = create({ vertices });
        expect(polygon.intersectsPolygon(pgon2)).to.be.false;
      });
    });
  });
});
