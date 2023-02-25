import setValue from '../set-value';

describe('set-value', () => {
  let object;

  beforeEach(() => {
    object = {};
  });

  it('should be able to handle undefined object', () => {
    setValue(undefined, '', false);
  });

  it('should not mutate object if reference is undefined', () => {
    setValue(object, undefined, false);
    expect(object).to.deep.equal({});
  });

  it('should set correct values on first level', () => {
    setValue(object, 'string', 'string 1');
    setValue(object, 'number', 1);
    setValue(object, 'boolean', true);
    setValue(object, 'object', { id: 'object 1' });
    setValue(object, 'array', [1, 1, 1]);
    setValue(object, 'array.1', 0);

    expect(object).to.deep.equal({
      string: 'string 1',
      number: 1,
      boolean: true,
      object: { id: 'object 1' },
      array: [1, 0, 1],
    });

    setValue(object, 'string', undefined);

    expect(object).to.deep.equal({
      number: 1,
      boolean: true,
      object: { id: 'object 1' },
      array: [1, 0, 1],
    });
  });

  it('should set correct values on second level', () => {
    setValue(object, 'collection.0.id', 1);
    setValue(object, 'second.string', 'string 2');
    setValue(object, 'second.number', 2);
    setValue(object, 'second.boolean', true);
    setValue(object, 'second.object', { id: 'object 2' });
    setValue(object, 'second.array', [2, 2, 2]);
    setValue(object, 'second.array.1', 0);

    expect(object).to.deep.equal({
      collection: [{ id: 1 }],
      second: {
        string: 'string 2',
        number: 2,
        boolean: true,
        object: { id: 'object 2' },
        array: [2, 0, 2],
      },
    });

    setValue(object, 'second.string', undefined);

    expect(object).to.deep.equal({
      collection: [{ id: 1 }],
      second: {
        number: 2,
        boolean: true,
        object: { id: 'object 2' },
        array: [2, 0, 2],
      },
    });
  });

  it('should set correct values on third level', () => {
    setValue(object, 'second.collection.0.id', 1);
    setValue(object, 'second.third.string', 'string 3');
    setValue(object, 'second.third.number', 3);
    setValue(object, 'second.third.boolean', true);
    setValue(object, 'second.third.object', { id: 'object 3' });
    setValue(object, 'second.third.array', [3, 3, 3]);
    setValue(object, 'second.third.array.1', 0);

    expect(object).to.deep.equal({
      second: {
        collection: [{ id: 1 }],
        third: {
          string: 'string 3',
          number: 3,
          boolean: true,
          object: { id: 'object 3' },
          array: [3, 0, 3],
        },
      },
    });

    setValue(object, 'second.third.string', undefined);

    expect(object).to.deep.equal({
      second: {
        collection: [{ id: 1 }],
        third: {
          number: 3,
          boolean: true,
          object: { id: 'object 3' },
          array: [3, 0, 3],
        },
      },
    });
  });
});
