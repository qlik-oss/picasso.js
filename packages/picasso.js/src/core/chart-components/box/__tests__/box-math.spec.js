import { cap, resolveDiff, getBoxWidth } from '../box-math';

describe('box math', () => {
  describe('cap', () => {
    it('should cap numbers correctly', () => {
      expect(cap(0, 100, -1)).to.equal(0);
      expect(cap(0, 100, 10)).to.equal(10);
      expect(cap(-10, 100, 4)).to.equal(4);
      expect(cap(-10, 100, -4)).to.equal(-4);
      expect(cap(-10, 100, 400)).to.equal(100);
    });
  });

  describe('resolveDiff', () => {
    it('should calculate right diff between two normalized values', () => {
      expect(resolveDiff({
        start: 0.2, end: 0.6, minPx: 0, maxPx: 100
      }).actualDiff).to.equal(40);
      expect(resolveDiff({
        start: 0.2, end: 0.6, minPx: 0, maxPx: 100
      }).startModifier).to.equal(0);
      expect(resolveDiff({
        start: 0.2, end: 0.6, minPx: 0, maxPx: 100
      }).actualLow).to.equal(20);

      expect(resolveDiff({
        start: 0.2, end: 0.5, minPx: 0, maxPx: 100
      }).actualDiff).to.equal(30);
      expect(resolveDiff({
        start: 0.2, end: 0.5, minPx: 0, maxPx: 100
      }).startModifier).to.equal(0);
      expect(resolveDiff({
        start: 0.2, end: 0.5, minPx: 0, maxPx: 100
      }).actualLow).to.equal(20);

      expect(resolveDiff({
        start: -0.5, end: 0.75, minPx: 0, maxPx: 100
      }).actualDiff).to.equal(85);
      expect(resolveDiff({
        start: -0.5, end: 0.75, minPx: 0, maxPx: 100
      }).startModifier).to.equal(0);
      expect(resolveDiff({
        start: -0.5, end: 0.75, minPx: 0, maxPx: 100
      }).actualLow).to.equal(-10);

      expect(resolveDiff({
        start: 0.1, end: 0.12, minPx: 50, maxPx: 100
      }).actualDiff).to.equal(50);
      expect(resolveDiff({
        start: 0.1, end: 0.12, minPx: 50, maxPx: 100
      }).startModifier).to.equal(24);
      expect(resolveDiff({
        start: 0.1, end: 0.12, minPx: 50, maxPx: 100
      }).actualLow).to.equal(-14);
    });
  });

  describe('getBoxWidth', () => {
    let item;
    let maxMajorWidth;
    let bandwidth;

    beforeEach(() => {
      maxMajorWidth = 100;
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
      const w = getBoxWidth({
        bandwidth,
        width: item.box.width,
        minWidthPx: item.box.minWidthPx,
        maxWidthPx: item.box.maxWidthPx,
        maxMajorWidth
      });
      expect(w).to.equal(0.05);
    });

    it('width is less than min width', () => {
      item.box.minWidthPx = 0.1 * maxMajorWidth;
      const w = getBoxWidth({
        bandwidth,
        width: item.box.width,
        minWidthPx: item.box.minWidthPx,
        maxWidthPx: item.box.maxWidthPx,
        maxMajorWidth
      });
      expect(w).to.equal(0.1);
    });

    it('width is larger than max width', () => {
      item.box.maxWidthPx = 0.01 * maxMajorWidth;
      const w = getBoxWidth({
        bandwidth,
        width: item.box.width,
        minWidthPx: item.box.minWidthPx,
        maxWidthPx: item.box.maxWidthPx,
        maxMajorWidth
      });
      expect(w).to.equal(0.01);
    });
  });
});
