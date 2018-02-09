import categorical from '../../../../../src/core/scales/color/categorical';

describe('categorical', () => {
  it('should return greyish color for unknown values (default)', () => {
    let s = categorical({}, {}, { theme: {
      palette: name => (name === 'unknown' ? ['#d2d2d2'] : [])
    } });
    expect(s()).to.equal('#d2d2d2');
  });

  it('should return red color for unknown values', () => {
    let s = categorical({
      unknown: 'red'
    });
    expect(s()).to.equal('red');
  });

  it('should return default range from theme', () => {
    const defaultColors = ['fancy'];
    let s = categorical({}, {}, { theme: {
      palette: name => (name === 'categorical' ? defaultColors : [])
    } });
    expect(s.range()).to.eql(defaultColors);
  });

  describe('explicit', () => {
    let s;
    beforeEach(() => {
      s = categorical({
        domain: ['Sweden', 'Italy', 'England', 'France', 'Canada'],
        range: ['blue', 'red'],
        explicit: {
          domain: ['Italy', 'USA', 'Sweden'],
          range: ['green', 'starspangled', 'yellow']
        }
      });
    });

    it('should not modify domain when explicit domain is set', () => {
      expect(s.domain()).to.eql(['Sweden', 'Italy', 'England', 'France', 'Canada']);
    });

    it('should modify range when explicit range and domain are set', () => {
      expect(s.range()).to.eql(['yellow', 'green', 'blue', 'red', 'blue']);
    });

    it('should return custom color for "Italy"', () => {
      expect(s('Italy')).to.equal('green');
    });
  });
});
