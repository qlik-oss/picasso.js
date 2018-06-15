import { rows } from '../../../../../../src/core/chart-components/labels/strategies/rows';

describe('labeling - rows', () => {
  describe('rows strategy', () => {
    let chart;
    let renderer;
    beforeEach(() => {
      chart = {};
      renderer = {
        measureText: sinon.stub()
      };
    });

    it('should support rects', () => {
      const settings = {
        align: 0,
        justify: 0,
        labels: [{
          label: () => 'etikett'
        }]
      };
      const nodes = [{
        type: 'rect',
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = rows({
        settings,
        chart,
        nodes,
        renderer,
        style: {}
      }, bounds => bounds);

      expect(labels[0]).to.eql({
        x: 4,
        y: 4,
        width: 92,
        height: 10
      });
    });

    it('should support circles', () => {
      const settings = {
        padding: 0,
        labels: [{
          label: () => 'etikett'
        }]
      };
      const nodes = [{
        type: 'circle',
        attrs: { cx: 50, cy: 50, r: 41 }
      }];
      renderer.measureText.returns({ width: 50, height: 18 });
      let labels = rows({
        settings,
        chart,
        nodes,
        renderer,
        style: {}
      }, bounds => bounds);

      expect(labels[0]).to.eql({
        x: 10,
        y: 41,
        width: 80,
        height: 18
      });
    });

    it('should support "circle" pie slice ', () => {
      const settings = {
        padding: 0,
        labels: [{
          label: () => 'etikett'
        }]
      };
      const nodes = [{
        type: 'path',
        desc: {
          slice: {
            start: 0,
            end: 2 * Math.PI,
            offset: { x: 30, y: 30 },
            innerRadius: 0,
            outerRadius: 25
          }
        }
      }];
      renderer.measureText.returns({ width: 20, height: 14 });
      let labels = rows({
        settings,
        chart,
        nodes,
        renderer,
        style: {}
      }, bounds => bounds);

      expect(labels[0]).to.eql({
        x: 6,
        y: 23,
        width: 48,
        height: 14
      });
    });

    it('should not support pie slice that are not a "circle"', () => {
      const settings = {
        padding: 0,
        labels: [{
          label: () => 'etikett'
        }]
      };
      const nodes = [{
        type: 'path',
        desc: {
          slice: {
            start: 0,
            end: Math.PI,
            offset: { x: 30, y: 30 },
            innerRadius: 0,
            outerRadius: 25
          }
        }
      }];
      renderer.measureText.returns({ width: 20, height: 14 });
      let labels = rows({
        settings,
        chart,
        nodes,
        renderer,
        style: {}
      }, bounds => bounds);

      expect(labels).to.have.length(0);
    });

    it('should stack labels', () => {
      const settings = {
        align: 0,
        justify: 0,
        labels: [
          { label: () => 'label1' },
          { label: () => 'label2' },
          { label: () => 'label3' }
        ]
      };
      const nodes = [{
        type: 'rect',
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = rows({
        settings,
        chart,
        nodes,
        renderer,
        style: {}
      }, (bounds, text) => text);

      expect(labels).to.eql(['label1', 'label2', 'label3']);
    });

    it('should cut labels if there are to may to fit', () => {
      const settings = {
        align: 0,
        justify: 0,
        labels: [
          { label: () => 'label1' },
          { label: () => 'label2' },
          { label: () => 'label3' }
        ]
      };
      const nodes = [{
        type: 'rect',
        bounds: {
          x: 0,
          y: 0,
          width: 20,
          height: 20
        }
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = rows({
        settings,
        chart,
        nodes,
        renderer,
        style: {}
      }, (bounds, text) => text);

      expect(labels).to.eql(['label1']);
    });

    it('should link data', () => {
      const settings = {
        align: 0,
        justify: 0,
        labels: [{
          label: () => 'etikett',
          linkData: ({ data }) => data
        }]
      };
      const nodes = [{
        type: 'rect',
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        },
        data: 1
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = rows({
        settings,
        chart,
        nodes,
        renderer,
        style: {}
      }, bounds => bounds);

      expect(labels[0]).to.containSubset({
        data: 1
      });
    });
  });
});
