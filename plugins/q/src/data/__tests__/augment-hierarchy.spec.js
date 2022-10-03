import q from '../dataset';
import { getPropsInfo } from '../../../../../packages/picasso.js/src/core/data/util';

describe('augment-hierarchy', () => {
  beforeAll(() => {
    q.util = {
      normalizeConfig: getPropsInfo,
    };
  });

  afterAll(() => {
    q.util = undefined;
  });

  // describe('hierarchical data', () => {
  describe('containing two dimensions, one measure', () => {
    const stackedPageWithoutPseudo = {
      qArea: {
        qLeft: 0,
        qTop: 0,
        qWidth: 2,
        qHeight: 3,
      },
      qData: [
        {
          qType: 'R',
          qText: '_rooot',
          qElemNo: 0,
          qSubNodes: [
            {
              qText: 'Alpha',
              qElemNo: 1,
              qRow: 7,
              qValue: 'NaN',
              qSubNodes: [
                {
                  qText: 'total: $666',
                  qElemNo: -1,
                  qValue: 666,
                  qType: 'T',
                },
                {
                  qText: 'a1',
                  qElemNo: 0,
                  qRow: 8,
                  qValue: 123,
                  qSubNodes: [
                    {
                      qValue: 45,
                      qElemNo: 0,
                      qRow: 8,
                      qText: '$45.00',
                      qAttrExps: { qValues: [{}, { qText: 'redish', qNum: 'NaN' }] },
                    },
                  ],
                },
                {
                  qText: 'a2',
                  qElemNo: 3,
                  qRow: 9,
                  qValue: 135,
                  qSubNodes: [
                    {
                      qValue: 32,
                      qElemNo: 0,
                      qRow: 9,
                      qText: '$32.00',
                      qAttrExps: { qValues: [{}, { qText: 'white', qNum: false }] },
                    },
                  ],
                },
              ],
            },
            {
              qText: 'Beta',
              qElemNo: 3,
              qRow: 10,
              qValue: 2,
              qSubNodes: [
                {
                  qText: 'total: $667',
                  qElemNo: -1,
                  qRow: 11,
                  qValue: 667,
                  qType: 'T',
                },
                {
                  qText: 'b1',
                  qElemNo: 7,
                  qRow: 12,
                  qValue: 345,
                  qSubNodes: [
                    {
                      qValue: 13,
                      qElemNo: 0,
                      qRow: 12,
                      qText: '$13.00',
                      qAttrExps: { qValues: [{}, { qText: 'red', qNum: 987 }] },
                    },
                  ],
                },
                {
                  qText: 'b3',
                  qElemNo: 9,
                  qRow: 13,
                  qValue: 276,
                  qSubNodes: [
                    {
                      qValue: 17,
                      qElemNo: 0,
                      qRow: 13,
                      qText: '$17.00',
                      qAttrExps: { qValues: [{}, { qText: 'green', qNum: 'NaN' }] },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const cube = {
      qMode: 'K',
      qDimensionInfo: [
        { qFallbackTitle: 'first', qStateCounts: {} },
        { qFallbackTitle: 'second', qStateCounts: {} },
      ],
      qMeasureInfo: [{ qFallbackTitle: 'emasure', qMin: 1, qMax: 2 }],
      qStackedDataPages: [stackedPageWithoutPseudo],
      qEffectiveInterColumnSortOrder: [0, 1],
    };

    it('should return a root node', () => {
      const m = q({ key: 'nyckel', data: cube }).hierarchy();
      expect(m.data.value).to.eql(stackedPageWithoutPseudo.qData[0]);
    });

    it('should add a data property per node', () => {
      const m = q({ key: 'nyckel', data: cube }).hierarchy({
        value: (d) => d.qText,
      });
      expect(m.descendants().map((child) => child.data.value)).to.eql([
        '_rooot',
        'Alpha',
        'Beta',
        'total: $666',
        'a1',
        'a2',
        'total: $667',
        'b1',
        'b3',
        '$45.00',
        '$32.00',
        '$13.00',
        '$17.00',
      ]);
    });

    it('should add a data property of an ancestor node', () => {
      const m = q({ key: 'nyckel', data: cube }).hierarchy({
        props: {
          dimOne: {
            field: 'qDimensionInfo/0',
            value: (d) => d.qText,
            reduce: (values) => values.join(', '),
          },
        },
      });
      // console.log(stackedPageWithoutPseudo.qData[0]);
      expect(m.descendants().map((child) => child.data.dimOne.value)).to.eql([
        'Alpha, Beta',
        'Alpha',
        'Beta',
        'Alpha',
        'Alpha',
        'Alpha',
        'Beta',
        'Beta',
        'Beta',
        'Alpha',
        'Alpha',
        'Beta',
        'Beta',
      ]);
    });

    it('should add a data property of a descendant node', () => {
      const m = q({ key: 'nyckel', data: cube }).hierarchy({
        props: {
          desc: {
            field: 'qDimensionInfo/1',
            value: (d) => d.qText,
            reduce: (values) => values.join(', '),
          },
        },
      });
      // console.log(stackedPageWithoutPseudo.qData[0]);
      expect(m.descendants().map((child) => child.data.desc.value)).to.eql([
        'total: $666, a1, a2, total: $667, b1, b3', // descendants of '__root', with reduction (join) applied
        'total: $666, a1, a2', // children of 'Alpha', with reduction applied
        'total: $667, b1, b3', // children of 'Beta', with reduction applied
        'total: $666',
        'a1',
        'a2',
        'total: $667',
        'b1',
        'b3',
        'a1', // from measure node
        'a2', // from measure node
        'b1', // from measure node
        'b3', // from measure node
      ]);
    });

    it('should add a data property of reduced values', () => {
      const m = q({ key: 'nyckel', data: cube }).hierarchy({
        props: {
          desc: {
            field: 'qMeasureInfo/0',
            value: (d) => (d ? d.qValue : d),
            reduce: (values) => values.join('---'),
          },
          p: (d) => d.qText,
        },
      });
      // console.log(stackedPageWithoutPseudo.qData[0]);
      expect(m.descendants().map((child) => child.data.desc.value)).to.eql([
        '45---32---13---17', // descendants of '__root', with reduction applied
        '45---32', // measure nodes in 'Alpha', with reduction applied
        '13---17', // measure nodes in 'Beta', with reduction applied
        '', // total node
        '45',
        '32',
        '',
        '13',
        '17',
        45, // actual measure node
        32, // actual measure node
        13, // actual measure node
        17, // actual measure node
      ]);
    });

    it('should add a data property for multiple fields', () => {
      const m = q({ key: 'nyckel', data: cube }).hierarchy({
        children: (node) => (node.qSubNodes ? node.qSubNodes.filter((n) => n.qType !== 'T') : null),
        props: {
          id: {
            fields: [
              { field: 'qDimensionInfo/0', value: (d) => d.qText, reduce: (values) => values.join('--') },
              { field: 'qDimensionInfo/1', value: (d) => d.qText, reduce: (values) => values.join('_') },
            ],
            value: (values, node) => values.slice(0, node.depth).join('>>'),
          },
        },
      });
      expect(m.descendants().map((child) => child.data.id.value)).to.eql([
        '', // root
        'Alpha',
        'Beta',
        'Alpha>>a1',
        'Alpha>>a2',
        'Beta>>b1',
        'Beta>>b3',
        'Alpha>>a1', // from measure node
        'Alpha>>a2', // from measure node
        'Beta>>b1', // from measure node
        'Beta>>b3', // from measure node
      ]);
    });
  });
  // });
  describe('S mode', () => {
    let cube;

    beforeEach(() => {
      cube = {
        qMode: 'S',
        qDimensionInfo: [
          { qFallbackTitle: 'first', qStateCounts: {} },
          { qFallbackTitle: 'second', qStateCounts: {} },
        ],
        qMeasureInfo: [{ qFallbackTitle: 'emasure', qMin: 1, qMax: 2 }],
        qDataPages: [
          {
            qMatrix: [
              [
                { qText: 'Aa', qElemNumber: 1 },
                { qText: '$456', qNum: 3 },
                { qText: 'A', qElemNumber: 1 },
              ],
              [
                { qText: 'Ba', qElemNumber: 2 },
                { qText: '$457', qNum: 10 },
                { qText: 'B', qElemNumber: 2 },
              ],
              [
                { qText: 'Ab', qElemNumber: 3 },
                { qText: '$235', qNum: 5 },
                { qText: 'A', qElemNumber: 1 },
              ],
            ],
          },
        ],
        qEffectiveInterColumnSortOrder: [1, 0, 2],
        qColumnOrder: [1, 2, 0],
      };
    });

    it('hierarchy', () => {
      const d = q({
        key: 'nyckel',
        data: cube,
      });
      const h = d.hierarchy({
        value: (v) => (v ? v.qText : '__'),
        props: {
          v: {
            field: 'qMeasureInfo/0',
            value: (v) => (v ? v.qNum : NaN),
          },
        },
      });

      expect(h.descendants().map((child) => child.data.v.value)).to.eql([6, 4, 10, 3, 5, 10]);
    });

    it('hierarchy - should handle empty qColumnOrder', () => {
      cube.qColumnOrder = [];
      cube.qDataPages = [
        {
          qMatrix: [
            [
              { qText: 'A', qElemNumber: 1 },
              { qText: 'Aa', qElemNumber: 1 },
              { qText: '$456', qNum: 3 },
            ],
            [
              { qText: 'B', qElemNumber: 2 },
              { qText: 'Ba', qElemNumber: 2 },
              { qText: '$457', qNum: 10 },
            ],
            [
              { qText: 'A', qElemNumber: 1 },
              { qText: 'Ab', qElemNumber: 3 },
              { qText: '$235', qNum: 5 },
            ],
          ],
        },
      ];
      const d = q({
        key: 'nyckel',
        data: cube,
      });
      const h = d.hierarchy({
        value: (v) => (v ? v.qText : '__'),
        props: {
          v: {
            field: 'qMeasureInfo/0',
            value: (v) => (v ? v.qNum : NaN),
          },
        },
      });

      expect(h.descendants().map((child) => child.data.v.value)).to.eql([6, 4, 10, 3, 5, 10]);
    });

    it('hierarchy - should handle if qColumnOrder doesnt contain a reference to all fields', () => {
      cube.qColumnOrder = [0, 1];
      cube.qDataPages = [
        {
          qMatrix: [
            [
              { qText: 'A', qElemNumber: 1 },
              { qText: 'Aa', qElemNumber: 1 },
              { qText: '$456', qNum: 3 },
            ],
            [
              { qText: 'B', qElemNumber: 2 },
              { qText: 'Ba', qElemNumber: 2 },
              { qText: '$457', qNum: 10 },
            ],
            [
              { qText: 'A', qElemNumber: 1 },
              { qText: 'Ab', qElemNumber: 3 },
              { qText: '$235', qNum: 5 },
            ],
          ],
        },
      ];
      const d = q({
        key: 'nyckel',
        data: cube,
      });
      const h = d.hierarchy({
        value: (v) => (v ? v.qText : '__'),
        props: {
          v: {
            field: 'qMeasureInfo/0',
            value: (v) => (v ? v.qNum : NaN),
          },
        },
      });

      expect(h.descendants().map((child) => child.data.v.value)).to.eql([6, 4, 10, 3, 5, 10]);
    });
  });
});
