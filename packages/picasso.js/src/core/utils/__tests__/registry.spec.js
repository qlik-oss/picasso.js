import registry from '../registry';

describe('Registry', () => {
  let reg;
  let logger;

  beforeEach(() => {
    logger = {
      warn: sinon.spy(),
    };
    reg = registry('', 'myRegistry', logger);
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

    it('should warn if key does not exist', () => {
      reg.register('spelledCorrect', () => {});
      const attempt = reg('spelledWrong');
      expect(attempt).to.equal(undefined);
      expect(logger.warn).to.have.been.calledOnce;
    });
  });
});
