import qTime from '..';
import tickGen from './tickGen';

describe('Scale - qTime', () => {
  let values;
  let settings;

  beforeEach(() => {
    values = [
      {
        qTags: ['$year'],
        qTicks: tickGen(1, 1, 'Y')
      },
      {
        qTags: ['$quarter'],
        qTicks: tickGen(4, 4, 'Q')
      },
      {
        qTags: ['$week'],
        qTicks: tickGen(52, 1, 'W')
      },
      {
        qTags: ['$day'],
        qTicks: tickGen(30, 1, '')
      }
    ];

    settings = {
      values,
      maxWidth: 10000, // Omit width as a limiter
      measureText: ({ text }) => ({ width: text.length })
    };
  });

  it('should return a linearly interpolated value', () => {
    settings.min = 10;
    settings.max = 20;
    const scale = qTime(settings);

    expect(scale(10)).to.equal(0);
    expect(scale(15)).to.equal(0.5);
    expect(scale(20)).to.equal(1);
  });

  it('should handle NaN value', () => {
    settings.min = 10;
    settings.max = 20;
    const scale = qTime(settings);

    expect(scale(undefined)).to.be.NaN;
  });

  describe('min/max', () => {
    it('should derive min/max from data fields', () => {
      const data = {
        fields: [
          { min: () => 10, max: () => 20 }
        ]
      };

      const i = qTime(settings, data);
      expect(i.min()).to.equal(10);
      expect(i.max()).to.equal(20);
    });

    it('should use min/max from settings', () => {
      settings.min = 10;
      settings.max = 20;

      const i = qTime(settings);
      expect(i.min()).to.equal(10);
      expect(i.max()).to.equal(20);
    });
  });

  describe('ticks', () => {
    it('should generate outer level with minor', () => {
      settings.level = 'outer';
      settings.maxWidth = 200;

      const ticks = qTime(settings).ticks({});

      expect(ticks).to.be.of.length(5);
      expect(ticks[0]).to.deep.include({ label: 'Y0', isMinor: false });
      expect(ticks[1]).to.deep.include({ label: 'Q0', isMinor: true });
      expect(ticks[2]).to.deep.include({ label: 'Q1', isMinor: true });
      expect(ticks[3]).to.deep.include({ label: 'Q2', isMinor: true });
      expect(ticks[4]).to.deep.include({ label: 'Q3', isMinor: true });
    });

    it('should generate inner level without minor', () => {
      settings.level = 'inner';
      settings.maxWidth = 200;

      const ticks = qTime(settings).ticks({});

      expect(ticks).to.be.of.length(4);
      expect(ticks[0]).to.deep.include({ label: 'Q0', isMinor: false });
      expect(ticks[1]).to.deep.include({ label: 'Q1', isMinor: false });
      expect(ticks[2]).to.deep.include({ label: 'Q2', isMinor: false });
      expect(ticks[3]).to.deep.include({ label: 'Q3', isMinor: false });
    });
  });
});
