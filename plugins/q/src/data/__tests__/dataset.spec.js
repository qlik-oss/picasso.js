import q from '../dataset';
import picData from '../../../../../packages/picasso.js/src/core/data/dataset';

const NxSimpleValue = { qNum: 37.6, qText: '$37.6' };
const NxSimpleDimValue = { qElemNo: 7, qText: 'seven' };
const NxCell = { qText: 'three', qElemNumber: 3, qNum: 3.1 };

const NxStackedPivotCell = { qValue: 34.3, qElemNo: 7, qText: '$34' };
const NxStackedPivotCellM = {
  qValue: 32.3,
  qElemNo: 1,
  qText: '$32.3',
  qAttrDims: { qValues: [{}, NxSimpleDimValue] },
  qAttrExps: { qValues: [{}, NxSimpleValue] }
};
const NxTreeValue = {
  qValue: 31.3,
  qText: '$31.3',
  qAttrDims: { qValues: [{}, NxSimpleDimValue] },
  qAttrExps: { qValues: [{}, NxSimpleValue] }
};
const NxTreeNode = { qElemNo: 9, qText: 'nine', qValues: [{}, {}, NxTreeValue] };

const ds = (qMode) => {
  const qDataPages = [{
    qArea: {
      qLeft: 0, qTop: 0, qWidth: 4, qHeight: 1
    },
    qMatrix: [
      [NxCell, {}, {}, Object.assign({}, NxCell, {
        qNum: 3.6, qText: '$$3.6', qAttrDims: { qValues: [{}, NxSimpleDimValue] }, qAttrExps: { qValues: [{}, NxSimpleValue] }
      })]
    ]
  }];
  const qStackedDataPages = [{
    qArea: {
      qLeft: 0,
      qTop: 0,
      qWidth: 6,
      qHeight: 10
    },
    qData: [
      {
        qType: 'R',
        qElemNo: -1,
        qSubNodes: [Object.assign({ qSubNodes: [{}, {}, NxStackedPivotCellM] }, NxStackedPivotCell)]
      }
    ]
  }];
  const qTreeDataPages = [{
    qNodes: [NxTreeNode]
  }];

  const cube = {
    qMode,
    qDimensionInfo: [{ qFallbackTitle: 'A' }],
    qMeasureInfo: [{}, {}, {
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
      }],
      qAttrDimInfo: [{}, {}]
    }],
    qDataPages,
    qStackedDataPages,
    qTreeDataPages
  };

  if (qMode !== 'S') {
    cube.qEffectiveInterColumnSortOrder = [0];
  } else {
    cube.qEffectiveInterColumnSortOrder = [2, 3, 0, 1];
  }

  const d = q({
    key: 'nyckel',
    data: cube,
    config: {
      localeInfo: {
        qDecimalSep: '_'
      }
    }
  });

  return d;
};

const tree = () => {
  const qTreeDataPages = [{
    qNodes: [NxTreeNode]
  }];
  const cube = {
    qNodesOnDim: [],
    qEffectiveInterColumnSortOrder: [0],
    qDimensionInfo: [{
      qFallbackTitle: 'A',
      qMeasureInfo: [{}, {}, {
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
        }],
        qAttrDimInfo: [{}, {}]
      }]
    }],
    qTreeDataPages
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
  return d;
};

describe('q-data', () => {
  before(() => {
    q.util = picData.util;
  });

  after(() => {
    q.util = undefined;
  });

  describe('error handling', () => {
    it('no data should throw', () => {
      const d = () => q({});
      expect(d).throw('Missing "data" input');
    });

    it('bad cube should throw', () => {
      const d = () => q({ data: {} });
      expect(d).throw('The "data" input is not recognized as a hypercube');
    });
  });

  describe('qMode="S"', () => {
    let d;
    before(() => {
      d = ds('S');
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

    describe('dimension', () => {
      let f;
      before(() => {
        f = d.field('qDimensionInfo/0');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([3]);
        expect(f.items().map(v => v.label)).to.eql(['three']);
      });
    });

    describe('measure', () => {
      let f;
      before(() => {
        f = d.field('qMeasureInfo/2');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([3.6]);
        expect(f.items().map(v => v.label)).to.eql(['$$3.6']);
      });
    });

    describe('attribute expression', () => {
      let f;
      before(() => {
        f = d.field('qMeasureInfo/2/qAttrExprInfo/1');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([37.6]);
        expect(f.items().map(v => v.label)).to.eql(['$37.6']);
      });
    });

    describe('attribute dimension', () => {
      let f;
      before(() => {
        f = d.field('qMeasureInfo/2/qAttrDimInfo/1');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([7]);
        expect(f.items().map(v => v.label)).to.eql(['seven']);
      });
    });

    describe('extract', () => {
      it('dimension', () => {
        const extracted = d.extract({
          field: 'qDimensionInfo/0'
        });
        expect(extracted).to.eql([{ value: 3, label: 'three', source: { field: 'qDimensionInfo/0', key: 'nyckel' } }]);
      });
    });

    describe('hierarchy', () => {
      it('root', () => {
        const h = d.hierarchy();
        expect(h.descendants()[1].data).to.eql({
          source: { key: 'nyckel', field: 'qDimensionInfo/0' },
          label: 'three',
          value: 3
        });
      });

      it('props', () => {
        const h = d.hierarchy({
          props: {
            v: {
              field: 'qMeasureInfo/2'
            }
          }
        });
        expect(h.descendants()[1].data.v).to.eql({
          source: { key: 'nyckel', field: 'qMeasureInfo/2' },
          label: '3.6',
          value: 3.6
        });
      });
    });
  });

  describe('qMode="K"', () => {
    let d;
    before(() => {
      d = ds('K');
    });

    describe('dimension', () => {
      let f;
      before(() => {
        f = d.field('qDimensionInfo/0');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([7]);
        expect(f.items().map(v => v.label)).to.eql(['$34']);
      });
    });

    describe('measure', () => {
      let f;
      before(() => {
        f = d.field('qMeasureInfo/2');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([32.3]);
        expect(f.items().map(v => v.label)).to.eql(['$32.3']);
      });
    });

    describe('attribute expression', () => {
      let f;
      before(() => {
        f = d.field('qMeasureInfo/2/qAttrExprInfo/1');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([37.6]);
        expect(f.items().map(v => v.label)).to.eql(['$37.6']);
      });
    });

    describe('attribute dimension', () => {
      let f;
      before(() => {
        f = d.field('qMeasureInfo/2/qAttrDimInfo/1');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([7]);
        expect(f.items().map(v => v.label)).to.eql(['seven']);
      });
    });

    // describe('hierarchy', () => {
    //   it('should be augmented', () => {
    //     let h = d.hierarchy();
    //     console.log(h);
    //     expect(h).to.eql('a');
    //   });
    // });
  });

  describe('qMode="T"', () => {
    let d;
    before(() => {
      d = ds('T');
    });

    describe('dimension', () => {
      let f;
      before(() => {
        f = d.field('qDimensionInfo/0');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([9]);
        expect(f.items().map(v => v.label)).to.eql(['nine']);
      });
    });

    describe('measure', () => {
      let f;
      before(() => {
        f = d.field('qMeasureInfo/2');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([31.3]);
        expect(f.items().map(v => v.label)).to.eql(['$31.3']);
      });
    });

    describe('attribute expression', () => {
      let f;
      before(() => {
        f = d.field('qMeasureInfo/2/qAttrExprInfo/1');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([37.6]);
        expect(f.items().map(v => v.label)).to.eql(['$37.6']);
      });
    });

    describe('attribute dimension', () => {
      let f;
      before(() => {
        f = d.field('qMeasureInfo/2/qAttrDimInfo/1');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([7]);
        expect(f.items().map(v => v.label)).to.eql(['seven']);
      });
    });

    describe('hierarchy', () => {
      it('should return tree', () => {
        const t = d.hierarchy();
        expect(t.children[0].data.label).to.equal('nine');
      });
    });
  });

  describe('TreeData', () => {
    let d;
    before(() => {
      d = tree();
    });

    describe('dimension', () => {
      let f;
      before(() => {
        f = d.field('qDimensionInfo/0');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([9]);
        expect(f.items().map(v => v.label)).to.eql(['nine']);
      });
    });

    describe('measure', () => {
      let f;
      before(() => {
        f = d.field('qDimensionInfo/0/qMeasureInfo/2');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([31.3]);
        expect(f.items().map(v => v.label)).to.eql(['$31.3']);
      });
    });

    describe('attribute expression', () => {
      let f;
      before(() => {
        f = d.field('qDimensionInfo/0/qMeasureInfo/2/qAttrExprInfo/1');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([37.6]);
        expect(f.items().map(v => v.label)).to.eql(['$37.6']);
      });
    });

    describe('attribute dimension', () => {
      let f;
      before(() => {
        f = d.field('qDimensionInfo/0/qMeasureInfo/2/qAttrDimInfo/1');
      });

      it('items', () => {
        expect(f.items().map(v => v.value)).to.eql([7]);
        expect(f.items().map(v => v.label)).to.eql(['seven']);
      });
    });

    describe('hierarchy', () => {
      it('should return tree', () => {
        const t = d.hierarchy();
        expect(t.children[0].data.label).to.equal('nine');
      });
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
