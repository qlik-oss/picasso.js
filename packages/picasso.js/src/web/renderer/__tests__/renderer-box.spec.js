import box from '../renderer-box';

describe('renderer-box', () => {
  it('should return a rect given valid values', () => {
    const b = box({
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    });
    expect(b).to.containSubset({
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    });
  });

  it('should return default x value given input is invalid', () => {
    const b = box({
      x: NaN,
      y: 2,
      width: 3,
      height: 4,
    });
    expect(b).to.containSubset({
      x: 0,
      y: 2,
      width: 3,
      height: 4,
    });
  });

  it('should return default y value given input is invalid', () => {
    const b = box({
      x: 1,
      y: NaN,
      width: 3,
      height: 4,
    });
    expect(b).to.containSubset({
      x: 1,
      y: 0,
      width: 3,
      height: 4,
    });
  });

  it('should return default width value given input is invalid', () => {
    const b = box({
      x: 1,
      y: 2,
      width: NaN,
      height: 4,
    });
    expect(b).to.containSubset({
      x: 1,
      y: 2,
      width: 0,
      height: 4,
    });
  });

  it('should return default height value given input is invalid', () => {
    const b = box({
      x: NaN,
      y: 2,
      width: 3,
      height: NaN,
    });
    expect(b).to.containSubset({
      x: 0,
      y: 2,
      width: 3,
      height: 0,
    });
  });

  describe('scaleRatio', () => {
    it('should return a scaleRatio given valid values', () => {
      const b = box({
        scaleRatio: { x: 3, y: 4 },
      });
      expect(b).to.containSubset({
        scaleRatio: { x: 3, y: 4 },
      });
    });

    it('should return default x value given input is invalid', () => {
      const b = box({
        scaleRatio: { y: 2 },
      });
      expect(b).to.containSubset({
        scaleRatio: { x: 1, y: 2 },
      });
    });

    it('should return default y value given input is invalid', () => {
      const b = box({
        scaleRatio: { x: 2 },
      });
      expect(b).to.containSubset({
        scaleRatio: { x: 2, y: 1 },
      });
    });

    it('should return default value given scaleRatio is missing', () => {
      const b = box({});
      expect(b).to.containSubset({
        scaleRatio: { x: 1, y: 1 },
      });
    });
  });

  describe('margin', () => {
    it('should return a margin given valid values', () => {
      const b = box({
        margin: { left: 3, top: 4 },
      });
      expect(b).to.containSubset({
        margin: { left: 3, top: 4 },
      });
    });

    it('should return default left value given input is invalid', () => {
      const b = box({
        margin: { top: 2 },
      });
      expect(b).to.containSubset({
        margin: { left: 0, top: 2 },
      });
    });

    it('should return default top value given input is invalid', () => {
      const b = box({
        margin: { left: 2 },
      });
      expect(b).to.containSubset({
        margin: { left: 2, top: 0 },
      });
    });

    it('should return default value given margin is missing', () => {
      const b = box({});
      expect(b).to.containSubset({
        margin: { left: 0, top: 0 },
      });
    });
  });

  describe('edgeBleed', () => {
    const props = ['left', 'right', 'top', 'bottom'];
    props.forEach(prop => {
      it(`should return ${prop} value given input is valid`, () => {
        const edgeBleed = {};
        edgeBleed[prop] = 123;
        const b = box({
          edgeBleed,
        });
        expect(b).to.containSubset({
          edgeBleed: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            bool: true,
            ...edgeBleed,
          },
        });
      });
    });
  });

  describe('computed', () => {});
});
