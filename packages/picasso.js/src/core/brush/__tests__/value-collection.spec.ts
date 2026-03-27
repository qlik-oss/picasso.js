import valueCollection from '../value-collection';

describe('value-collection', () => {
  describe('api', () => {
    it('should be a factory function', () => {
      expect(valueCollection).to.be.a('function');
    });
  });

  describe('add', () => {
    it('should return true when successfully adding a value', () => {
      const vc = valueCollection();
      expect(vc.add('Foo')).to.equal(true);
    });

    it('should return false when adding new value fails', () => {
      const vc = valueCollection();
      vc.add('Foo');
      expect(vc.add('Foo')).to.equal(false);
    });

    it('should not add duplicate values', () => {
      const vc = valueCollection();
      vc.add('Foo');
      vc.add('Foo');
      vc.add(3);
      expect(vc.values()).to.eql(['Foo', 3]);
    });
  });

  describe('remove', () => {
    let vc;

    beforeEach(() => {
      vc = valueCollection();
      vc.add('Foo');
      vc.add('Foo');
      vc.add(3);
    });

    it('should return true when succssfully remove an existing value', () => {
      expect(vc.remove('Foo')).to.equal(true);
    });

    it('should return false when attempting to remove a non-existing value', () => {
      expect(vc.remove('Noop')).to.equal(false);
    });

    it('should remove values', () => {
      vc.remove('Dummy');
      vc.remove('Foo');
      expect(vc.values()).to.eql([3]);
    });
  });

  describe('contains', () => {
    let vc;

    beforeEach(() => {
      vc = valueCollection();
      vc.add(false);
      vc.add('Foo');
      vc.add(3);
    });

    it('should contain a false boolean', () => {
      expect(vc.contains(false)).to.equal(true);
    });

    it('should contain number 3', () => {
      expect(vc.contains(3)).to.equal(true);
    });

    it('should contain string Foo', () => {
      expect(vc.contains('Foo')).to.equal(true);
    });

    it('should return false when checking for a non-existing vale', () => {
      expect(vc.contains('Waldo')).to.equal(false);
    });
  });

  it('should clear values', () => {
    const vc = valueCollection();
    vc.add('Foo');
    vc.add(3);
    expect(vc.values()).to.eql(['Foo', 3]);
    vc.clear();
    expect(vc.values()).to.eql([]);
  });
});
