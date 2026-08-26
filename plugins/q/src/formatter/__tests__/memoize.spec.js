import memoize from '../memoize';

describe('memoize', () => {
  let func;

  beforeEach(() => {
    func = memoize((val) => `$${val}`);
  });

  it('should cache return value', () => {
    func(123);
    expect(func.has(123)).to.be.true;
    expect(func.size()).to.equal(1);
  });

  it('should return cached value', () => {
    const setSpy = vi.spyOn(func, 'set');
    const getSpy = vi.spyOn(func, 'get');
    expect(func(123)).to.equal('$123'); // Calls set
    expect(func(123)).to.equal('$123'); // Calls get
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(func.size()).to.equal(1);
  });

  it('should cache all stringifiable values', () => {
    const setSpy = vi.spyOn(func, 'set');
    expect(func(undefined)).to.equal('$undefined');
    expect(func(null)).to.equal('$null');
    expect(func({})).to.equal('$[object Object]');

    expect(setSpy).toHaveBeenCalledWith(undefined, '$undefined');
    expect(setSpy).toHaveBeenCalledWith(null, '$null');
    expect(setSpy).toHaveBeenCalledWith({}, '$[object Object]');
    expect(func.size()).to.equal(3);
  });

  it('should handle multiple arguments', () => {
    const funcSpy = vi.fn().mockReturnValue('1337');
    func = memoize(funcSpy, { multipleArguments: true, toKey: (...args) => args });
    const setSpy = vi.spyOn(func, 'set');

    func(1, 2, 3, 4, 5);

    expect(funcSpy).toHaveBeenCalledWith(1, 2, 3, 4, 5);
    expect(setSpy).toHaveBeenCalledWith([1, 2, 3, 4, 5], '1337');
    expect(func.size()).to.equal(1);
    expect(func.has([1, 2, 3, 4, 5])).to.be.true;
    expect(func.get([1, 2, 3, 4, 5])).to.be.equal('1337');
  });

  it('should behave as a first-in-first-out cache when max size is reached', () => {
    func = memoize((val) => `$${val}`, { size: 1 });
    expect(func(1)).to.equal('$1'); // Calls set
    expect(func(2)).to.equal('$2'); // Calls set and purge the previous call from the cache
    expect(func.size()).to.equal(1);
    expect(func.has(1)).to.be.false;
    expect(func.has(2)).to.be.true;
  });

  it('should use cache key from optional toKey function', () => {
    func = memoize((val) => `$${val}`, { toKey: (arg) => `KEY_${arg}` });
    expect(func(123)).to.equal('$123');
    expect(func.has('KEY_123')).to.be.true;
    expect(func.get('KEY_123')).to.equal('$123');
    expect(func.size()).to.equal(1);
  });
});
