import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import axisComponent from '../axis';
import linear from '../../../scales/linear';
import band from '../../../scales/band';

describe('Axis', () => {
  let config;
  let scale = {};
  let componentFixture;
  let opts;
  let chart;

  function verifyNumberOfNodes(type, expectedNbrOfNodes) {
    const nodes = componentFixture.getRenderOutput().filter((n) => n.type === type);

    expect(nodes.length, `Unexpected number of ${type} nodes`).to.equal(expectedNbrOfNodes);
  }

  beforeEach(() => {
    componentFixture = componentFactoryFixture();

    chart = componentFixture.mocks().chart;
    chart.scale.returns(scale);

    config = {
      scale: 'y',
      formatter: 'f',
      settings: {},
    };

    opts = {
      inner: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      outer: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    };
  });

  describe('Settings', () => {
    beforeEach(() => {
      scale = band();
      chart.scale.returns(scale);
    });

    describe('maxLengthPx', () => {
      // maxLengthPx should set the maxWidth value of a text node to it-self
      beforeEach(() => {
        scale = band();
        scale.domain(['AAAAAAAAAA', 'BBBBBBBBB']);
        chart.scale.returns(scale);
        config.settings.labels = {
          show: true,
          maxLengthPx: 10,
          mode: 'horizontal',
        };
      });

      it('should limit text nodes max width in horizontal mode and docked vertically', () => {
        config.dock = 'left';

        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);
        const textNodes = componentFixture.getRenderOutput().filter((n) => n.type === 'text');

        expect(textNodes[0].maxWidth).to.equal(10);
        expect(textNodes[1].maxWidth).to.equal(10);
      });

      it('should limit text nodes max width in horizontal mode and docked horizontally', () => {
        config.dock = 'bottom';

        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);
        const textNodes = componentFixture.getRenderOutput().filter((n) => n.type === 'text');

        expect(textNodes[0].maxWidth).to.equal(10);
        expect(textNodes[1].maxWidth).to.equal(10);
      });

      it('should limit text nodes max width in tilted mode', () => {
        config.dock = 'bottom';
        config.settings.labels.mode = 'tilted';

        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);
        const textNodes = componentFixture.getRenderOutput().filter((n) => n.type === 'text');

        expect(textNodes[0].maxWidth).to.equal(10);
        expect(textNodes[1].maxWidth).to.equal(10);
      });

      it('should limit text nodes max width in layered mode', () => {
        config.dock = 'bottom';
        config.settings.labels.mode = 'layered';

        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);
        const textNodes = componentFixture.getRenderOutput().filter((n) => n.type === 'text');

        expect(textNodes[0].maxWidth).to.equal(10);
        expect(textNodes[1].maxWidth).to.equal(10);
      });
    });

    describe('minLengthPx', () => {
      /* minLengthPx only really comes into effect when a label is shorten the minLength, we simulate this by
        generating short labels and configuring a "high" minimum length.
      */
      beforeEach(() => {
        scale = band();
        scale.domain(['A', 'B']);
        chart.scale.returns(scale);
        config.settings.labels = {
          show: true,
          minLengthPx: 100,
          mode: 'horizontal',
        };
      });

      it('should limit text nodes min width in horizontal mode and docked vertically', () => {
        config.dock = 'left';

        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);
        const textNodes = componentFixture.getRenderOutput().filter((n) => n.type === 'text');

        expect(textNodes[0].maxWidth).to.equal(100);
        expect(textNodes[1].maxWidth).to.equal(100);
      });

      it('should limit text nodes min width in horizontal mode and docked horizontally', () => {
        config.dock = 'bottom';

        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);
        const textNodes = componentFixture.getRenderOutput().filter((n) => n.type === 'text');

        expect(textNodes[0].maxWidth).to.equal(100);
        expect(textNodes[1].maxWidth).to.equal(100);
      });

      it('should limit text nodes min width in tilted mode', () => {
        config.dock = 'bottom';
        config.settings.labels.mode = 'tilted';
        config.settings.labels.minLengthPx = 100;
        opts.inner.width = 1000;
        opts.outer.width = 1000;

        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);
        const textNodes = componentFixture.getRenderOutput().filter((n) => n.type === 'text');

        expect(textNodes[0].maxWidth).to.approximately(127.83348, 0.0001);
        expect(textNodes[1].maxWidth).to.approximately(127.83348, 0.0001);
      });

      it('should limit text nodes min width in layered mode', () => {
        config.dock = 'bottom';
        config.settings.labels.mode = 'layered';

        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);
        const textNodes = componentFixture.getRenderOutput().filter((n) => n.type === 'text');

        expect(textNodes[0].maxWidth).to.equal(100);
        expect(textNodes[1].maxWidth).to.equal(100);
      });
    });

    describe('padding', () => {
      beforeEach(() => {
        scale = band();
        scale.domain(['A', 'B']);
        chart.scale.returns(scale);
        config.layout = { dock: 'center' };
        config.settings.align = 'left';
      });

      describe('paddingStart', () => {
        const DEFAULT_PADDING_START = 0;

        it('should equal padding given as number', () => {
          config.settings.align = 'left';
          config.settings.paddingStart = 11;
          componentFixture.simulateCreate(axisComponent, config);
          expect(componentFixture.instance().def.state.settings.paddingStart).to.equal(11);
        });

        it('should equal default padding as fallback', () => {
          config.settings.align = 'left';
          config.settings.paddingStart = undefined;
          componentFixture.simulateCreate(axisComponent, config);
          expect(componentFixture.instance().def.state.settings.paddingStart).to.equal(DEFAULT_PADDING_START);
        });

        it('should equal padding given as func', () => {
          config.settings.align = 'bottom';
          config.settings.paddingStart = () => 12;
          componentFixture.simulateCreate(axisComponent, config);
          expect(componentFixture.instance().def.state.settings.paddingStart).to.equal(12);
        });
      });

      describe('paddingEnd', () => {
        const DEFAULT_PADDING_END = 10;

        it('should equal padding given as number', () => {
          config.settings.align = 'left';
          config.settings.paddingEnd = 11;
          componentFixture.simulateCreate(axisComponent, config);
          expect(componentFixture.instance().def.state.settings.paddingEnd).to.equal(11);
        });

        it('should equal default padding as fallback', () => {
          config.settings.align = 'left';
          config.settings.paddingEnd = undefined;
          componentFixture.simulateCreate(axisComponent, config);
          expect(componentFixture.instance().def.state.settings.paddingEnd).to.equal(DEFAULT_PADDING_END);
        });

        it('should equal padding given as func', () => {
          config.settings.align = 'bottom';
          config.settings.paddingEnd = () => 12;
          componentFixture.simulateCreate(axisComponent, config);
          expect(componentFixture.instance().def.state.settings.paddingEnd).to.equal(12);
        });
      });
    });

    describe('Defaults', () => {
      ['left', 'right', 'top', 'bottom'].forEach((d) => {
        it(`should default align when docked at ${d}`, () => {
          config.dock = d;
          componentFixture.simulateCreate(axisComponent, config);

          expect(componentFixture.instance().def.state.settings.align).to.equal(d);
        });
      });
    });
  });

  describe('Lifecycle', () => {
    describe('Update', () => {
      it('should handle an update where scale type changes from discrete to continuous', () => {
        scale = band();
        scale.domain([0, 1, 2, 3, 4, 5]);
        chart.scale.returns(scale);
        config.settings.labels = { show: true };

        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);

        verifyNumberOfNodes('text', 6);

        chart.scale.returns(linear());
        componentFixture.simulateUpdate();
        verifyNumberOfNodes('text', 3);
      });

      it('should handle an update where scale type changes from continuous to discrete', () => {
        scale = linear();
        chart.scale.returns(scale);
        config.settings.labels = { show: true };

        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);

        verifyNumberOfNodes('text', 3);

        scale = band();
        scale.domain([0, 1, 2, 3, 4, 5]);
        chart.scale.returns(scale);
        componentFixture.simulateUpdate();
        verifyNumberOfNodes('text', 6);
      });
    });
  });

  describe('continuous', () => {
    beforeEach(() => {
      scale = linear();
      chart.scale.returns(scale);
    });

    ['left', 'right', 'top', 'bottom'].forEach((d) => {
      it(`should align to ${d}`, () => {
        config.settings.align = d;
        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);

        verifyNumberOfNodes('text', 3);
        verifyNumberOfNodes('line', 4);
      });
    });

    it('should not render labels when disabled', () => {
      config.settings.labels = { show: false };
      componentFixture.simulateCreate(axisComponent, config);
      componentFixture.simulateRender(opts);

      verifyNumberOfNodes('text', 0);
      verifyNumberOfNodes('line', 4);
    });

    it('should not render axis line when disabled', () => {
      config.settings.line = { show: false };
      componentFixture.simulateCreate(axisComponent, config);
      componentFixture.simulateRender(opts);

      verifyNumberOfNodes('text', 3);
      verifyNumberOfNodes('line', 3);
    });

    it('should not render ticks when disabled', () => {
      config.settings.ticks = { show: false };
      componentFixture.simulateCreate(axisComponent, config);
      componentFixture.simulateRender(opts);

      verifyNumberOfNodes('text', 3);
      verifyNumberOfNodes('line', 1);
    });
  });

  describe('discrete', () => {
    beforeEach(() => {
      scale = band();
      scale.domain([0, 1, 2]);
      scale.range([0, 1]);
      chart.scale.returns(scale);
    });

    ['left', 'right', 'top', 'bottom'].forEach((d) => {
      it(`should align to ${d}`, () => {
        config.settings.align = d;
        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);

        verifyNumberOfNodes('text', 3);
        verifyNumberOfNodes('line', 0);
      });
    });

    ['top', 'bottom'].forEach((d) => {
      it(`should support layered labels for ${d} aligned axis`, () => {
        config.settings.align = d;
        config.settings.labels = { mode: 'layered' };
        componentFixture.simulateCreate(axisComponent, config);
        componentFixture.simulateRender(opts);

        verifyNumberOfNodes('text', 3);
        verifyNumberOfNodes('line', 0);
      });
    });
  });
});
