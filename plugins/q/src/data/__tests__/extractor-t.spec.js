import { extract, getFieldDepth } from '../extractor-t';

import { getPropsInfo, collect, track } from '../../../../../packages/picasso.js/src/core/data/util';

describe('q-data-extractor-t', () => {
  const deps = {
    normalizeConfig: getPropsInfo,
    collect,
    track,
  };

  describe('without pseudo', () => {
    const treePages = [
      {
        qElemNo: -1,
        qNodeNr: 0,
        qParentNode: -1,
        qRow: 0,
        qType: 'R',
        qValues: [],
        qNodes: [
          {
            qText: 'Alcoholic Beverages',
            qElemNo: 0,
            qNodeNr: 1,
            qParentNode: 0,
            qRow: 0,
            qType: 'N',
            qAttrDims: { qValues: [{}, { qElemNo: 3, qText: 'Alco' }] },
            qValues: [{}, { qValue: 36, qText: '+36' }],
            qNodes: [
              {
                qText: 'Beer',
                qElemNo: 0,
                qNodeNr: 4,
                qParentNode: 1,
                qRow: 0,
                qType: 'N',
                qAttrExps: { qValues: [{ qNum: 3, qText: 'three' }] },
                qValues: [
                  {
                    qText: '6',
                    qValue: 6,
                  },
                  {
                    qText: '$171792',
                    qValue: 171792,
                  },
                ],
                qNodes: [],
              },
              {
                qText: 'Wine',
                qElemNo: 1,
                qNodeNr: 5,
                qParentNode: 1,
                qRow: 1,
                qType: 'N',
                qAttrExps: { qValues: [{ qNum: 2, qText: 'two' }] },
                qValues: [
                  {
                    qText: '17',
                    qValue: 17,
                  },
                  {
                    qText: '$195765',
                    qValue: 195765,
                  },
                ],
                qNodes: [],
              },
            ],
          },
          {
            qText: 'Baked Goods',
            qElemNo: 1,
            qNodeNr: 2,
            qParentNode: 0,
            qRow: 2,
            qType: 'N',
            qAttrDims: { qValues: [{}, { qElemNo: 7, qText: 'Bake' }] },
            qValues: [{}, { qValue: 31, qText: '+31' }],
            qNodes: [
              {
                qText: 'Bagels',
                qElemNo: 2,
                qNodeNr: 6,
                qParentNode: 2,
                qRow: 2,
                qType: 'N',
                qAttrExps: { qValues: [{ qNum: 5, qText: 'five' }] },
                qValues: [
                  {
                    qText: '2',
                    qValue: 2,
                  },
                  {
                    qText: '$22652',
                    qValue: 22652,
                  },
                ],
                qNodes: [],
              },
              {
                qText: 'Muffins',
                qElemNo: 3,
                qNodeNr: 7,
                qParentNode: 2,
                qRow: 3,
                qType: 'N',
                qAttrExps: { qValues: [{ qNum: 7, qText: 'seven' }] },
                qValues: [
                  {
                    qText: '9',
                    qValue: 9,
                  },
                  {
                    qText: '$158937',
                    qValue: 158937,
                  },
                ],
                qNodes: [],
              },
              {
                qText: 'Sliced Bread',
                qElemNo: 4,
                qNodeNr: 8,
                qParentNode: 2,
                qRow: 4,
                qType: 'N',
                qAttrExps: { qValues: [{ qNum: 9, qText: 'nine' }] },
                qValues: [
                  {
                    qText: '13',
                    qValue: 13,
                  },
                  {
                    qText: '$110661',
                    qValue: 110661,
                  },
                ],
                qNodes: [],
              },
            ],
          },
        ],
      },
    ];

    const cube = {
      qDimensionInfo: [
        {
          qFallbackTitle: 'Product Group',
          qApprMaxGlyphCount: 19,
          qCardinal: 17,
          qSortIndicator: 'A',
          qGroupFallbackTitles: ['Product Group'],
          qGroupPos: 0,
          qStateCounts: {
            qLocked: 0,
            qSelected: 2,
            qOption: 0,
            qDeselected: 0,
            qAlternative: 15,
            qExcluded: 0,
            qSelectedExcluded: 0,
            qLockedExcluded: 0,
          },
          qTags: ['$ascii', '$text'],
          qDimensionType: 'D',
          qGrouping: 'N',
          qNumFormat: {
            qType: 'R',
            qnDec: 14,
            qUseThou: 1,
            qFmt: '##############',
            qDec: '.',
            qThou: ',',
          },
          qIsAutoFormat: true,
          qGroupFieldDefs: ['Product Group Desc'],
          qMin: 'NaN',
          qMax: 'NaN',
          qAttrExprInfo: [],
          qAttrDimInfo: [],
          qCardinalities: {
            qCardinal: 17,
            qHypercubeCardinal: 2,
          },
          title: 'Product Group',
          coloring: {
            colorMapRef: 'rAWLLGj',
            changeHash: '0.6784502254237292',
          },
          autoSort: true,
          cId: 'XKAuVu',
          othersLabel: 'Others',
        },
        {
          qFallbackTitle: 'Product Sub Group Desc',
          qApprMaxGlyphCount: 17,
          qCardinal: 70,
          qSortIndicator: 'A',
          qGroupFallbackTitles: ['Product Sub Group Desc'],
          qGroupPos: 0,
          qStateCounts: {
            qLocked: 0,
            qSelected: 0,
            qOption: 5,
            qDeselected: 0,
            qAlternative: 0,
            qExcluded: 65,
            qSelectedExcluded: 0,
            qLockedExcluded: 0,
          },
          qTags: ['$ascii', '$text'],
          qDimensionType: 'D',
          qGrouping: 'N',
          qNumFormat: {
            qType: 'R',
            qnDec: 14,
            qUseThou: 1,
            qFmt: '##############',
            qDec: '.',
            qThou: ',',
          },
          qIsAutoFormat: true,
          qGroupFieldDefs: ['Product Sub Group Desc'],
          qMin: 'NaN',
          qMax: 'NaN',
          qAttrExprInfo: [
            {
              qMin: 18,
              qMax: 83,
              qFallbackTitle: '# of Customers',
              qMinText: '18',
              qMaxText: '83',
              id: 'colorByAlternative',
              matchMeasure: 0,
              colorMapRef: 'DSrjAGm',
            },
          ],
          qAttrDimInfo: [],
          qMeasureInfo: [
            {
              qFallbackTitle: '# of Products',
              qApprMaxGlyphCount: 2,
              qCardinal: 0,
              qSortIndicator: 'D',
              qNumFormat: {
                qType: 'I',
                qnDec: 0,
                qUseThou: 1,
                qFmt: '###0',
                qDec: '.',
              },
              qMin: 0,
              qMax: 17,
              qIsAutoFormat: true,
              qAttrExprInfo: [],
              qAttrDimInfo: [],
              autoSort: true,
              cId: 'MbpvBQ',
              numFormatFromTemplate: true,
            },
            {
              qFallbackTitle: 'Amount Overdue',
              qApprMaxGlyphCount: 11,
              qCardinal: 0,
              qSortIndicator: 'D',
              qNumFormat: {
                qType: 'R',
                qnDec: 0,
                qUseThou: 0,
                qFmt: '##############',
                qDec: '.',
                qThou: ',',
              },
              qMin: 0,
              qMax: 195765.2816000001,
              qIsAutoFormat: true,
              qAttrExprInfo: [],
              qAttrDimInfo: [],
              autoSort: true,
              cId: 'YvFYB',
              numFormatFromTemplate: true,
            },
          ],
          qCardinalities: {
            qCardinal: 70,
            qHypercubeCardinal: 5,
          },
          title: 'Product Sub Group Desc',
          autoSort: true,
          cId: 'XBkuFYE',
          othersLabel: 'Others',
        },
      ],
      qEffectiveInterColumnSortOrder: [0, 1],
      qGrandTotalRow: [],
      qTreeDataPages: treePages,
      qTreeNodesOnDim: [3, 6],
    };

    const fields = [
      {
        title: () => 'a',
        value: d => d.qElemNo,
        label: d => d.qText,
        key: () => 'qDimensionInfo/0',
        reduce: values => values.join(', '),
        formatter: () => v => `<${v}>`,
      },
      {
        title: () => 'b',
        value: d => d.qElemNo,
        label: d => d.qText,
        key: () => 'qDimensionInfo/1',
        reduce: values => values.join(', '),
        reduceLabel: values => values.join(':'),
        formatter: () => v => `<${v}>`,
      },
      {
        title: () => 'am',
        value: d => d.qElemNo,
        label: d => d.qText,
        key: () => 'qDimensionInfo/0/qMeasureInfo/1',
        reduce: values => values.join(', '),
        formatter: () => v => `=${v}=`,
      },
      {
        title: () => 'c',
        value: d => d.qValue,
        label: d => d.qText,
        key: () => 'qDimensionInfo/1/qMeasureInfo/0',
        reduce: values => values.join(', '),
        reduceLabel: (labels, v) => `€€${v}`,
        formatter: () => v => `£${v}`,
      },
      {
        title: () => 'd',
        value: d => d.qValue,
        label: d => d.qText,
        key: () => 'qDimensionInfo/1/qMeasureInfo/1',
        reduce: values => values.join(', '),
        formatter: () => v => `-${v}-`,
      },
    ];

    const dataset = {
      key: () => 'cube',
      raw: () => cube,
      field: sinon.stub(),
    };

    dataset.field.withArgs('qDimensionInfo/0').returns(fields[0]);
    dataset.field.withArgs('qDimensionInfo/1').returns(fields[1]);
    dataset.field.withArgs('qDimensionInfo/0/qMeasureInfo/1').returns(fields[2]);
    dataset.field.withArgs('qDimensionInfo/1/qMeasureInfo/0').returns(fields[3]);
    dataset.field.withArgs('qDimensionInfo/1/qMeasureInfo/1').returns(fields[4]);
    const attrDimField = {
      title: () => '',
      value: v => v.qElemNo,
      label: v => v.qText,
      key: () => 'qDimensionInfo/0/qAttrDimInfo/1',
      reduce: values => values.join(', '),
      formatter: () => () => '',
    };
    dataset.field.withArgs('firstDimSecondAttrDim').returns(attrDimField);

    const attrExprField = {
      title: () => '',
      key: () => 'qDimensionInfo/1/qAttrExprInfo/0',
      reduce: values => values.join(', '),
      reduceLabel: labels => labels.join(':'),
      formatter: () => () => '',
    };

    dataset.field.withArgs('qDimensionInfo/1/qAttrExprInfo/0').returns(attrExprField);

    it('should return origin field depth for virtual field', () => {
      const origin = {
        key: () => 'qDimensionInfo/1',
      };
      const f = {
        origin: () => origin,
      };
      const depth = getFieldDepth(f, {
        cube: {
          qEffectiveInterColumnSortOrder: [2, 0, 1],
          qDimensionInfo: [{}, {}, {}],
        },
      });
      expect(depth).to.eql({
        fieldDepth: 3,
        pseudoMeasureIndex: -1,
        measureIdx: -1,
        attrDimIdx: -1,
        attrIdx: -1,
      });
    });

    it('should return empty array when root node is missing or empty', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/0',
        },
        {
          key: () => 'cube',
          raw: () => ({
            qDimensionInfo: [{ qStateCounts: {}, qAttrDimInfo: [{}, {}] }],
            qTreeDataPages: [],
          }),
          field: sinon.stub(),
        },
        {},
        deps
      );

      expect(m).to.eql([]);
    });

    it('should return dim field values based on default field accessor', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/0',
        },
        dataset,
        {},
        deps
      );

      expect(m).to.eql([
        { value: 0, label: 'Alcoholic Beverages', source: { key: 'cube', field: 'qDimensionInfo/0' } },
        { value: 1, label: 'Baked Goods', source: { key: 'cube', field: 'qDimensionInfo/0' } },
      ]);
    });

    it('should return measure field values based on default field accessor', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/1/qMeasureInfo/1',
        },
        dataset,
        {},
        deps
      );

      expect(m).to.eql([
        { value: 171792, label: '$171792', source: { key: 'cube', field: 'qDimensionInfo/1/qMeasureInfo/1' } },
        { value: 195765, label: '$195765', source: { key: 'cube', field: 'qDimensionInfo/1/qMeasureInfo/1' } },
        { value: 22652, label: '$22652', source: { key: 'cube', field: 'qDimensionInfo/1/qMeasureInfo/1' } },
        { value: 158937, label: '$158937', source: { key: 'cube', field: 'qDimensionInfo/1/qMeasureInfo/1' } },
        { value: 110661, label: '$110661', source: { key: 'cube', field: 'qDimensionInfo/1/qMeasureInfo/1' } },
      ]);
    });

    it('should return joined set when array of fields is used', () => {
      const m = extract(
        [{ field: 'qDimensionInfo/0' }, { field: 'qDimensionInfo/0', value: v => v.qText }],
        dataset,
        {},
        deps
      );

      expect(m).to.eql([
        { value: 0, label: 'Alcoholic Beverages', source: { key: 'cube', field: 'qDimensionInfo/0' } },
        { value: 1, label: 'Baked Goods', source: { key: 'cube', field: 'qDimensionInfo/0' } },
        {
          value: 'Alcoholic Beverages',
          label: 'Alcoholic Beverages',
          source: { key: 'cube', field: 'qDimensionInfo/0' },
        },
        { value: 'Baked Goods', label: 'Baked Goods', source: { key: 'cube', field: 'qDimensionInfo/0' } },
      ]);
    });

    it('should return attr dim field values based on default field accessor', () => {
      const m = extract(
        {
          field: 'firstDimSecondAttrDim',
        },
        dataset,
        {},
        deps
      );

      expect(m).to.eql([
        { value: 3, label: 'Alco', source: { key: 'cube', field: 'qDimensionInfo/0/qAttrDimInfo/1' } },
        { value: 7, label: 'Bake', source: { key: 'cube', field: 'qDimensionInfo/0/qAttrDimInfo/1' } },
      ]);
    });

    it('should return attr expr field values based on default field accessor', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/0',
          props: {
            descs: {
              field: 'qDimensionInfo/1/qAttrExprInfo/0',
              value: v => `-${v.qText}-`,
              label: v => `~${v.qText}~`,
            },
          },
        },
        dataset,
        {},
        deps
      );

      expect(m).to.eql([
        {
          value: 0,
          label: 'Alcoholic Beverages',
          source: { key: 'cube', field: 'qDimensionInfo/0' },
          descs: {
            value: '-three-, -two-',
            label: '~three~:~two~',
            source: { key: 'cube', field: 'qDimensionInfo/1/qAttrExprInfo/0' },
          },
        },
        {
          value: 1,
          label: 'Baked Goods',
          source: { key: 'cube', field: 'qDimensionInfo/0' },
          descs: {
            value: '-five-, -seven-, -nine-',
            label: '~five~:~seven~:~nine~',
            source: { key: 'cube', field: 'qDimensionInfo/1/qAttrExprInfo/0' },
          },
        },
      ]);
    });

    it('should return attr expr field values based on default field accessor again', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/1',
          props: {
            descs: {
              field: 'qDimensionInfo/1/qAttrExprInfo/0',
              value: v => v.qText,
              label: v => v.qText,
            },
          },
        },
        dataset,
        {},
        deps
      );

      expect(m).to.eql([
        {
          value: 0,
          label: 'Beer',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          descs: { value: 'three', label: 'three', source: { key: 'cube', field: 'qDimensionInfo/1/qAttrExprInfo/0' } },
        },
        {
          value: 1,
          label: 'Wine',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          descs: { value: 'two', label: 'two', source: { key: 'cube', field: 'qDimensionInfo/1/qAttrExprInfo/0' } },
        },
        {
          value: 2,
          label: 'Bagels',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          descs: { value: 'five', label: 'five', source: { key: 'cube', field: 'qDimensionInfo/1/qAttrExprInfo/0' } },
        },
        {
          value: 3,
          label: 'Muffins',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          descs: { value: 'seven', label: 'seven', source: { key: 'cube', field: 'qDimensionInfo/1/qAttrExprInfo/0' } },
        },
        {
          value: 4,
          label: 'Sliced Bread',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          descs: { value: 'nine', label: 'nine', source: { key: 'cube', field: 'qDimensionInfo/1/qAttrExprInfo/0' } },
        },
      ]);
    });

    it('should return mapped properties from same field', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/1',
          value: d => d.qElemNo,
          props: {
            text: d => d.qText,
          },
        },
        dataset,
        {},
        deps
      );

      expect(m).to.eql([
        {
          value: 0,
          label: 'Beer',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          text: { value: 'Beer', label: 'Beer', source: { key: 'cube', field: 'qDimensionInfo/1' } },
        },
        {
          value: 1,
          label: 'Wine',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          text: { value: 'Wine', label: 'Wine', source: { key: 'cube', field: 'qDimensionInfo/1' } },
        },
        {
          value: 2,
          label: 'Bagels',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          text: { value: 'Bagels', label: 'Bagels', source: { key: 'cube', field: 'qDimensionInfo/1' } },
        },
        {
          value: 3,
          label: 'Muffins',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          text: { value: 'Muffins', label: 'Muffins', source: { key: 'cube', field: 'qDimensionInfo/1' } },
        },
        {
          value: 4,
          label: 'Sliced Bread',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          text: { value: 'Sliced Bread', label: 'Sliced Bread', source: { key: 'cube', field: 'qDimensionInfo/1' } },
        },
      ]);
    });

    it('should return mapped properties to ancestor fields', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/1',
          value: d => d.qElemNo,
          props: {
            parent: {
              field: 'qDimensionInfo/0',
              value: d => d.qText,
            },
          },
        },
        dataset,
        { fields },
        deps
      );

      expect(m).to.eql([
        {
          value: 0,
          label: 'Beer',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          parent: {
            value: 'Alcoholic Beverages',
            label: 'Alcoholic Beverages',
            source: { key: 'cube', field: 'qDimensionInfo/0' },
          },
        },
        {
          value: 1,
          label: 'Wine',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          parent: {
            value: 'Alcoholic Beverages',
            label: 'Alcoholic Beverages',
            source: { key: 'cube', field: 'qDimensionInfo/0' },
          },
        },
        {
          value: 2,
          label: 'Bagels',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          parent: { value: 'Baked Goods', label: 'Baked Goods', source: { key: 'cube', field: 'qDimensionInfo/0' } },
        },
        {
          value: 3,
          label: 'Muffins',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          parent: { value: 'Baked Goods', label: 'Baked Goods', source: { key: 'cube', field: 'qDimensionInfo/0' } },
        },
        {
          value: 4,
          label: 'Sliced Bread',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          parent: { value: 'Baked Goods', label: 'Baked Goods', source: { key: 'cube', field: 'qDimensionInfo/0' } },
        },
      ]);
    });

    it('should return mapped properties to descendant fields', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/0',
          value: d => d.qElemNo,
          props: {
            descs: {
              field: 'qDimensionInfo/1',
              value: d => d.qText,
              label: d => `€${d.qText}`,
            },
          },
        },
        dataset,
        { fields },
        deps
      );
      expect(m).to.eql([
        {
          value: 0,
          label: 'Alcoholic Beverages',
          source: { key: 'cube', field: 'qDimensionInfo/0' },
          descs: { value: 'Beer, Wine', label: '€Beer:€Wine', source: { key: 'cube', field: 'qDimensionInfo/1' } },
        },
        {
          value: 1,
          label: 'Baked Goods',
          source: { key: 'cube', field: 'qDimensionInfo/0' },
          descs: {
            value: 'Bagels, Muffins, Sliced Bread',
            label: '€Bagels:€Muffins:€Sliced Bread',
            source: { key: 'cube', field: 'qDimensionInfo/1' },
          },
        },
      ]);
    });

    it('should return primitive nodes', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/1',
          value: 'foo',
          label: 'baz',
          props: {
            num: 0,
            bool: false,
          },
        },
        dataset,
        { fields },
        deps
      );

      const v = {
        value: 'foo',
        label: 'baz',
        source: { key: 'cube', field: 'qDimensionInfo/1' },
        num: { value: 0, label: '0' },
        bool: { value: false, label: 'false' },
      };
      expect(m).to.eql([v, v, v, v, v]);
    });

    it('should support track by', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/0',
          value: d => d.qElemNo,
          trackBy: () => -1,
          reduce: values => values.join('--'),
          props: {
            descs: {
              field: 'qDimensionInfo/1',
              value: d => d.qText,
            },
            m: {
              field: 'qDimensionInfo/1/qMeasureInfo/1',
            },
          },
        },
        dataset,
        { fields },
        deps
      );
      expect(m).to.eql([
        {
          value: '0--1',
          label: '<0--1>',
          source: { key: 'cube', field: 'qDimensionInfo/0' },
          descs: {
            value: 'Beer, Wine, Bagels, Muffins, Sliced Bread',
            label: 'Beer:Wine:Bagels:Muffins:Sliced Bread',
            source: { key: 'cube', field: 'qDimensionInfo/1' },
          },
          m: {
            value: '171792, 195765, 22652, 158937, 110661',
            label: '-171792, 195765, 22652, 158937, 110661-',
            source: { key: 'cube', field: 'qDimensionInfo/1/qMeasureInfo/1' },
          },
        },
      ]);
    });

    it('should support properties from multiple fields', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/1',
          value: d => d.qElemNo,
          props: {
            id: {
              fields: [{ field: 'qDimensionInfo/0', value: v => v.qText }, { value: v => v.qText }],
              value: values => values.join(':'),
              label: values => values.join('||'),
            },
          },
        },
        dataset,
        { fields },
        deps
      );

      expect(m).to.eql([
        {
          value: 0,
          label: 'Beer',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          id: { value: 'Alcoholic Beverages:Beer', label: 'Alcoholic Beverages||Beer' },
        },
        {
          value: 1,
          label: 'Wine',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          id: { value: 'Alcoholic Beverages:Wine', label: 'Alcoholic Beverages||Wine' },
        },
        {
          value: 2,
          label: 'Bagels',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          id: { value: 'Baked Goods:Bagels', label: 'Baked Goods||Bagels' },
        },
        {
          value: 3,
          label: 'Muffins',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          id: { value: 'Baked Goods:Muffins', label: 'Baked Goods||Muffins' },
        },
        {
          value: 4,
          label: 'Sliced Bread',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
          id: { value: 'Baked Goods:Sliced Bread', label: 'Baked Goods||Sliced Bread' },
        },
      ]);
    });

    it('should support properties from multiple descendant fields', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/0',
          value: d => d.qElemNo,
          props: {
            id: {
              fields: [{ value: v => v.qText }, { field: 'qDimensionInfo/1/qMeasureInfo/0', reduce: 'sum' }],
              value: values => values.join(':'),
              label: labels => labels.join('||'),
            },
          },
        },
        dataset,
        { fields },
        deps
      );

      expect(m).to.eql([
        {
          value: 0,
          label: 'Alcoholic Beverages',
          source: { key: 'cube', field: 'qDimensionInfo/0' },
          id: { value: 'Alcoholic Beverages:23', label: 'Alcoholic Beverages||€€23' },
        },
        {
          value: 1,
          label: 'Baked Goods',
          source: { key: 'cube', field: 'qDimensionInfo/0' },
          id: { value: 'Baked Goods:24', label: 'Baked Goods||€€24' },
        },
      ]);
    });

    it('should filter main field', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/1',
          value: d => d.qElemNo,
          filter: d => d.qElemNo !== 2,
        },
        dataset,
        { fields },
        deps
      );

      expect(m).to.eql([
        {
          value: 0,
          label: 'Beer',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
        },
        {
          value: 1,
          label: 'Wine',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
        },
        {
          value: 3,
          label: 'Muffins',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
        },
        {
          value: 4,
          label: 'Sliced Bread',
          source: { key: 'cube', field: 'qDimensionInfo/1' },
        },
      ]);
    });
  });

  describe('with pseudo', () => {
    const treePages = [
      {
        qType: 'R',
        qElemNo: -1,
        qNodes: [
          {
            qText: 'Alpha',
            qElemNo: 1,
            qRow: 7,
            qType: 'N',
            qNodes: [
              {
                qText: 'Sales',
                qElemNo: 0,
                qType: 'P',
                qNodes: [
                  { qText: 'Sales-a1', qElemNo: 4, qValues: [{ qText: '$67', qValue: 67 }] },
                  { qText: 'Sales-a2', qElemNo: 5, qValues: [{ qText: '$48', qValue: 48 }] },
                ],
              },
              {
                qText: 'Margin',
                qElemNo: 1,
                qType: 'P',
                qValues: [{ qText: '25%', qValue: 0.25 }],
                qNodes: [
                  { qText: 'Margin-a1', qElemNo: 4, qValues: [{ qText: '28%', qValue: 0.28 }] },
                  { qText: 'Margin-a2', qElemNo: 5, qValues: [{ qText: '21%', qValue: 0.21 }] },
                ],
              },
            ],
          },
          {
            qText: 'Beta',
            qElemNo: 3,
            qRow: 10,
            qType: 'N',
            qNodes: [
              {
                qText: 'Sales',
                qElemNo: 0,
                qType: 'P',
                qNodes: [
                  { qText: 'Sales-b1', qElemNo: 9, qValues: [{ qText: '$112', qValue: 112 }] },
                  { qText: 'Sales-b2', qElemNo: 8, qValues: [{ qText: '$132', qValue: 132 }] },
                ],
              },
              {
                qText: 'Margin',
                qElemNo: 1,
                qType: 'P',
                qValues: [{ qText: '22%', qValue: 0.22 }],
                qNodes: [
                  { qText: 'Margin-b1', qElemNo: 9, qValues: [{ qText: '24%', qValue: 0.24 }] },
                  { qText: 'Margin-b2', qElemNo: 8, qValues: [{ qText: '23%', qValue: 0.23 }] },
                ],
              },
            ],
          },
        ],
      },
    ];

    const cube = {
      qMode: 'T',
      qDimensionInfo: [{ qStateCounts: {} }, { qStateCounts: {} }],
      qMeasureInfo: [
        { qMin: 0, qMax: 17 },
        { qMin: 0, qMax: 195765 },
      ],
      qTreeDataPages: treePages,
      qEffectiveInterColumnSortOrder: [0, -1, 1],
    };

    const fields = [
      {
        title: () => 'a',
        value: d => d.qElemNo,
        key: () => 'qDimensionInfo/0',
        formatter: () => v => `<${v}>`,
      },
      {
        title: () => 'b',
        value: d => d.qElemNo,
        key: () => 'qDimensionInfo/1',
        reduce: values => values.join(', '),
        formatter: () => v => `<${v}>`,
      },
      {
        title: () => 'c',
        value: d => d.qValue,
        label: d => d.qText,
        key: () => 'qMeasureInfo/0',
        formatter: () => v => `£${v}`,
      },
      {
        title: () => 'd',
        value: d => d.qValue,
        label: d => d.qText,
        key: () => 'qMeasureInfo/1',
        formatter: () => v => `£${v}`,
      },
    ];

    const dataset = {
      key: () => 'cube',
      raw: () => cube,
      field: sinon.stub(),
    };

    dataset.field.withArgs('qDimensionInfo/0').returns(fields[0]);
    dataset.field.withArgs('qDimensionInfo/1').returns(fields[1]);
    dataset.field.withArgs('qMeasureInfo/0').returns(fields[2]);
    dataset.field.withArgs('qMeasureInfo/1').returns(fields[3]);

    it('should return proper pseudo measure', () => {
      const m = extract(
        {
          field: 'qMeasureInfo/1',
        },
        dataset,
        { fields },
        deps
      );

      expect(m).to.eql([
        { value: 0.25, label: '25%', source: { key: 'cube', field: 'qMeasureInfo/1' } },
        { value: 0.22, label: '22%', source: { key: 'cube', field: 'qMeasureInfo/1' } },
      ]);
    });

    it('should return proper descendants of pseudo measure', () => {
      const m = extract(
        {
          field: 'qMeasureInfo/1',
          props: {
            descs: {
              field: 'qDimensionInfo/1',
              value: v => v.qText,
            },
          },
        },
        dataset,
        { fields },
        deps
      );

      expect(m).to.eql([
        {
          value: 0.25,
          label: '25%',
          source: { key: 'cube', field: 'qMeasureInfo/1' },
          descs: {
            value: 'Margin-a1, Margin-a2',
            label: 'Margin-a1, Margin-a2',
            source: { key: 'cube', field: 'qDimensionInfo/1' },
          },
        },
        {
          value: 0.22,
          label: '22%',
          source: { key: 'cube', field: 'qMeasureInfo/1' },
          descs: {
            value: 'Margin-b1, Margin-b2',
            label: 'Margin-b1, Margin-b2',
            source: { key: 'cube', field: 'qDimensionInfo/1' },
          },
        },
      ]);
    });
  });

  describe('with weird data', () => {
    // the following mock is a snapshot from engine
    const pages = [
      {
        qData: [
          {
            qElemNo: 0,
            qValue: 0,
            qType: 'R',
            qMaxPos: 0,
            qMinNeg: 0,
            qUp: 0,
            qDown: 0,
            qRow: 0,
            qSubNodes: [
              {
                qText: '-',
                qElemNo: -2,
                qValue: 'NaN',
                qType: 'U',
                qMaxPos: 'NaN',
                qMinNeg: 0,
                qUp: 0,
                qDown: 0,
                qRow: 0,
                qSubNodes: [
                  {
                    qText: '-',
                    qElemNo: 0,
                    qValue: 'NaN',
                    qType: 'U',
                    qMaxPos: 0,
                    qMinNeg: 0,
                    qUp: 0,
                    qDown: 0,
                    qRow: 0,
                    qSubNodes: [],
                  },
                ],
              },
            ],
          },
        ],
        qArea: {
          qLeft: 0,
          qTop: 0,
          qWidth: 1,
          qHeight: 1,
        },
      },
    ];

    const cube = {
      qMode: 'K',
      qDimensionInfo: [{ qStateCounts: {} }, { qStateCounts: {} }],
      qMeasureInfo: [{ qMin: 209146.92000000027, qMax: 209146.92000000027 }],
      qStackedDataPages: [pages],
      qEffectiveInterColumnSortOrder: [0, 1],
    };

    const fields = [
      {
        title: () => '=aggr(...)',
        value: d => d.qElemNo,
        key: () => 'qDimensionInfo/0',
        formatter: () => () => '',
      },
    ];

    const dataset = {
      key: () => 'cube',
      raw: () => cube,
      field: sinon.stub(),
    };

    dataset.field.withArgs('qDimensionInfo/0').returns(fields[0]);

    it('should return empty', () => {
      const m = extract(
        {
          field: 'qDimensionInfo/0',
        },
        dataset,
        { fields },
        deps
      );

      expect(m).to.eql([]);
    });
  });
});
