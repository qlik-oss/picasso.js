import stack, { stackOffsetDiverging } from '../stack';

describe('stack', () => {
  const valueField = { key: 'nyckel', field: 'sales' };
  let data;
  beforeEach(() => {
    data = {
      items: [
        { minor: { value: 1, source: valueField }, stack: 1 },
        { minor: { value: 2, source: valueField }, stack: 2 },
        { minor: { value: 3, source: valueField }, stack: 3 },
        { minor: { value: 4, source: valueField }, stack: 1 },
        { minor: { value: 5, source: valueField }, stack: 1 },
        { minor: { value: 6, source: valueField }, stack: 1 },
        { minor: { value: 7, source: valueField }, stack: 1 },
        { minor: { value: 8, source: valueField }, stack: 2 },
        { minor: { value: 9, source: valueField }, stack: 3 },
      ],
      fields: [],
    };
  });

  it('should attach generated field', () => {
    stack(data, {
      stackKey: (v) => v.stack,
      value: (v) => v.minor.value,
    });
    expect(data.fields[0].min()).to.eql(0);
    expect(data.fields[0].max()).to.eql(23);
  });

  it('should attach start and end properties', () => {
    stack(data, {
      stackKey: (v) => v.stack,
      value: (v) => v.minor.value,
    });
    expect(data.items[8].start).to.eql({ value: 3 });
    expect(data.items[8].end).to.eql({ value: 12 });
  });
});

describe('stackOffsetDiverging', () => {
  it('should stack positive values above zero and negative values below zero', () => {
    const series = [
      [
        [0, 1],
        [0, -2],
      ],
      [
        [0, 3],
        [0, -4],
      ],
      [
        [0, -6],
        [0, 7],
      ],
    ];

    stackOffsetDiverging(series, [0, 1, 2]);

    expect(series).to.eql([
      [
        [0, 1],
        [-2, 0],
      ],
      [
        [1, 4],
        [-6, -2],
      ],
      [
        [-6, 0],
        [0, 7],
      ],
    ]);
  });

  it('should keep zero-height segments at the current positive baseline', () => {
    const series = [[[0, 5]], [[0, 0]], [[0, -2]]];

    stackOffsetDiverging(series, [0, 1, 2]);

    expect(series).to.eql([[[0, 5]], [[5, 5]], [[-2, 0]]]);
  });

  it('should anchor non-comparable segments at the current positive baseline', () => {
    const series = [[[0, 2]], [[NaN, NaN]], [[0, -1]]];

    stackOffsetDiverging(series, [0, 1, 2]);

    expect(series[0]).to.eql([[0, 2]]);
    expect(series[1][0][0]).to.equal(2);
    expect(series[1][0][1]).to.be.NaN;
    expect(series[2]).to.eql([[-1, 0]]);
  });

  it('should respect the provided order when applying offsets', () => {
    const series = [[[0, 2]], [[0, 3]]];

    stackOffsetDiverging(series, [1, 0]);

    expect(series).to.eql([[[3, 5]], [[0, 3]]]);
  });
});
