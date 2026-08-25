import { alignmentToNumber } from '../lines-and-labels';

describe('alignmentToNumber', () => {
  it('should fallback on undefined, Infinity and NaN', () => {
    expect(alignmentToNumber(undefined)).to.equal(0);
    expect(alignmentToNumber(Infinity)).to.equal(0);
    expect(alignmentToNumber(-Infinity)).to.equal(0);
    expect(alignmentToNumber(NaN)).to.equal(0);
  });

  it('should handle numeric values', () => {
    expect(alignmentToNumber(0)).to.equal(0);
    expect(alignmentToNumber(0.5)).to.equal(0.5);
    expect(alignmentToNumber(1)).to.equal(1);
  });

  it('should handle string values', () => {
    expect(alignmentToNumber('top')).to.equal(0);
    expect(alignmentToNumber('left')).to.equal(0);

    expect(alignmentToNumber('center')).to.equal(0.5);
    expect(alignmentToNumber('middle')).to.equal(0.5);

    expect(alignmentToNumber('bottom')).to.equal(1);
    expect(alignmentToNumber('right')).to.equal(1);
  });
});
