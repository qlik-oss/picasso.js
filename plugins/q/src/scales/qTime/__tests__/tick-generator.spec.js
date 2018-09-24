import { scaleLinear } from 'd3-scale';
import tickGenerator from '../tick-generator';

describe('qTime - Tick generator', () => {
  let scale;
  let tickFn;
  let settings;

  beforeEach(() => {
    scale = scaleLinear();
    settings = {};
  });

  describe('transformTicks', () => {
    let qTicks;

    beforeEach(() => {
      qTicks = [
        { qStart: 0, qEnd: 1, qText: 'Day 1' },
        { qStart: 1, qEnd: 2, qText: 'Day 2' }
      ];
    });

    it('should transform qAxisticks to picasso format', () => {
      scale.domain([0, 2]);
      tickFn = tickGenerator(scale, settings);

      const ticks = tickFn.transformTicks(qTicks);

      expect(ticks[0]).to.deep.equal({
        value: 0.5, position: 0.25, start: 0, end: 0.5, label: 'Day 1', isMinor: false
      });

      expect(ticks[1]).to.deep.equal({
        value: 1.5, position: 0.75, start: 0.5, end: 1, label: 'Day 2', isMinor: false
      });
    });

    it('should position at start given anchor is set to start', () => {
      scale.domain([0, 2]);
      settings.anchor = 'start';
      tickFn = tickGenerator(scale, settings);

      const ticks = tickFn.transformTicks(qTicks);

      expect(ticks[0]).to.deep.equal({
        value: 0, position: 0, start: 0, end: 0.5, label: 'Day 1', isMinor: false
      });

      expect(ticks[1]).to.deep.equal({
        value: 1, position: 0.5, start: 0.5, end: 1, label: 'Day 2', isMinor: false
      });
    });

    it('should position at end given anchor is set to end', () => {
      scale.domain([0, 2]);
      settings.anchor = 'end';
      tickFn = tickGenerator(scale, settings);

      const ticks = tickFn.transformTicks(qTicks);

      expect(ticks[0]).to.deep.equal({
        value: 1, position: 0.5, start: 0, end: 0.5, label: 'Day 1', isMinor: false
      });

      expect(ticks[1]).to.deep.equal({
        value: 2, position: 1, start: 0.5, end: 1, label: 'Day 2', isMinor: false
      });
    });
  });

  describe('createTicks', () => {
    it('should format with hh:mm:ss given any date tick seconds value > 0', () => {
      const qTime = 34206;
      scale.domain([qTime, qTime + (1 / 24 / 60)]); // 1 minute time span
      tickFn = tickGenerator(scale, settings);

      const ticks = tickFn.createTicks(120);

      expect(ticks[0].label).to.equal('00:00:00');
    });

    it('should format with hh:mm given all date ticks have seconds value of 0', () => {
      const qTime = 34206;
      scale.domain([qTime, qTime + ((1 / 24 / 60) * 5)]); // 5 minute time span
      tickFn = tickGenerator(scale, settings);

      const ticks = tickFn.createTicks(180);

      expect(ticks[0].label).to.equal('00:00');
    });

    it.skip('should generate ticks even when no distance argument is passed', () => {
      tickFn = tickGenerator(scale, settings);

      const ticks = tickFn.createTicks();

      expect(ticks).to.be.of.length(9);
    });

    it.skip('should generate appropriate amount of ticks based on distance', () => {
      tickFn = tickGenerator(scale, settings);

      let ticks = tickFn.createTicks(120);

      expect(ticks).to.be.of.length(3);

      ticks = tickFn.createTicks(360);
      expect(ticks).to.be.of.length(9);
    });

    it.skip('should output ticks in picasso format', () => {
      tickFn = tickGenerator(scale, settings);

      const ticks = tickFn.createTicks(120);

      expect(ticks[1]).to.deep.include({
        position: 0.5,
        start: 0.5,
        end: 1,
        label: '12:00',
        isMinor: false
      });
    });
  });
});
