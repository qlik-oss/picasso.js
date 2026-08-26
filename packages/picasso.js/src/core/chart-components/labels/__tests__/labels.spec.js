import { strategy } from '../labels';

describe('component - label', () => {
  describe('strategy', () => {
    it('should return empty when component is not found', () => {
      const chart = {
        component: () => 0,
      };
      let labels = strategy({
        chart,
        source: {},
      });
      expect(labels.length).to.equal(0);
    });

    it('should filter shapes based on selector', () => {
      const chart = {
        component: vi.fn(),
        findShapes: vi.fn(),
      };
      chart.component.mockReturnValue({});
      chart.findShapes.mockReturnValue([{ key: 'bars' }, { key: 'points' }, { key: 'bars' }]);
      let labels = strategy(
        {
          chart,
          source: {
            component: 'bars',
            selector: 'circle',
            strategy: {},
          },
          rect: {},
        },
        (opts) => opts.nodes,
      );
      expect(labels).to.eql([{ key: 'bars' }, { key: 'bars' }]);
    });
  });
});
