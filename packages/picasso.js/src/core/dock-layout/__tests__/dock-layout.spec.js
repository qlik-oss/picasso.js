import dockLayout from '../dock-layout';
import dockConfig from '../dock-config';

describe('Dock Layout', () => {
  const componentMock = function componentMock({
    dock = '',
    size = 0,
    displayOrder = 0,
    prioOrder = 0,
    edgeBleed = {},
    minimumLayoutMode,
    show = true
  } = {}) {
    let outerRect = {
      x: 0, y: 0, width: 0, height: 0
    };
    let innerRect = {
      x: 0, y: 0, width: 0, height: 0
    };
    let containerRect = {
      x: 0, y: 0, width: 0, height: 0
    };

    const dummy = function dummy() {};

    dummy.dockConfig = () => dockConfig({
      dock,
      displayOrder,
      show,
      prioOrder,
      preferredSize: ({ outer }) => ({ size: outer.width * size, edgeBleed }),
      minimumLayoutMode
    });
    // dummy.dockConfig.computePreferredSize((inner, outer) => ());
    // dummy.dockConfig.minimumLayoutMode(minimumLayoutMode);

    dummy.resize = function resize(...args) {
      if (!args.length) {
        return { innerRect, outerRect, containerRect };
      }
      [innerRect, outerRect, containerRect] = args;
      return this;
    };

    return dummy;
  };

  it('should always return an inner, outer and a container rect', () => {
    const leftComp = componentMock({ dock: 'left', size: 0.05 });
    const rightComp = componentMock({ dock: 'right', size: 0.1 });
    const mainComp = componentMock();
    const topComp = componentMock({ dock: 'top', size: 0.15 });
    const bottomComp = componentMock({ dock: 'bottom', size: 0.2 });
    const rect = {
      x: 0, y: 0, width: 1000, height: 1000
    };
    const dl = dockLayout();
    dl.addComponent(leftComp);
    dl.addComponent(rightComp);
    dl.addComponent(mainComp);
    dl.addComponent(topComp);
    dl.addComponent(bottomComp);

    dl.layout(rect);

    expect(leftComp.resize().outerRect, 'Left outerRect had incorrect calculated size').to.deep.include({
      x: 0, y: 0, width: 50, height: 1000
    });
    expect(rightComp.resize().outerRect, 'Right outerRect had incorrect calculated size').to.deep.include({
      x: 900, y: 0, width: 100, height: 1000
    });
    expect(mainComp.resize().outerRect, 'Main outerRect had incorrect calculated size').to.deep.include({
      x: 50, y: 150, width: 850, height: 650
    });
    expect(topComp.resize().outerRect, 'Top outerRect had incorrect calculated size').to.deep.include({
      x: 0, y: 0, width: 1000, height: 150
    });
    expect(bottomComp.resize().outerRect, 'Bottom outerRect had incorrect calculated size').to.deep.include({
      x: 0, y: 800, width: 1000, height: 200
    });

    expect(leftComp.resize().innerRect, 'Left innerRect had incorrect calculated size').to.deep.include({
      x: 0, y: 150, width: 50, height: 650
    });
    expect(rightComp.resize().innerRect, 'Right innerRect had incorrect calculated size').to.deep.include({
      x: 900, y: 150, width: 100, height: 650
    });
    expect(mainComp.resize().innerRect, 'Main innerRect had incorrect calculated size').to.deep.include({
      x: 50, y: 150, width: 850, height: 650
    });
    expect(topComp.resize().innerRect, 'Top innerRect had incorrect calculated size').to.deep.include({
      x: 50, y: 0, width: 850, height: 150
    });
    expect(bottomComp.resize().innerRect, 'Bottom innerRect had incorrect calculated size').to.deep.include({
      x: 50, y: 800, width: 850, height: 200
    });

    expect(bottomComp.resize().containerRect, 'Incorrect size for container rect').to.deep.include(rect);
  });

  it('should allow multiple components to dock on same side', () => {
    const leftComp = componentMock({ dock: 'left', size: 0.05 });
    const leftComp2 = componentMock({ dock: 'left', size: 0.1 });
    const leftComp3 = componentMock({ dock: 'left', size: 0.15 });
    const mainComp = componentMock();
    const rect = {
      x: 0, y: 0, width: 1000, height: 1000
    };
    const dl = dockLayout();
    dl.addComponent(leftComp);
    dl.addComponent(leftComp2);
    dl.addComponent(leftComp3);
    dl.addComponent(mainComp);

    dl.layout(rect);

    expect(leftComp.resize().innerRect, 'leftComp innerRect had incorrect calculated size').to.deep.include({
      x: 250, y: 0, width: 50, height: 1000
    });
    expect(leftComp2.resize().innerRect, 'leftComp2 innerRect had incorrect calculated size').to.deep.include({
      x: 150, y: 0, width: 100, height: 1000
    });
    expect(leftComp3.resize().innerRect, 'leftComp3 innerRect had incorrect calculated size').to.deep.include({
      x: 0, y: 0, width: 150, height: 1000
    });
    expect(mainComp.resize().innerRect, 'Main innerRect had incorrect calculated size').to.deep.include({
      x: 300, y: 0, width: 700, height: 1000
    });
  });

  it('should thrown an expection if component doesnt implement needed properties', () => {
    const leftComp = { dock: 'left' };
    const mainComp = {};
    const dl = dockLayout();
    const fn = () => { dl.addComponent(leftComp); };
    const fn2 = () => { dl.addComponent(mainComp); };
    expect(fn).to.throw('Component is missing required function "resize"');
    expect(fn2).to.throw('Component is missing required function "resize"');
  });

  it("should remove components that don't fit", () => {
    const leftComp = componentMock({ dock: 'left', size: 0.30 });
    const leftComp2 = componentMock({ dock: 'left', size: 0.30 });
    const leftComp3 = componentMock({ dock: 'left', size: 0.30 });
    const mainComp = componentMock();
    const rect = {
      x: 0, y: 0, width: 1000, height: 1000
    };
    const dl = dockLayout();
    dl.addComponent(leftComp);
    dl.addComponent(leftComp2);
    dl.addComponent(leftComp3);
    dl.addComponent(mainComp);

    dl.layout(rect);

    expect(leftComp.resize().innerRect, 'leftComp innerRect had incorrect calculated size').to.deep.include({
      x: 0, y: 0, width: 300, height: 1000
    });
    expect(leftComp2.resize().innerRect, 'leftComp2 innerRect had incorrect calculated size').to.deep.include({
      x: 0, y: 0, width: 0, height: 0
    });
    expect(leftComp3.resize().innerRect, 'leftComp3 innerRect had incorrect calculated size').to.deep.include({
      x: 0, y: 0, width: 0, height: 0
    });
    expect(mainComp.resize().innerRect, 'Main innerRect had incorrect calculated size').to.deep.include({
      x: 300, y: 0, width: 700, height: 1000
    });
  });

  describe('Settings', () => {
    let settings;
    let container;

    beforeEach(() => {
      settings = {
        logicalSize: {
          x: 0, y: 0, width: 500, height: 400, preserveAspectRatio: false
        }
      };

      container = {
        x: 0, y: 0, width: 1000, height: 1200
      };
    });

    it('should generate layout from a logical size setting', () => {
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.settings(settings);
      dl.layout(container);
      const output = mainComp.resize();
      expect(output.innerRect.scaleRatio, 'Main innerRect had incorrect ratio').to.deep.equal({ x: 2, y: 3 });
      expect(output.outerRect.scaleRatio, 'Main outerRect had incorrect ratio').to.deep.equal({ x: 2, y: 3 });
      expect(output.containerRect.scaleRatio, 'Main containerRect had incorrect ratio').to.deep.equal({ x: 2, y: 3 });
    });

    it('should generate layout from a logical size setting with preserved aspect ratio', () => {
      settings.logicalSize.preserveAspectRatio = true;
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.settings(settings);
      dl.layout(container);
      const output = mainComp.resize();
      // Preserve the smallest ratio
      expect(output.innerRect.scaleRatio, 'innerRect had incorrect ratio').to.deep.equal({ x: 2, y: 2 });
      expect(output.outerRect.scaleRatio, 'outerRect had incorrect ratio').to.deep.equal({ x: 2, y: 2 });
      expect(output.containerRect.scaleRatio, 'containerRect had incorrect ratio').to.deep.equal({ x: 2, y: 2 });
    });

    it('should generate layout from a size setting', () => {
      settings = {
        size: {
          width: 100,
          height: 200
        }
      };
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.settings(settings);
      dl.layout(container);
      const output = mainComp.resize();

      expect(output.containerRect, 'ContainerRect had incorrect size').to.deep.include({
        x: 0, y: 0, width: 100, height: 200
      });
    });

    it('should ignore size and logicalSize NaN values and fallback to default size value', () => {
      settings = {
        logicalSize: {
          width: undefined,
          height: '10 bananas'
        },
        size: {
          width: undefined,
          height: 'two bananas'
        }
      };
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.settings(settings);
      dl.layout(container);
      const output = mainComp.resize();

      expect(output.containerRect, 'ContainerRect had incorrect size').to.deep.include({
        x: 0, y: 0, width: 1000, height: 1200
      });
    });

    it('should use minWidthRatio', () => {
      settings = {
        center: {
          minWidthRatio: 1
        }
      };

      const leftComp = componentMock({ dock: 'left', size: 0.10 });
      const bottomComp = componentMock({ dock: 'bottom', size: 0.30 });
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.addComponent(leftComp);
      dl.addComponent(bottomComp);
      dl.settings(settings);

      const { visible, hidden } = dl.layout(container);

      expect(visible).to.include(mainComp);
      expect(visible).to.include(bottomComp);
      expect(hidden).to.include(leftComp); // Because ratio 1, this component should be hidden
    });

    it('should use minHeightRatio', () => {
      settings = {
        center: {
          minHeightRatio: 1
        }
      };

      const leftComp = componentMock({ dock: 'left', size: 0.10 });
      const bottomComp = componentMock({ dock: 'bottom', size: 0.30 });
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.addComponent(leftComp);
      dl.addComponent(bottomComp);
      dl.settings(settings);

      const { visible, hidden } = dl.layout(container);

      expect(visible).to.include(mainComp);
      expect(hidden).to.include(bottomComp); // Because ratio 1, this component should be hidden
      expect(visible).to.include(leftComp);
    });

    it('should clamp min width/height ratios to min value of 0', () => {
      settings = {
        center: {
          minWidthRatio: -1,
          minHeightRatio: -1
        }
      };

      const leftComp = componentMock({ dock: 'left', size: 0.9 });
      const bottomComp = componentMock({ dock: 'bottom', size: 0.9 });
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.addComponent(leftComp);
      dl.addComponent(bottomComp);
      dl.settings(settings);

      const { visible } = dl.layout(container);

      // Expect it to behave as ratio is set to 0
      expect(visible).to.include(mainComp);
      expect(visible).to.include(bottomComp);
      expect(visible).to.include(leftComp);
    });

    it('should clamp min width/height ratios to max value of 1', () => {
      settings = {
        center: {
          minWidthRatio: 10,
          minHeightRatio: 10
        }
      };

      const leftComp = componentMock({ dock: 'left', size: 0.1 });
      const bottomComp = componentMock({ dock: 'bottom', size: 0.1 });
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.addComponent(leftComp);
      dl.addComponent(bottomComp);
      dl.settings(settings);

      const { visible, hidden } = dl.layout(container);

      // Expect it to behave as ratio is set to 1
      expect(visible).to.include(mainComp);
      expect(hidden).to.include(bottomComp);
      expect(hidden).to.include(leftComp);
    });

    it('should use minWidth and have predence on minWidthRatio', () => {
      settings = {
        center: {
          minWidthRatio: 0,
          minWidth: container.width
        }
      };

      const leftComp = componentMock({ dock: 'left', size: 0.10 });
      const bottomComp = componentMock({ dock: 'bottom', size: 0.30 });
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.addComponent(leftComp);
      dl.addComponent(bottomComp);
      dl.settings(settings);

      const { visible, hidden } = dl.layout(container);

      expect(visible).to.include(mainComp);
      expect(visible).to.include(bottomComp);
      expect(hidden).to.include(leftComp); // Because width === container width 1, this component should be hidden
    });

    it('should use minHeight and have predence on minHeightRatio', () => {
      settings = {
        center: {
          minHeightRatio: 0,
          minHeight: container.height
        }
      };

      const leftComp = componentMock({ dock: 'left', size: 0.10 });
      const bottomComp = componentMock({ dock: 'bottom', size: 0.30 });
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.addComponent(leftComp);
      dl.addComponent(bottomComp);
      dl.settings(settings);

      const { visible, hidden } = dl.layout(container);

      expect(visible).to.include(mainComp);
      expect(hidden).to.include(bottomComp); // Because height === container height 1, this component should be hidden
      expect(visible).to.include(leftComp);
    });

    it('should clamp min width/height to the logical size', () => {
      settings = {
        center: {
          minWidth: 333333,
          minHeight: 333333
        }
      };

      const leftComp = componentMock({ dock: 'left', size: 0.10 });
      const bottomComp = componentMock({ dock: 'bottom', size: 0.10 });
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.addComponent(leftComp);
      dl.addComponent(bottomComp);
      dl.settings(settings);

      const { visible, hidden } = dl.layout(container);

      // Expect it to behave as if required with/height is equal to the logical size
      expect(visible).to.include(mainComp);
      expect(hidden).to.include(bottomComp);
      expect(hidden).to.include(leftComp);
    });

    it('should ignore min width/height of less then or equal to 0', () => {
      settings = {
        center: {
          minWidth: 0,
          minHeight: -1
        }
      };

      const leftComp = componentMock({ dock: 'left', size: 0.10 });
      const bottomComp = componentMock({ dock: 'bottom', size: 0.10 });
      const mainComp = componentMock();
      const dl = dockLayout();
      dl.addComponent(mainComp);
      dl.addComponent(leftComp);
      dl.addComponent(bottomComp);
      dl.settings(settings);

      const { visible } = dl.layout(container);

      // Expect it to behave as if required with/height is equal default value
      expect(visible).to.include(mainComp);
      expect(visible).to.include(bottomComp);
      expect(visible).to.include(leftComp);
    });
  });

  describe('minimumLayoutMode', () => {
    it('normal visible', () => {
      const mainComp = componentMock({ minimumLayoutMode: 'L' });
      const rect = {
        x: 0, y: 0, width: 1000, height: 1000
      };
      const settings = {
        layoutModes: {
          L: { width: 500, height: 500 }
        }
      };
      const dl = dockLayout();

      dl.addComponent(mainComp);

      dl.settings(settings);
      dl.layout(rect);
      const output = mainComp.resize();

      expect(output.containerRect, 'ContainerRect had incorrect size').to.deep.include({
        x: 0, y: 0, width: 1000, height: 1000
      });
    });
    it('normal to small', () => {
      const mainComp = componentMock({ minimumLayoutMode: 'L' });
      const rect = {
        x: 0, y: 0, width: 1000, height: 1000
      };
      const settings = {
        layoutModes: {
          L: { width: 1100, height: 500 }
        }
      };
      const dl = dockLayout();

      dl.addComponent(mainComp);

      dl.settings(settings);
      dl.layout(rect);
      const output = mainComp.resize();

      expect(output.containerRect, 'ContainerRect had incorrect size').to.deep.include({
        x: 0, y: 0, width: 0, height: 0
      });
    });
    it('complex visible', () => {
      const mainComp = componentMock({ minimumLayoutMode: { width: 'S', height: 'L' } });
      const rect = {
        x: 0, y: 0, width: 1000, height: 1000
      };
      const settings = {
        layoutModes: {
          S: { width: 100, height: 100 },
          L: { width: 1100, height: 500 }
        }
      };
      const dl = dockLayout();

      dl.addComponent(mainComp);

      dl.settings(settings);
      dl.layout(rect);
      const output = mainComp.resize();

      expect(output.containerRect, 'ContainerRect had incorrect size').to.deep.include({
        x: 0, y: 0, width: 1000, height: 1000
      });
    });
  });

  describe('edgeBleed', () => {
    it("should remove component when edgebleed don't fit", () => {
      const leftComp = componentMock({ dock: 'left', size: 0.10, edgeBleed: { top: 700 } });
      const mainComp = componentMock();
      const rect = {
        x: 0, y: 0, width: 1000, height: 1000
      };
      const dl = dockLayout();
      dl.addComponent(leftComp);
      dl.addComponent(mainComp);

      dl.layout(rect);

      expect(leftComp.resize().innerRect, 'leftComp innerRect had incorrect calculated size').to.deep.include({
        x: 0, y: 0, width: 0, height: 0
      });
      expect(mainComp.resize().innerRect, 'Main innerRect had incorrect calculated size').to.deep.include({
        x: 0, y: 0, width: 1000, height: 1000
      });
    });

    it('should remove component because other components edgebleed', () => {
      const leftComp = componentMock({ dock: 'left', size: 0.10, edgeBleed: { top: 400 } });
      const bottomComp = componentMock({ dock: 'bottom', size: 0.30 });
      const mainComp = componentMock();
      const rect = {
        x: 0, y: 0, width: 1000, height: 1000
      };
      const dl = dockLayout();
      dl.addComponent(leftComp);
      dl.addComponent(bottomComp);
      dl.addComponent(mainComp);

      dl.layout(rect);

      expect(leftComp.resize().innerRect, 'leftComp innerRect had incorrect calculated size').to.deep.include({
        x: 0, y: 400, width: 100, height: 600
      });
      expect(bottomComp.resize().innerRect, 'bottomComp innerRect had incorrect calculated size').to.deep.include({
        x: 0, y: 0, width: 0, height: 0
      });
      expect(mainComp.resize().innerRect, 'Main innerRect had incorrect calculated size').to.deep.include({
        x: 100, y: 400, width: 900, height: 600
      });
    });

    it('should overlap component and edgebleed on the same side', () => {
      const leftComp = componentMock({ dock: 'left', size: 0.10, edgeBleed: { bottom: 400 } });
      const bottomComp = componentMock({ dock: 'bottom', size: 0.30 });
      const mainComp = componentMock();
      const rect = {
        x: 0, y: 0, width: 1000, height: 1000
      };
      const dl = dockLayout();
      dl.addComponent(leftComp);
      dl.addComponent(bottomComp);
      dl.addComponent(mainComp);

      dl.layout(rect);

      expect(leftComp.resize().innerRect, 'leftComp innerRect had incorrect calculated size').to.deep.include({
        x: 0, y: 0, width: 100, height: 600
      });
      expect(bottomComp.resize().innerRect, 'bottomComp innerRect had incorrect calculated size').to.deep.include({
        x: 100, y: 600, width: 900, height: 300
      });
      expect(mainComp.resize().innerRect, 'Main innerRect had incorrect calculated size').to.deep.include({
        x: 100, y: 0, width: 900, height: 600
      });
    });
  });

  describe('show', () => {
    it('should remove components with show set to false', () => {
      const leftComp = componentMock({ dock: 'left', size: 0.05, show: false });
      const rightComp = componentMock({ dock: 'right', size: 0.1 });
      const mainComp = componentMock();
      const topComp = componentMock({ dock: 'top', size: 0.15 });
      const bottomComp = componentMock({ dock: 'bottom', size: 0.2, show: false });
      const rect = {
        x: 0, y: 0, width: 1000, height: 1000
      };
      const dl = dockLayout();
      dl.addComponent(leftComp);
      dl.addComponent(rightComp);
      dl.addComponent(mainComp);
      dl.addComponent(topComp);
      dl.addComponent(bottomComp);

      const { visible, hidden } = dl.layout(rect);

      expect(visible).to.be.of.length(3);
      expect(hidden).to.be.of.length(2);
      expect(visible).to.include(rightComp);
      expect(visible).to.include(mainComp);
      expect(visible).to.include(topComp);
      expect(hidden).to.include(leftComp);
      expect(hidden).to.include(bottomComp);
    });
  });

  describe('prioOrder', () => {
    it('should remove components with higher prioOrder given not enough space and they have the same orientation', () => {
      const leftComp = componentMock({ dock: 'left', size: 0.5, prioOrder: 1 }); // Remove
      const rightComp = componentMock({ dock: 'right', size: 0.5, prioOrder: -1 }); // Keep
      const topComp = componentMock({ dock: 'top', size: 0.15, prioOrder: 2 }); // Keep as only the vertical docked components are out of space
      const mainComp = componentMock();

      const rect = {
        x: 0, y: 0, width: 1000, height: 1000
      };
      const dl = dockLayout();
      dl.addComponent(leftComp);
      dl.addComponent(rightComp);
      dl.addComponent(mainComp);
      dl.addComponent(topComp);

      const { visible, hidden } = dl.layout(rect);

      expect(visible).to.include(rightComp);
      expect(visible).to.include(mainComp);
      expect(visible).to.include(topComp);
      expect(hidden).to.include(leftComp);
    });

    it('should not change the order in which components are displayed', () => {
      const leftComp = componentMock({ dock: 'left', size: 0.1, prioOrder: 1 }); // Keep and render first
      const rightComp = componentMock({ dock: 'left', size: 0.1, prioOrder: -1 }); // Keep and render last
      const mainComp = componentMock();

      const rect = {
        x: 0, y: 0, width: 1000, height: 1000
      };
      const dl = dockLayout();
      dl.addComponent(leftComp);
      dl.addComponent(rightComp);
      dl.addComponent(mainComp);

      const { visible } = dl.layout(rect);

      expect(visible[0]).to.equal(leftComp); // Prio 1
      expect(visible[1]).to.equal(rightComp); // Prio -1
      expect(visible[2]).to.equal(mainComp); // Prio 0
    });
  });
});
