import memoize from '../memoize';

describe('memoize', () => {
  let func;

  beforeEach(() => {
    func = memoize(val => `$${val}`);
  });

  it('should cache return value', () => {
    func(123);
    expect(func.has(123)).to.be.true;
    expect(func.size()).to.equal(1);
  });

  it('should return cached value', () => {
    const setSpy = sinon.spy(func, 'set');
    const getSpy = sinon.spy(func, 'get');
    expect(func(123)).to.equal('$123'); // Calls set
    expect(func(123)).to.equal('$123'); // Calls get
    expect(setSpy).to.have.been.calledOnce;
    expect(getSpy).to.have.been.calledOnce;
    expect(func.size()).to.equal(1);
  });

  it('should cache all stringifiable values', () => {
    const setSpy = sinon.spy(func, 'set');
    expect(func(undefined)).to.equal('$undefined');
    expect(func(null)).to.equal('$null');
    expect(func({})).to.equal('$[object Object]');

    expect(setSpy).to.have.been.calledWith(undefined, '$undefined');
    expect(setSpy).to.have.been.calledWith(null, '$null');
    expect(setSpy).to.have.been.calledWith({}, '$[object Object]');
    expect(func.size()).to.equal(3);
  });

  it('should handle multiple arguments', () => {
    const funcSpy = sinon.stub().returns('1337');
    func = memoize(funcSpy, { multipleArguments: true });
    const setSpy = sinon.spy(func, 'set');

    func(1, 2, 3, 4, 5);

    expect(funcSpy).to.have.been.calledWith(1, 2, 3, 4, 5);
    expect(setSpy).to.have.been.calledWith([1, 2, 3, 4, 5], '1337');
    expect(func.size()).to.equal(1);
    expect(func.has([1, 2, 3, 4, 5])).to.be.true;
    expect(func.get([1, 2, 3, 4, 5])).to.be.equal('1337');
  });

  it('should behave as a first-in-first-out cache when max size is reached', () => {
    func = memoize(val => `$${val}`, { size: 1 });
    expect(func(1)).to.equal('$1'); // Calls set
    expect(func(2)).to.equal('$2'); // Calls set and purge the previous call from the cache
    expect(func.size()).to.equal(1);
    expect(func.has(1)).to.be.false;
    expect(func.has(2)).to.be.true;
  });

  it('should use cache key from optional toKey function', () => {
    func = memoize(val => `$${val}`, { toKey: arg => `KEY_${arg}` });
    expect(func(123)).to.equal('$123');
    expect(func.has('KEY_123')).to.be.true;
    expect(func.get('KEY_123')).to.equal('$123');
    expect(func.size()).to.equal(1);
  });
});
