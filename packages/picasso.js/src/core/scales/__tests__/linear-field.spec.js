import linear from '../linear';
import field from '../../data/field';

describe('Linear data scale', () => {
  let dataScale;
  let fields;
  let settings;
  const truty = [true, {}, [], 42, 'foo', new Date(), -42, 3.14, -3.14, Infinity, -Infinity];
  const falsy = [false, null, undefined, 0, NaN, ''];
  const notNumbers = [{}, 'this is my sock', undefined, NaN, () => {}, '123ABC'];

  beforeEach(() => {
    fields = {
      fields: [field({ min: 0, max: 10 }), field({ min: 50, max: 100 })],
    };
    settings = {};
  });

  it('should create a function object', () => {
    dataScale = linear(settings, fields);
    expect(dataScale).to.be.a('function');
  });

  it('should return a scaled value on the function object', () => {
    dataScale = linear(settings, fields);
    expect(dataScale(100)).to.equal(1);
  });

  it('should use a normalized range', () => {
    dataScale = linear(settings, fields);
    expect(dataScale.range()).to.deep.equal([0, 1]);
  });

  it('should generate a domain based on the min and max of all fields', () => {
    fields.fields.push(field({ min: -20, max: 10 }));
    dataScale = linear(settings, fields);
    expect(dataScale.domain()).to.deep.equal([-20, 100]);
  });

  it('should default to -1 and 1 as domain if data range and data value is equal to zero', () => {
    fields = {
      fields: [field({ min: 0, max: 0 })],
    };
    dataScale = linear(settings, fields);
    expect(dataScale.domain()).to.deep.equal([-1, 1]);
  });

  it('should default to -1 and 1 as domain if data range is NaN', () => {
    fields = {
      fields: [field({ min: NaN, max: NaN })],
    };
    dataScale = linear(settings, fields);
    expect(dataScale.domain()).to.deep.equal([-1, 1]);
  });

  it('should default expand by 10% if data range is equal to zero', () => {
    fields = {
      fields: [field({ min: 10, max: 10 })],
    };
    dataScale = linear(settings, fields);
    expect(dataScale.domain()).to.deep.equal([9, 11]);

    fields = {
      fields: [field({ min: -10, max: -10 })],
    };
    dataScale = linear(settings, fields);
    expect(dataScale.domain()).to.deep.equal([-11, -9]);
  });

  describe('Settings', () => {
    it('should follow a specific predecence for settings effecting the domain', () => {
      // From highest predence to lowest: min/max, include, expand
      settings.expand = 1; // Takes predence over default domain
      settings.include = [-500, 500]; // Takes predence over expand
      dataScale = linear(settings, fields);
      expect(dataScale.domain()).to.deep.equal([-500, 500]);

      settings.min = -555; // Takes predence over expand and include
      settings.max = 555; // Takes predence over expand and include
      dataScale = linear(settings, fields);
      expect(dataScale.domain()).to.deep.equal([-555, 555]);
    });

    it('should expose data and resources as context in callback functions', () => {
      const resources = {
        a: 1,
      };
      const spy = sinon.spy();
      settings.min = spy;
      dataScale = linear(settings, fields, resources);
      expect(spy).to.have.been.calledWith({ data: fields, resources });
    });

    describe('Invert', () => {
      it('should be possible to invert the scale using a boolean', () => {
        settings.invert = true;
        dataScale = linear(settings, fields);
        expect(dataScale.range()).to.deep.equal([1, 0]);
      });

      it('should be possible to invert the scale using a function', () => {
        settings.invert = () => true;
        dataScale = linear(settings, fields);
        expect(dataScale.range()).to.deep.equal([1, 0]);
      });

      it('should handle truty values', () => {
        truty.forEach((t) => {
          settings.invert = t;
          dataScale = linear(settings, fields);
          expect(dataScale.range()).to.deep.equal([1, 0], `truty value ${t} was not handled correctly`);
        });
      });

      it('should handle falsy values', () => {
        falsy.forEach((t) => {
          settings.invert = t;
          dataScale = linear(settings, fields);
          expect(dataScale.range()).to.deep.equal([0, 1], `falsy value ${t} was not handled correctly`);
        });
      });

      it('should be respected in the normalized output', () => {
        settings.invert = true;
        dataScale = linear(settings, fields);
        expect(dataScale.norm(0)).to.equal(1); // Domain range is 0-100
      });

      it('should be respected in the normalized inverted output', () => {
        settings.invert = true;
        dataScale = linear(settings, fields);
        expect(dataScale.normInvert(0)).to.equal(100); // Domain range is 0-100
      });
    });

    describe('Expand', () => {
      it('should be possible to expand the domain using a number', () => {
        settings.expand = 0.1;
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-10, 110]);
      });

      it('should be possible to expand the domain using a function', () => {
        settings.expand = () => 1;
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-100, 200]);
      });

      it('should ignore non-numeric values', () => {
        notNumbers.forEach((n) => {
          settings.expand = n;
          dataScale = linear(settings, fields);
          expect(dataScale.domain()).to.deep.equal([0, 100]);
        });
      });

      it('should not be applied if data range and data value is equal to zero', () => {
        fields = {
          fields: [field({ min: 0, max: 0 })],
        };
        settings.expand = 10;
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-1, 1]);
      });

      it('should not be applied if data range is equal to zero', () => {
        fields = {
          fields: [field({ min: 10, max: 10 })],
        };
        settings.expand = 10;
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([9, 11]);
      });
    });

    describe('Min/Max', () => {
      it('should be possible to set min/max the domain using a number', () => {
        settings.min = -200;
        settings.max = 300;
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-200, 300]);
      });

      it('should be possible to set min/max the domain using a function', () => {
        settings.min = () => -250;
        settings.max = () => -100;
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-250, -100]);
      });

      it('should ignore non-numeric values', () => {
        notNumbers.forEach((n) => {
          settings.min = () => n;
          settings.max = () => n;
          dataScale = linear(settings, fields);
          expect(dataScale.domain()).to.deep.equal([0, 100]);
        });
      });

      it('should be applied if data range and data value is equal to zero', () => {
        fields = {
          fields: [field({ min: 0, max: 0 })],
        };
        settings.min = -250;
        settings.max = -100;
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-250, -100]);
      });

      it('should be applied if data range is equal to zero', () => {
        fields = {
          fields: [field({ min: 10, max: 10 })],
        };
        settings.min = -250;
        settings.max = -100;
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-250, -100]);
      });
    });

    describe('Include', () => {
      it('should be possible to set a range of values to include in the domain using an Array', () => {
        settings.include = [-250, 0, 10, 2000];
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-250, 2000]);
      });

      it('should be possible to set a range of values to include in the domain using a function', () => {
        settings.include = () => [-250, 0, 10, 2000];
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-250, 2000]);
      });

      it('should handle when input array contains non-numeric values', () => {
        settings.include = () => [-250].concat(notNumbers);
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-250, 100]);
      });

      it('should be applied if data range and data value is equal to zero', () => {
        fields = {
          fields: [field({ min: 0, max: 0 })],
        };
        settings.include = [-250, 0, 10, 100];
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-250, 100]);
      });

      it('should be applied if data range is equal to zero', () => {
        fields = {
          fields: [field({ min: 10, max: 10 })],
        };
        settings.include = [-250, 0, 10, 100];
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-250, 100]);
      });

      it('should only extend domain if included values are above or below current domain range', () => {
        // Default range is 0-100
        settings.include = () => [-250, 0];
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([-250, 100]);

        settings.include = () => [10, 500];
        dataScale = linear(settings, fields);
        expect(dataScale.domain()).to.deep.equal([0, 500]);
      });
    });
  });
});
