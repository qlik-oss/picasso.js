import colorObject from '../../../../../src/core/colors/instantiator/color-object';
import RgbaColor from '../../../../../src/core/colors/rgba-color';
import HslaColor from '../../../../../src/core/colors/hsla-color';

describe('colorObject', () => {
  const nonObjects = [true, 0, '', () => { }],
    undetermined = [{}, { r: 0, g: 0 }, { h: 0, s: 0 }, { r: 0, g: 0, h: 0 }, { h: 0, s: 0, r: 0 }, {
      r: 0, g: 0, h: 0, s: 0
    }],
    rgb = { r: 0, g: 0, b: 0 },
    hsl = { h: 0, s: 0, l: 0 };

  it('should be the correct api', () => {
    expect(typeof colorObject === 'function').to.equal(true);

    const methods = ['test', 'getColorType'];

    methods.forEach((method) => {
      expect(Object.prototype.hasOwnProperty.call(colorObject, method)).to.equal(true);
      expect(typeof colorObject[method] === 'function').to.equal(true);
    });

    expect(Object.keys(colorObject).length).to.equal(methods.length);
  });

  it('should return undefined if argument is not an object', () => {
    nonObjects.forEach((argument) => {
      expect(typeof colorObject(argument)).to.equal('undefined');
    });
  });

  it('should return undefined if no color type can be determined for the object', () => {
    undetermined.forEach((argument) => {
      expect(typeof colorObject(argument)).to.equal('undefined');
    });
  });

  it('should return an instance of RgbaColor if color type rgb is determined', () => {
    expect(colorObject(rgb) instanceof RgbaColor).to.equal(true);
  });

  it('should return a new instance of RgbaColor if color type rgb is determined', () => {
    expect(colorObject(rgb)).not.to.equal(colorObject(rgb));
  });

  it('should return a correct RgbaColor instance', () => {
    const color = colorObject({
      r: 1, g: 2, b: 3, a: 4
    });

    expect(color.r).to.equal(1);
    expect(color.g).to.equal(2);
    expect(color.b).to.equal(3);
    expect(color.a).to.equal(4);
  });

  it('should return an instance of HslaColor if color type hsl is determined', () => {
    expect(colorObject(hsl) instanceof HslaColor).to.equal(true);
  });

  it('should return a new instance of HslaColor if color type hsl is determined', () => {
    expect(colorObject(hsl)).not.to.equal(colorObject(hsl));
  });

  it('should return a correct RgbaColor instance', () => {
    const color = colorObject({ h: 1, s: 2, l: 3 });

    expect(color.h).to.equal(1);
    expect(color.s).to.equal(2);
    expect(color.l).to.equal(3);
  });

  describe('test', () => {
    it('should return false if argument is undefined', () => {
      expect(colorObject.test()).to.equal(false);
    });

    it('should return false if argument is null', () => {
      expect(colorObject.test(null)).to.equal(false);
    });

    it('should return false if keyword is not an object', () => {
      nonObjects.forEach((argument) => {
        expect(colorObject.test(argument)).to.equal(false);
      });
    });

    it('should return false if color type for object cannot be determined', () => {
      undetermined.forEach((obj) => {
        expect(colorObject.test(obj)).to.equal(false);
      });
    });

    it('should return true if color type is rgb', () => {
      expect(colorObject.test(rgb)).to.equal(true);
    });

    it('should return true if color type is hsl', () => {
      expect(colorObject.test(hsl)).to.equal(true);
    });
  });

  describe('getColorType', () => {
    it('should return undefined if argument is undefined', () => {
      expect(typeof colorObject.getColorType()).to.equal('undefined');
    });

    it('should return undefined if argument is null', () => {
      expect(typeof colorObject.getColorType(null)).to.equal('undefined');
    });

    it('should return undefined if argument is not an object', () => {
      nonObjects.forEach((argument) => {
        expect(typeof colorObject.getColorType(argument)).to.equal('undefined');
      });
    });

    it('should return undefined if color type for object cannot be determined', () => {
      undetermined.forEach((obj) => {
        expect(typeof colorObject.getColorType(obj)).to.equal('undefined');
      });
    });

    it('should return rgb if color type is determined to be rgb', () => {
      expect(colorObject.getColorType(rgb)).to.equal('rgb');
    });

    it('should return hsl if color type is determined to be rgb', () => {
      expect(colorObject.getColorType(hsl)).to.equal('hsl');
    });
  });
});
