import dataset from '../../../../src/core/data/dataset';

describe('dataset', () => {
  describe('api', () => {
    const d = dataset();
    const api = {
      key: 'function',
      raw: 'function',
      field: 'function',
      fields: 'function',
      extract: 'function',
      hierarchy: 'function'
    };

    Object.keys(api).forEach((key) => {
      it(`#${key}`, () => {
        expect(d[key]).to.be.a(api[key]);
      });
    });
  });

  describe('field()', () => {
    let d;
    before(() => {
      const data = [
        ['Product', 'Sales'],
        ['Cars', 56],
        ['Cars', 59]
      ];
      d = dataset({ data });
    });

    it('should find the second field', () => {
      const f = d.field(1);
      expect(f.title()).to.equal('Sales');
      expect(f.items()).to.eql([56, 59]);
    });
  });
});
