import interaction from '..';

describe('interaction plugin api', () => {
  it('should return the native interaction', () => {
    expect(interaction('native')).to.be.a('function');
  });

  it('should register new interaction', () => {
    const myObj = {
      a: 'a',
      b: 'b',
    };
    interaction('test', myObj);
    expect(interaction('test')).to.equal(myObj);
  });
});
