import color from '../index';

describe('Colors', () => {
  describe('HSL', () => {
    it('should handle hsl values', () => {
      const c = color('hsl(180,100%,50%)');
      expect(c).to.deep.equal({
        h: 180, s: 1, l: 0.5, a: 1
      });
    });

    it('should handle hsla values', () => {
      const c = color('hsla(180, 100% ,50%, 0.5)');
      expect(c).to.deep.equal({
        h: 180, s: 1, l: 0.5, a: 0.5
      });
    });

    it('should normalize angle values', () => {
      let c = color('hsla(-120, 100% ,50%, 0.5)');
      expect(c).to.deep.equal({
        h: 240, s: 1, l: 0.5, a: 0.5
      });

      c = color('hsla(480, 100% ,50%, 0.5)');
      expect(c).to.deep.equal({
        h: 120, s: 1, l: 0.5, a: 0.5
      });
    });

    it('should clip percentage values', () => {
      const c = color('hsla(180, 101% ,101%, 1)');
      expect(c).to.deep.equal({
        h: 180, s: 1, l: 1, a: 1
      });
    });

    it('should clip negative percentage values', () => {
      const c = color('hsla(180, -1% ,-1%, 1)');
      expect(c).to.deep.equal({
        h: 180, s: 0, l: 0, a: 1
      });
    });

    it('should clip alpha value', () => {
      const c = color('hsla(255, 100%, 50%, 10.10)');
      expect(c).to.deep.equal({
        h: 255, s: 1, l: 0.5, a: 1
      });
    });

    it('should allow decimal values and round to nearest integer', () => {
      let c = color('hsla(180.6, 11.6% , 19.6%, 1)');
      expect(c).to.deep.equal({
        h: 181, s: 0.12, l: 0.2, a: 1
      });

      c = color('hsl(180.6, 11.6% , 19.6%)');
      expect(c).to.deep.equal({
        h: 181, s: 0.12, l: 0.2, a: 1
      });
    });

    it('should not allow saturation and lightness values without a percentage character', () => {
      let c = color('hsla(18, 1 , 0.5, 1)');
      expect(c).to.deep.equal(undefined);

      c = color('hsl(18, 1 , 1)');
      expect(c).to.deep.equal(undefined);
    });

    it('should use percentage in string output', () => {
      let c = color('hsl(230, 100% ,50%)').toString();
      expect(c).to.equal('hsla(230, 100%, 50%, 1)');

      c = color('hsla(230, 100% ,50%, 0.5)').toString();
      expect(c).to.equal('hsla(230, 100%, 50%, 0.5)');
    });

    it('should not allow non-digit characters', () => {
      let c = color('hsla(a,b,c,d)');
      expect(c).to.equal(undefined);

      c = color('hsl(a,b,c)');
      expect(c).to.equal(undefined);
    });

    it('should handle whitespace', () => {
      let c = color(' hsla( 120 , 100% , 50% , 0.5 ) ');
      expect(c).to.deep.equal({
        h: 120, s: 1, l: 0.5, a: 0.5
      });

      c = color(' hsla( 80 , 100% , 50% , 0.5 ) ');
      expect(c).to.deep.equal({
        h: 80, s: 1, l: 0.5, a: 0.5
      });
    });
  });

  describe('RGB', () => {
    it('should handle rgb numerical values', () => {
      const c = color('rgb(3,33,99)');
      expect(c).to.deep.equal({
        r: 3, g: 33, b: 99, a: 1
      });
    });

    it('should handle rgba numerical values', () => {
      const c = color('rgba(3,33,99,0.1)');
      expect(c).to.deep.equal({
        r: 3, g: 33, b: 99, a: 0.1
      });
    });

    it('should handle rgb percentage values', () => {
      const c = color('rgb(3%,33%,99%)');
      expect(c).to.deep.equal({
        r: 8, g: 84, b: 252, a: 1
      });
    });

    it('should handle rgba percentage values', () => {
      const c = color('rgba(3%,33%,99%,0.5)');
      expect(c).to.deep.equal({
        r: 8, g: 84, b: 252, a: 0.5
      });
    });

    it('should clip numerical values', () => {
      let c = color('rgba(256,256,256,1)');
      expect(c).to.deep.equal({
        r: 255, g: 255, b: 255, a: 1
      });

      c = color('rgb(256,256,256)');
      expect(c).to.deep.equal({
        r: 255, g: 255, b: 255, a: 1
      });
    });

    it('should clip negative numerical values', () => {
      let c = color('rgba(-1,-1,-1,1)');
      expect(c).to.deep.equal({
        r: 0, g: 0, b: 0, a: 1
      });

      c = color('rgb(-1,-1,-1)');
      expect(c).to.deep.equal({
        r: 0, g: 0, b: 0, a: 1
      });
    });

    it('should clip percentage values', () => {
      let c = color('rgba(101%,101%,101%,1)');
      expect(c).to.deep.equal({
        r: 255, g: 255, b: 255, a: 1
      });

      c = color('rgb(101%,101%,101%)');
      expect(c).to.deep.equal({
        r: 255, g: 255, b: 255, a: 1
      });
    });

    it('should clip alpha value', () => {
      const c = color('rgba(255, 255, 255, 10.10)');
      expect(c).to.deep.equal({
        r: 255, g: 255, b: 255, a: 1
      });
    });

    it('should handle numerical boundry values', () => {
      let c = color('rgb(255,255,255)');
      expect(c).to.deep.equal({
        r: 255, g: 255, b: 255, a: 1
      });

      c = color('rgb(0, 0, 0)');
      expect(c).to.deep.equal({
        r: 0, g: 0, b: 0, a: 1
      });
    });

    it('should handle percentage boundry values', () => {
      let c = color('rgb(100%,100%,100%)');
      expect(c).to.deep.equal({
        r: 255, g: 255, b: 255, a: 1
      });

      c = color('rgb(0%,0%,0%)');
      expect(c).to.deep.equal({
        r: 0, g: 0, b: 0, a: 1
      });
    });

    it('should handle whitespace', () => {
      let c = color(' rgb( 100% , 100% , 100% ) ');
      expect(c).to.deep.equal({
        r: 255, g: 255, b: 255, a: 1
      });

      c = color(' rgba( 255 , 255 , 255 , 1 ) ');
      expect(c).to.deep.equal({
        r: 255, g: 255, b: 255, a: 1
      });
    });

    it('should clip negative alpha values', () => {
      const c = color('rgba(255,255,255,-1)');
      expect(c).to.deep.equal({
        r: 255, g: 255, b: 255, a: 0
      });
    });

    it('should not allow non-digit characters', () => {
      let c = color('rgba(a,b,c,d)');
      expect(c).to.deep.equal(undefined);

      c = color('rgb(a,b,c)');
      expect(c).to.deep.equal(undefined);
    });

    it('should not allow mixing numerial and percentage values', () => {
      let c = color('rgba(255,10%,123,1)');
      expect(c).to.deep.equal(undefined);

      c = color('rgb(123,55%,90%)');
      expect(c).to.deep.equal(undefined);
    });

    it('should not allow decimal values', () => {
      let c = color('rgba(25.5, 99.9, 0.1, 1)');
      expect(c).to.deep.equal(undefined);

      c = color('rgb(25.5, 99.9, 0.1)');
      expect(c).to.deep.equal(undefined);

      c = color('rgba(25.5%, 99.9%, 0.1%, 1)');
      expect(c).to.deep.equal(undefined);

      c = color('rgb(25.5%, 99.9%, 0.1%)');
      expect(c).to.deep.equal(undefined);
    });
  });

  describe('Hex', () => {
    it('should handle six digit hex values', () => {
      const c = color('#4682B4');
      expect(c).to.deep.equal({
        r: 70, g: 130, b: 180, a: 1
      });
    });

    it('should handle three digit hex values', () => {
      const c = color('#abc');
      expect(c).to.deep.equal({
        r: 170, g: 187, b: 204, a: 1
      });
    });

    it('should handle white space before and after three digit hex values', () => {
      const c = color('   #4682B4   ');
      expect(c).to.deep.equal({
        r: 70, g: 130, b: 180, a: 1
      });
    });

    it('should handle white space before and after six digit hex values', () => {
      const c = color('   #abc   ');
      expect(c).to.deep.equal({
        r: 170, g: 187, b: 204, a: 1
      });
    });

    it('should not match six digit hex values without #', () => {
      const c = color('aabbcc');
      expect(c).to.equal(undefined);
    });

    it('should not match three digit hex values without #', () => {
      const c = color('abc');
      expect(c).to.equal(undefined);
    });

    it('should not allow six digit hex values outside of boundry', () => {
      const c = color('#GGGGGG');
      expect(c).to.equal(undefined);
    });

    it('should only allow six or three digit hex values', () => {
      let c = color('#ffff');
      expect(c).to.equal(undefined);

      c = color('#ff');
      expect(c).to.equal(undefined);
    });
  });

  describe('Key words', () => {
    it('should handle key words', () => {
      const c = color('red');
      expect(c).to.deep.equal({
        r: 255, g: 0, b: 0, a: 1
      });
    });

    it('should handle key words', () => {
      const c = color('green');
      expect(c).to.deep.equal({
        r: 0, g: 128, b: 0, a: 1
      });
    });

    it('should handle extended key words', () => {
      const c = color('chocolate');
      expect(c).to.deep.equal({
        r: 210, g: 105, b: 30, a: 1
      });
    });

    it('should handle white space before and after key words', () => {
      const c = color('   red   ');
      expect(c).to.deep.equal({
        r: 255, g: 0, b: 0, a: 1
      });
    });

    it('should handle case in key words', () => {
      const c = color('RED');
      expect(c).to.deep.equal({
        r: 255, g: 0, b: 0, a: 1
      });
    });
  });

  describe('Input handling', () => {
    it('should handle null', () => {
      const c = color(null);
      expect(c).to.equal(undefined);
    });

    it('should handle undefined', () => {
      const c = color(undefined);
      expect(c).to.equal(undefined);
    });

    it('should handle empty string value', () => {
      const c = color('');
      expect(c).to.equal(undefined);
    });

    it('should handle empty value', () => {
      const c = color();
      expect(c).to.equal(undefined);
    });
  });

  describe('RGBA color', () => {
    it('should convert RGB to HSL', () => {
      const c1 = color('rgb(3, 33, 99)');
      const c2 = color('rgb(0, 0, 0)');
      const c3 = color('rgb(255, 255, 255)');

      expect(c1.toHSL()).to.equal('hsl(221, 94%, 20%)');
      expect(c2.toHSL()).to.equal('hsl(0, 0%, 0%)');
      expect(c3.toHSL()).to.equal('hsl(0, 0%, 100%)');
    });
  });

  describe('Conversions from RGBA', () => {
    it('should convert RGB to HSL', () => {
      let c1 = color('rgb(3, 33, 99)'),
        c2 = color('rgb(0, 0, 0)'),
        c3 = color('rgb(255, 255, 255)');

      expect(c1.toHSL()).to.equal('hsl(221, 94%, 20%)');
      expect(c2.toHSL()).to.equal('hsl(0, 0%, 0%)');
      expect(c3.toHSL()).to.equal('hsl(0, 0%, 100%)');
    });

    it('should convert RGBA to HSLA', () => {
      const c = color('rgba(3, 33, 99, 0.1)');
      expect(c.toHSLA()).to.equal('hsla(221, 94%, 20%, 0.1)');
    });

    it('should convert RGBA to RGB', () => {
      const c = color('rgba(255,255,255, 0.9)');
      expect(c.toRGB()).to.equal('rgb(255, 255, 255)');
    });

    it('should convert RGBA to RGBA', () => {
      const c = color('rgba(255,255,255, 0.9)');
      expect(c.toRGBA()).to.equal('rgba(255, 255, 255, 0.9)');
    });

    it('should convert RGB to HEX', () => {
      const c = color('rgb(255,255,0)');
      expect(c.toHex()).to.equal('#ffff00');
    });

    it('should convert RGBA to number', () => {
      const c = color('rgb(100, 128, 200)');
      expect(c.toNumber()).to.equal(6586568);
    });

    it('should convert RGBA to string', () => {
      const c = color('rgba(50, 50, 50, 0.6)');
      expect(c.toString()).to.equal('rgba(50, 50, 50, 0.6)');
    });

    it('should compare 2 RGBA colors, return true', () => {
      const c1 = color('rgba(50, 50, 50, 0.6)');
      const c2 = color('rgba(50, 50, 50, 0.6)');
      expect(c1.isEqual(c2)).to.deep.equal(true);
    });

    it('should compare 2 RGBA colors, return false', () => {
      let c1 = color('rgba(50, 50, 50, 0.6)'),
        c2 = color('rgba(50, 50, 50, 1)');
      expect(c1.isEqual(c2)).to.deep.equal(false);

      let c3 = color('rgba(50, 50, 50, 0.6)'),
        c4 = color('rgba(50, 51, 50, 0.6)');
      expect(c3.isEqual(c4)).to.deep.equal(false);
    });
  });

  describe('Conversions from HSLA', () => {
    it('should convert HSL to RGB', () => {
      let c1 = color('hsl(0, 100%, 100%)'),
        c2 = color('hsl(0, 0%, 0%)'),
        c3 = color('hsl(359, 60%, 50%)'),
        c4 = color('hsl(128, 50%, 33%)');

      expect(c1.toRGB()).to.equal('rgb(255, 255, 255)');
      expect(c2.toRGB()).to.equal('rgb(0, 0, 0)');
      expect(c3.toRGB()).to.equal('rgb(204, 51, 54)');
      expect(c4.toRGB()).to.equal('rgb(42, 126, 53)');
    });

    it('should convert HSLA to RGBA', () => {
      const c = color('hsla(480, 100% ,50%, 0.8)');
      expect(c.toRGBA()).to.equal('rgba(0, 255, 0, 0.8)');
    });

    it('should convert HSLA to HSL', () => {
      const c = color('hsla(180, 100%, 50%, 0.5)');
      expect(c.toHSL()).to.equal('hsl(180, 100%, 50%)');
    });

    it('should convert HSLA to HSLA', () => {
      const c = color('hsla(180, 100%, 50%, 0.5)');
      expect(c.toHSLA()).to.equal('hsla(180, 100%, 50%, 0.5)');
    });

    it('should convert HSL to HEX', () => {
      const c = color('hsl(60, 100%, 50%)');
      expect(c.toHex()).to.equal('#ffff00');
    });

    it('should convert HSL to 24 bit number', () => {
      const c = color('hsl(359, 100%, 100%)');
      expect(c.toNumber()).to.equal(0xffffff);
    });

    it('should convert HSLA to string', () => {
      const c = color('hsl(359, 100%, 100%)');
      expect(c.toString()).to.equal('hsla(359, 100%, 100%, 1)');
    });

    it('should compare 2 HSLA colors, return true', () => {
      const c1 = color('hsla(180, 80%, 50%, 0.6)');
      const c2 = color('hsla(180, 80%, 50%, 0.6)');
      expect(c1.isEqual(c2)).to.deep.equal(true);
    });

    it('should compare 2 HSLA colors, return false', () => {
      const c1 = color('hsla(180, 80%, 50%, 0.6)');
      const c2 = color('hsl(180, 80%, 50%)');
      expect(c1.isEqual(c2)).to.deep.equal(false);

      const c3 = color('hsla(180, 80%, 50%, 0.6)');
      const c4 = color('hsla(181, 80%, 50%, 0.6)');
      expect(c3.isEqual(c4)).to.deep.equal(false);
    });
  });

  describe('Color luminance', () => {
    it('should calculate luminance of RGBA color', () => {
      let c1 = color('yellow'),
        c2 = color('white'),
        c3 = color('black'),
        c4 = color('blue');
      expect(c1.luminance()).to.equal(0.9412757300600073);
      expect(c2.luminance()).to.equal(0.9999999999999999);
      expect(c3.luminance()).to.equal(0);
      expect(c4.luminance()).to.equal(0.33763886032268264);
    });

    it('should calculate luminance of HSLA color', () => {
      let c1 = color('hsl(60,100%,50%)'),
        c2 = color('hsl(0,0%,100%)'),
        c3 = color('hsl(0,0%,0%)'),
        c4 = color('hsl(309,85%,51%)');

      expect(c1.luminance()).to.equal(0.9412757300600073);
      expect(c2.luminance()).to.equal(0.9999999999999999);
      expect(c3.luminance()).to.equal(0);
      expect(c4.luminance()).to.equal(0.5781546696097349);
    });

    it('should calculate if the color is dark', () => {
      let c1 = color('black'),
        c2 = color('white'),
        c3 = color('hsl(240, 100%, 50%)'),
        c4 = color('lightblue');

      expect(c1.isDark()).to.equal(true);
      expect(c2.isDark()).to.equal(false);
      expect(c3.isDark()).to.equal(true);
      expect(c4.isDark()).to.equal(false);
    });
  });

  describe('Color utils', () => {
    it('should calculate contrast of two RGBA colors', () => {
      let c1 = color('white'),
        c2 = color('navy'),
        c3 = color('yellow');

      expect(color.utils.getContrast(c1, c2)).to.equal(4.7840030125136686);
      expect(color.utils.getContrast(c1, c3)).to.equal(1.059241105334474);
    });

    it('should calculate contrast of two HSLA colors', () => {
      let c1 = color('hsl(0, 0%, 100%)'),
        c2 = color('hsl(240, 100%, 25%)'),
        c3 = color('hsl(60, 100%, 50%)');

      expect(color.utils.getContrast(c1, c2)).to.equal(4.7840030125136686);
      expect(color.utils.getContrast(c1, c3)).to.equal(1.059241105334474);
    });

    it('should calculate contrast between RGB and HSL colors', () => {
      let c1 = color('white'),
        c2 = color('hsl(60, 100%, 50%)');

      expect(color.utils.getContrast(c1, c2)).to.equal(1.059241105334474);
    });

    it('should generate a linear gradient css string from a scale object', () => {
      const colorScale = color.palettes.scientific(0, 1);

      expect(color.utils.linearGradient('right', colorScale)).to.equal('linear-gradient(to right, rgb(61, 82, 161),rgb(58, 137, 201),rgb(119, 183, 229),rgb(180, 221, 247),rgb(230, 245, 254),rgb(255, 227, 170),rgb(249, 189, 126),rgb(237, 135, 94),rgb(210, 77, 62),rgb(174, 28, 62))');
    });

    it('should generate a linear gradient css string from an array of color objects', () => {
      const colorAry = ['red', 'blue'].map(color);
      expect(color.utils.linearGradient('right', colorAry)).to.equal('linear-gradient(to right, rgba(255, 0, 0, 1),rgba(0, 0, 255, 1))');
    });

    it('should generate a linear gradient css string from an array of color strings', () => {
      const colorAry = ['red', 'blue'];
      expect(color.utils.linearGradient('right', colorAry)).to.equal('linear-gradient(to right, red,blue)');
    });
  });
});
