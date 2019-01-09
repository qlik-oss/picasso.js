import {
  create,
  collection
} from '..';

describe('chart formatters', () => {
  describe('collection', () => {
    let fn;
    beforeEach(() => {
      fn = sinon.spy(def => (typeof def === 'object' && !Object.keys(def).length ? 'fallback' : def));
    });

    it('should return fallback formatter when unknown config is used', () => {
      const s = collection({}, null, null, fn).get({});
      expect(s).to.equal('fallback');
    });

    it('should return formatter from config', () => {
      const s = collection({ time: 'tick tock' }, null, null, fn).get('time');
      expect(s).to.equal('tick tock');
    });

    it('should return named formatter from config', () => {
      const s = collection({ time: 'tick tock' }, null, null, fn).get({ formatter: 'time' });
      expect(s).to.equal('tick tock');
    });

    it('should return named type from config', () => {
      const s = collection({ time: 'tick tock' }, null, null, fn).get({ type: 'time' });
      expect(s).to.equal('tick tock');
    });

    it('should maintain cache of created formatters', () => {
      const c = collection({ time: 'tick tock' }, null, null, fn);
      c.get('time');
      c.get('time');
      expect(fn.callCount).to.equal(1);
    });

    it('should create formatter on the fly', () => {
      const s = collection({}, null, null, fn).get({ data: 'd' });
      expect(s).to.eql({ data: 'd' });
    });

    it('should return all formatters', () => {
      const s = collection({ time: 'tick tock', p: '%' }, null, null, fn);
      expect(s.all()).to.eql({
        time: 'tick tock',
        p: '%'
      });
    });
  });

  describe('create', () => {
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
});
