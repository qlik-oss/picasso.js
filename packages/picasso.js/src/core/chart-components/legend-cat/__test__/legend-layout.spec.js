import layout from '../../../../../src/core/chart-components/legend-cat/legend-layout';

describe('legend layout', () => {
  const itemRenderer = {
    spread: () => 11,
    extent: () => 13,
    parallelize: () => {},
    direction: () => 'ltr'
  };
  const navigationRenderer = {
    spread: () => 41,
    extent: () => 17
  };
  const titleRenderer = {
    spread: () => 19,
    extent: () => 21
  };

  const display = {
    spacing: 7
  };

  describe('vertical', () => {
    const boxes = layout({
      x: 0,
      y: 0,
      width: 200,
      height: 100
    }, display, 'vertical', {
      itemRenderer,
      titleRenderer,
      navigationRenderer
    });

    it('should position title at top', () => {
      expect(boxes.title).to.eql({
        x: 7,
        y: 7,
        width: 200 - 14,
        height: 19
      });
    });

    it('should not show navigation', () => {
      expect(boxes.navigation).to.eql({
        x: 7,
        y: 93,
        width: 200 - 14,
        height: 0
      });
    });

    it('should position content below title', () => {
      expect(boxes.content).to.eql({
        x: 7,
        y: 7 + 19 + 7,
        width: 200 - 14,
        height: 100 - 14 - 7 - 19
      });
    });

    it('should have a preferredSize', () => {
      expect(boxes.preferredSize).to.equal(21);
    });
  });

  describe('horizontal', () => {
    describe('without overflow', () => {
      const boxes = layout({
        x: 0,
        y: 0,
        width: 200,
        height: 100
      }, display, 'horizontal', {
        itemRenderer,
        titleRenderer,
        navigationRenderer
      });

      it('should position title at left', () => {
        expect(boxes.title).to.eql({
          x: 7,
          y: 7,
          width: 21,
          height: 19
        });
      });

      it('should not show navigation', () => {
        expect(boxes.navigation).to.eql({
          x: 193,
          y: 7,
          width: 0,
          height: 86
        });
      });

      it('should position content to the right', () => {
        expect(boxes.content).to.eql({
          x: 7 + 21 + 7,
          y: 7,
          width: 200 - 35 - 7,
          height: 86
        });
      });

      it('should not reserve more than needed for visible parts', () => {
        expect(boxes.preferredSize).to.equal(19);
      });
    });

    describe('with overflow, rtl and no title', () => {
      const boxes = layout({
        x: 0,
        y: 0,
        width: 200,
        height: 100
      }, display, 'horizontal', {
        itemRenderer: {
          direction: () => 'rtl',
          parallelize: () => {},
          spread: () => 11,
          extent: () => 200 - 13 // 1px less than available space
        },
        titleRenderer: {
          spread: () => 19,
          extent: () => 0
        },
        navigationRenderer
      });

      it('should not show title', () => {
        expect(boxes.title).to.eql({
          x: 193,
          y: 22,
          width: 0,
          height: 19
        });
      });

      it('should position navigation to the left', () => {
        expect(boxes.navigation).to.eql({
          x: 7,
          y: 7,
          width: 17,
          height: 86
        });
      });

      it('should position content to the right', () => {
        expect(boxes.content).to.eql({
          x: 7 + 17 + 7,
          y: 22,
          width: 200 - 31 - 7,
          height: 86
        });
      });
    });
  });
});
