import * as ellipsText from '../../../../../web/text-manipulation/text-ellipsis';
import { rows } from '../rows';

describe('labeling - rows', () => {
  let sandbox;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(ellipsText, 'default');
    ellipsText.default.callsFake((n) => n.text);
  });

  afterAll(() => {
    sandbox.restore();
  });

  describe('rows strategy', () => {
    let chart;
    let renderer;

    beforeEach(() => {
      chart = {};
      renderer = {
        measureText: sandbox.stub(),
      };
    });

    it('should support rects', () => {
      const settings = {
        align: 0,
        justify: 0,
        labels: [
          {
            label: () => 'etikett',
          },
        ],
      };
      const nodes = [
        {
          type: 'rect',
          bounds: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = rows(
        {
          settings,
          chart,
          nodes,
          renderer,
          style: {},
        },
        (bounds) => bounds
      );

      expect(labels[0]).to.eql({
        x: 4,
        y: 4,
        width: 92,
        height: 10,
      });
    });

    it('should support circles', () => {
      const settings = {
        padding: 0,
        labels: [
          {
            label: () => 'etikett',
          },
        ],
      };
      const nodes = [
        {
          type: 'circle',
          attrs: { cx: 50, cy: 50, r: 41 },
        },
      ];
      renderer.measureText.returns({ width: 50, height: 18 });
      let labels = rows(
        {
          settings,
          chart,
          nodes,
          renderer,
          style: {},
        },
        (bounds) => bounds
      );

      expect(labels[0]).to.eql({
        x: 10,
        y: 41,
        width: 80,
        height: 18,
      });
    });

    it('should support "circle" pie slice ', () => {
      const settings = {
        padding: 0,
        labels: [
          {
            label: () => 'etikett',
          },
        ],
      };
      const nodes = [
        {
          type: 'path',
          desc: {
            slice: {
              start: 0,
              end: 2 * Math.PI,
              offset: { x: 30, y: 30 },
              innerRadius: 0,
              outerRadius: 25,
            },
          },
        },
      ];
      renderer.measureText.returns({ width: 20, height: 14 });
      let labels = rows(
        {
          settings,
          chart,
          nodes,
          renderer,
          style: {},
        },
        (bounds) => bounds
      );

      expect(labels[0]).to.eql({
        x: 6,
        y: 23,
        width: 48,
        height: 14,
      });
    });

    it('should not support pie slice that are not a "circle"', () => {
      const settings = {
        padding: 0,
        labels: [
          {
            label: () => 'etikett',
          },
        ],
      };
      const nodes = [
        {
          type: 'path',
          desc: {
            slice: {
              start: 0,
              end: Math.PI,
              offset: { x: 30, y: 30 },
              innerRadius: 0,
              outerRadius: 25,
            },
          },
        },
      ];
      renderer.measureText.returns({ width: 20, height: 14 });
      let labels = rows(
        {
          settings,
          chart,
          nodes,
          renderer,
          style: {},
        },
        (bounds) => bounds
      );

      expect(labels).to.have.length(0);
    });

    it('should stack labels', () => {
      const settings = {
        align: 0,
        justify: 0,
        labels: [{ label: () => 'label1' }, { label: () => 'label2' }, { label: () => 'label3' }],
      };
      const nodes = [
        {
          type: 'rect',
          bounds: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = rows(
        {
          settings,
          chart,
          nodes,
          renderer,
          style: {},
        },
        (bounds, text) => text
      );

      expect(labels).to.eql(['label1', 'label2', 'label3']);
    });

    it('should cut labels if there are to may to fit', () => {
      const settings = {
        align: 0,
        justify: 0,
        labels: [{ label: () => 'label1' }, { label: () => 'label2' }, { label: () => 'label3' }],
      };
      const nodes = [
        {
          type: 'rect',
          bounds: {
            x: 0,
            y: 0,
            width: 20,
            height: 20,
          },
        },
      ];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = rows(
        {
          settings,
          chart,
          nodes,
          renderer,
          style: {},
        },
        (bounds, text) => text
      );

      expect(labels).to.eql(['label1']);
    });

    it('should precalculate ellipsed value', () => {
      const settings = {
        align: 0,
        justify: 0,
        labels: [
          {
            label: () => 'etikett',
          },
        ],
      };
      const nodes = [
        {
          type: 'rect',
          bounds: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ];
      renderer.measureText.returns({ width: 20, height: 10 });

      ellipsText.default.returns('et…');

      let labels = rows(
        {
          settings,
          chart,
          nodes,
          renderer,
          style: {},
        },
        (bounds, text) => ({ text })
      );

      expect(labels[0]).to.eql({
        ellipsed: 'et…',
        text: 'etikett',
      });

      // { text: 'label1', ellipsed: 'label1' }
    });

    it('should not include labels that are ellipsed to the ellipsis only', () => {
      const settings = {
        align: 0,
        justify: 0,
        labels: [
          {
            label: () => 'etikett',
          },
        ],
      };
      const nodes = [
        {
          type: 'rect',
          bounds: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ];
      renderer.measureText.returns({ width: 20, height: 10 });

      ellipsText.default.returns('…');

      let labels = rows(
        {
          settings,
          chart,
          nodes,
          renderer,
          style: {},
        },
        (bounds, text) => ({ text })
      );

      expect(labels.length).to.eql(0);

      // { text: 'label1', ellipsed: 'label1' }
    });

    it('should link data', () => {
      const settings = {
        align: 0,
        justify: 0,
        labels: [
          {
            label: () => 'etikett',
            linkData: ({ data }) => data,
          },
        ],
      };
      const nodes = [
        {
          type: 'rect',
          bounds: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
          data: 1,
        },
      ];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = rows(
        {
          settings,
          chart,
          nodes,
          renderer,
          style: {},
        },
        (bounds) => bounds
      );

      expect(labels[0]).to.containSubset({
        data: 1,
      });
    });

    it('should keep empty labels', () => {
      const settings = {
        align: 0,
        justify: 0,
        labels: [{ label: () => 'label1' }, { label: () => '' }, { label: () => 'label3' }],
      };
      const nodes = [
        {
          type: 'rect',
          bounds: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = rows(
        {
          settings,
          chart,
          nodes,
          renderer,
          style: {},
        },
        (bounds, text) => text || '<empty>'
      );

      expect(labels).to.eql(['label1', '<empty>', 'label3']);
    });
  });
});
