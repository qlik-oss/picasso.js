import collections from '../collections';

describe('data collections', () => {
  describe('create', () => {
    it('should throw when no key is provided', () => {
      const fn = () => collections([{}]);
      expect(fn).to.throw('Data collection is missing "key" property');
    });

    it('should throw when "collection" property is provided', () => {
      let fn = () => collections([{ key: 'a', data: { collection: '' } }]);
      expect(fn).to.throw('Data config for collections may not reference other collections');
    });

    it('should not call extractor on initiation', () => {
      let extractor = sinon.stub();
      collections([{ key: 'a', data: 'foo' }], 'dd', 'opts', extractor);
      expect(extractor.callCount).to.equal(0);
    });
  });

  describe('get', () => {
    it('should return a function', () => {
      let extractor = sinon.stub();
      let fn = collections([{ key: 'a', data: 'foo' }], 'dd', 'opts', extractor);
      expect(fn).to.be.a('function');
    });

    it('should fetch the correct collection', () => {
      let extractor = sinon.stub();
      extractor.withArgs('extracted', 'dd', 'opts').returns('a - extracted');
      extractor.withArgs('stacked', 'dd', 'opts').returns(false);
      let fn = collections([
        { key: 'a', data: 'extracted' },
        { key: 'b', data: 'stacked' }
      ], 'dd', 'opts', extractor);
      expect(fn('a')).to.equal('a - extracted');
      expect(fn('b')).to.equal(false);
    });

    it('should extract only once', () => {
      const extractor = sinon.stub();
      const fn = collections([{ key: 'a', data: 'foo' }], 'dd', 'opts', extractor);
      fn('a');
      fn('a');
      fn('a');
      expect(extractor.callCount).to.equal(1);
    });
  });
});
