import dataset from '../dataset';

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

  describe('object array', () => {
    let d;
    before(() => {
      const data = [
        { product: 'Cars', sales: 56 },
        { product: 'Bikes', sales: 34 },
        { product: 'Shoes', sales: 23 }
      ];
      d = dataset({
        data
      });
    });

    it('should find product field', () => {
      const f = d.field(0);
      expect(f.title()).to.equal('product');
      expect(f.items()).to.eql(['Cars', 'Bikes', 'Shoes']);
    });

    it('should find sales field', () => {
      const f = d.field('sales');
      expect(f.title()).to.equal('sales');
      expect(f.items()).to.eql([56, 34, 23]);
    });
  });

  describe('object array with config', () => {
    let d;
    before(() => {
      const data = [
        { product: 'Cars', sales: 56 },
        { product: 'Bikes', sales: 34 },
        { product: 'Shoes', sales: 23 }
      ];
      d = dataset({
        data,
        config: {
          parse: {
            fields(flds) {
              return [
                {
                  key: 'product',
                  title: flds[0],
                  formatter: {},
                  value: v => v,
                  label: v => `#${v}`
                }, {
                  key: 'sales',
                  title: 'Sell sell sell',
                  formatter: {},
                  value: v => v + 4,
                  label: v => `-${v}-`
                },
                {
                  key: 'extra',
                  title: 'Added',
                  formatter: {
                    type: 'd3-number',
                    format: '.3f'
                  },
                  value: v => v,
                  label: v => `${v * 100}%`
                }
              ];
            },
            row(v) {
              if (v.product === 'Bikes') {
                return null;
              }
              return {
                product: v.product,
                sales: v.sales * 2,
                extra: v.sales * 100,
                dummy: 'foo'
              };
            }
          }
        }
      });
    });

    it('should find product field', () => {
      const f = d.field(0);
      expect(f.title()).to.equal('product');
      expect(f.items()).to.eql(['Cars', 'Shoes']);
    });

    it('should find sales field', () => {
      const f = d.field('sales');
      expect(f.title()).to.equal('Sell sell sell');
      expect(f.items()).to.eql([112, 46]);
    });

    it('should find extra field', () => {
      const f = d.field('Added');
      expect(f.key()).to.equal('extra');
      expect(f.items()).to.eql([5600, 2300]);
    });
  });

  describe('2d matrix', () => {
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

  describe('2d matrix with config', () => {
    let d;
    before(() => {
      const data = [
        ['Product', 'Sales'],
        ['Cars', 56],
        ['Bikes', 34]
      ];
      d = dataset({
        data,
        config: {
          parse: {
            fields(flds) {
              return [
                {
                  key: 'product',
                  title: flds[0],
                  formatter: {},
                  value: v => v,
                  label: v => `#${v}`
                }, {
                  key: 'sales',
                  title: 'Sell sell sell',
                  formatter: {},
                  value: v => v + 4,
                  label: v => `-${v}-`
                },
                {
                  key: 'extra',
                  title: 'Added',
                  formatter: {
                    type: 'd3-number',
                    format: '.3f'
                  },
                  value: v => v,
                  label: v => `${v * 100}%`,
                  dummy: 20
                }
              ];
            },
            row(r, i, fields) {
              return [r[0], r[1] * 2, fields[2].dummy + i + 1];
            }
          }
        }
      });
    });

    it('should find the second field', () => {
      const f = d.field('Sell sell sell');
      expect(f.title()).to.equal('Sell sell sell');
      expect(f.items()).to.eql([112, 68]);
      expect(f.value(33)).to.eql(37);
      expect(f.label(33)).to.eql('-33-');
    });

    it('should add a third field', () => {
      const f = d.field('extra');
      expect(f.title()).to.equal('Added');
      expect(f.items()).to.eql([21, 22]);
      expect(f.formatter()(0.22)).to.equal('0.220');
    });
  });

  describe('2d matrix without headers', () => {
    let d;
    before(() => {
      const data = [
        ['Cars', 56],
        ['Cars', 59]
      ];
      d = dataset({
        data,
        config: {
          parse: {
            headers: false
          }
        }
      });
    });

    it('should find the second field', () => {
      const f = d.field(1);
      expect(f.title()).to.equal('1');
      expect(f.items()).to.eql([56, 59]);
    });
  });

  describe('dsv with explicit delimiter', () => {
    let d;
    before(() => {
      const data = 'Product|Sales\nCars|56\nBikes|34';
      d = dataset({
        data,
        config: {
          parse: { delimiter: '|' }
        }
      });
    });

    it('should find product field', () => {
      const f = d.field(0);
      expect(f.title()).to.equal('Product');
      expect(f.items()).to.eql(['Cars', 'Bikes']);
    });

    it('should find sales field', () => {
      const f = d.field('Sales');
      expect(f.title()).to.equal('Sales');
      expect(f.items()).to.eql(['56', '34']);
    });
  });

  describe('dsv with guessed delimiter', () => {
    it('comma (,)', () => {
      const d = dataset({
        data: 'Product,Sales\nCars,56\nBikes,34'
      });
      const f = d.field(0);
      expect(f.title()).to.equal('Product');
      expect(f.items()).to.eql(['Cars', 'Bikes']);
    });

    it('semicolon (;)', () => {
      const d = dataset({
        data: 'Pro,d\tuct;Sales\nCars;56\nBikes;34'
      });
      const f = d.field(0);
      expect(f.title()).to.equal('Pro,d\tuct');
      expect(f.items()).to.eql(['Cars', 'Bikes']);
    });

    it('tab (\\t)', () => {
      const d = dataset({
        data: 'Pro,duct\tSales\nCars\t56\nBikes\t34'
      });
      const f = d.field(0);
      expect(f.title()).to.equal('Pro,duct');
      expect(f.items()).to.eql(['Cars', 'Bikes']);
    });

    it('; with header only', () => {
      const d = dataset({
        data: 'Product;Sales'
      });
      const f = d.field(0);
      expect(f.title()).to.equal('Product');
    });
  });
});
