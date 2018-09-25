import {
  testPolygonLine,
  testPolygonRect
} from '../narrow-phase-collision';
import { create } from '../../geometry/polygon';

describe('NarrowPhaseCollision', () => {
  let polygon;
  const convexPolygon = [
    { x: 0, y: 25 },
    { x: 25, y: 0 },
    { x: 50, y: 25 },
    { x: 0, y: 25 }
  ]; // Triangle
  const concavePolygon = [
    { x: 0, y: 0 },
    { x: 0, y: 50 },
    { x: 25, y: 25 },
    { x: 50, y: 50 },
    { x: 50, y: 0 },
    { x: 0, y: 0 }
  ];
  const selfIntersectingPolygon = [
    { x: 0, y: 0 },
    { x: 50, y: 50 },
    { x: 50, y: 0 },
    { x: 0, y: 50 },
    { x: 0, y: 0 }
  ]; // butterfly quadrilateral

  describe('testPolygonLine', () => {
    it('convex polygon', () => {
      const lineIsInsidePolygon = {
        x1: 25, y1: 20, x2: 25, y2: 10
      }; // Both points inside polygon
      const lineIsCrossingAPolygonEdge = {
        x1: 0, y1: 75, x2: 25, y2: -10
      }; // No point inside polygon but line is crossing it
      const lineIsCoincidentWithPolygonEdge = {
        x1: 0, y1: 25, x2: 25, y2: 0
      };

      polygon = create({ vertices: convexPolygon });
      expect(testPolygonLine(polygon, lineIsInsidePolygon)).to.equal(true);
      expect(testPolygonLine(polygon, lineIsCrossingAPolygonEdge)).to.equal(true);
      expect(testPolygonLine(polygon, lineIsCoincidentWithPolygonEdge)).to.equal(true);
    });

    it('concave polygon', () => {
      const lineIsInsidePolygon = {
        x1: 10, y1: 10, x2: 10, y2: 20
      }; // Both points inside polygon
      const lineIsCrossingAPolygonEdge = {
        x1: 100, y1: 10, x2: -10, y2: 20
      }; // No point inside polygon but line is crossing it
      const lineIsCoincidentWithPolygonEdge = {
        x1: 0, y1: 0, x2: 0, y2: 50
      };

      polygon = create({ vertices: concavePolygon });
      expect(testPolygonLine(polygon, lineIsInsidePolygon)).to.equal(true);
      expect(testPolygonLine(polygon, lineIsCrossingAPolygonEdge)).to.equal(true);
      expect(testPolygonLine(polygon, lineIsCoincidentWithPolygonEdge)).to.equal(true);
    });

    it('self-Intersecting polygon', () => {
      const lineIsInsidePolygon = {
        x1: 10, y1: 10, x2: 10, y2: 20
      }; // Both points inside polygon
      const lineIsCrossingAPolygonEdge = {
        x1: 100, y1: 10, x2: -10, y2: 20
      }; // No point inside polygon but line is crossing it
      const lineIsCoincidentWithPolygonEdge = {
        x1: 0, y1: 0, x2: 0, y2: 50
      };

      polygon = create({ vertices: selfIntersectingPolygon });
      expect(testPolygonLine(polygon, lineIsInsidePolygon)).to.equal(true);
      expect(testPolygonLine(polygon, lineIsCrossingAPolygonEdge)).to.equal(true);
      expect(testPolygonLine(polygon, lineIsCoincidentWithPolygonEdge)).to.equal(true);
    });

    it('to few vertices', () => {
      const line = {
        x1: 0, y1: 0, x2: 20, y2: 20
      }; // Both points inside polygon

      polygon = create({
        vertices: [
          { x: 0, y: 0 },
          { x: 10, y: 10 }
        ]
      }); // for a 2-dimensional polygon, at least 3 edges are needed
      expect(testPolygonLine(polygon, line)).to.equal(false);
    });
  });

  describe('testPolygonRect', () => {
    it('convex polygon', () => {
      const rectIsInsidePolygon = {
        x: 25, y: 10, width: 6, height: 6
      };
      const rectEdgeIsCrossingAPolygonEdge = {
        x: 0, y: 10, width: 60, height: 6
      };

      polygon = create({ vertices: convexPolygon });
      expect(testPolygonRect(polygon, rectIsInsidePolygon)).to.equal(true);
      expect(testPolygonRect(polygon, rectEdgeIsCrossingAPolygonEdge)).to.equal(true);
    });

    it('concave polygon', () => {
      const rectIsInsidePolygon = {
        x: 25, y: 10, width: 6, height: 6
      };
      const rectEdgeIsCrossingAPolygonEdge = {
        x: -10, y: 10, width: 100, height: 6
      };

      polygon = create({ vertices: concavePolygon });
      expect(testPolygonRect(polygon, rectIsInsidePolygon)).to.equal(true);
      expect(testPolygonRect(polygon, rectEdgeIsCrossingAPolygonEdge)).to.equal(true);
    });

    it('self-Intersecting polygon', () => {
      const rectIsInsidePolygon = {
        x: 5, y: 25, width: 6, height: 6
      };
      const rectEdgeIsCrossingAPolygonEdge = {
        x: -25, y: 25, width: 100, height: 6
      };

      polygon = create({ vertices: selfIntersectingPolygon });
      expect(testPolygonRect(polygon, rectIsInsidePolygon)).to.equal(true);
      expect(testPolygonRect(polygon, rectEdgeIsCrossingAPolygonEdge)).to.equal(true);
    });

    it('to few vertices', () => {
      const rect = {
        x: 0, y: 0, width: 50, height: 50
      };

      polygon = create({
        vertices: [
          { x: 0, y: 0 },
          { x: 10, y: 10 }
        ]
      }); // for a 2-dimensional polygon, at least 3 edges are needed
      expect(testPolygonRect(polygon, rect)).to.equal(false);
    });
  });
});
