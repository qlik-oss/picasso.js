import baselineHeuristic from '../baseline-heuristic';

describe('Baseline polyfill', () => {
  let text;

  beforeEach(() => {
    text = {
      'font-size': '10px'
    };
  });

  it('should handle undefined font-size', () => {
    text['font-size'] = undefined;
    text.baseline = 'alphabetical';

    expect(baselineHeuristic(text)).to.equal(0);
  });

  it('should handle font-size as number', () => {
    text['font-size'] = 10;
    text.baseline = 'ideographic';

    expect(baselineHeuristic(text)).to.equal(-2);
  });

  it('should support "dominant-baseline" attribute', () => {
    text['dominant-baseline'] = 'ideographic';

    expect(baselineHeuristic(text)).to.equal(-2);
  });

  it('should handle undefined baseline', () => {
    expect(baselineHeuristic(text)).to.equal(0);
  });

  it('should scale linearly with font-fize', () => {
    text['font-size'] = '20px';
    text.baseline = 'ideographic';

    expect(baselineHeuristic(text)).to.equal(-2 * 2);
  });

  it('should support "alphabetical" baseline', () => {
    text.baseline = 'alphabetical';

    expect(baselineHeuristic(text)).to.equal(0);
  });

  it('should support "ideographic" baseline', () => {
    text.baseline = 'ideographic';

    expect(baselineHeuristic(text)).to.equal(-2);
  });

  it('should support "hanging" baseline', () => {
    text.baseline = 'hanging';

    expect(baselineHeuristic(text)).to.equal(7.5);
  });

  it('should support "middle" baseline', () => {
    text.baseline = 'middle';

    expect(baselineHeuristic(text)).to.equal(2.5);
  });

  it('should support "central" baseline', () => {
    text.baseline = 'central';

    expect(baselineHeuristic(text)).to.equal(3.5);
  });

  it('should support "mathemetical" baseline', () => {
    text.baseline = 'mathemetical';

    expect(baselineHeuristic(text)).to.equal(5);
  });

  it('should support "text-before-edge" baseline', () => {
    text.baseline = 'text-before-edge';

    expect(baselineHeuristic(text)).to.equal(8.5);
  });

  it('should support "text-after-edge" baseline', () => {
    text.baseline = 'text-after-edge';

    expect(baselineHeuristic(text)).to.equal(-2);
  });
});
