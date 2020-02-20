import { resolveStyle } from '..';

describe('Style resolver', () => {
  let settings;
  beforeEach(() => {
    settings = {
      stroke: 'stroke',
      fontSize: '13px',
      style: {
        stroke: function stroke(item, index) {
          return index < 2 ? 'style.stroke' : undefined;
        },
        box: {
          width: 1.2,
          fill: 'rgba(0, 0, 0, 0.2)',
          opacity: {
            source: '/qMeasureInfo/1',
            fn: function fn(index) {
              return index > 1 ? 0.5 : null;
            },
          },
        },
        whisker: {
          type: 'circle',
          otherThing: (item, index) => {
            if (index < 1) {
              return 'thing';
            }
            return null;
          },
          fill: 'red',
          width: 1,
        },
        med: {
          stroke: '#00f',
          strokeWidth: 6,
          fill: 0,
        },
        line: {
          stroke: function stroke(item, index) {
            return index < 1 ? 'style.line.stroke' : undefined;
          },
          strokeWidth: {
            fn: function fn() {
              return 5;
            },
            source: '/qMeasureInfo/1',
          },
          fill: { source: '/qMeasureInfo/0', type: 'color' },
        },
        title: {
          main: {
            nullValue: null,
          },
        },
      },
    };
  });

  it('should resolve existing style', () => {
    const result = resolveStyle({ fill: 'default' }, settings, 'style.whisker');
    expect(result.fill).to.equal('red');
  });
  it('should resolve existing 0 style', () => {
    const result = resolveStyle({ fill: 1 }, settings, 'style.med');
    expect(result.fill).to.equal(0);
  });
  it('should resolve deep inheritance', () => {
    const result = resolveStyle({ fontSize: 'default' }, settings, 'style.title.main');
    expect(result.fontSize).to.equal('13px');
  });
  it('should fallback to inline default', () => {
    const result = resolveStyle({ color: 'red' }, settings, 'style.title.main');
    expect(result.color).to.equal('red');
  });
  it('should fallback to inline 0 default', () => {
    const result = resolveStyle({ fontSize: 0 }, settings, 'style.med');
    expect(result.fontSize).to.equal(0);
  });
  it('should fallback to global default for unallowed null value', () => {
    const result = resolveStyle({ color: null }, settings, 'style.title.main');
    expect(result.color).to.equal('#595959');
  });
  it('should fallback throught functions', () => {
    const result = resolveStyle({ stroke: 'default' }, settings, 'style.line');
    const output = [0, 1, 2].map(item => result.stroke.fn(undefined, null, item));
    expect(output).to.deep.equal(['style.line.stroke', 'style.stroke', 'stroke']);
  });
  it('should possibly return null', () => {
    const result = resolveStyle({ otherThing: 'default' }, settings, 'style.whisker');
    const output = [0, 1, 2].map(item => result.otherThing.fn(undefined, null, item));
    expect(output).to.deep.equal(['thing', null, null]);
  });
  it('should return explicitly set null values', () => {
    const result = resolveStyle({ nullValue: 2 }, settings, 'style.title.main');
    expect(result.nullValue).to.equal(null);
  });
});
