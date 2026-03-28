import { angleToPoints, toRadians, degreesToPoints } from '../angles';

describe('minmax', () => {
  describe('angleToPoints', () => {
    it('should respond with correct values', () => {
      let result1: any = angleToPoints(toRadians(90));

      expect(result1.x1).to.be.closeTo(1, 0.0000001);
      expect(result1.y1).to.be.closeTo(0, 0.0000001);
      expect(result1.x2).to.be.closeTo(1, 0.0000001);
      expect(result1.y2).to.be.closeTo(1, 0.0000001);

      let result2: any = angleToPoints(toRadians(180));

      expect(result2.x1).to.be.closeTo(0, 0.0000001);
      expect(result2.y1).to.be.closeTo(0, 0.0000001);
      expect(result2.x2).to.be.closeTo(1, 0.0000001);
      expect(result2.y2).to.be.closeTo(0, 0.0000001);
    });
  });

  describe('degreesToPoints', () => {
    it('should respond with correct values', () => {
      let result1: any = degreesToPoints(45);

      expect(result1.x1).to.be.closeTo(1, 0.0000001);
      expect(result1.y1).to.be.closeTo(0, 0.0000001);
      expect(result1.x2).to.be.closeTo(0, 0.0000001);
      expect(result1.y2).to.be.closeTo(1, 0.0000001);

      let result2: any = degreesToPoints(0);

      expect(result2.x1).to.be.closeTo(1, 0.0000001);
      expect(result2.y1).to.be.closeTo(0, 0.0000001);
      expect(result2.x2).to.be.closeTo(0, 0.0000001);
      expect(result2.y2).to.be.closeTo(0, 0.0000001);
    });
  });
});
