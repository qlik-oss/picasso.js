import {
  getSliceRect,
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
        position: 'into',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql({
        x: 5,
        y: -8,
        width: 6,
        height: 4,
        baseline: 'top'
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
        position: 'into',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql({
        x: 5,
        y: 4,
        width: 6,
        height: 4,
        baseline: 'top'
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
        position: 'inside',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql({
        x: -11,
        y: 4,
        width: 6,
        height: 4,
        baseline: 'top'
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
        position: 'into',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql(null);
    });

    it('rotated outside', () => {
      let epsilon = 0.0001;
      let bounds = getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: 0,
          end: Math.PI,
          innerRadius: 15,
          outerRadius: 20
        },
        direction: 'rotate',
        position: 'outside',
        padding: 1,
        measured: { width: 6, height: 4 },
        view: {
          x: -50, y: -50, width: 100, height: 100
        }
      });
      expect(bounds).property('anchor').to.equal('start');
      expect(bounds).property('angle').to.equal(0);
      expect(bounds).property('x').to.equal(21);
      expect(bounds).property('y').to.closeTo(0, epsilon);
      expect(bounds).property('width').to.equal(6);
      expect(bounds).property('height').to.equal(4);
    });

    it('rotated into', () => {
      let epsilon = 0.0001;
      let bounds = getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: 0,
          end: Math.PI,
          innerRadius: 15,
          outerRadius: 20
        },
        direction: 'rotate',
        position: 'into',
        padding: 1,
        measured: { width: 6, height: 4 },
        view: {
          x: -50, y: -50, width: 100, height: 100
        }
      });
      expect(bounds).property('anchor').to.equal('end');
      expect(bounds).property('angle').to.equal(0);
      expect(bounds).property('x').to.equal(19);
      expect(bounds).property('y').to.closeTo(0, epsilon);
      expect(bounds).property('width').to.equal(3);
      expect(bounds).property('height').to.equal(4);
    });
  });

  describe('slice strategy', () => {
    let chart;
    let renderer;
    let rect;
    beforeEach(() => {
      chart = {};
      renderer = {
        measureText: sinon.stub()
      };
      rect = {
        x: 0,
        y: 0,
        width: 300,
        height: 300
      };
    });

    it('should return some labels', () => {
      const settings = {
        labels: [{
          placements: [{ position: 'into', fill: () => 'red' }],
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
        rect,
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
        y: 64,
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
          placements: [{ position: 'into', fill: () => 'red' }],
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

    it('should link data', () => {
      const settings = {
        labels: [{
          placements: [{ position: 'into', fill: () => 'red' }],
          label: () => 'etikett',
          linkData: ({ data }) => data
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
        },
        data: 1
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = slices({
        settings,
        chart,
        nodes,
        rect,
        renderer,
        style: {}
      });

      expect(labels[0]).to.containSubset({
        data: 1
      });
    });

    describe('label overlap', () => {
      function createLabel(list) {
        const settings = {
          labels: [{
            placements: [{ position: 'outside', fill: () => 'red' }],
            label: () => 'etikett'
          }]
        };
        const nodes = list.map(l => ({
          desc: {
            slice: {
              offset: { x: 10, y: 50 },
              start: l.start,
              end: l.end,
              innerRadius: 0,
              outerRadius: 50
            }
          }
        }));

        renderer.measureText.returns({ width: 36, height: 5 });
        return slices({
          settings,
          chart,
          nodes,
          renderer,
          rect: {
            x: 0, y: 0, height: 100, width: 100
          },
          style: {
            label: {
              fontSize: '16px',
              fontFamily: 'simpsons',
              fill: 'green'
            }
          }
        });
      }

      it('should not add any labels, because they are out of bounds', () => {
        const labels = createLabel([
          { start: 0, end: 0.1 },
          { start: 0.2, end: 0.3 }
        ]);
        expect(labels.length).to.eql(0);
      });

      it('should move overlapping labels and create a line to the moved one', () => {
        const labels = createLabel([
          { start: 1.38, end: 1.45 },
          { start: 1.45, end: 1.51 }
        ]);
        expect(labels).to.containSubset([
          { type: 'text' },
          { type: 'text' },
          { type: 'line' }
        ]);
        // check indication that the correct label is moved
        expect(labels[0].y > labels[1].y).to.be.true;
      });

      it('should handle roatation and wraparound', () => {
        const labels = createLabel([
          { start: 1.45, end: 1.51 },
          { start: 1.38 + (Math.PI * 2), end: 1.45 + (Math.PI * 2) }
        ]);
        expect(labels).to.containSubset([
          { type: 'text' },
          { type: 'text' },
          { type: 'line' }
        ]);
        // check indication that the correct label is moved
        expect(labels[0].y > labels[1].y).to.be.true;
      });
    });
  });
});
