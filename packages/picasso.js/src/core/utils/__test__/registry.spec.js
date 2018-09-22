import registry from '../registry';

describe('Registry', () => {
  let reg;
  beforeEach(() => {
    reg = registry();
  });

  describe('add', () => {
    it('should register a key', () => {
      const fn = () => {};
      const registered = reg.add('foo', fn);
      expect(reg('foo')).to.equal(fn);
      expect(registered).to.equal(true);
    });
    it('should throw error if key is invalid', () => {
      let fn = () => {
          reg.register('');
        },
        fn2 = () => {
          reg.register(5);
        };

      expect(fn).to.throw('Invalid argument: key must be a non-empty string');
      expect(fn2).to.throw('Invalid argument: key must be a non-empty string');
    });

    it('should not register if key is taken', () => {
      reg.register('a', () => {});
      const registered = reg.register('a', () => {});
      expect(registered).to.equal(false);
    });
  });
});
