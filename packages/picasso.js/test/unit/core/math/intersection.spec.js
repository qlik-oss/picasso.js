import { rectContainsRect } from '../../../../src/core/math/intersection';

describe('Intersection', () => {
  describe('rectContainsRect', () => {
    describe('Error handling', () => {
      it('should throw error if childRect is missing', () => {
        expect(() => {
          rectContainsRect(null, {});
        }).to.throw('A rect or both rects are missing');
      });

      it('should throw error if parentRect is missing', () => {
        expect(() => {
          rectContainsRect({}, null);
        }).to.throw('A rect or both rects are missing');
      });

      it('should throw error if both rects are missing', () => {
        expect(() => {
          rectContainsRect(null, null);
        }).to.throw('A rect or both rects are missing');
      });

      it('should throw error if all properties are missing', () => {
        expect(() => {
          rectContainsRect({}, {});
        }).to.throw('Position on child rect is missing or parent rect have a missing width or height');
      });

      it('should throw error if x is missing', () => {
        const childRect = {
          y: 20,
          width: 10,
          height: 30
        };

        const parentRect = {
          height: 120,
          width: 110
        };

        expect(() => {
          rectContainsRect(childRect, parentRect);
        }).to.throw('Position on child rect is missing or parent rect have a missing width or height');
      });

      it('should throw error if y is missing', () => {
        const childRect = {
          x: 20,
          width: 10,
          height: 30
        };

        const parentRect = {
          height: 120,
          width: 110
        };

        expect(() => {
          rectContainsRect(childRect, parentRect);
        }).to.throw('Position on child rect is missing or parent rect have a missing width or height');
      });

      it('should throw error if both x and y are missing', () => {
        const childRect = {
          width: 10,
          height: 30
        };

        const parentRect = {
          height: 120,
          width: 110
        };

        expect(() => {
          rectContainsRect(childRect, parentRect);
        }).to.throw('Position on child rect is missing or parent rect have a missing width or height');
      });

      it('should throw error if parentRect has no height', () => {
        const childRect = {
          x: 1,
          y: 1
        };

        const parentRect = {
          width: 110
        };

        expect(() => {
          rectContainsRect(childRect, parentRect);
        }).to.throw('Position on child rect is missing or parent rect have a missing width or height');
      });

      it('should throw error if parentRect has no width', () => {
        const childRect = {
          x: 1,
          y: 1
        };

        const parentRect = {
          height: 110
        };

        expect(() => {
          rectContainsRect(childRect, parentRect);
        }).to.throw('Position on child rect is missing or parent rect have a missing width or height');
      });

      it('should throw error if parentRect has no width nor height', () => {
        const childRect = {
          x: 1,
          y: 1
        };

        const parentRect = {};

        expect(() => {
          rectContainsRect(childRect, parentRect);
        }).to.throw('Position on child rect is missing or parent rect have a missing width or height');
      });
    });

    it('should fit inside parent rect', () => {
      const childRect = {
        x: 20,
        y: 50,
        width: 10,
        height: 30
      };

      const parentRect = {
        height: 120,
        width: 110
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(true);
    });

    it('should be outside parent rect', () => {
      const childRect = {
        x: 20,
        y: 5,
        width: 10,
        height: 30
      };

      const parentRect = {
        height: 120,
        width: 110
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(false);
    });

    it('should be located on the lower part of parent rect', () => {
      const childRect = {
        x: 20,
        y: 70,
        width: 10,
        height: 30
      };

      const parentRect = {
        height: 120,
        width: 110
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(true);
    });
  });
});
