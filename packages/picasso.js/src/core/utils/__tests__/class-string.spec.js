import classString from '../class-string';

describe('class string', () => {
  it('return a space separated string with object keys', () => {
    const classMap = {
      'class-A': true,
      'class-B': false,
      'class-C': true
    };
    expect(classString(classMap)).to.be.equal('class-A class-C');
  });
});
