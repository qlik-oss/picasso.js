import getValue from '../get-value';

describe('get-value', () => {
  let object;

  beforeEach(() => {
    object = {
      string: 'string 1',
      number: 1,
      boolean: true,
      object: { id: 'object 1' },
      array: [1, 2, 3],
      second: {
        string: 'string 2',
        number: 2,
        boolean: false,
        object: { id: 'object 2' },
        array: [4, 5, 6],
        third: {
          string: 'string 3',
          number: 3,
          boolean: true,
          object: { id: 'object 3' },
          array: [7, 8, 9],
        },
      },
    };
  });

  it('should return fallback value if object is undefined', () => {
    expect(getValue(undefined, '', 'fallback')).to.equal('fallback');
  });

  it('should return fallback value if reference is undefined', () => {
    expect(getValue(object, undefined, 'fallback')).to.equal('fallback');
  });

  it('should get correct values from first level', () => {
    expect(getValue(object, 'string')).to.equal('string 1');
    expect(getValue(object, 'number')).to.equal(1);
    expect(getValue(object, 'boolean')).to.be.true;
    expect(getValue(object, 'object')).to.deep.equal({ id: 'object 1' });
    expect(getValue(object, 'array')).to.deep.equal([1, 2, 3]);
    expect(getValue(object, 'array.1')).to.equal(2);
    expect(getValue(object, 'missing', 'fallback')).to.equal('fallback');
  });

  it('should get correct values from second level', () => {
    expect(getValue(object, 'second.string')).to.equal('string 2');
    expect(getValue(object, 'second.number')).to.equal(2);
    expect(getValue(object, 'second.boolean')).to.be.false;
    expect(getValue(object, 'second.object')).to.deep.equal({ id: 'object 2' });
    expect(getValue(object, 'second.array')).to.deep.equal([4, 5, 6]);
    expect(getValue(object, 'second.array.1')).to.equal(5);
    expect(getValue(object, 'second.missing', 'fallback')).to.equal('fallback');
  });

  it('should get correct values from third level', () => {
    expect(getValue(object, 'second.third.string')).to.equal('string 3');
    expect(getValue(object, 'second.third.number')).to.equal(3);
    expect(getValue(object, 'second.third.boolean')).to.be.true;
    expect(getValue(object, 'second.third.object')).to.deep.equal({ id: 'object 3' });
    expect(getValue(object, 'second.third.array')).to.deep.equal([7, 8, 9]);
    expect(getValue(object, 'second.third.array.1')).to.equal(8);
    expect(getValue(object, 'second.third.missing', 'fallback')).to.equal('fallback');
  });
});
