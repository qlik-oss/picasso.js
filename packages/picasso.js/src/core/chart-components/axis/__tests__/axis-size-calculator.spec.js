import extend from 'extend';
import calcRequiredSize from '../axis-size-calculator';
import { DEFAULT_CONTINUOUS_SETTINGS } from '../axis-default-settings';

describe('Axis size calculator', () => {
  let settings;
  let ticks;
  let sizeFn;
  let rect;
  let scale;
  let isDiscrete;
  let state;

  beforeEach(() => {
    settings = extend(true, {}, DEFAULT_CONTINUOUS_SETTINGS);
    settings.labels.show = false;
    settings.labels.mode = 'horizontal';
    settings.line.show = false;
    settings.ticks.show = false;
    settings.paddingStart = 0;
    settings.paddingEnd = 10;

    state = {
      labels: {
        activeMode: 'horizontal'
      }
    };

    const bandwidth = (i, len) => 1 / len;
    const start = (i, bw) => i * bw;
    const pos = (s, bw) => s + (bw / 2);
    const end = (s, bw) => s + bw;
    ticks = ['AA', 'BB', 'CC'].map((label, i, ary) => {
      const bw = bandwidth(i, ary.length);
      const s = start(i, bw);
      return {
        label,
        start: s,
        position: pos(s, bw),
        end: end(s, bw)
      };
    });
    scale = {};
    scale.ticks = sinon.stub().returns(ticks);
    scale.bandwidth = sinon.stub().returns(1 / ticks.length);
    isDiscrete = false;
    rect = {
      x: 0, y: 0, height: 100, width: 100
    };
    const data = null;
    const formatter = null;
    const measureText = ({ text = '' }) => ({ width: text.toString().length, height: 5 });
    sizeFn = (r) => calcRequiredSize({
      settings, rect: r, scale, data, formatter, measureText, isDiscrete, state
    });
  });

  it('axis with no visible component have a margin of 10', () => {
    const size = sizeFn(rect);
    expect(size.size).to.equals(10);
  });

  it('the size of a vertical axis depend on text length', () => {
    settings.dock = 'left';
    settings.align = 'left';
    settings.labels.show = true;
    let size = sizeFn(rect);
    expect(size.size).to.equals(16 /* = 10(margin) + 4(label padding) + 2(text size) */);

    ticks[0].label = 'AAAAAA';
    size = sizeFn(rect);
    expect(size.size).to.equals(20 /* = 10(margin) + 4(label padding) + 6(text size) */);
  });

  it('the size of a vertical axis should depend on maxGlyhpCount if set', () => {
    settings.dock = 'left';
    settings.align = 'left';
    settings.labels.show = true;
    settings.labels.maxGlyphCount = 3;
    let size = sizeFn(rect);
    expect(size.size).to.equals(17 /* = 10(margin) + 4(label padding) + 3(text size) */);

    ticks[0].label = 'AAAAAA';
    size = sizeFn(rect);
    expect(size.size).to.equals(17 /* = 10(margin) + 4(label padding) + 3(text size) */);
  });

  it("the size of a horizontal axis don't depend on text length", () => {
    settings.dock = 'bottom';
    settings.align = 'bottom';
    settings.labels.show = true;
    let size = sizeFn(rect);
    expect(size.size).to.equals(19);

    ticks[0].label = 'AAAAAA';
    size = sizeFn(rect);
    expect(size.size).to.equals(19);
  });

  describe('hide', () => {
    beforeEach(() => {
      settings.dock = 'bottom';
      settings.align = 'bottom';
      settings.labels.show = true;
      settings.labels.filterOverlapping = false;
    });

    it('horizontal discrete axis should be considered to large when labels requires more size then available', () => {
      rect.width = 5;
      isDiscrete = true;
      // available bandWidth is ~1.7, required width from labels is 2
      const size = sizeFn(rect);

      expect(size.size).to.equals(100); // return the width of the container (rect in this test)
    });

    it('horizontal tilted discrete axis should be considered to large when labels requires more size then available', () => {
      settings.labels.tiltAngle = 45;
      settings.labels.maxEdgeBleed = Infinity;
      state.labels.activeMode = 'tilted';
      rect.width = 25;
      isDiscrete = true;
      const size = sizeFn(rect);

      expect(size.size).to.equals(100); // return the width of the container (rect in this test)
    });

    it('horizontal tilted discrete axis should be considered to large if angle is set to zero', () => {
      settings.labels.tiltAngle = 0;
      state.labels.activeMode = 'tilted';
      rect.width = 100;
      isDiscrete = true;

      const size = sizeFn(rect);

      expect(size.size).to.equals(100); // return the width of the container (rect in this test)
    });

    it('horizontal tilted discrete axis should not be considered to large if there is only one tick', () => {
      ticks.splice(1);
      settings.labels.tiltAngle = 45;
      state.labels.activeMode = 'tilted';
      rect.width = 2; // would be considered to large if there were two ticks
      isDiscrete = true;

      const size = sizeFn(rect);

      expect(size.size).to.not.equal(100);
    });
  });

  describe('label mode', () => {
    describe('auto', () => {
      it('should switch to tilted orientation if horizontal size limit is reached', () => {
        settings.dock = 'bottom';
        settings.align = 'bottom';
        settings.labels.show = true;
        settings.labels.mode = 'auto';
        rect.width = 5;
        state.labels.activeMode = 'horizontal';
        isDiscrete = true;

        sizeFn(rect);

        expect(state.labels.activeMode).to.equals('tilted');
      });

      it('should switch to tilted orientation if tiltThreshold is set to 1', () => {
        settings.dock = 'bottom';
        settings.align = 'bottom';
        settings.labels.show = true;
        settings.labels.mode = 'auto';
        rect.width = 5;
        state.labels.activeMode = 'horizontal';
        settings.labels.tiltThreshold = 1;
        isDiscrete = true;

        sizeFn(rect);

        expect(state.labels.activeMode).to.equals('tilted');
      });

      it('should if set use maxGlyphCount to determine if horizontal size limit is reached', () => {
        settings.dock = 'bottom';
        settings.align = 'bottom';
        settings.labels.show = true;
        settings.labels.mode = 'auto';
        settings.labels.maxGlyphCount = 200;
        rect.width = 150;
        state.labels.activeMode = 'horizontal';
        isDiscrete = true;

        sizeFn(rect);

        expect(state.labels.activeMode).to.equals('tilted');
      });
    });

    describe('horizontal', () => {
      it('should handle when there are no ticks', () => {
        isDiscrete = true;
        settings.dock = 'left';
        settings.align = 'left';
        settings.labels.show = true;
        state.labels.activeMode = 'horizontal';
        scale.ticks = sinon.stub().returns([]);
        const size = sizeFn(rect);
        expect(size.size).to.equal(14); // Return the size of padding, ticks, margin but not the label size
      });
    });

    describe('layered', () => {
      it('should return correct size when docked at bottom', () => {
        settings.dock = 'bottom';
        settings.align = 'bottom';
        settings.labels.show = true;
        state.labels.activeMode = 'layered';
        const size = sizeFn(rect);
        expect(size.size).to.equals(28);
      });
    });

    describe('tilted', () => {
      beforeEach(() => {
        settings.labels.maxEdgeBleed = Infinity;
        settings.labels.tiltAngle = 45;
        settings.dock = 'bottom';
        settings.align = 'bottom';
        settings.labels.show = true;
        state.labels.activeMode = 'tilted';
        isDiscrete = true;
      });

      it('should return correct size when docked at bottom', () => {
        const size = sizeFn(rect);
        expect(size.size).to.approximately(18.9497, 0.0001);
      });

      it('should handle when there are no ticks', () => {
        scale.ticks = sinon.stub().returns([]);
        const size = sizeFn(rect);
        expect(size.size).to.equal(14); // Return the size of padding, ticks, margin but not the label size
        expect(size.edgeBleed).to.deep.equal({
          left: 10, top: 0, right: 0, bottom: 0
        }); // left is paddingEnd
      });

      it('maxLengthPx', () => {
        settings.labels.maxLengthPx = 5;
        ticks[0].label = 'AAAAAAAAAAAAAA';
        const size = sizeFn(rect);
        expect(size.size).to.approximately(21.07106, 0.0001);
      });

      it('minLengthPx', () => {
        settings.labels.minLengthPx = 75;
        ticks[0].label = 'A';
        const size = sizeFn(rect);
        expect(size.size).to.approximately(70.568542, 0.0001);
      });

      it('require edgeBleed', () => {
        ticks[0] = { label: 'AAAAAAAAAAAAAA', position: 0.1 };
        ticks[1] = { label: 'BBBBBBBBBBBBBB', position: 0.5 };
        ticks[2] = { label: 'CCCCCCCCCCCCCC', position: 0.9 };
        const size = sizeFn(rect);
        expect(size.edgeBleed.left).to.approximately(14.89949, 0.0001);
      });

      it('maxEdgeBleed', () => {
        settings.labels.maxEdgeBleed = 1;
        ticks[0] = { label: 'AAAAAAAAAAAAAA', position: 0.1 };
        ticks[1] = { label: 'BBBBBBBBBBBBBB', position: 0.5 };
        ticks[2] = { label: 'CCCCCCCCCCCCCC', position: 0.9 };
        const size = sizeFn(rect);
        expect(size.edgeBleed.left).to.equals(11); // maxEdgeBleed + paddingEnd
      });
    });
  });

  describe('ticks and line', () => {
    it('measure ticks', () => {
      settings.ticks.show = true;
      settings.ticks.margin = 4;
      settings.ticks.tickSize = 7;
      const size = sizeFn(rect);
      expect(size.size).to.equals(21);
    });

    it('measure minorTicks', () => {
      settings.minorTicks.show = true;
      settings.minorTicks.margin = 2;
      settings.minorTicks.tickSize = 9;
      const size = sizeFn(rect);
      expect(size.size).to.equals(21);
    });

    it('measure line', () => {
      settings.line.show = true;
      settings.line.strokeWidth = 5;
      const size = sizeFn(rect);
      expect(size.size).to.equals(15);
    });

    it('minor and major ticks', () => {
      settings.ticks.show = true;
      settings.ticks.margin = 4;
      settings.ticks.tickSize = 7;

      settings.minorTicks.show = true;
      settings.minorTicks.margin = 0;
      settings.minorTicks.tickSize = 2;

      const size = sizeFn(rect);
      expect(size.size).to.equals(21);
    });
  });
});
