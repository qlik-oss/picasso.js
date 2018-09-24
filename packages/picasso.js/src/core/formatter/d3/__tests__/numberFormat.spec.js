import numberFormat from '../numberFormat';

describe('d3 numberFormat', () => {
  let formatter;

  beforeEach(() => {
    formatter = numberFormat('0.2f');
  });

  it('should swallow a pattern', () => {
    expect(formatter(0.123)).to.equal('0.12');
  });

  it('should format manually correctly', () => {
    expect(formatter.format('0.1f', 0.123)).to.equal('0.1');
  });

  it('should allow for custom locale', () => {
    formatter.locale({
      decimal: ',',
      thousands: '\u00a0',
      grouping: [3],
      currency: ['', 'SEK']
    });

    expect(formatter(0.123)).to.equal('0,12');

    expect(formatter.format('0.1f', 0.123)).to.equal('0,1');
  });
});
