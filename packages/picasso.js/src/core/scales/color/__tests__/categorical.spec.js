import categorical from '../categorical';

describe('categorical', () => {
  it('should return greyish color for unknown values (default)', () => {
    let s = categorical({}, {}, {
      theme: {
        palette: name => (name === 'unknown' ? ['#d2d2d2'] : [])
      }
    });
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
    let s = categorical({}, {}, {
      theme: {
        palette: name => (name === 'categorical' ? defaultColors : [])
      }
    });
    expect(s.range()).to.eql(defaultColors);
  });

  describe('explicit', () => {
    let settings;
    let s;
    beforeEach(() => {
      settings = {
        domain: ['Sweden', 'Italy', 'England', 'France', 'Canada'],
        range: ['blue', 'red'],
        explicit: {
          domain: ['Italy', 'USA', 'Sweden'],
          range: ['green', 'starspangled', 'yellow']
        }
      };
      s = categorical(settings);
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

    it('should override range', () => {
      settings.domain = ['Italy', 'France', 'Sweden', 'Canada'];
      settings.explicit.override = true;
      // range is first duplicated to fit domain:  [blue, red] -> [blue, red, blue, red]
      // then override -> [green, red, yellow, blue]

      s = categorical(settings);

      expect(s.range()).to.eql(['green', 'red', 'yellow', 'red']);
    });
  });
});
