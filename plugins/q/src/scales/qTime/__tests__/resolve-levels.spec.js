import resolveLevels from '../resolve-levels';
import tickGen from './tickGen';

describe('qTime - Resolve levels', () => {
  let data;
  let settings;

  beforeEach(() => {
    settings = {
      maxWidth: 10000, // Omit width as a limiter
      measureText: ({ text }) => ({ width: text.length }),
    };

    data = [
      {
        qTags: ['$year'],
        qTicks: tickGen(1, 1, 'Y'),
      },
      {
        qTags: ['$quarter'],
        qTicks: tickGen(4, 4, 'Q'),
      },
      {
        qTags: ['$week'],
        qTicks: tickGen(52, 1, 'W'),
      },
      {
        qTags: ['$day'],
        qTicks: tickGen(30, 1, ''),
      },
    ];
  });

  it('given enough space is available, should start on the last level', () => {
    settings.maxWidth = 1000;

    const out = resolveLevels({ data, settings });

    expect(out).to.deep.equal({
      outer: { index: 1, minor: 2 }, // quarter/week
      inner: { index: 2, minor: 3 }, // week/day
    });
  });

  it('given no space is available, should return the first level', () => {
    settings.maxWidth = 10;

    const out = resolveLevels({ data, settings });

    expect(out).to.deep.equal({
      outer: { index: 0, minor: null }, // year
      inner: { index: null, minor: null },
    });
  });

  describe('auto-calender', () => {
    beforeEach(() => {
      data = [
        {
          // Index 0
          qTags: ['$year'],
          qTicks: tickGen(1, 1, 'Y'),
        },
        {
          // Index 1
          qTags: ['$quarter'],
          qTicks: tickGen(4, 1, 'Q'),
        },
        {
          // Index 2
          qTags: ['$yearquarter', '$qualified'],
          qTicks: tickGen(4, 1, 'YQ'),
        },
        {
          // Index 3
          qTags: ['$month'],
          qTicks: tickGen(12, 1, 'M'),
        },
        {
          // Index 4
          qTags: ['$month', '$qualified'],
          qTicks: tickGen(12, 1, 'YM'),
        },
        {
          // Index 5
          qTags: ['$week', '$hidden'],
          qTicks: tickGen(52, 1, 'W'),
        },
        {
          // Index 6
          qTags: ['$week', '$qualified'],
          qTicks: tickGen(52, 1, 'YW'),
        },
        {
          // Index 7
          qTags: ['$date', '$hidden'],
          qTicks: tickGen(364, 1, ''),
        },
        {
          // Index 8
          qTags: ['$date', '$qualified'],
          qTicks: tickGen(364, 1, ''),
        },
      ];
    });

    it('scenario 1: outer and inner resolved at highest granularity', () => {
      settings.maxWidth = 10000;
      const out = resolveLevels({ data, settings });

      expect(out).to.deep.equal({
        outer: { index: 6, minor: 7 }, // week$qualified / date$hidden
        inner: { index: 7, minor: null }, // date$hidden
      });
    });

    it('scenario 2: outer and inner resolved at mid granularity', () => {
      settings.maxWidth = 500;
      const out = resolveLevels({ data, settings });

      expect(out).to.deep.equal({
        outer: { index: 2, minor: 3 }, // yearquarter$qualified / month
        inner: { index: 3, minor: null }, // month
      });
    });
  });

  describe('data handling', () => {
    it('should handle empty dataset', () => {
      data = [];

      const out = resolveLevels({ data, settings });

      expect(out).to.deep.equal({
        outer: { index: null, minor: null },
        inner: { index: null, minor: null },
      });
    });

    it('should handle non-array data param', () => {
      data = {};

      const out = resolveLevels({ data, settings });

      expect(out).to.deep.equal({
        outer: { index: null, minor: null },
        inner: { index: null, minor: null },
      });
    });

    it('should handle single value dataset', () => {
      data = [
        {
          qTags: ['date'],
          qTicks: tickGen(30, 1, ''),
        },
      ];

      const out = resolveLevels({ data, settings });

      expect(out).to.deep.equal({
        outer: { index: 0, minor: null },
        inner: { index: null, minor: null },
      });
    });

    it('should handle empty qTicks', () => {
      data = [
        {
          qTags: ['$date'],
          qTicks: [],
        },
      ];

      const out = resolveLevels({ data, settings });

      expect(out).to.deep.equal({
        outer: { index: 0, minor: null },
        inner: { index: null, minor: null },
      });
    });
  });

  describe('qTags', () => {
    it('should use hidden data only if all data values are hidden', () => {
      data = [
        {
          qTags: ['$hidden'],
          qTicks: tickGen(4, 1, 'H'),
        },
        {
          qTags: ['$hidden'],
          qTicks: tickGen(10, 1, 'HH'),
        },
      ];

      const out = resolveLevels({ data, settings });

      expect(out).to.deep.equal({
        outer: { index: 0, minor: null }, // first hidden
        inner: { index: null, minor: null },
      });
    });

    it('should not use qualified values as inner level', () => {
      data = [
        {
          qTags: ['$year', '$qualified'],
          qTicks: tickGen(1, 1, 'Y'),
        },
        {
          qTags: ['$quarter', '$qualified'],
          qTicks: tickGen(4, 4, 'Q'),
        },
        {
          qTags: ['$week', '$qualified'],
          qTicks: tickGen(52, 1, 'W'),
        },
        {
          qTags: ['$day', '$qualified'],
          qTicks: tickGen(30, 1, ''),
        },
      ];

      const out = resolveLevels({ data, settings });

      expect(out).to.deep.equal({
        outer: { index: 3, minor: null }, // first qualified
        inner: { index: null, minor: null },
      });
    });
  });
});
