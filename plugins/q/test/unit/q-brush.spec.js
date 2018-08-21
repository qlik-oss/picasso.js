import qBrush, { extractFieldFromId } from '../../src/brush/q-brush';

describe('q-brush', () => {
  let brush;

  beforeEach(() => {
    brush = {
      isActive: sinon.stub(),
      brushes: sinon.stub()
    };
  });

  it('should return empty when no brushes exist', () => {
    brush.brushes.returns([]);
    expect(qBrush(brush).length).to.equal(0);
  });

  it('should reset made selections when brush is active but contain no values', () => {
    brush.isActive.returns(true);
    brush.brushes.returns([{
      id: 'qHyperCube/qDimensionInfo/2',
      type: 'value',
      brush: {
        values: () => []
      }
    }]);
    const selections = qBrush(brush);
    expect(selections[0].method).to.equal('resetMadeSelections');
    expect(selections[0].params).to.eql([]);
  });

  describe('selectHyperCubeValues', () => {
    beforeEach(() => {
      brush.brushes.returns([{
        id: 'qHyperCube/qDimensionInfo/2',
        type: 'value',
        brush: {
          values: () => [3, 2, 7]
        }
      }]);
    });

    it('should have method="selectHyperCubeValues"', () => {
      const selections = qBrush(brush);
      expect(selections[0].method).to.equal('selectHyperCubeValues');
    });

    it('should have valid params', () => {
      const selections = qBrush(brush);
      expect(selections[0].params).to.eql([
        '/qHyperCubeDef',
        2,
        [3, 2, 7],
        false
      ]);
    });
  });

  describe('rangeSelectHyperCubeValues', () => {
    beforeEach(() => {
      brush.brushes.returns([{
        id: '/qHyperCube/qMeasureInfo/3',
        type: 'range',
        brush: {
          ranges: () => [{ min: 13, max: 17 }, { min: 4, max: 9 }]
        }
      }, {
        id: '/qHyperCube/qMeasureInfo/1',
        type: 'range',
        brush: {
          ranges: () => [{ min: -13, max: 6 }]
        }
      }]);
    });

    it('should have method="rangeSelectHyperCubeValues"', () => {
      const selections = qBrush(brush);
      expect(selections[0].method).to.equal('rangeSelectHyperCubeValues');
    });

    it('should have valid params', () => {
      const selections = qBrush(brush);
      expect(selections[0].params).to.eql([
        '/qHyperCubeDef',
        [
          {
            qMeasureIx: 3,
            qRange: {
              qMin: 13, qMax: 17, qMinInclEq: true, qMaxInclEq: true
            }
          },
          {
            qMeasureIx: 3,
            qRange: {
              qMin: 4, qMax: 9, qMinInclEq: true, qMaxInclEq: true
            }
          },
          {
            qMeasureIx: 1,
            qRange: {
              qMin: -13, qMax: 6, qMinInclEq: true, qMaxInclEq: true
            }
          }
        ],
        [],
        true
      ]);
    });
  });

  describe('selectHyperCubeContinuousRange', () => {
    beforeEach(() => {
      brush.brushes.returns([{
        id: '/qHyperCube/qDimensionInfo/1',
        type: 'range',
        brush: {
          ranges: () => [{ min: 11, max: 23 }, { min: 3, max: 8 }]
        }
      }, {
        id: '/qHyperCube/qDimensionInfo/2',
        type: 'range',
        brush: {
          ranges: () => [{ min: -3, max: 1 }]
        }
      }]);
    });

    it('should have method="selectHyperCubeContinuousRange"', () => {
      const selections = qBrush(brush);
      expect(selections[0].method).to.equal('selectHyperCubeContinuousRange');
    });

    it('should have valid params', () => {
      const selections = qBrush(brush);
      expect(selections[0].params).to.eql([
        '/qHyperCubeDef',
        [
          {
            qDimIx: 1,
            qRange: {
              qMin: 11, qMax: 23, qMinInclEq: true, qMaxInclEq: false
            }
          },
          {
            qDimIx: 1,
            qRange: {
              qMin: 3, qMax: 8, qMinInclEq: true, qMaxInclEq: false
            }
          },
          {
            qDimIx: 2,
            qRange: {
              qMin: -3, qMax: 1, qMinInclEq: true, qMaxInclEq: false
            }
          }
        ]
      ]);
    });
  });

  describe('selectHyperCubeCells', () => {
    beforeEach(() => {
      brush.brushes.returns([{
        id: 'layers/0/qHyperCube/qDimensionInfo/2',
        type: 'value',
        brush: {
          values: () => [3, 2, 7]
        }
      }, {
        id: '/layers/0/qHyperCube/qDimensionInfo/1',
        type: 'value',
        brush: {
          values: () => [1, 6, 4]
        }
      }]);
    });

    it('should have method="selectHyperCubeCells"', () => {
      const selections = qBrush(brush, { byCells: true });
      expect(selections[0].method).to.equal('selectHyperCubeCells');
    });

    it('should have valid params when primary is not specified', () => {
      const selections = qBrush(brush, { byCells: true });
      expect(selections[0].params).to.eql([
        '/layers/0/qHyperCubeDef',
        [3, 2, 7],
        [2, 1]
      ]);
    });

    it('should have valid params when primary is specified', () => {
      const selections = qBrush(brush, { byCells: true, primarySource: '/layers/0/qHyperCube/qDimensionInfo/1' });
      expect(selections[0].params).to.eql([
        '/layers/0/qHyperCubeDef',
        [1, 6, 4],
        [2, 1]
      ]);
    });
  });

  describe('selectPivotCells', () => {
    const layout = {
      qHyperCube: {
        qEffectiveInterColumnSortOrder: [],
        qMode: 'T'
      }
    };

    beforeEach(() => {
      brush.brushes.returns([{
        id: 'layers/0/qHyperCube/qDimensionInfo/2',
        type: 'value',
        brush: {
          values: () => [3, 2, 7]
        }
      }, {
        id: '/layers/0/qHyperCube/qDimensionInfo/1',
        type: 'value',
        brush: {
          values: () => [1, 6, 4]
        }
      }]);

      layout.qHyperCube.qEffectiveInterColumnSortOrder = [];
    });

    it('should have method="selectPivotCells"', () => {
      const selections = qBrush(brush, { byCells: true }, layout);
      expect(selections[0].method).to.equal('selectPivotCells');
    });

    it('should have valid params when primary is not specified', () => {
      layout.qHyperCube.qNoOfLeftDims = 1;
      layout.qHyperCube.qEffectiveInterColumnSortOrder.push(2);

      const selections = qBrush(brush, { byCells: true }, layout);
      expect(selections[0].params).to.eql([
        '/layers/0/qHyperCubeDef',
        [
          {
            qCol: 2,
            qRow: 3,
            qType: 'L'
          },
          {
            qCol: 2,
            qRow: 2,
            qType: 'L'
          },
          {
            qCol: 2,
            qRow: 7,
            qType: 'L'
          }
        ]
      ]);
    });

    it('should have valid params when primary is specified', () => {
      layout.qHyperCube.qNoOfLeftDims = 1;
      layout.qHyperCube.qEffectiveInterColumnSortOrder.push(1);

      const selections = qBrush(brush, { byCells: true, primarySource: '/layers/0/qHyperCube/qDimensionInfo/1' }, layout);
      expect(selections[0].params).to.eql([
        '/layers/0/qHyperCubeDef',
        [
          {
            qCol: 1,
            qRow: 1,
            qType: 'L'
          },
          {
            qCol: 1,
            qRow: 6,
            qType: 'L'
          },
          {
            qCol: 1,
            qRow: 4,
            qType: 'L'
          }
        ]
      ]);
    });

    it('should get top dimension', () => {
      layout.qHyperCube.qNoOfLeftDims = 0;
      layout.qHyperCube.qEffectiveInterColumnSortOrder.push(1);

      const selections = qBrush(brush, { byCells: true, primarySource: '/layers/0/qHyperCube/qDimensionInfo/1' }, layout);
      expect(selections[0].params).to.eql([
        '/layers/0/qHyperCubeDef',
        [
          {
            qCol: 1,
            qRow: 0,
            qType: 'T'
          },
          {
            qCol: 6,
            qRow: 0,
            qType: 'T'
          },
          {
            qCol: 4,
            qRow: 0,
            qType: 'T'
          }
        ]
      ]);
    });

    it('should do selectHyperCubeCells if qMode: S and byCells: true', () => {
      layout.qHyperCube.qMode = 'S';

      const selections = qBrush(brush, { byCells: true }, layout);
      expect(selections[0].params).to.eql([
        '/layers/0/qHyperCubeDef',
        [3, 2, 7],
        [2, 1]
      ]);
    });
  });

  describe('path extraction', () => {
    it('should map hypercube layout value to property path', () => {
      let v = extractFieldFromId('/qHyperCube');
      expect(v.path).to.equal('/qHyperCubeDef');
    });

    it('should map dimension layout value to params', () => {
      let v = extractFieldFromId('/qHyperCube/qDimensionInfo/3');
      expect(v).to.eql({
        path: '/qHyperCubeDef',
        dimensionIdx: 3,
        measureIdx: -1
      });
    });

    it('should map measure layout value to params', () => {
      let v = extractFieldFromId('/qHyperCube/qMeasureInfo/2');
      expect(v).to.eql({
        path: '/qHyperCubeDef',
        dimensionIdx: -1,
        measureIdx: 2
      });
    });

    it('should map attribute dimension layout value to params (on dimension)', () => {
      let v = extractFieldFromId('/qHyperCube/qDimensionInfo/2/qAttrDimInfo/5');
      expect(v).to.eql({
        path: '/qHyperCubeDef/qDimensions/2/qAttributeDimensions/5',
        dimensionIdx: 0,
        measureIdx: -1
      });
    });

    it('should map attribute dimension column layout value to params (on dimension)', () => {
      let v = extractFieldFromId('/qHyperCube/qDimensionInfo/2/qAttrDimInfo/5/3');
      expect(v).to.eql({
        path: '/qHyperCubeDef/qDimensions/2/qAttributeDimensions/5',
        dimensionIdx: 3,
        measureIdx: -1
      });
    });

    it('should map attribute dimension layout value to params (on measure)', () => {
      let v = extractFieldFromId('/qHyperCube/qMeasureInfo/2/qAttrDimInfo/4');
      expect(v).to.eql({
        path: '/qHyperCubeDef/qMeasures/2/qAttributeDimensions/4',
        dimensionIdx: 0,
        measureIdx: -1
      });
    });

    it('should map attribute dimension column layout value to params (on measure)', () => {
      let v = extractFieldFromId('qHyperCube/qMeasureInfo/2/qAttrDimInfo/4/3');
      expect(v).to.eql({
        path: '/qHyperCubeDef/qMeasures/2/qAttributeDimensions/4',
        dimensionIdx: 3,
        measureIdx: -1
      });
    });

    it('should map attribute expression layout value to params (on measure)', () => {
      let v = extractFieldFromId('/qHyperCube/qMeasureInfo/1/qAttrExprInfo/1', {
        qHyperCube: {
          qDimensionInfo: [{ qAttrExprInfo: [{}, {}] }],
          qMeasureInfo: [{ qAttrExprInfo: [{}, {}] }, { qAttrExprInfo: [{}, {}, {}] }]
        }
      });
      expect(v).to.eql({
        path: '/qHyperCubeDef',
        dimensionIdx: -1,
        measureIdx: 7
      });
    });

    it('should map attribute expression layout value to params (on measure) - without layout', () => {
      let v = extractFieldFromId('/qHyperCube/qMeasureInfo/1/qAttrExprInfo/1');
      expect(v).to.eql({
        path: '/qHyperCubeDef',
        measureIdx: 3,
        dimensionIdx: -1
      });
    });

    it('should map attribute expression layout value to params (on dimension)', () => {
      let v = extractFieldFromId('/qHyperCube/qDimensionInfo/1/qAttrExprInfo/1', {
        qHyperCube: {
          qDimensionInfo: [{ qAttrExprInfo: [{}, {}] }, { qAttrExprInfo: [{}, {}, {}] }],
          qMeasureInfo: [{}, {}, {}]
        }
      });
      expect(v).to.eql({
        path: '/qHyperCubeDef',
        measureIdx: 6,
        dimensionIdx: -1
      });
    });

    it('should map attribute expression layout value to params (on dimension) - without layout', () => {
      let v = extractFieldFromId('/qHyperCube/qDimensionInfo/1/qAttrExprInfo/1');
      expect(v).to.eql({
        path: '/qHyperCubeDef',
        measureIdx: 1,
        dimensionIdx: -1
      });
    });

    it('should map measure layout value on dimension to params', () => {
      let v = extractFieldFromId('/qTreeData/qDimensionInfo/3/qMeasureInfo/2');
      expect(v).to.eql({
        path: '/qTreeDataDef',
        dimensionIdx: 3,
        measureIdx: 2
      });
    });

    // TODO - figure out how this hould work
    it.skip('should map attribute expression layout value to params (on dimension)', () => {
      let v = extractFieldFromId('/qTreeData/qDimensionInfo/1/qAttrExprInfo/1', {
        qTreeData: {
          qDimensionInfo: [
            { qMeasureInfo: [{}, { qAttrExprInfo: [{}, {}] }], qAttrExprInfo: [{}, {}] },
            { qMeasureInfo: [], qAttrExprInfo: [{}, { /* target */ }, {}] }
          ]
        }
      });
      expect(v).to.eql({
        path: '/qTreeDataDef',
        measureIdx: 6,
        dimensionIdx: -1
      });
    });
  });

  describe('multiRangeSelectTreeDataValues', () => {
    beforeEach(() => {
      brush.brushes.returns([{
        id: '/qTreeData/qDimensionInfo/1/qMeasureInfo/2',
        type: 'range',
        brush: {
          ranges: () => [{ min: 13, max: 17 }, { min: 4, max: 9 }]
        }
      }, {
        id: '/qTreeData/qDimensionInfo/2/qMeasureInfo/1',
        type: 'range',
        brush: {
          ranges: () => [{ min: -13, max: 6 }]
        }
      }]);
    });

    it('should have method="multiRangeSelectTreeDataValues"', () => {
      const selections = qBrush(brush);
      expect(selections[0].method).to.equal('multiRangeSelectTreeDataValues');
    });

    it('should have valid params', () => {
      const selections = qBrush(brush);
      expect(selections[0].params).to.eql([
        '/qTreeDataDef',
        [
          {
            qMeasureIx: 2,
            qDimensionIx: 1,
            qRange: {
              qMin: 13, qMax: 17, qMinInclEq: true, qMaxInclEq: true
            }
          },
          {
            qMeasureIx: 2,
            qDimensionIx: 1,
            qRange: {
              qMin: 4, qMax: 9, qMinInclEq: true, qMaxInclEq: true
            }
          },
          {
            qMeasureIx: 1,
            qDimensionIx: 2,
            qRange: {
              qMin: -13, qMax: 6, qMinInclEq: true, qMaxInclEq: true
            }
          }
        ]
      ]);
    });
  });
});
