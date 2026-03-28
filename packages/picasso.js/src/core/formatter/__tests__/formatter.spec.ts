import formatter from '..';

describe('formatter', () => {
  it('should return the default d3 number formatter', () => {
    expect(formatter('d3-number')).to.be.a('function');
  });

  it('should return the default d3 time formatter', () => {
    expect(formatter('d3-time')).to.be.a('function');
  });
});
