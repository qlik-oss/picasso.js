import numeric from '../numeric';

describe('Numeric interpolator', () => {
  it('should linearly interpolate between two numbers', () => {
    expect(numeric.interpolate(10, 20, 0.2)).to.equal(12);
  });

  it('should extend outside given range', () => {
    expect(numeric.interpolate(10, 20, 2)).to.equal(30);
    expect(numeric.interpolate(10, 20, -0.5)).to.equal(5);
  });
});
