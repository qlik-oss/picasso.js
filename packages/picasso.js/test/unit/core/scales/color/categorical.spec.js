import categorical from '../../../../../src/core/scales/color/categorical';

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

    it('should override the range', () => {
      settings.explicit.domain = ['Italy', 'England', 'Sweden'];
      settings.explicit.range = ['green', 'white', 'yellow'];
      settings.explicit.override = true;

      s = categorical(settings);

      expect(s.range()).to.eql(['yellow', 'green', 'white']);
    });

    it('should append null', () => {
      settings.domain.push(-2);
      settings.explicit.domain = [-2];
      settings.explicit.range = ['grey'];
      settings.explicit.override = true;

      s = categorical(settings);

      expect(s.range()).to.eql(['blue', 'red', 'grey']);
    });

    it('should append others', () => {
      settings.domain.push(-3);
      settings.explicit.domain = [-3];
      settings.explicit.range = ['darkgrey'];
      settings.explicit.override = false;

      s = categorical(settings);

      expect(s.range()).to.eql(['blue', 'red', 'blue', 'red', 'blue', 'darkgrey']);
    });

    it('should append others and null', () => {
      settings.domain.push(-3);
      settings.domain.splice(0, 0, -2);

      settings.explicit.domain = [-2, -3];
      settings.explicit.range = ['grey', 'darkgrey'];
      settings.explicit.override = false;

      s = categorical(settings);

      expect(s.range()).to.eql(['grey', 'blue', 'red', 'blue', 'red', 'blue', 'darkgrey']);
    });
  });
});
