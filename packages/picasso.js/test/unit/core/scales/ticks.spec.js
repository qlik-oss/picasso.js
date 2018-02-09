import ticks from '../../../../src/core/scales/ticks';

describe('Ticks', () => {
  it('should produce nice numbers by extending the given value into a multiple of [1, 2, 5, 10]', () => {
    expect(ticks.niceNum(0)).to.equal(0); // 0

    expect(ticks.niceNum(0.5)).to.equal(0.5); // 5
    expect(ticks.niceNum(0.9)).to.equal(1); // 1
    expect(ticks.niceNum(1)).to.equal(1); // 1

    expect(ticks.niceNum(1.1)).to.equal(2); // 2
    expect(ticks.niceNum(2)).to.equal(2); // 2

    expect(ticks.niceNum(2.1)).to.equal(5); // 5
    expect(ticks.niceNum(5)).to.equal(5); // 5

    expect(ticks.niceNum(5.1)).to.equal(10); // 10
    expect(ticks.niceNum(10)).to.equal(10); // 10


    expect(ticks.niceNum(-0.15)).to.equal(-0.2); // 2
    expect(ticks.niceNum(-300)).to.equal(-500); // 5
  });

  it('should produce nice numbers by rounding the given value into a multiple of [1, 2, 5, 10]', () => {
    expect(ticks.niceNum(0.14, true)).to.equal(0.1); // 1
    expect(ticks.niceNum(0.29, true)).to.equal(0.2); // 2
    expect(ticks.niceNum(0.3001, true)).to.equal(0.5); // 5
    expect(ticks.niceNum(0.69, true)).to.equal(0.5); // 5
    expect(ticks.niceNum(0.701, true)).to.equal(1); // 1

    expect(ticks.niceNum(1.4, true)).to.equal(1); // 1
    expect(ticks.niceNum(2.5, true)).to.equal(2); // 2

    expect(ticks.niceNum(3.1, true)).to.equal(5); // 5
    expect(ticks.niceNum(6.9, true)).to.equal(5); // 5

    expect(ticks.niceNum(7.1, true)).to.equal(10); // 10
    expect(ticks.niceNum(14, true)).to.equal(10); // 10

    expect(ticks.niceNum(-290, true)).to.equal(-200); // 2
    expect(ticks.niceNum(-0.0149, true)).to.equal(-0.01); // 1
  });

  it('should produce nice ticks', () => {
    expect(ticks.generateTicks(0, 1)).to.deep.equal({ start: 0, end: 1, ticks: [0, 1], nfrac: 0 });
    expect(ticks.generateTicks(-1.2, 5, 4)).to.deep.equal({ start: -5, end: 5, ticks: [-5, 0, 5], nfrac: 0 });
    expect(ticks.generateTicks(-1.2, 5, 4, true)).to.deep.equal({ start: -2, end: 6, ticks: [-2, 0, 2, 4, 6], nfrac: 0 });
  });

  it('should produce nice ticks with negative range', () => {
    expect(ticks.generateTicks(1, 0)).to.deep.equal({ start: 1, end: 0, ticks: [1, 0], nfrac: 0 });
    expect(ticks.generateTicks(5, -1.2, 4)).to.deep.equal({ start: 5, end: -5, ticks: [5, 0, -5], nfrac: 0 });
    expect(ticks.generateTicks(5, -1.2, 4, true)).to.deep.equal({ start: 6, end: -2, ticks: [6, 4, 2, 0, -2], nfrac: 0 });
  });
});
