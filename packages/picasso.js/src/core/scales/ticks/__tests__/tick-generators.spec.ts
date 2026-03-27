import extend from 'extend';
import { looseDistanceBasedGenerator } from '../tick-generators';
import linear, { DEFAULT_TICKS_SETTINGS, DEFAULT_MINORTICKS_SETTINGS } from '../../linear';
import band from '../../band';
import formatter from '../../../formatter';

describe('Tick generators', () => {
  let settings;
  let scale;
  const d3formatter = formatter('d3-number')('');
  let input;

  describe('continuous tick generator', () => {
    beforeEach(() => {
      settings = extend(true, {}, { ticks: DEFAULT_TICKS_SETTINGS, minorTicks: DEFAULT_MINORTICKS_SETTINGS });
      settings.paddingStart = 0;
      settings.paddingEnd = 10;
      settings.minorTicks = {
        count: 0,
      };
      scale = linear();
      input = {
        settings,
        distance: 100,
        scale,
        formatter: d3formatter,
      };
    });

    describe('formatting', () => {
      it('should output ticks in the correct format', () => {
        settings.ticks.count = 2;
        input.formatter = formatter('d3-number')('-1.0%');
        const ticks = scale.ticks(input);
        [{ label: '0%' }, { label: '50%' }, { label: '100%' }].forEach((e, i) => {
          expect(ticks[i].label).to.equal(e.label);
        });
      });
    });

    describe('by values', () => {
      it('should generate ticks by values', () => {
        settings.ticks.values = [0.1, 0.3];
        const ticks = scale.ticks(input);
        [
          { position: 0.1, start: 0.1, end: 0.1 },
          { position: 0.3, start: 0.3, end: 0.3 },
        ].forEach((e, i) => {
          expect(ticks[i].position).to.equal(e.position);
          expect(ticks[i].start).to.equal(e.start);
          expect(ticks[i].end).to.equal(e.end);
        });
      });

      it('should generate ticks from objects', () => {
        settings.ticks.values = [{ value: 0.1, start: 0, end: 0.2 }, 0.3];
        const ticks = scale.ticks(input);
        [
          { position: 0.1, start: 0, end: 0.2 },
          { position: 0.3, start: 0.3, end: 0.3 },
        ].forEach((e, i) => {
          expect(ticks[i].position).to.equal(e.position);
          expect(ticks[i].start).to.equal(e.start);
          expect(ticks[i].end).to.equal(e.end);
        });
      });

      it('should generate ticks from objects with isMinor property', () => {
        settings.ticks.values = [
          {
            value: 0.1,
            start: 0,
            end: 0.2,
            isMinor: true,
          },
          0.3,
        ];
        const ticks = scale.ticks(input);
        [
          {
            position: 0.1,
            start: 0,
            end: 0.2,
            isMinor: true,
          },
          { position: 0.3, start: 0.3, end: 0.3 },
        ].forEach((e, i) => {
          expect(ticks[i].position).to.equal(e.position);
          expect(ticks[i].start).to.equal(e.start);
          expect(ticks[i].end).to.equal(e.end);
          expect(ticks[i].isMinor).to.equal(!!e.isMinor);
        });
      });

      it('should require value prop on object', () => {
        settings.ticks.values = [
          { value: 0.1, start: 0, end: 0.2 },
          { start: 0.3, end: 0.5 },
        ];
        const ticks = scale.ticks(input);
        [{ position: 0.1, start: 0, end: 0.2 }].forEach((e, i) => {
          expect(ticks[i].position).to.equal(e.position);
          expect(ticks[i].start).to.equal(e.start);
          expect(ticks[i].end).to.equal(e.end);
        });
      });

      it('should filter out NaN values', () => {
        settings.ticks.values = [0.1, NaN, '12', 'asd', false, 0.3];
        const ticks = scale.ticks(input);
        [0.1, 0.3].forEach((e, i) => {
          expect(ticks[i].value).to.equal(e);
        });
      });

      it('should only generate ticks by values that are within the domain', () => {
        settings.ticks.values = [-100, -0.1, 0.1, 0.3, 1.1, 123, 2130];
        const ticks = scale.ticks(input);
        [0.1, 0.3].forEach((e, i) => {
          expect(ticks[i].value).to.equal(e);
        });
      });

      it('should only generate unique ticks by values', () => {
        settings.ticks.values = [0.1, 0.1, 0.3, 0.4, 0.3, 0.5];
        const ticks = scale.ticks(input);
        expect(ticks.map((t) => t.value)).to.deep.equal([0.1, 0.3, 0.4, 0.5]);
      });

      it('should sort ticks by values', () => {
        settings.ticks.values = [0.3, 0.1, 0.5, 0.4];
        const ticks = scale.ticks(input);
        expect(ticks.map((t) => t.value)).to.deep.equal([0.1, 0.3, 0.4, 0.5]);
      });
    });

    describe('by count', () => {
      it('should generate ticks by count', () => {
        settings.ticks.count = 3;
        const ticks = scale.ticks(input);
        expect(ticks.length).to.deep.equal(3);
        [0, 0.5, 1].forEach((e, i) => {
          expect(ticks[i].position).to.equal(e);
          expect(ticks[i].start).to.equal(e);
          expect(ticks[i].end).to.equal(e);
        });
      });

      it('should generate ticks by count with minor ticks', () => {
        settings.ticks.count = 5;
        settings.minorTicks.count = 1;
        const ticks = scale.ticks(input);
        expect(ticks.length).to.equal(11);
        expect(ticks.filter((t) => t.isMinor).length).to.equal(5);
      });
    });

    describe('by distance', () => {
      it('should generate ticks by distance', () => {
        const ticks = scale.ticks(input);
        [0, 0.5, 1].forEach((e, i) => {
          expect(ticks[i].position).to.equal(e);
          expect(ticks[i].start).to.equal(e);
          expect(ticks[i].end).to.equal(e);
        });
      });

      it('should generate tight ticks by distance', () => {
        settings.ticks.tight = true;
        const ticks = scale.ticks(input);
        expect(ticks[0].position).to.equal(scale.range()[0]);
        expect(ticks[ticks.length - 1].position).to.equal(scale.range()[1]);
        [0, 0.5, 1].forEach((e, i) => {
          expect(ticks[i].position).to.equal(e);
          expect(ticks[i].start).to.equal(e);
          expect(ticks[i].end).to.equal(e);
        });
      });

      it('should generate tight ticks by a custom distance', () => {
        settings.ticks.tight = true;
        settings.ticks.distance = 20;
        const ticks = scale.ticks(input);
        expect(ticks).to.be.of.length(6);
      });

      it('should generate loose ticks by a custom distance', () => {
        settings.ticks.distance = 20;
        const ticks = scale.ticks(input);
        expect(ticks).to.be.of.length(6);
      });

      it('should generate ticks by distance with minor ticks', () => {
        settings.minorTicks.count = 1;
        const ticks = scale.ticks(input);
        expect(ticks.length).to.equal(5);
        expect(ticks.filter((t) => t.isMinor).length).to.equal(2);
      });
    });

    describe('forceBounds', () => {
      it('should be able to force ticks at bounds', () => {
        settings.ticks.tight = false;
        settings.ticks.forceBounds = true;
        scale.domain([-99, 99]);
        const ticks = scale.ticks(input);
        const majorTicks = ticks.filter((t) => !t.isMinor);

        expect(majorTicks[0]).to.deep.equal({
          position: 0,
          start: 0,
          end: 0,
          label: '−99',
          isMinor: false,
          value: -99,
        });
        expect(majorTicks[majorTicks.length - 1]).to.deep.equal({
          position: 1,
          start: 1,
          end: 1,
          label: '99',
          isMinor: false,
          value: 99,
        });
      });

      it('should be able to force ticks at bounds with minorTicks', () => {
        settings.ticks.tight = false;
        settings.ticks.forceBounds = true;
        settings.minorTicks = {
          count: 3, // Should trigger minorTicks on -50 and 450, those should be replace by major ticks
        };
        scale.domain([-50, 450]);
        const ticks = scale.ticks(input);
        const majorTicks = ticks.filter((t) => !t.isMinor);

        expect(majorTicks[0]).to.deep.equal({
          start: 0,
          end: 0,
          position: 0,
          label: '−50',
          isMinor: false,
          value: -50,
        });
        expect(majorTicks[majorTicks.length - 1]).to.deep.equal({
          position: 1,
          start: 1,
          end: 1,
          label: '450',
          isMinor: false,
          value: 450,
        });
      });
    });
  });

  describe('looseDistanceBasedGenerator', () => {
    beforeEach(() => {
      scale = linear();
      sinon.spy(scale, 'ticks');
    });

    describe('unitDivider', () => {
      it('should use fallback divider if unitDivider is not a number', () => {
        ['3', 'asd', null, false, true, NaN, () => {}, undefined, ' ', {}].forEach((type) => {
          looseDistanceBasedGenerator({ distance: 100, unitDivider: type, scale });
          expect(scale.ticks).to.have.been.calledWith(2);
        });
      });

      it('should use fallback divider if unitDivider is a negative number', () => {
        looseDistanceBasedGenerator({ distance: 100, unitDivider: -123, scale });
        expect(scale.ticks).to.have.been.calledWith(2);
      });

      it('should use unitDivider if it is a positive number', () => {
        looseDistanceBasedGenerator({ distance: 100, unitDivider: 20, scale });
        expect(scale.ticks).to.have.been.calledWith(100 / 20);
      });

      it('should handle unitDivider of zero', () => {
        looseDistanceBasedGenerator({ distance: 100, unitDivider: 0, scale });
        expect(scale.ticks).to.have.been.calledWith(1000);
      });

      it('should handle very small number on unitDivider', () => {
        looseDistanceBasedGenerator({ distance: 100, unitDivider: 0.0001, scale });
        expect(scale.ticks).to.have.been.calledWith(1000);
      });
    });

    describe('distance', () => {
      it('should handle if distance is not a number', () => {
        ['3', 'asd', null, false, true, NaN, () => {}, undefined, ' ', {}].forEach((type) => {
          looseDistanceBasedGenerator({ distance: type, scale });
          expect(scale.ticks).to.have.been.calledWith(2);
        });
      });

      it('should handle if distance is a negative number', () => {
        looseDistanceBasedGenerator({ distance: -1213, scale });
        expect(scale.ticks).to.have.been.calledWith(2);
      });

      it('should use distance if it is a positive number', () => {
        looseDistanceBasedGenerator({ distance: 2000, scale });
        expect(scale.ticks).to.have.been.calledWith(2000 / 100);
      });

      it('should handle distance of zero', () => {
        looseDistanceBasedGenerator({ distance: 0, scale });
        expect(scale.ticks).to.have.been.calledWith(2);
      });

      it('should handle very small number on distance', () => {
        looseDistanceBasedGenerator({ distance: 0.0001, scale });
        expect(scale.ticks).to.have.been.calledWith(2);
      });
    });
  });

  describe('discrete tick generator', () => {
    let data;

    beforeEach(() => {
      data = ['d1', 'd2', 'd3'];
    });

    it('should generate ticks by data', () => {
      scale = band(
        {
          value: (d) => d.datum,
          label: (d) => d.datum,
        },
        { items: data }
      );
      scale.range([0, 1]);
      const ticks = scale.ticks();
      const expected = [
        {
          position: 0 + scale.bandwidth() / 2,
          label: 'd1',
          data: 'd1',
          start: 0,
          end: 0 + scale.bandwidth(),
        },
        {
          position: 1 / 3 + scale.bandwidth() / 2,
          label: 'd2',
          data: 'd2',
          start: 1 / 3,
          end: 1 / 3 + scale.bandwidth(),
        },
        {
          position: 2 / 3 + scale.bandwidth() / 2,
          label: 'd3',
          data: 'd3',
          start: 2 / 3,
          end: 2 / 3 + scale.bandwidth(),
        },
      ];
      expect(ticks).to.deep.equal(expected);
    });

    it('should support duplicate labels by separating values and labels', () => {
      scale = band(
        {
          value: (item) => item.datum.id.value,
          label: (item) => item.datum.value,
        },
        {
          items: [
            { value: 'alpha', id: { value: 'd1' } },
            { value: 'alpha', id: { value: 'd2' } },
            { value: 'beta', id: { value: 'd3' } },
          ],
        }
      );
      scale.range([0, 1]);

      const ticks = scale.ticks();

      expect(ticks[0].label).to.deep.equal('alpha');
      expect(ticks[0].data).to.deep.equal({ value: 'alpha', id: { value: 'd1' } });

      expect(ticks[1].label).to.deep.equal('alpha');
      expect(ticks[1].data).to.deep.equal({ value: 'alpha', id: { value: 'd2' } });

      expect(ticks[2].label).to.deep.equal('beta');
      expect(ticks[2].data).to.deep.equal({ value: 'beta', id: { value: 'd3' } });
    });
  });
});
