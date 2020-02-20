import minmax from '../min-max';

describe('minmax', () => {
  it('should default to [0,1]', () => {
    expect(minmax()).to.eql([0, 1]);
    expect(minmax({})).to.eql([0, 1]);
  });

  it('should use provided min value', () => {
    expect(
      minmax({
        min: 13,
      })
    ).to.eql([13, 1]);
  });

  it('should use provided max value', () => {
    expect(
      minmax({
        max: 13,
      })
    ).to.eql([0, 13]);
  });

  it('should calculate min from object array', () => {
    let arr = [{ min: () => 4 }, { min: () => 3 }];
    expect(minmax({ max: 15 }, arr)).to.eql([3, 15]);
  });

  it('should calculate max from object array', () => {
    let arr = [{ max: () => 4 }, { max: () => 3 }];
    expect(minmax({ min: -4 }, arr)).to.eql([-4, 4]);
  });

  it('should handle NaN values in object array', () => {
    let arr = [{ min: () => 'min', max: () => 'max' }];
    expect(minmax({}, arr)).to.eql([0, 1]);
  });
});
