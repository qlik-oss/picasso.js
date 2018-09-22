import { box, verticalLine, horizontalLine } from '../box-shapes';

describe('box shapes', () => {
  describe('box', () => {
    it('should create a correct box shape', () => {
      const item = {
        start: 0.1,
        end: 0.9,
        major: 0.25,
        box: {
          minHeightPx: 1
        }
      };

      const boxWidth = 0.5;
      const boxPadding = 0;

      let result = box({
        item, boxWidth, boxPadding, rendwidth: 100, rendheight: 100, flipXY: false
      });

      expect(result).to.eql({
        minHeightPx: 1,
        type: 'rect',
        x: 25,
        y: 10,
        width: 50,
        height: 80,
        data: {},
        collider: {
          type: null
        }
      });


      result = box({
        item, boxWidth, boxPadding, rendwidth: 200, rendheight: 100, flipXY: false
      });

      expect(result).to.eql({
        minHeightPx: 1,
        type: 'rect',
        x: 50,
        y: 10,
        width: 100,
        height: 80,
        data: {},
        collider: {
          type: null
        }
      });

      result = box({
        item, boxWidth, boxPadding, rendwidth: 100, rendheight: 100, flipXY: true
      });

      expect(result).to.eql({
        minHeightPx: 1,
        type: 'rect',
        x: 10,
        y: 25,
        width: 80,
        height: 50,
        data: {},
        collider: {
          type: null
        }
      });

      item.data = { test: true };
      result = box({
        item, boxWidth, boxPadding, rendwidth: 200, rendheight: 100, flipXY: true
      });

      expect(result).to.eql({
        minHeightPx: 1,
        type: 'rect',
        x: 20,
        y: 25,
        width: 160,
        height: 50,
        data: {
          test: true
        },
        collider: {
          type: null
        }
      });
    });
  });

  describe('verticalLine', () => {
    it('should create a correct vertical line', () => {
      const item = {
        line: {
          strokeWidth: 1
        }
      };

      let result = verticalLine({
        item, from: 0.25, to: 0.75, boxCenter: 0.5, rendwidth: 100, rendheight: 100, flipXY: false
      });

      expect(result).to.eql({
        strokeWidth: 1,
        type: 'line',
        x1: 50,
        x2: 50,
        y1: 75,
        y2: 25,
        data: {},
        collider: {
          type: null
        }
      });

      result = verticalLine({
        item, from: 0.25, to: 0.75, boxCenter: 0.5, rendwidth: 200, rendheight: 100, flipXY: false
      });

      expect(result).to.eql({
        strokeWidth: 1,
        type: 'line',
        x1: 100,
        x2: 100,
        y1: 75,
        y2: 25,
        data: {},
        collider: {
          type: null
        }
      });

      item.data = { id: 3 };
      result = verticalLine({
        item, from: 0.25, to: 0.75, boxCenter: 0.5, rendwidth: 200, rendheight: 100, flipXY: true
      });

      expect(result).to.eql({
        strokeWidth: 1,
        type: 'line',
        x1: 150,
        x2: 50,
        y1: 50,
        y2: 50,
        data: {
          id: 3
        },
        collider: {
          type: null
        }
      });
    });
  });

  describe('horizontalLine', () => {
    it('should create a correct horizontal line', () => {
      const item = {
        med: {
          stroke: 'black'
        },
        low: {
          stroke: 'red'
        }
      };

      let result = horizontalLine({
        item, key: 'med', position: 0.5, width: 0.5, boxCenter: 0.5, rendwidth: 100, rendheight: 100, flipXY: false
      });

      expect(result).to.eql({
        stroke: 'black',
        type: 'line',
        x1: 25,
        x2: 75,
        y1: 50,
        y2: 50,
        r: 25,
        width: 50,
        cx: 50,
        cy: 50,
        data: {},
        collider: {
          type: null
        }
      });

      result = horizontalLine({
        item, key: 'low', position: 0.5, width: 0.5, boxCenter: 0.5, rendwidth: 200, rendheight: 100, flipXY: false
      });

      expect(result).to.eql({
        stroke: 'red',
        type: 'line',
        x1: 50,
        x2: 150,
        y1: 50,
        y2: 50,
        r: 50,
        width: 100,
        cx: 100,
        cy: 50,
        data: {},
        collider: {
          type: null
        }
      });

      item.data = { origin: 'test' };
      result = horizontalLine({
        item, key: 'med', position: 0.5, width: 0.5, boxCenter: 0.5, rendwidth: 200, rendheight: 100, flipXY: true
      });

      expect(result).to.eql({
        stroke: 'black',
        type: 'line',
        x1: 100,
        x2: 100,
        y1: 25,
        y2: 75,
        r: 25,
        width: 50,
        cx: 50,
        cy: 100,
        data: {
          origin: 'test'
        },
        collider: {
          type: null
        }
      });
    });
  });
});
