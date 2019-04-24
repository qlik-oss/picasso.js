import fontSizeToHeight from '../font-size-to-height';

describe('font-size to height', () => {
  it('should use 24px a base for determing height', () => {
    // font-size + 4
    expect(fontSizeToHeight('9px')).to.equal(13);
    expect(fontSizeToHeight('12px')).to.equal(16);
    expect(fontSizeToHeight('23.99px')).to.equal(27.99);

    // font-size + 8
    expect(fontSizeToHeight('24px')).to.equal(32);
    expect(fontSizeToHeight('36px')).to.equal(44);
    expect(fontSizeToHeight('47.99px')).to.equal(55.99);

    // font-size + 12
    expect(fontSizeToHeight('48px')).to.equal(60);
    expect(fontSizeToHeight('71.99px')).to.equal(83.99);
  });

  it('should only accept valid font-size format', () => {
    // Valid
    expect(fontSizeToHeight('16px')).to.equal(20);
    expect(fontSizeToHeight(' 16px ')).to.equal(20);
    expect(fontSizeToHeight(' 16PX ')).to.equal(20);
    expect(fontSizeToHeight('16.0123456789px')).to.equal(20.0123456789);

    // Invalid
    expect(fontSizeToHeight('123')).to.equal(16);
    expect(fontSizeToHeight('123 px')).to.equal(16);
    expect(fontSizeToHeight(123)).to.equal(16);
    expect(fontSizeToHeight(null)).to.equal(16);
    expect(fontSizeToHeight([])).to.equal(16);
    expect(fontSizeToHeight(false)).to.equal(16);
    expect(fontSizeToHeight(() => {})).to.equal(16);
    expect(fontSizeToHeight({})).to.equal(16);
  });
});
