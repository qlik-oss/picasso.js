import q from '../../src/data/dataset';

describe('q-data', () => {
  describe('create field', () => {
    const cube = {
      qSize: { qcx: 3, qcy: 20 },
      qDimensionInfo: [
        {
          qFallbackTitle: 'A'
        }
      ],
      qMeasureInfo: [
        {},
        {},
        {
          qFallbackTitle: 'C',
          qNumFormat: {
            qType: 'M',
            qFmt: '$#_00'
          },
          qAttrExprInfo: [{}, {
            qFallbackTitle: 'm attr expr title',
            qNumFormat: {
              qType: 'M',
              qFmt: '€#_00'
            }
          }]
        }
      ],
      qDataPages: [{ qMatrix: [] }]
    };

    const d = q({
      key: 'nyckel',
      data: cube,
      config: {
        localeInfo: {
          qDecimalSep: '_'
        }
      }
    });

    it('should pass localeInfo to field', () => {
      let f = d.field('qMeasureInfo/2');
      const form = f.formatter();
      expect(form(300)).to.eql('$300_00');
    });

    it('should pass localeInfo to attribute field', () => {
      let f = d.field('qMeasureInfo/2/qAttrExprInfo/1');
      const form = f.formatter();
      expect(form(300)).to.eql('€300_00');
    });
  });
  describe('find field', () => {
    const cube = {
      qSize: { qcx: 3, qcy: 20 },
      qDimensionInfo: [
        {
          qFallbackTitle: 'A',
          qAttrDimInfo: [{}, {
            label: 'title from label',
            qFallbackTitle: 'attr dim title',
            qSize: {},
            qDataPages: 'attr dim table pages'
          }],
          qAttrExprInfo: [{
            qFallbackTitle: 'attr expr title'
          }]
        },
        { qFallbackTitle: 'B' }
      ],
      qMeasureInfo: [
        {},
        {},
        {
          qFallbackTitle: 'C',
          qAttrDimInfo: [{}, {}, {
            qFallbackTitle: 'm attr dim title'
          }],
          qAttrExprInfo: [{}, {
            qFallbackTitle: 'm attr expr title'
          }]
        }
      ],
      qDataPages: [{ qMatrix: [] }]
    };

    const d = q({ key: 'nyckel', data: cube });

    it('should find attribute dimension on dimension', () => {
      const f = d.field('qDimensionInfo/0/qAttrDimInfo/1');
      expect(f.id()).to.eql('nyckel/qDimensionInfo/0/qAttrDimInfo/1');
      expect(f.key()).to.eql('qDimensionInfo/0/qAttrDimInfo/1');
      expect(f.title()).to.eql('attr dim title');
    });

    it('should find attribute expression on dimension', () => {
      const f = d.field('qDimensionInfo/0/qAttrExprInfo/0');
      expect(f.title()).to.eql('attr expr title');
    });

    it('should find attribute dimension on measure', () => {
      const f = d.field('qMeasureInfo/2/qAttrDimInfo/2');
      expect(f.title()).to.eql('m attr dim title');
    });

    it('should find attribute expression on measure', () => {
      const f = d.field('qMeasureInfo/2/qAttrExprInfo/1');
      expect(f.title()).to.eql('m attr expr title');
    });

    it('should find a main field by number', () => {
      const f = d.field(4);
      expect(f.title()).to.eql('C');
    });

    it('should throw an error when field not found', () => {
      const fn = () => d.field('nope');
      expect(fn).to.throw('Field not found');
    });

    it('should return false when search by function misses', () => {
      const f = d.field(ff => ff.title() === 'nope');
      expect(f).to.equal(false);
    });

    it('should find field by function', () => {
      const f = d.field(ff => ff.title() === 'm attr expr title');
      expect(f).to.not.equal(false);
      expect(f.title()).to.eql('m attr expr title');
    });

    it('should return field when given as a parameter', () => {
      // find a field first
      const f = d.field('B');

      // search for the field using the instance
      const ff = d.field(f);
      expect(f).to.equal(ff);
    });
  });
});
