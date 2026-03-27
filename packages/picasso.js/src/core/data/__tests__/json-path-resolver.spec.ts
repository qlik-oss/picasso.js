import resolve from '../json-path-resolver';

describe('JSON Path resolver', () => {
  it('should resolve basic path', () => {
    let p = '/path/to/paradise',
      obj = {
        path: {
          to: {
            paradise: 'heaven',
          },
        },
      };
    expect(resolve(p, obj)).to.equal('heaven');
  });

  it('should resolve path to array index', () => {
    let p = '/cars/1',
      obj = {
        cars: ['first', 'second'],
      };

    expect(resolve(p, obj)).to.equal('second');
  });

  it('should map array values when path to specific value is skipped', () => {
    let p = '/cars//brand',
      obj = {
        cars: [
          { brand: 'BMW', color: 'red' },
          { brand: 'Mercedes', color: 'silver' },
          { brand: 'Volvo', color: 'black' },
        ],
      };

    expect(resolve(p, obj)).to.deep.equal(['BMW', 'Mercedes', 'Volvo']);
  });
});
