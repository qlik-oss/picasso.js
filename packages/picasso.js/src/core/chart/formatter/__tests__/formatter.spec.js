import { create } from '..';

describe('chart formatters', () => {
  let deps;
  let formatterFn;
  beforeEach(() => {
    deps = {
      formatter: {
        has: sinon.stub(),
        get: sinon.stub()
      }
    };
    formatterFn = pattern => (value => `${pattern}${value}`);
  });

  it('should throw when type is not registered', () => {
    const fn = () => create({
      type: 'dummy'
    }, null, deps);
    expect(fn).to.throw('Formatter of type \'dummy\' was not found');
  });

  it('should create a formatter of a custom type', () => {
    deps.formatter.has.withArgs('custom').returns(true);
    deps.formatter.get.returns(formatterFn);
    const s = create({
      type: 'custom',
      format: '$'
    }, null, deps);
    expect(s(45)).to.equal('$45');
  });

  it('should create a formatter of a specific subtype', () => {
    deps.formatter.has.withArgs('custom-time').returns(true);
    deps.formatter.get.returns(formatterFn);
    const s = create({
      formatter: 'custom',
      type: 'time',
      format: '$'
    }, null, deps);
    expect(s(45)).to.equal('$45');
  });

  it('should create a number subtype by default', () => {
    deps.formatter.has.withArgs('custom-number').returns(true);
    deps.formatter.get.returns(formatterFn);
    const s = create({
      formatter: 'custom',
      format: '$'
    }, null, deps);
    expect(s(45)).to.equal('$45');
  });

  it('should return formatter from field', () => {
    const extractor = () => ({
      fields: [{
        formatter: () => (value => `${value} %%% `)
      }]
    });
    const s = create({
      data: {}
    }, null, deps, extractor);
    expect(s(45)).to.equal('45 %%% ');
  });
});
