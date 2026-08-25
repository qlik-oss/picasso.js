import { rectContainsRect } from '../intersection';

describe('Intersection', () => {
  describe('rectContainsRect', () => {
    it('should fit inside parent rect', () => {
      const childRect = {
        x: 20,
        y: 50,
        width: 10,
        height: 30,
      };

      const parentRect = {
        x: 10,
        y: 10,
        height: 120,
        width: 110,
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(true);
    });

    it('should be outside parent rect', () => {
      const childRect = {
        x: 20,
        y: 5,
        width: 10,
        height: 30,
      };

      const parentRect = {
        x: 10,
        y: 40,
        height: 120,
        width: 110,
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(false);
    });

    it('should not because childRects width is bigger than parentRect', () => {
      const childRect = {
        x: 20,
        y: 30,
        width: 120,
        height: 30,
      };

      const parentRect = {
        x: 10,
        y: 40,
        height: 120,
        width: 110,
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(false);
    });

    it('should not because childRects height is bigger than parentRect', () => {
      const childRect = {
        x: 20,
        y: 30,
        width: 50,
        height: 130,
      };

      const parentRect = {
        x: 10,
        y: 40,
        height: 120,
        width: 110,
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(false);
    });

    it('should not because childRects height and width is bigger than parentRect', () => {
      const childRect = {
        x: 20,
        y: 30,
        width: 150,
        height: 130,
      };

      const parentRect = {
        x: 10,
        y: 40,
        height: 120,
        width: 110,
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(false);
    });
  });
});
