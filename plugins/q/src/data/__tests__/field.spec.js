// import * as picasso from '../../../../src/index';

import qField from '../field';

describe('q-field', () => {
  function struct(mode, fe, type) {
    return {
      meta: {
        qMin: 1,
        qMax: 2,
        qTags: ['a', 'b'],
        qFallbackTitle: 'TITLE',
        qNumFormat: {
          qType: 'U',
        },
      },
      type,
      id: 'unique',
      cube: { qMode: mode || 'S' },
      fieldExtractor: fe,
      localeInfo: {
        qDecimalSep: '-',
      },
    };
  }
  function mField(mode, fe) {
    return qField(struct(mode, fe, 'measure'));
  }

  function dimField(mode, fe) {
    let def = struct(mode, fe, 'dimension');
    def.meta.qStateCounts = {};
    return qField(def);
  }

  function attrDimField(mode, fe) {
    let def = struct(mode, fe, 'dimension');
    def.meta.qSize = {};
    return qField(def);
  }

  describe('meta', () => {
    it('should return id', () => {
      let f = dimField();
      expect(f.id()).to.equal('unique');
    });

    it('should return meta', () => {
      let def = struct();
      def.meta.qStateCounts = {};
      const f = qField(def);
      expect(f.raw()).to.equal(def.meta);
    });

    it('should return min value', () => {
      let f = mField();
      expect(f.min()).to.equal(1);
    });

    it('should return max value', () => {
      let f = mField();
      expect(f.max()).to.equal(2);
    });

    it('should return tags', () => {
      let f = mField();
      expect(f.tags()).to.deep.equal(['a', 'b']);
    });

    it('should return title', () => {
      let f = mField();
      expect(f.title()).to.equal('TITLE');
    });

    it('should identify when the field is a dimension', () => {
      let f = dimField();
      expect(f.type()).to.equal('dimension');
    });

    it('should identify an attribute dimension as a dimension', () => {
      let f = attrDimField();
      expect(f.type()).to.equal('dimension');
    });

    it('should identify when the field is a measure', () => {
      let f = mField();
      expect(f.type()).to.equal('measure');
    });

    it('should call field extractor with itself as parameter', () => {
      let fe = sinon.stub();
      let f = dimField('', fe);
      f.items();
      expect(fe).to.have.been.calledWithExactly(f);
    });

    it('should not call field extractor more than once', () => {
      let fe = sinon.stub().returns({});
      let f = dimField('', fe);
      f.items();
      f.items();
      f.items();
      expect(fe.callCount).to.equal(1);
    });

    it('should have a formatter', () => {
      let f = mField();
      const form = f.formatter();
      expect(typeof form).to.eql('function');
    });

    it('should take localeInfo into account when formatting', () => {
      let f = mField();
      const form = f.formatter();
      expect(form(3.123)).to.eql('3-12');
    });

    it('should have a default reducer of "avg" for a measure', () => {
      let f = mField();
      expect(f.reduce).to.eql('avg');
    });

    it('should have a default reducer of "first" for a dimension', () => {
      let f = dimField();
      expect(f.reduce).to.eql('first');
    });
  });
});
