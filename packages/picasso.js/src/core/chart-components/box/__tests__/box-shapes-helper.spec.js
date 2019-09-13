import {
  oob,
  box,
  verticalLine,
  horizontalLine,
  getBoxWidth
} from '../box-shapes-helper';


describe('box shapes', () => {
  describe('out of bounds arrows', () => {
    it('should create a correct out of bounds shape at the bottom of the graph', () => {
      const item = {
        major: 0.3,
        oob: {
          size: 10
        }
      };

      // We mock the symbol() function here
      let result = oob({
        value: 1, item, boxCenter: item.major, rendWidth: 100, rendHeight: 100, flipXY: false, symbol: (v) => v
      });

      expect(result).to.eql({
        size: 10,
        startAngle: -90,
        x: 30,
        y: 95
      });

      item.major = 0.5;
    });

    it('should create a correct out of bounds shape at the top of the graph', () => {
      const item = {
        major: 0.75,
        oob: {
          size: 10
        }
      };

      // We mock the symbol() function here
      let result = oob({
        value: 0, item, boxCenter: item.major, rendWidth: 100, rendHeight: 100, flipXY: false, symbol: (v) => v
      });

      expect(result).to.eql({
        size: 10,
        startAngle: 90,
        x: 75,
        y: 5
      });
    });
  });

  it('should create a correct out of bounds shape at the bottom of the graph with flipXY', () => {
    const item = {
      major: 0.3,
      oob: {
        size: 10
      }
    };

    // We mock the symbol() function here
    let result = oob({
      value: 1, item, boxCenter: item.major, rendWidth: 200, rendHeight: 150, flipXY: true, symbol: (v) => v
    });

    expect(result).to.eql({
      size: 10,
      startAngle: 0,
      x: 195,
      y: 45
    });

    item.major = 0.5;
  });

  it('should create a correct out of bounds shape at the top of the graph with flipXY', () => {
    const item = {
      major: 0.75,
      oob: {
        size: 10
      }
    };

    // We mock the symbol() function here
    let result = oob({
      value: 0, item, boxCenter: item.major, rendWidth: 200, rendHeight: 150, flipXY: true, symbol: (v) => v
    });

    expect(result).to.eql({
      size: 10,
      startAngle: 180,
      x: 5,
      y: 112.5
    });
  });

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
        item, boxWidth, boxPadding, rendWidth: 100, rendHeight: 100, flipXY: false
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
        item, boxWidth, boxPadding, rendWidth: 200, rendHeight: 100, flipXY: false
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
        item, boxWidth, boxPadding, rendWidth: 100, rendHeight: 100, flipXY: true
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
        item, boxWidth, boxPadding, rendWidth: 200, rendHeight: 100, flipXY: true
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
        item, from: 0.25, to: 0.75, boxCenter: 0.5, rendWidth: 100, rendHeight: 100, flipXY: false
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
        item, from: 0.25, to: 0.75, boxCenter: 0.5, rendWidth: 200, rendHeight: 100, flipXY: false
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
        item, from: 0.25, to: 0.75, boxCenter: 0.5, rendWidth: 200, rendHeight: 100, flipXY: true
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
        item, key: 'med', position: 0.5, width: 0.5, boxCenter: 0.5, rendWidth: 100, rendHeight: 100, flipXY: false
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
        item, key: 'low', position: 0.5, width: 0.5, boxCenter: 0.5, rendWidth: 200, rendHeight: 100, flipXY: false
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
        item, key: 'med', position: 0.5, width: 0.5, boxCenter: 0.5, rendWidth: 200, rendHeight: 100, flipXY: true
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

  describe('getBoxWidth', () => {
    let item;
    let avaialbleWidth;
    let bandwidth;

    beforeEach(() => {
      avaialbleWidth = 100;
      bandwidth = 0.1;
      item = {
        box: {
          width: 0.5,
          maxWidthPx: NaN,
          minWidthPx: NaN
        }
      };
    });

    it('width is between min and max pixel width', () => {
      const w = getBoxWidth(bandwidth, item, avaialbleWidth);
      expect(w).to.equal(0.05);
    });

    it('width is less than min width', () => {
      item.box.minWidthPx = 0.1 * avaialbleWidth;
      const w = getBoxWidth(bandwidth, item, avaialbleWidth);
      expect(w).to.equal(0.1);
    });

    it('negative bandwidth - width is less than min width', () => {
      bandwidth = -0.1;
      item.box.minWidthPx = 0.1 * avaialbleWidth;
      const w = getBoxWidth(bandwidth, item, avaialbleWidth);
      expect(w).to.equal(-0.1);
    });

    it('width is larger than max width', () => {
      item.box.maxWidthPx = 0.01 * avaialbleWidth;
      const w = getBoxWidth(bandwidth, item, avaialbleWidth);
      expect(w).to.equal(0.01);
    });

    it('negative bandwidth - width is larger than max width', () => {
      bandwidth = -0.1;
      item.box.maxWidthPx = 0.01 * avaialbleWidth;
      const w = getBoxWidth(bandwidth, item, avaialbleWidth);
      expect(w).to.equal(-0.01);
    });
  });
});
