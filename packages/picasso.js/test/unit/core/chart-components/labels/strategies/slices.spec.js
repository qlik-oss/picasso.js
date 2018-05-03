import {
  getSliceRect,
  // placeTextInRect,
  // placeInBars,
  // findBestPlacement,
  slices
} from '../../../../../../src/core/chart-components/labels/strategies/slices';

describe('labeling - slices', () => {
  describe('slice rects', () => {
    it('inside Q1 - OK', () => {
      expect(getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: 0,
          end: 2 * Math.asin(4 / 5),
          innerRadius: 0,
          outerRadius: 15
        },
        position: 'inside',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql({
        x: 5,
        y: -8,
        width: 6,
        height: 4
      });
    });

    it('inside Q2 - OK', () => {
      expect(getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: Math.PI / 2,
          end: (Math.PI / 2) + (2 * Math.asin(3 / 5)),
          innerRadius: 0,
          outerRadius: 15
        },
        position: 'inside',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql({
        x: 5,
        y: 4,
        width: 6,
        height: 4
      });
    });

    it('opposite Q3 - OK', () => {
      expect(getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: Math.PI,
          end: Math.PI + (2 * Math.asin(4 / 5)),
          innerRadius: 15,
          outerRadius: 20
        },
        position: 'opposite',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql({
        x: -11,
        y: 4,
        width: 6,
        height: 4
      });
    });

    it('inside Q4 - Do not fit', () => {
      expect(getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: (Math.PI * (3 / 2)) + Math.asin(3 / 5),
          end: (Math.PI * (3 / 2)) + Math.asin(3 / 5),
          innerRadius: 0,
          outerRadius: 15
        },
        position: 'inside',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql(null);
    });
  });

  describe('slice strategy', () => {
    let chart;
    let renderer;
    beforeEach(() => {
      chart = {};
      renderer = {
        measureText: sinon.stub()
      };
    });

    it('should return some labels', () => {
      const settings = {
        direction: () => 'vertical',
        labels: [{
          placements: [{ position: 'inside', fill: () => 'red' }],
          label: () => 'etikett'
        }]
      };
      const nodes = [{
        desc: {
          slice: {
            offset: { x: 25, y: 25 },
            start: 0,
            end: 2 * Math.PI,
            innerRadius: 0,
            outerRadius: 50
          }
        }
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = slices({
        settings,
        chart,
        nodes,
        renderer,
        style: {
          label: {
            fontSize: '16px',
            fontFamily: 'simpsons',
            fill: 'green'
          }
        }
      });

      expect(labels[0]).to.eql({
        type: 'text',
        text: 'etikett',
        maxWidth: 20,
        x: 15,
        y: 25,
        fill: 'red',
        anchor: 'start',
        baseline: 'middle',
        fontSize: '16px',
        fontFamily: 'simpsons'
      });
    });

    it('should skip node if label is falsy', () => {
      const settings = {
        direction: () => 'right',
        labels: [{
          placements: [{ position: 'inside', fill: () => 'red' }],
          label: () => ''
        }]
      };
      const nodes = [{
        desc: {
          slice: {
            offset: { x: 25, y: 25 },
            start: 0,
            end: 2 * Math.PI,
            innerRadius: 0,
            outerRadius: 50
          }
        }
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = slices({
        settings,
        chart,
        nodes,
        renderer,
        style: {
          label: {
            fontSize: '16px',
            fontFamily: 'simpsons',
            fill: 'yellow'
          }
        }
      });

      expect(labels).to.be.empty;
    });
  });
});
