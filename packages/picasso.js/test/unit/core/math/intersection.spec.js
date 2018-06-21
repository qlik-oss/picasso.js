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
        }).to.throw('One or more entries are either not a number or the parent rect has wrongly specified width and height');
      });

      it('should throw error if all properties are missing', () => {
        expect(() => {
          rectContainsRect({}, {});
        }).to.throw('One or more entries are either not a number or the parent rect has wrongly specified width and height');
      });

      it('should throw error for NaN', () => {
        const childRect = {
          x: NaN,
          y: 20,
          width: 10,
          height: 30
        };

        const parentRect = {
          x: 10,
          y: 10,
          height: 120,
          width: 110
        };

        expect(() => {
          rectContainsRect(childRect, parentRect);
        }).to.throw('One or more entries are either not a number or the parent rect has wrongly specified width and height');
      });

      it('should throw error if x is missing', () => {
        const childRect = {
          y: 20,
          width: 10,
          height: 30
        };

        const parentRect = {
          x: 10,
          y: 10,
          height: 120,
          width: 110
        };

        expect(() => {
          rectContainsRect(childRect, parentRect);
        }).to.throw('One or more entries are either not a number or the parent rect has wrongly specified width and height');
      });

      it('should throw error if y is missing', () => {
        const childRect = {
          x: 20,
          width: 10,
          height: 30
        };

        const parentRect = {
          x: 10,
          y: 10,
          height: 120,
          width: 110
        };

        expect(() => {
          rectContainsRect(childRect, parentRect);
        }).to.throw('One or more entries are either not a number or the parent rect has wrongly specified width and height');
      });

      it('should throw error if both x and y are missing', () => {
        const childRect = {
          width: 10,
          height: 30
        };

        const parentRect = {
          x: 10,
          y: 10,
          height: 120,
          width: 110
        };

        expect(() => {
          rectContainsRect(childRect, parentRect);
        }).to.throw('One or more entries are either not a number or the parent rect has wrongly specified width and height');
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
        }).to.throw('One or more entries are either not a number or the parent rect has wrongly specified width and height');
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
        }).to.throw('One or more entries are either not a number or the parent rect has wrongly specified width and height');
      });

      it('should throw error if parentRect has no width nor height', () => {
        const childRect = {
          x: 1,
          y: 1
        };

        const parentRect = {};

        expect(() => {
          rectContainsRect(childRect, parentRect);
        }).to.throw('One or more entries are either not a number or the parent rect has wrongly specified width and height');
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
        x: 10,
        y: 10,
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
        x: 10,
        y: 40,
        height: 120,
        width: 110
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(false);
    });

    it('should fit by explicitly specifying settings', () => {
      const childRect = {
        x: 20,
        y: 5,
        width: 10,
        height: 30
      };

      const parentRect = {
        x: 10,
        y: 40,
        height: 120,
        width: 110
      };

      const settings = {
        rtl: true,
        orientation: 'top'
      };

      expect(rectContainsRect(childRect, parentRect, settings)).to.equal(true);
    });

    it('should not fit by explicitly specifying settings', () => {
      const childRect = {
        x: 20,
        y: 160,
        width: 10,
        height: 30
      };

      const parentRect = {
        x: 10,
        y: 40,
        height: 120,
        width: 110
      };

      const settings = {
        rtl: false,
        orientation: 'bottom'
      };

      expect(rectContainsRect(childRect, parentRect, settings)).to.equal(false);
    });

    it('should not because childRects width is bigger than parentRect', () => {
      const childRect = {
        x: 20,
        y: 30,
        width: 120,
        height: 30
      };

      const parentRect = {
        x: 10,
        y: 40,
        height: 120,
        width: 110
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(false);
    });

    it('should not because childRects height is bigger than parentRect', () => {
      const childRect = {
        x: 20,
        y: 30,
        width: 50,
        height: 130
      };

      const parentRect = {
        x: 10,
        y: 40,
        height: 120,
        width: 110
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(false);
    });

    it('should not because childRects height and width is bigger than parentRect', () => {
      const childRect = {
        x: 20,
        y: 30,
        width: 150,
        height: 130
      };

      const parentRect = {
        x: 10,
        y: 40,
        height: 120,
        width: 110
      };

      expect(rectContainsRect(childRect, parentRect)).to.equal(false);
    });
  });
});
