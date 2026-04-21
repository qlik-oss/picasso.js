import dockLayout from '../docker';
import createRect from '../create-rect';
import dockConfig from '../config';

describe('Dock Layout', () => {
  const componentMock = function componentMock({
    dock = '',
    displayOrder = 0,
    prioOrder = 0,
    edgeBleed = {},
    minimumLayoutMode,
    size = 0,
    key,
    overlap = false,
  } = {}) {
    const dummy = {};
    dummy.key = key;
    dummy.dockConfig = dockConfig({
      dock,
      displayOrder,
      prioOrder,
      minimumLayoutMode,
      overlap,
    });

    dummy.preferredSize = () => ({ width: size, height: size, edgeBleed });

    let outerRect = createRect();
    let innerRect = createRect();
    dummy.resize = function resize(...args) {
      [innerRect, outerRect] = args;
    };

    Object.defineProperties(dummy, {
      rect: {
        get: () => innerRect,
      },
      outer: {
        get: () => outerRect,
      },
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
        componentMock({ dock: 'bottom', size: 200 }),
      ];

      dl.layout(rect, components);

      // outer rects
      expect(components[0].outer, 'Left outerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 50,
        height: 1000,
      });
      expect(components[1].outer, 'Right outerRect had incorrect calculated size').to.deep.include({
        x: 900,
        y: 0,
        width: 100,
        height: 1000,
      });
      expect(components[2].outer, 'Main outerRect had incorrect calculated size').to.deep.include({
        x: 50,
        y: 150,
        width: 850,
        height: 650,
      });
      expect(components[3].outer, 'Top outerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 1000,
        height: 150,
      });
      expect(components[4].outer, 'Bottom outerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 800,
        width: 1000,
        height: 200,
      });

      // main rects
      expect(components[0].rect, 'Left rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 150,
        width: 50,
        height: 650,
      });
      expect(components[1].rect, 'Right rect had incorrect calculated size').to.deep.include({
        x: 900,
        y: 150,
        width: 100,
        height: 650,
      });
      expect(components[2].rect, 'Main rect had incorrect calculated size').to.deep.include({
        x: 50,
        y: 150,
        width: 850,
        height: 650,
      });
      expect(components[3].rect, 'Top rect had incorrect calculated size').to.deep.include({
        x: 50,
        y: 0,
        width: 850,
        height: 150,
      });
      expect(components[4].rect, 'Bottom rect had incorrect calculated size').to.deep.include({
        x: 50,
        y: 800,
        width: 850,
        height: 200,
      });
    });

    it('should allow multiple components to dock on same side', () => {
      const components = [
        componentMock({ dock: 'left', size: 50 }),
        componentMock({ dock: 'left', size: 100 }),
        componentMock({ dock: 'left', size: 150 }),
        componentMock(),
      ];

      dl.layout(rect, components);

      expect(components[0].rect, 'first component rect had incorrect calculated size').to.deep.include({
        x: 250,
        y: 0,
        width: 50,
        height: 1000,
      });
      expect(components[1].rect, 'second component rect had incorrect calculated size').to.deep.include({
        x: 150,
        y: 0,
        width: 100,
        height: 1000,
      });
      expect(components[2].rect, 'third component rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 150,
        height: 1000,
      });
      expect(components[3].rect, 'Main innerRect had incorrect calculated size').to.deep.include({
        x: 300,
        y: 0,
        width: 700,
        height: 1000,
      });
    });

    it('should throw an expection if needed properties are missing', () => {
      const leftComp = {};
      const rightComp = { resize: {} };
      const asfdComp = { resize: () => {} };
      const fn2 = () => {
        dl.layout(rect, [leftComp]);
      };
      const fn3 = () => {
        dl.layout(rect, [rightComp]);
      };
      const fn4 = () => {
        dl.layout(rect, [asfdComp]);
      };
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
        height: 1000,
      });
      expect(leftComp2.rect, 'leftComp2 rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
      expect(leftComp3.rect, 'leftComp3 rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
      expect(mainComp.rect, 'Main rect had incorrect calculated size').to.deep.include({
        x: 300,
        y: 0,
        width: 700,
        height: 1000,
      });
    });

    it('should remove component that is docked at another component which does not fit', () => {
      const leftComp = componentMock({ dock: 'left', size: 300 });
      const leftComp2 = componentMock({
        dock: 'left',
        size: 300,
        key: 'notFit',
      });
      const leftComp3 = componentMock({ dock: '@notFit', size: 100 });
      const mainComp = componentMock();

      const components = [leftComp, leftComp2, leftComp3, mainComp];

      dl.layout(rect, components);

      expect(leftComp.rect, 'leftComp rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 300,
        height: 1000,
      });
      expect(leftComp2.rect, 'leftComp2 rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
      expect(leftComp3.rect, 'leftComp3 rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
      expect(mainComp.rect, 'Main rect had incorrect calculated size').to.deep.include({
        x: 300,
        y: 0,
        width: 700,
        height: 1000,
      });
    });

    it('should keep component because one of the referenced components are shown', () => {
      const leftComp = componentMock({
        dock: 'left',
        size: 300,
        key: 'fit',
      });
      const leftComp2 = componentMock({
        dock: 'left',
        size: 300,
        key: 'notFit',
      });
      const leftComp3 = componentMock({ dock: '@fit, @notFit', size: 300 });
      const mainComp = componentMock();
      const components = [leftComp, leftComp2, leftComp3, mainComp];

      dl.layout(rect, components);

      expect(leftComp.rect, 'leftComp innerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 300,
        height: 1000,
      });
      expect(leftComp2.rect, 'leftComp2 innerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
      expect(leftComp3.rect, 'leftComp3 innerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 300,
        height: 1000,
      });
      expect(mainComp.rect, 'Main innerRect had incorrect calculated size').to.deep.include({
        x: 300,
        y: 0,
        width: 700,
        height: 1000,
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
        componentMock({ dock: 'bottom', size: 200 }),
      ];

      dl.layout(rect, components);

      // outer rects
      expect(components[0].outer, 'Left outerRect had incorrect calculated size').to.deep.include({
        x: 500,
        y: 500,
        width: 50,
        height: 1000,
      });
      expect(components[1].outer, 'Right outerRect had incorrect calculated size').to.deep.include({
        x: 1400,
        y: 500,
        width: 100,
        height: 1000,
      });
      expect(components[2].outer, 'Main outerRect had incorrect calculated size').to.deep.include({
        x: 550,
        y: 650,
        width: 850,
        height: 650,
      });
      expect(components[3].outer, 'Top outerRect had incorrect calculated size').to.deep.include({
        x: 500,
        y: 500,
        width: 1000,
        height: 150,
      });
      expect(components[4].outer, 'Bottom outerRect had incorrect calculated size').to.deep.include({
        x: 500,
        y: 1300,
        width: 1000,
        height: 200,
      });

      // main rects
      expect(components[0].rect, 'Left rect had incorrect calculated size').to.deep.include({
        x: 500,
        y: 650,
        width: 50,
        height: 650,
      });
      expect(components[1].rect, 'Right rect had incorrect calculated size').to.deep.include({
        x: 1400,
        y: 650,
        width: 100,
        height: 650,
      });
      expect(components[2].rect, 'Main rect had incorrect calculated size').to.deep.include({
        x: 550,
        y: 650,
        width: 850,
        height: 650,
      });
      expect(components[3].rect, 'Top rect had incorrect calculated size').to.deep.include({
        x: 550,
        y: 500,
        width: 850,
        height: 150,
      });
      expect(components[4].rect, 'Bottom rect had incorrect calculated size').to.deep.include({
        x: 550,
        y: 1300,
        width: 850,
        height: 200,
      });
    });
  });

  describe('Overlap', () => {
    let rect;
    let dl;

    beforeEach(() => {
      rect = createRect(0, 0, 1000, 1000);
      dl = dockLayout();
    });

    it('should position two overlap top components at the same anchor and reduce center by max height', () => {
      // compA: normal top, 30px — reduces center to y=30
      // compB: overlap top, 20px — max(30, 20)=30, center stays at y=30
      // compC: overlap top, 15px — max stays 20, center stays at y=30
      // all overlap bottoms align with compA's bottom (y=30)
      const compA = componentMock({ dock: 'top', size: 30 });
      const compB = componentMock({ dock: 'top', size: 20, overlap: true });
      const compC = componentMock({ dock: 'top', size: 15, overlap: true });
      const center = componentMock();

      dl.layout(rect, [compA, compB, compC, center]);

      // center: max(30, 20) = 30
      expect(center.rect, 'center rect incorrect').to.deep.include({ x: 0, y: 30, width: 1000, height: 970 });

      // compA: normal top, y=0, h=30, bottom=30
      expect(compA.rect, 'compA rect incorrect').to.deep.include({ x: 0, y: 0, width: 1000, height: 30 });

      // compB: overlap top, anchor=30, y=30-20=10, bottom=30 (same as compA)
      expect(compB.rect, 'compB rect incorrect').to.deep.include({ x: 0, y: 10, width: 1000, height: 20 });

      // compC: overlap top, anchor=30, y=30-15=15, bottom=30 (same as compA)
      expect(compC.rect, 'compC rect incorrect').to.deep.include({ x: 0, y: 15, width: 1000, height: 15 });
    });

    it('should position overlap bottom components at the same anchor and reduce center by max height', () => {
      const compA = componentMock({ dock: 'bottom', size: 40 });
      const compB = componentMock({ dock: 'bottom', size: 25, overlap: true });
      const compC = componentMock({ dock: 'bottom', size: 10, overlap: true });
      const center = componentMock();

      dl.layout(rect, [compA, compB, compC, center]);

      // center: max(1000-40=960, 1000-25=975) → bottom stays at 960, height=960
      expect(center.rect, 'center rect incorrect').to.deep.include({ x: 0, y: 0, width: 1000, height: 960 });

      // compA: normal bottom, y=960, h=40 (inner edge at y=960)
      expect(compA.rect, 'compA rect incorrect').to.deep.include({ x: 0, y: 960, width: 1000, height: 40 });

      // compB: overlap bottom, anchor=960, y=960, h=25 — inner edge aligns with compA
      expect(compB.rect, 'compB rect incorrect').to.deep.include({ x: 0, y: 960, width: 1000, height: 25 });

      // compC: overlap bottom, anchor=960, y=960, h=10 — overlaps compB
      expect(compC.rect, 'compC rect incorrect').to.deep.include({ x: 0, y: 960, width: 1000, height: 10 });
    });

    it('should expand center when overlap exceeds sum of normal components', () => {
      // A=30 normal, B=20 normal, C=70 overlap → center = max(50, 70) = 70
      // vRect starts at reducedRect.y=70: A (innermost) placed at y=40, B at y=20
      // A's inner edge (bottom=70) aligns with center boundary and C's inner edge
      const compA = componentMock({ dock: 'top', size: 30 });
      const compB = componentMock({ dock: 'top', size: 20 });
      const compC = componentMock({ dock: 'top', size: 70, overlap: true });
      const center = componentMock();

      dl.layout(rect, [compA, compB, compC, center]);

      expect(center.rect, 'center rect incorrect').to.deep.include({ x: 0, y: 70, width: 1000, height: 930 });

      // compA: innermost normal, bottom=70 (aligns with center and C's inner edge)
      expect(compA.rect, 'compA rect incorrect').to.deep.include({ x: 0, y: 40, width: 1000, height: 30 });
      // compB: outermost normal
      expect(compB.rect, 'compB rect incorrect').to.deep.include({ x: 0, y: 20, width: 1000, height: 20 });
      // compC: overlap, anchor=70, bottom=70 (same as compA's bottom)
      expect(compC.rect, 'compC rect incorrect').to.deep.include({ x: 0, y: 0, width: 1000, height: 70 });
    });

    it('should not affect center when there are no non-overlap components on the same edge', () => {
      // Only overlap top components — center should still be reduced by max overlap size
      const compA = componentMock({ dock: 'top', size: 30, overlap: true });
      const compB = componentMock({ dock: 'top', size: 20, overlap: true });
      const center = componentMock();

      dl.layout(rect, [compA, compB, center]);

      // No normal top: only overlap max=30 reduces center
      expect(center.rect, 'center rect incorrect').to.deep.include({ x: 0, y: 30, width: 1000, height: 970 });

      // Both anchored at y=30
      expect(compA.rect, 'compA rect incorrect').to.deep.include({ x: 0, y: 0, width: 1000, height: 30 });
      expect(compB.rect, 'compB rect incorrect').to.deep.include({ x: 0, y: 10, width: 1000, height: 20 });
    });

    it('should correctly position components docked at overlap components via @ syntax', () => {
      // A: normal top 30px  → center at y=30
      // B: overlap top 20px → max(30,20)=30, center stays at y=30
      // C: overlap top 15px → max stays 20, center stays at y=30
      // D: @A, E: @B, F: @C — inherit refs' rects
      const compA = componentMock({ dock: 'top', size: 30, key: 'A' });
      const compB = componentMock({ dock: 'top', size: 20, overlap: true, key: 'B' });
      const compC = componentMock({ dock: 'top', size: 15, overlap: true, key: 'C' });
      const compD = componentMock({ dock: '@A' });
      const compE = componentMock({ dock: '@B' });
      const compF = componentMock({ dock: '@C' });
      const center = componentMock();

      dl.layout(rect, [compA, compB, compC, compD, compE, compF, center]);

      expect(center.rect, 'center rect incorrect').to.deep.include({ x: 0, y: 30, width: 1000, height: 970 });

      expect(compA.rect, 'compA rect incorrect').to.deep.include({ x: 0, y: 0, width: 1000, height: 30 });
      expect(compB.rect, 'compB rect incorrect').to.deep.include({ x: 0, y: 10, width: 1000, height: 20 });
      expect(compC.rect, 'compC rect incorrect').to.deep.include({ x: 0, y: 15, width: 1000, height: 15 });

      // @-docked components inherit the rect of their referenced component
      expect(compD.rect, 'compD (@A) rect incorrect').to.deep.include({ x: 0, y: 0, width: 1000, height: 30 });
      expect(compE.rect, 'compE (@B) rect incorrect').to.deep.include({ x: 0, y: 10, width: 1000, height: 20 });
      expect(compF.rect, 'compF (@C) rect incorrect').to.deep.include({ x: 0, y: 15, width: 1000, height: 15 });
    });

    it('should support chained @ references through overlap components', () => {
      // A: normal top 30px → placed at y=20 (inner), center top at y=50
      // B: normal top 20px → stacks above A, placed at y=0
      // C: @A → same rect as A (overlaps A)
      // D: @B → same rect as B (overlaps B)
      // E: @A → same rect as A
      // F: @B → same rect as B
      // G: @C → same rect as C (= A)
      // H: @D → same rect as D (= B)
      const compA = componentMock({ dock: 'top', size: 30, key: 'A' });
      const compB = componentMock({ dock: 'top', size: 20, key: 'B' });
      const compC = componentMock({ dock: '@A', key: 'C' });
      const compD = componentMock({ dock: '@B', key: 'D' });
      const compE = componentMock({ dock: '@A' });
      const compF = componentMock({ dock: '@B' });
      const compG = componentMock({ dock: '@C' });
      const compH = componentMock({ dock: '@D' });
      const center = componentMock();

      dl.layout(rect, [compA, compB, compC, compD, compE, compF, compG, compH, center]);

      // center reduced by 30+20=50
      expect(center.rect, 'center rect incorrect').to.deep.include({ x: 0, y: 50, width: 1000, height: 950 });

      // A: innermost top, y = 50-30 = 20
      expect(compA.rect, 'compA rect incorrect').to.deep.include({ x: 0, y: 20, width: 1000, height: 30 });
      // B: stacks above A, y = 20-20 = 0
      expect(compB.rect, 'compB rect incorrect').to.deep.include({ x: 0, y: 0, width: 1000, height: 20 });

      // C overlaps A (same rect)
      expect(compC.rect, 'compC (@A) rect incorrect').to.deep.include({ x: 0, y: 20, width: 1000, height: 30 });
      // D overlaps B (same rect)
      expect(compD.rect, 'compD (@B) rect incorrect').to.deep.include({ x: 0, y: 0, width: 1000, height: 20 });

      // E also overlaps A
      expect(compE.rect, 'compE (@A) rect incorrect').to.deep.include({ x: 0, y: 20, width: 1000, height: 30 });
      // F also overlaps B
      expect(compF.rect, 'compF (@B) rect incorrect').to.deep.include({ x: 0, y: 0, width: 1000, height: 20 });

      // G chains through C → same rect as A
      expect(compG.rect, 'compG (@C) rect incorrect').to.deep.include({ x: 0, y: 20, width: 1000, height: 30 });
      // H chains through D → same rect as B
      expect(compH.rect, 'compH (@D) rect incorrect').to.deep.include({ x: 0, y: 0, width: 1000, height: 20 });
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
          preserveAspectRatio: false,
        },
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
        y: 3,
      });
      expect(mainComp.outer.scaleRatio, 'Main outerRect had incorrect ratio').to.deep.equal({
        x: 2,
        y: 3,
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
        y: 2,
      });
      expect(mainComp.outer.scaleRatio, 'outerRect had incorrect ratio').to.deep.equal({
        x: 2,
        y: 2,
      });
    });

    it('should ignore size and logicalSize NaN values and fallback to default size value', () => {
      settings = {
        logicalSize: {
          width: undefined,
          height: '10 bananas',
        },
      };
      const mainComp = componentMock();
      dl.settings(settings);
      dl.layout(container, [mainComp]);

      expect(mainComp.rect, 'ContainerRect had incorrect size').to.deep.include({
        x: 0,
        y: 0,
        width: 1000,
        height: 1200,
      });
    });

    it('should use minWidthRatio', () => {
      settings = {
        center: {
          minWidthRatio: 1,
        },
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
          minHeightRatio: 1,
        },
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
          minHeightRatio: -1,
        },
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
          minHeightRatio: 10,
        },
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
          minWidth: container.width,
        },
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
          minHeight: container.height,
        },
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
          minHeight: 333333,
        },
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
          minHeight: -1,
        },
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
          L: { width: 500, height: 500 },
        },
      };

      dl.settings(settings);
      dl.layout(rect, [mainComp]);

      expect(mainComp.rect, 'Main rect had incorrect size').to.deep.include({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
      });
    });
    it('normal to small', () => {
      const mainComp = componentMock({ minimumLayoutMode: 'L' });
      const settings = {
        layoutModes: {
          L: { width: 1100, height: 500 },
        },
      };
      dl.settings(settings);
      dl.layout(rect, [mainComp]);

      expect(mainComp.rect, 'Main rect had incorrect size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
    });
    it('complex visible', () => {
      const mainComp = componentMock({
        minimumLayoutMode: { width: 'S', height: 'L' },
      });
      const settings = {
        layoutModes: {
          S: { width: 100, height: 100 },
          L: { width: 1100, height: 500 },
        },
      };
      dl.settings(settings);
      dl.layout(rect, [mainComp]);

      expect(mainComp.rect, 'ContainerRect had incorrect size').to.deep.include({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
      });
    });

    it('should use logicalSize when determining visiblity of components', () => {
      const container = createRect(0, 0, 1000, 2000);
      const settings = {
        layoutModes: {
          S: { width: 800, height: 100 },
        },
        logicalSize: {
          x: 0,
          y: 0,
          width: 799,
          height: 100,
        },
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
        edgeBleed: { top: 700 },
      });
      const mainComp = componentMock();

      dl.layout(rect, [leftComp, mainComp]);

      expect(leftComp.rect, 'leftComp rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
      expect(mainComp.rect, 'Main rect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
      });
    });

    it('should remove component because other components edgebleed', () => {
      const leftComp = componentMock({
        dock: 'left',
        size: 100,
        edgeBleed: { top: 400 },
      });
      const bottomComp = componentMock({ dock: 'bottom', size: 300 });
      const mainComp = componentMock();

      dl.layout(rect, [leftComp, bottomComp, mainComp]);

      expect(leftComp.rect, 'leftComp innerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 400,
        width: 100,
        height: 600,
      });
      expect(bottomComp.rect, 'bottomComp innerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
      expect(mainComp.rect, 'Main innerRect had incorrect calculated size').to.deep.include({
        x: 100,
        y: 400,
        width: 900,
        height: 600,
      });
    });

    it('should overlap component and edgebleed on the same side', () => {
      const leftComp = componentMock({
        dock: 'left',
        size: 100,
        edgeBleed: { bottom: 400 },
      });
      const bottomComp = componentMock({ dock: 'bottom', size: 300 });
      const mainComp = componentMock();

      dl.layout(rect, [leftComp, bottomComp, mainComp]);

      expect(leftComp.rect, 'leftComp innerRect had incorrect calculated size').to.deep.include({
        x: 0,
        y: 0,
        width: 100,
        height: 600,
      });
      expect(bottomComp.rect, 'bottomComp innerRect had incorrect calculated size').to.deep.include({
        x: 100,
        y: 600,
        width: 900,
        height: 300,
      });
      expect(mainComp.rect, 'Main innerRect had incorrect calculated size').to.deep.include({
        x: 100,
        y: 0,
        width: 900,
        height: 600,
      });
    });
  });

  describe('prioOrder', () => {
    it('should remove components with higher prioOrder given not enough space and they have the same orientation', () => {
      const leftComp = componentMock({ dock: 'left', size: 500, prioOrder: 1 }); // Remove
      const rightComp = componentMock({
        dock: 'right',
        size: 500,
        prioOrder: -1,
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
        prioOrder: -1,
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

      const { visible, ordered } = dl.layout(rect, [mainComp, leftComp, onLeft, onMain]);

      expect(visible.map((v) => v.key)).to.eql(['main', 'y', 'dockAtY', 'dockAtMain']);
      expect(ordered.map((v) => v.key)).to.eql(['dockAtMain', 'main', 'dockAtY', 'y']);
    });
  });
});
