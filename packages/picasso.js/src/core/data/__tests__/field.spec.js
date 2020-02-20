import field from '../field';

describe('Field', () => {
  describe('defaults', () => {
    const dd = {
      source: 'magic-table',
      min: 1,
      max: 2,
      tags: ['a', 'b'],
      title: 'wohoo',
      values: ['a', 'c', 'a'],
    };
    let f;
    beforeEach(() => {
      f = field(dd);
    });

    it('should return id', () => {
      expect(f.id()).to.equal('magic-table/wohoo');
    });

    it('should return min value', () => {
      expect(f.min()).to.equal(1);
    });

    it('should return max value', () => {
      expect(f.max()).to.equal(2);
    });

    it('should return tags', () => {
      expect(f.tags()).to.deep.equal(['a', 'b']);
    });

    it('should return title', () => {
      expect(f.title()).to.equal('wohoo');
    });

    it('should return values', () => {
      expect(f.items()).to.deep.equal(['a', 'c', 'a']);
    });

    it('should return raw data', () => {
      expect(f.raw()).to.deep.equal(dd);
    });
  });

  describe('custom accessors', () => {
    let f;
    beforeEach(() => {
      f = field(
        {
          mm: { qMin: -3, maximum: 2 },
          meta: {
            taggar: [{ v: 'numeric' }, { v: 'date' }],
          },
          t: 'custom',
          values: [{ v: 1 }, { v: 6 }, { v: 6 }],
        },
        {
          min: d => d.mm.qMin,
          max: d => d.mm.maximum,
          tags: d => d.meta.taggar.map(x => x.v),
          title: d => d.t,
          values: d => d.values.map(x => x.v),
        }
      );
    });

    it('should return min value', () => {
      expect(f.min()).to.equal(-3);
    });

    it('should return max value', () => {
      expect(f.max()).to.equal(2);
    });

    it('should return tags', () => {
      expect(f.tags()).to.deep.equal(['numeric', 'date']);
    });

    it('should return title', () => {
      expect(f.title()).to.equal('custom');
    });

    it('should return values', () => {
      expect(f.items()).to.deep.equal([1, 6, 6]);
    });
  });
});
