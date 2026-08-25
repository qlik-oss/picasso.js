import getHorizontalWidth from '../get-continuous-label-rect';

describe('axis - get horizontal continuous label width', () => {
  let opts;
  let width;

  beforeEach(() => {
    opts = {
      major: [],
      innerRect: { x: 0, width: 100 },
      outerRect: { x: 0, width: 100 },
      tick: { position: 0 },
      layered: false,
      index: 0,
    };
  });

  describe('Case 1 - Less than 2 ticks', () => {
    it('should return inner rect width', () => {
      opts.major = [1];
      opts.outerRect.width = 200;
      width = getHorizontalWidth(opts);

      expect(width).to.eql(opts.innerRect.width);
    });
  });

  describe('Case 2 - Is first or last tick', () => {
    describe('first tick', () => {
      it('is positioned at 0', () => {
        const tick = { position: 0 };
        opts.major = [tick, { position: 0.3 }];
        opts.tick = tick;

        width = getHorizontalWidth(opts);

        expect(width).to.eql(48);
      });

      it('double distance to neighbouring tick is less than available edge bleed', () => {
        const tick = { position: 0.1 };
        opts.innerRect.x = 100; // 100 px edge bleed
        opts.major = [tick, { position: 0.3 }]; // 20 px between ticks
        opts.index = 0;
        opts.tick = tick;

        width = getHorizontalWidth(opts);

        expect(width).to.eql(16);
      });

      it('distance to neighbouring tick is greater than double available edge bleed', () => {
        const tick = { position: 0.01 };
        opts.innerRect.x = 1; // 1 px edge bleed
        opts.major = [tick, { position: 0.21 }]; // 20 px between ticks
        opts.index = 0;
        opts.tick = tick;

        width = getHorizontalWidth(opts);

        expect(width).to.eql(8);
      });

      it('double distance of edge bleed is greater than distance to neighbouring tick', () => {
        const tick = { position: 0.1 };
        opts.innerRect.x = 5; // 15 px edge bleed
        opts.major = [tick, { position: 0.5 }]; // 40 px between ticks
        opts.index = 0;
        opts.tick = tick;

        width = getHorizontalWidth(opts);

        expect(width).to.eql(30);
      });
    });

    describe('last tick', () => {
      it('is positioned at 1', () => {
        const tick = { position: 1 };
        opts.major = [{ position: 0.8 }, tick];
        opts.tick = tick;
        opts.index = 1;

        width = getHorizontalWidth(opts);

        expect(width).to.eql(48);
      });

      it('double distance to neighbouring tick is less than available edge bleed', () => {
        const tick = { position: 0.99 };
        opts.outerRect.width = 200; // 100 px edge bleed
        opts.major = [{ position: 0.79 }, tick]; // 20 px between ticks
        opts.index = 1;
        opts.tick = tick;

        width = getHorizontalWidth(opts);

        expect(width).to.be.closeTo(16, 0.1);
      });

      it('distance to neighbouring tick is greater than double available edge bleed', () => {
        const tick = { position: 0.99 };
        opts.outerRect.width = 101; // 1 px edge bleed
        opts.major = [{ position: 0.79 }, tick]; // 20 px between ticks
        opts.index = 1;
        opts.tick = tick;

        width = getHorizontalWidth(opts);

        expect(width).to.be.closeTo(8, 0.1);
      });

      it('double distance of edge bleed is greater than distance to neighbouring tick', () => {
        const tick = { position: 0.9 };
        opts.outerRect.width = 105; // 15 px edge bleed
        opts.major = [{ position: 0.5 }, tick]; // 40 px between ticks
        opts.index = 1;
        opts.tick = tick;

        width = getHorizontalWidth(opts);

        expect(width).to.eql(30);
      });
    });
  });

  describe('Case 3 - Default', () => {
    it('should return the shortest distance', () => {
      const tick = { position: 0.5 };
      opts.major = [{ position: 0.1 }, tick, { position: 0.7 }]; // 40 and 20 px between ticks
      opts.index = 1;
      opts.tick = tick;

      width = getHorizontalWidth(opts);

      expect(width).to.be.closeTo(16, 0.1);
    });
  });
});
