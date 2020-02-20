import colorKeyWord from '../color-keyword';
import RgbaColor from '../../rgba-color';

describe('colorKeyWord', () => {
  it('should be the correct api', () => {
    expect(typeof colorKeyWord === 'function').to.equal(true);

    const methods = ['test'];

    methods.forEach(method => {
      expect(Object.prototype.hasOwnProperty.call(colorKeyWord, method)).to.equal(true);
      expect(typeof colorKeyWord[method] === 'function').to.equal(true);
    });

    expect(Object.keys(colorKeyWord).length).to.equal(methods.length);
  });

  it('should return a color instance', () => {
    expect(colorKeyWord('blue') instanceof RgbaColor).to.equal(true);
  });

  it('should return a new color instance', () => {
    expect(colorKeyWord('blue')).not.to.equal(colorKeyWord('blue'));
  });

  it('should return a correct color instance', () => {
    const blue = colorKeyWord('blue');

    expect(blue.r).to.equal(0);
    expect(blue.g).to.equal(0);
    expect(blue.b).to.equal(255);
    expect(blue.a).to.equal(1);

    const ghostwhite = colorKeyWord('ghostwhite');

    expect(ghostwhite.r).to.equal(248);
    expect(ghostwhite.g).to.equal(248);
    expect(ghostwhite.b).to.equal(255);
    expect(ghostwhite.a).to.equal(1);

    const olive = colorKeyWord('olive');

    expect(olive.r).to.equal(128);
    expect(olive.g).to.equal(128);
    expect(olive.b).to.equal(0);
    expect(olive.a).to.equal(1);
  });

  describe('test', () => {
    it('should return false if keyword is undefined', () => {
      expect(colorKeyWord.test()).to.equal(false);
    });

    it('should return false if keyword is null', () => {
      expect(colorKeyWord.test(null)).to.equal(false);
    });

    it('should return false if keyword is not a string', () => {
      [true, 0, {}, () => {}].forEach(keyword => {
        expect(colorKeyWord.test(keyword)).to.equal(false);
      });
    });

    it('should return false if keyword is unknown', () => {
      expect(colorKeyWord.test('tassekatt')).to.equal(false);
    });

    it('should return true if keyword is known', () => {
      expect(colorKeyWord.test('aliceblue')).to.equal(true);
      expect(colorKeyWord.test('ALICEBLUE')).to.equal(true);
      expect(colorKeyWord.test('coral')).to.equal(true);
      expect(colorKeyWord.test('moccasin')).to.equal(true);
      expect(colorKeyWord.test('yellowgreen')).to.equal(true);
    });
  });
});
