import dockLayout from '../docker';
import createRect from '../create-rect';

describe('Dock Layout', () => {
  const componentMock = function componentMock({
    dock = '',
    displayOrder = 0,
    prioOrder = 0,
    edgeBleed = {},
    minimumLayoutMode,
    size = 0,
    show = true,
    key
  } = {}) {
    const dummy = {};

    dummy.settings = {
      key,
      show,
      layout: {
        dock,
        displayOrder,
        prioOrder,
        minimumLayoutMode
      }
    };

    dummy.preferredSize = () => ({ width: size, height: size, edgeBleed });

    let outerRect = createRect();
    let innerRect = createRect();
    dummy.resize = function resize(...args) {
      [innerRect, outerRect] = args;
    };

    Object.defineProperties(dummy, {
      rect: {
        get: () => innerRect
      },
      outer: {
        get: () => outerRect
      }
    });

    return dummy;
  };

  describe('Layout', () => {
    let rect;
    let dl;

    beforeEach(() => {
      rect = createRect(0, 0, 1000, 1000);
      dl = dockLayout();
    });

    it('should handle empty components array in layout call', () => {
      const { visible, hidden } = dl.layout(rect);
      expect(visible).to.be.an('array').that.is.empty;
      expect(hidden).to.be.an('array').that.is.empty;
    });

    it('should throw exception if rect is invalid', () => {
      const fn = () => {
        dl.layout(null, [componentMock()]);
      };
      expect(fn).to.throw('Invalid rect');
    });

    it('should set correct component rects', () => {
      const components = [
        componentMock({ dock: 'left', size: 50 }),
        componentMock({ dock: 'right', size: 100 }),
        componentMock(),
        componentMock({ dock: 'top', size: 150 }),
        componentMock({ dock: 'bottom', size: 200 })
      ];

      dl.layout(rect, components);

      // outer rects
      expect(components[0].outer, 'Left outerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 50,
        height: 1000
      });
      expect(components[1].outer, 'Right outerRect had incorrect calculated size').to.deep.include({
        x: 900,
        y: 0,
        width: 100,
        height: 1000
      });
      expect(components[2].outer, 'Main outerRect had incorrect calculated size').to.deep.include({
        x: 50,
        y: 150,
        width: 850,
        height: 650
      });
      expect(components[3].outer, 'Top outerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 1000,
        height: 150
      });
      expect(components[4].outer, 'Bottom outerRect had incorrect calculated size').to.deep.include(
        {
          x: 0,
          y: 800,
          width: 1000,
          height: 200
        }
      );

      // main rects
      expect(components[0].rect, 'Left rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 150,
        width: 50,
        height: 650
      });
      expect(components[1].rect, 'Right rect had incorrect calculated size').to.deep.include({
        x: 900,
        y: 150,
        width: 100,
        height: 650
      });
      expect(components[2].rect, 'Main rect had incorrect calculated size').to.deep.include({
        x: 50,
        y: 150,
        width: 850,
        height: 650
      });
      expect(components[3].rect, 'Top rect had incorrect calculated size').to.deep.include({
        x: 50,
        y: 0,
        width: 850,
        height: 150
      });
      expect(components[4].rect, 'Bottom rect had incorrect calculated size').to.deep.include({
        x: 50,
        y: 800,
        width: 850,
        height: 200
      });
    });

    it('should allow multiple components to dock on same side', () => {
      const components = [
        componentMock({ dock: 'left', size: 50 }),
        componentMock({ dock: 'left', size: 100 }),
        componentMock({ dock: 'left', size: 150 }),
        componentMock()
      ];

      dl.layout(rect, components);

      expect(
        components[0].rect,
        'first component rect had incorrect calculated size'
      ).to.deep.include({
        x: 250,
        y: 0,
        width: 50,
        height: 1000
      });
      expect(
        components[1].rect,
        'second component rect had incorrect calculated size'
      ).to.deep.include({
        x: 150,
        y: 0,
        width: 100,
        height: 1000
      });
      expect(
        components[2].rect,
        'third component rect had incorrect calculated size'
      ).to.deep.include({
        x: 0,
        y: 0,
        width: 150,
        height: 1000
      });
      expect(components[3].rect, 'Main innerRect had incorrect calculated size').to.deep.include({
        x: 300,
        y: 0,
        width: 700,
        height: 1000
      });
    });

    it('should throw an expection if needed properties are missing', () => {
      const mainComp = {};
      const leftComp = { settings: { layout: { dock: 'left' } } };
      const rightComp = { settings: { layout: { dock: 'right' } }, resize: {} };
      const asfdComp = { settings: { layout: { dock: 'right' } }, resize: () => {} };
      const fn = () => {
        dl.layout(rect, [mainComp]);
      };
      const fn2 = () => {
        dl.layout(rect, [leftComp]);
      };
      const fn3 = () => {
        dl.layout(rect, [rightComp]);
      };
      const fn4 = () => {
        dl.layout(rect, [asfdComp]);
      };
      expect(fn).to.throw('Invalid component settings');
      expect(fn2).to.throw('Component is missing resize function');
      expect(fn3).to.throw('Component is missing resize function');
      expect(fn4).to.throw('Component is missing preferredSize function');
    });

    it("should remove components that don't fit", () => {
      const leftComp = componentMock({ dock: 'left', size: 300 });
      const leftComp2 = componentMock({ dock: 'left', size: 300 });
      const leftComp3 = componentMock({ dock: 'left', size: 300 });
      const mainComp = componentMock();
      const components = [leftComp, leftComp2, leftComp3, mainComp];

      dl.layout(rect, components);

      expect(leftComp.rect, 'leftComp rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 300,
        height: 1000
      });
      expect(leftComp2.rect, 'leftComp2 rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      });
      expect(leftComp3.rect, 'leftComp3 rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      });
      expect(mainComp.rect, 'Main rect had incorrect calculated size').to.deep.include({
        x: 300,
        y: 0,
        width: 700,
        height: 1000
      });
    });

    it('should remove component that is docked at another component which does not fit', () => {
      const leftComp = componentMock({ dock: 'left', size: 300 });
      const leftComp2 = componentMock({
        dock: 'left',
        size: 300,
        key: 'notFit'
      });
      const leftComp3 = componentMock({ dock: '@notFit', size: 100 });
      const mainComp = componentMock();

      const components = [leftComp, leftComp2, leftComp3, mainComp];

      dl.layout(rect, components);

      expect(leftComp.rect, 'leftComp rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 300,
        height: 1000
      });
      expect(leftComp2.rect, 'leftComp2 rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      });
      expect(leftComp3.rect, 'leftComp3 rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      });
      expect(mainComp.rect, 'Main rect had incorrect calculated size').to.deep.include({
        x: 300,
        y: 0,
        width: 700,
        height: 1000
      });
    });

    it('should keep component because one of the referenced components are shown', () => {
      const leftComp = componentMock({
        dock: 'left',
        size: 300,
        key: 'fit'
      });
      const leftComp2 = componentMock({
        dock: 'left',
        size: 300,
        key: 'notFit'
      });
      const leftComp3 = componentMock({ dock: '@fit, @notFit', size: 300 });
      const mainComp = componentMock();
      const components = [leftComp, leftComp2, leftComp3, mainComp];

      dl.layout(rect, components);

      expect(leftComp.rect, 'leftComp innerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 300,
        height: 1000
      });
      expect(leftComp2.rect, 'leftComp2 innerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      });
      expect(leftComp3.rect, 'leftComp3 innerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 300,
        height: 1000
      });
      expect(mainComp.rect, 'Main innerRect had incorrect calculated size').to.deep.include({
        x: 300,
        y: 0,
        width: 700,
        height: 1000
      });
    });
  });

  describe('Layout', () => {
    let rect;
    let dl;

    beforeEach(() => {
      rect = createRect(500, 500, 1000, 1000);
      dl = dockLayout();
    });

    it('should set correct component rects when container rect is not starting in origin', () => {
      const components = [
        componentMock({ dock: 'left', size: 50 }),
        componentMock({ dock: 'right', size: 100 }),
        componentMock(),
        componentMock({ dock: 'top', size: 150 }),
        componentMock({ dock: 'bottom', size: 200 })
      ];

      dl.layout(rect, components);

      // outer rects
      expect(components[0].outer, 'Left outerRect had incorrect calculated size').to.deep.include({
        x: 500,
        y: 500,
        width: 50,
        height: 1000
      });
      expect(components[1].outer, 'Right outerRect had incorrect calculated size').to.deep.include({
        x: 1400,
        y: 500,
        width: 100,
        height: 1000
      });
      expect(components[2].outer, 'Main outerRect had incorrect calculated size').to.deep.include({
        x: 550,
        y: 650,
        width: 850,
        height: 650
      });
      expect(components[3].outer, 'Top outerRect had incorrect calculated size').to.deep.include({
        x: 500,
        y: 500,
        width: 1000,
        height: 150
      });
      expect(components[4].outer, 'Bottom outerRect had incorrect calculated size').to.deep.include(
        {
          x: 500,
          y: 1300,
          width: 1000,
          height: 200
        }
      );

      // main rects
      expect(components[0].rect, 'Left rect had incorrect calculated size').to.deep.include({
        x: 500,
        y: 650,
        width: 50,
        height: 650
      });
      expect(components[1].rect, 'Right rect had incorrect calculated size').to.deep.include({
        x: 1400,
        y: 650,
        width: 100,
        height: 650
      });
      expect(components[2].rect, 'Main rect had incorrect calculated size').to.deep.include({
        x: 550,
        y: 650,
        width: 850,
        height: 650
      });
      expect(components[3].rect, 'Top rect had incorrect calculated size').to.deep.include({
        x: 550,
        y: 500,
        width: 850,
        height: 150
      });
      expect(components[4].rect, 'Bottom rect had incorrect calculated size').to.deep.include({
        x: 550,
        y: 1300,
        width: 850,
        height: 200
      });
    });
  });

  describe('Settings', () => {
    let settings;
    let container;
    let dl;

    beforeEach(() => {
      settings = {
        logicalSize: {
          x: 0,
          y: 0,
          width: 500,
          height: 400,
          preserveAspectRatio: false
        }
      };

      container = createRect(0, 0, 1000, 1200);

      dl = dockLayout();
    });

    it('should generate layout from a logical size setting', () => {
      const mainComp = componentMock();

      dl.settings(settings);
      dl.layout(container, [mainComp]);
      expect(mainComp.rect.scaleRatio, 'Main innerRect had incorrect ratio').to.deep.equal({
        x: 2,
        y: 3
      });
      expect(mainComp.outer.scaleRatio, 'Main outerRect had incorrect ratio').to.deep.equal({
        x: 2,
        y: 3
      });
    });

    it('should generate layout from a logical size setting with preserved aspect ratio', () => {
      settings.logicalSize.preserveAspectRatio = true;
      const mainComp = componentMock();
      dl.settings(settings);
      dl.layout(container, [mainComp]);
      // Preserve the smallest ratio
      expect(mainComp.rect.scaleRatio, 'innerRect had incorrect ratio').to.deep.equal({
        x: 2,
        y: 2
      });
      expect(mainComp.outer.scaleRatio, 'outerRect had incorrect ratio').to.deep.equal({
        x: 2,
        y: 2
      });
    });

    it('should ignore size and logicalSize NaN values and fallback to default size value', () => {
      settings = {
        logicalSize: {
          width: undefined,
          height: '10 bananas'
        }
      };
      const mainComp = componentMock();
      dl.settings(settings);
      dl.layout(container, [mainComp]);

      expect(mainComp.rect, 'ContainerRect had incorrect size').to.deep.include({
        x: 0,
        y: 0,
        width: 1000,
        height: 1200
      });
    });

    it('should use minWidthRatio', () => {
      settings = {
        center: {
          minWidthRatio: 1
        }
      };

      const leftComp = componentMock({ dock: 'left', size: 100 });
      const bottomComp = componentMock({ dock: 'bottom', size: 360 });
      const mainComp = componentMock();

      dl.settings(settings);

      const { visible, hidden } = dl.layout(container, [mainComp, leftComp, bottomComp]);

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

      const leftComp = componentMock({ dock: 'left', size: 100 });
      const bottomComp = componentMock({ dock: 'bottom', size: 360 });
      const mainComp = componentMock();

      dl.settings(settings);

      const { visible, hidden } = dl.layout(container, [mainComp, leftComp, bottomComp]);

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

      const leftComp = componentMock({ dock: 'left', size: 900 });
      const bottomComp = componentMock({ dock: 'bottom', size: 1080 });
      const mainComp = componentMock();
      dl.settings(settings);

      const { visible } = dl.layout(container, [mainComp, leftComp, bottomComp]);

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

      const leftComp = componentMock({ dock: 'left', size: 100 });
      const bottomComp = componentMock({ dock: 'bottom', size: 120 });
      const mainComp = componentMock();

      dl.settings(settings);

      const { visible, hidden } = dl.layout(container, [mainComp, leftComp, bottomComp]);

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

      const leftComp = componentMock({ dock: 'left', size: 100 });
      const bottomComp = componentMock({ dock: 'bottom', size: 360 });
      const mainComp = componentMock();
      dl.settings(settings);

      const { visible, hidden } = dl.layout(container, [mainComp, leftComp, bottomComp]);

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

      const leftComp = componentMock({ dock: 'left', size: 100 });
      const bottomComp = componentMock({ dock: 'bottom', size: 360 });
      const mainComp = componentMock();

      dl.settings(settings);

      const { visible, hidden } = dl.layout(container, [mainComp, leftComp, bottomComp]);

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

      const leftComp = componentMock({ dock: 'left', size: 100 });
      const bottomComp = componentMock({ dock: 'bottom', size: 120 });
      const mainComp = componentMock();

      dl.settings(settings);

      const { visible, hidden } = dl.layout(container, [mainComp, leftComp, bottomComp]);

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

      const leftComp = componentMock({ dock: 'left', size: 100 });
      const bottomComp = componentMock({ dock: 'bottom', size: 120 });
      const mainComp = componentMock();

      dl.settings(settings);

      const { visible } = dl.layout(container, [mainComp, leftComp, bottomComp]);

      // Expect it to behave as if required with/height is equal default value
      expect(visible).to.include(mainComp);
      expect(visible).to.include(bottomComp);
      expect(visible).to.include(leftComp);
    });
  });

  describe('minimumLayoutMode', () => {
    let dl;
    let rect;
    beforeEach(() => {
      dl = dockLayout();
      rect = createRect(0, 0, 1000, 1000);
    });

    it('normal visible', () => {
      const mainComp = componentMock({ minimumLayoutMode: 'L' });
      const settings = {
        layoutModes: {
          L: { width: 500, height: 500 }
        }
      };

      dl.settings(settings);
      dl.layout(rect, [mainComp]);

      expect(mainComp.rect, 'Main rect had incorrect size').to.deep.include({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000
      });
    });
    it('normal to small', () => {
      const mainComp = componentMock({ minimumLayoutMode: 'L' });
      const settings = {
        layoutModes: {
          L: { width: 1100, height: 500 }
        }
      };
      dl.settings(settings);
      dl.layout(rect, [mainComp]);

      expect(mainComp.rect, 'Main rect had incorrect size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      });
    });
    it('complex visible', () => {
      const mainComp = componentMock({
        minimumLayoutMode: { width: 'S', height: 'L' }
      });
      const settings = {
        layoutModes: {
          S: { width: 100, height: 100 },
          L: { width: 1100, height: 500 }
        }
      };
      dl.settings(settings);
      dl.layout(rect, [mainComp]);

      expect(mainComp.rect, 'ContainerRect had incorrect size').to.deep.include({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000
      });
    });

    it('should use logicalSize when determining visiblity of components', () => {
      const container = createRect(0, 0, 1000, 2000);
      const settings = {
        layoutModes: {
          S: { width: 800, height: 100 }
        },
        logicalSize: {
          x: 0,
          y: 0,
          width: 799,
          height: 100
        }
      };

      const leftComp = componentMock({ dock: 'left', size: 100, minimumLayoutMode: { width: 'S', height: 'S' } });
      const mainComp = componentMock();

      dl.settings(settings);

      const { visible, hidden } = dl.layout(container, [mainComp, leftComp]);

      expect(visible).to.include(mainComp);
      expect(hidden).to.include(leftComp);
    });
  });

  describe('edgeBleed', () => {
    let rect;
    let dl;
    beforeEach(() => {
      rect = createRect(0, 0, 1000, 1000);
      dl = dockLayout();
    });
    it("should remove component when edgebleed doesn't fit", () => {
      const leftComp = componentMock({
        dock: 'left',
        size: 100,
        edgeBleed: { top: 700 }
      });
      const mainComp = componentMock();

      dl.layout(rect, [leftComp, mainComp]);

      expect(leftComp.rect, 'leftComp rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      });
      expect(mainComp.rect, 'Main rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000
      });
    });

    it('should remove component because other components edgebleed', () => {
      const leftComp = componentMock({
        dock: 'left',
        size: 100,
        edgeBleed: { top: 400 }
      });
      const bottomComp = componentMock({ dock: 'bottom', size: 300 });
      const mainComp = componentMock();

      dl.layout(rect, [leftComp, bottomComp, mainComp]);

      expect(leftComp.rect, 'leftComp innerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 400,
        width: 100,
        height: 600
      });
      expect(bottomComp.rect, 'bottomComp innerRect had incorrect calculated size').to.deep.include(
        {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      );
      expect(mainComp.rect, 'Main innerRect had incorrect calculated size').to.deep.include({
        x: 100,
        y: 400,
        width: 900,
        height: 600
      });
    });

    it('should overlap component and edgebleed on the same side', () => {
      const leftComp = componentMock({
        dock: 'left',
        size: 100,
        edgeBleed: { bottom: 400 }
      });
      const bottomComp = componentMock({ dock: 'bottom', size: 300 });
      const mainComp = componentMock();

      dl.layout(rect, [leftComp, bottomComp, mainComp]);

      expect(leftComp.rect, 'leftComp innerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 100,
        height: 600
      });
      expect(bottomComp.rect, 'bottomComp innerRect had incorrect calculated size').to.deep.include(
        {
          x: 100,
          y: 600,
          width: 900,
          height: 300
        }
      );
      expect(mainComp.rect, 'Main innerRect had incorrect calculated size').to.deep.include({
        x: 100,
        y: 0,
        width: 900,
        height: 600
      });
    });
  });

  describe('prioOrder', () => {
    it('should remove components with higher prioOrder given not enough space and they have the same orientation', () => {
      const leftComp = componentMock({ dock: 'left', size: 500, prioOrder: 1 }); // Remove
      const rightComp = componentMock({
        dock: 'right',
        size: 500,
        prioOrder: -1
      }); // Keep
      const topComp = componentMock({ dock: 'top', size: 150, prioOrder: 2 }); // Keep as only the vertical docked components are out of space
      const mainComp = componentMock();

      const rect = createRect(0, 0, 1000, 1000);
      const dl = dockLayout();

      const { visible, hidden } = dl.layout(rect, [leftComp, rightComp, mainComp, topComp]);

      expect(visible).to.include(rightComp);
      expect(visible).to.include(mainComp);
      expect(visible).to.include(topComp);
      expect(hidden).to.include(leftComp);
    });

    it('should not change the order in which components are displayed', () => {
      const leftComp = componentMock({ dock: 'left', size: 100, prioOrder: 1 }); // Keep and render first
      const rightComp = componentMock({
        dock: 'left',
        size: 100,
        prioOrder: -1
      }); // Keep and render last
      const mainComp = componentMock();

      const rect = createRect(0, 0, 1000, 1000);
      const dl = dockLayout();

      const { visible } = dl.layout(rect, [leftComp, rightComp, mainComp]);

      expect(visible[0]).to.equal(leftComp); // Prio 1
      expect(visible[1]).to.equal(rightComp); // Prio -1
      expect(visible[2]).to.equal(mainComp); // Prio 0
    });
  });

  describe('displayOrder', () => {
    it('should maintain order of visible components', () => {
      const mainComp = componentMock({ key: 'main' });
      const leftComp = componentMock({ displayOrder: 1, dock: 'left', key: 'y' });
      const onLeft = componentMock({ displayOrder: 0, dock: '@y', key: 'dockAtY' });
      const onMain = componentMock({ displayOrder: -1, dock: '@main', key: 'dockAtMain' });

      const rect = createRect(0, 0, 1000, 1000);
      const dl = dockLayout();

      const { visible, order } = dl.layout(rect, [mainComp, leftComp, onLeft, onMain]);

      expect(visible.map(v => v.settings.key)).to.eql(['main', 'y', 'dockAtY', 'dockAtMain']);
      expect(order).to.eql([1, 3, 2, 0]);
    });
  });
});
