import itemRendererFactory, {
  itemize,
  extent,
  spread,
  getItemsToRender,
  createRenderItem,
  parallelize
} from '../item-renderer';
import * as symbolFactory from '../../../symbols';

describe('legend-item-renderer', () => {
  describe('itemize', () => {
    let created;
    beforeEach(() => {
      created = itemize({
        resolved: {
          layout: { item: {} },
          labels: { items: [{}, { fontSize: 11, data: { label: 'wohoo' } }] },
          items: { items: [{ show: false }, {}] },
          symbols: { items: [{}, { size: 17 }] }
        }
      }, {
        textBounds: obj => ({ width: parseInt(obj.fontSize, 10) * 2, height: 20 })
      });
    });
    it('should filter out hidden items', () => {
      expect(created.items.length).to.equal(1);
    });

    it('should return items', () => {
      expect(created.items).to.eql([{
        symbol: {
          meta: { size: 17 }
        },
        label: {
          displayObject: {
            data: { label: 'wohoo' },
            fontSize: '11px',
            text: 'wohoo',
            title: 'wohoo',
            type: 'text'
          },
          bounds: { width: 22, height: 20 }
        }
      }]);
    });

    it('should calculate absolute metrics', () => {
      expect(created.globalMetrics).to.eql({
        spacing: 8,
        maxSymbolSize: 17,
        maxLabelBounds: { width: 22, height: 20 },
        maxItemBounds: { height: 20, width: 17 + 8 + 22 }
      });
    });
  });

  describe('extent', () => {
    it('should calculate when vertical', () => {
      let x = extent({
        items: [1, 2, 3, 4, 5],
        layout: {
          margin: { vertical: 13 }
        },
        globalMetrics: { maxItemBounds: { width: 10, height: 20 } }
      }, 2);
      // 5 items running in 2 columns gives:
      // 3 rows each with a height of 20, plus spacing between the rows
      expect(x).to.equal((3 * 20) + (2 * 13));
    });

    it('should calculate when horizontal', () => {
      let x = extent({
        items: [1, 2, 3, 4, 5],
        layout: { orientation: 'horizontal', margin: { horizontal: 17 } },
        globalMetrics: { maxItemBounds: { width: 10, height: 20 } }
      }, 2);
      // 5 items running in 2 rows gives:
      // 3 columns each with a width of 10, plus spacing between the columns
      expect(x).to.equal((3 * 10) + (2 * 17));
    });
  });

  describe('spread', () => {
    it('should calculate when vertical', () => {
      let x = spread({
        layout: { margin: { horizontal: 13 } },
        globalMetrics: { maxItemBounds: { width: 10, height: 20 } }
      }, 3);
      // 3 columns each with a width of 10, plus spacing between the columns
      expect(x).to.equal((3 * 10) + (2 * 13));
    });

    it('should calculate when horizontal', () => {
      let x = spread({
        layout: { orientation: 'horizontal', margin: { vertical: 7 } },
        globalMetrics: { spacing: 4, maxItemBounds: { width: 10, height: 20 } }
      }, 3);
      // 3 rows each with a height of 20, plus spacing between the rows
      expect(x).to.equal((3 * 20) + (2 * 7));
    });
  });

  describe('parallelize', () => {
    it('should fill up allowed space', () => {
      expect(parallelize(48, null, { // 20 in row height + 4 margin should fit two rows and result in 3 columns (parallels)
        items: [1, 2, 3, 4, 5, 6],
        layout: { size: 5, margin: { vertical: 4 } },
        globalMetrics: { maxItemBounds: { width: 10, height: 20 } }
      })).to.equal(3);
    });

    it('should not overflow allowd spread', () => {
      // 20 in row height + 4 spacing should fit two rows and result in 3 columns (parallels)
      // 3 columns = 10 * 3 + 2 * 4 = 38
      // limit spread to < 38 should limit the parallels to 2
      expect(parallelize(48, 37, {
        items: [1, 2, 3, 4, 5, 6],
        layout: { size: 5, margin: { vertical: 4 } },
        globalMetrics: { maxItemBounds: { width: 10, height: 20 } }
      })).to.equal(2);
    });
  });

  describe('getItemsToRender', () => {
    let rendered;
    describe('vertical', () => {
      beforeEach(() => {
        const itemized = {
          items: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
          layout: { margin: { vertical: 5, horizontal: 6 } },
          globalMetrics: {
            spacing: 4,
            maxItemBounds: { width: 20, height: 10 }
          }
        };
        rendered = getItemsToRender(
          {
            viewRect: {
              x: 0, y: 0, width: 100, height: 20
            }
          },
          {
            x: 0, y: -12, width: 100, height: 400
          }, { // rows start at -12 and increase by 15 => -12, 3, 18, 33
            itemized,
            create: ({ x, y, item }) => ({ item: { x, y, label: item } }),
            parallels: 2
          }
        );
      });

      it('should position items in two columns', () => {
        expect(rendered).to.eql([
          // { x: 0, y: -12, label: 'a' }, { x: 28, y: -12, label: 'b' }, // not visible
          { x: 0, y: 3, label: 'c' }, { x: 26, y: 3, label: 'd' }, // first visible row
          { x: 0, y: 18, label: 'e' }, { x: 26, y: 18, label: 'f' } // second
          // { x: 0, y: 30, label: 'g' } // not visible - outside of view rect
        ]);
      });
    });

    describe('horizontal', () => {
      beforeEach(() => {
        const itemized = {
          items: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
          layout: { orientation: 'horizontal', margin: { vertical: 5, horizontal: 6 } },
          globalMetrics: {
            spacing: 4,
            maxItemBounds: { width: 20, height: 10 }
          }
        };
        rendered = getItemsToRender({
          viewRect: {
            x: 0, y: 0, width: 30, height: 100
          }
        }, {
          x: -22, y: 0, width: 200, height: 400
        }, { // columns start at -22 and increase by 26 => -22, 4, 30, 56
          itemized,
          create: ({ x, y, item }) => ({ item: { x, y, label: item } }),
          parallels: 2
        });
      });

      it('should position items in two rows', () => {
        expect(rendered).to.eql([
          { x: 4, y: 0, label: 'c' }, { x: 4, y: 15, label: 'd' }, // first visible row
          { x: 30, y: 0, label: 'e' }, { x: 30, y: 15, label: 'f' } // second
        ]);
      });
    });
  });

  describe('createRenderItem', () => {
    it('create', () => {
      const item = createRenderItem({
        x: 1,
        y: 3,
        item: {
          label: {
            bounds: { width: 15, height: 9 },
            displayObject: {
              fontSize: 11,
              data: 'd'
            }
          },
          symbol: { meta: { size: 4 } }
        },
        globalMetrics: {
          spacing: 8,
          maxSymbolSize: 14,
          maxItemBounds: { width: 17, height: 15 },
          maxLabelBounds: { width: 20, height: 10 }
        },
        symbolFn: coord => coord
      });

      expect(item.item).to.eql({
        type: 'container',
        data: 'd',
        collider: {
          type: 'rect',
          x: 1,
          y: 3,
          width: 17,
          height: 15
        },
        children: [{
          size: 4,
          x: 1 + 7, // x + maxSymbolSize / 2
          y: 3 + 7 // y + maxSymbolSize / 2
        }, {
          baseline: 'hanging',
          fontSize: 11,
          anchor: 'start',
          data: 'd',
          x: 1 + 14 + 8, // x + maxSymbolSize + spacing
          y: 3 + ((14 - 9) / 2) // y + (maxSymbolSize - labelHeight) / 2
        }]
      });
    });
  });

  describe('offset', () => {
    let sandbox;
    let legend;
    let api;
    let obj;
    let overflow;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      legend = {
        renderer: {
          textBounds: o => ({ width: parseInt(o.fontSize, 10) * 2, height: 20 })
        }
      };
      obj = {
        viewRect: { x: 1, y: 2 },
        resolved: {
          layout: { item: { scrollOffset: 100 } },
          labels: { items: [{}, { fontSize: 11, data: { label: 'wohoo' } }] },
          items: { items: [{ show: false }, {}] },
          symbols: { items: [{}, { size: 17 }] }
        }
      };
      api = itemRendererFactory(legend, {
        onScroll: () => {}
      });
      overflow = 0;
      sandbox.stub(api, 'getContentOverflow').callsFake(() => overflow);
      sandbox.stub(symbolFactory, 'default').returns({});
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct offset after itemize is executed', () => {
      api.itemize(obj);
      expect(api.offset()).to.equal(100);
    });

    it('should return correct offset after itemize and getItemsToRender are executed and overflow = 0', () => {
      api.itemize(obj);
      api.getItemsToRender(obj);
      expect(api.offset()).to.equal(0);
    });

    it('should return correct offset after itemize and getItemsToRender are executed and overflow < offset', () => {
      overflow = 5;
      api.itemize(obj);
      api.getItemsToRender(obj);
      expect(api.offset()).to.equal(5);
    });

    it('should return correct offset after itemize and getItemsToRender are executed and overflow > offset', () => {
      overflow = 200;
      api.itemize(obj);
      api.getItemsToRender(obj);
      expect(api.offset()).to.equal(100);
    });

    it('should return correct offset after itemize and getItemsToRender and then itemize are executed', () => {
      api.itemize(obj);
      api.getItemsToRender(obj);
      api.itemize(obj);
      expect(api.offset()).to.equal(100);
    });

    it('should return correct offset after itemize and getItemsToRender and then itemize and getItemsToRender are executed and overflow < offset', () => {
      overflow = 10;
      api.itemize(obj);
      api.getItemsToRender(obj);
      api.itemize(obj);
      api.getItemsToRender(obj);
      expect(api.offset()).to.equal(10);
    });

    it('should return correct offset after itemize and getItemsToRender and then itemize and getItemsToRender are executed and overflow > offset', () => {
      overflow = 300;
      api.itemize(obj);
      api.getItemsToRender(obj);
      api.itemize(obj);
      api.getItemsToRender(obj);
      expect(api.offset()).to.equal(100);
    });
  });
});
