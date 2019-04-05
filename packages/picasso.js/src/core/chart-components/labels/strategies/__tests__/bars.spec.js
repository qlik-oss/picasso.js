import {
  getBarRect,
  isTextInRect,
  placeTextInRect,
  // precalculate,
  placeInBars,
  findBestPlacement,
  bars
} from '../bars';

function place(position, direction) {
  return getBarRect({
    bar: {
      x: 10, y: 40, width: 20, height: 30
    },
    view: { width: 200, height: 100 },
    direction,
    position,
    padding: {
      top: 4, bottom: 4, left: 2, right: 2
    }
  });
}

const postFilter = () => () => true;

describe('labeling - bars', () => {
  describe('bar rects', () => {
    it('inside', () => {
      expect(place('inside')).to.eql({
        x: 12, y: 44, width: 16, height: 22
      });
    });

    it('outside-up/opposite-down', () => {
      expect(place('outside', 'up')).to.eql({
        x: 12, y: 4, width: 16, height: 32
      });
      expect(place('opposite', 'down')).to.eql({
        x: 12, y: 4, width: 16, height: 32
      });
    });

    it('outside-down/opposite-up', () => {
      expect(place('outside', 'down')).to.eql({
        x: 12, y: 74, width: 16, height: 22
      });
      expect(place('opposite', 'up')).to.eql({
        x: 12, y: 74, width: 16, height: 22
      });
    });

    it('outside-right/opposite-left', () => {
      expect(place('outside', 'right')).to.eql({
        x: 32, y: 44, width: 166, height: 22
      });
      expect(place('opposite', 'left')).to.eql({
        x: 32, y: 44, width: 166, height: 22
      });
    });

    it('outside-left/opposite-right', () => {
      expect(place('outside', 'left')).to.eql({
        x: 2, y: 44, width: 6, height: 22
      });
      expect(place('opposite', 'right')).to.eql({
        x: 2, y: 44, width: 6, height: 22
      });
    });
  });

  describe('is text in rect', () => {
    describe('when rotate = false', () => {
      it('should return false if rect width < text width', () => {
        expect(isTextInRect({ width: 20, height: 100 }, { width: 30, height: 1 }, { rotate: false })).to.equal(false);
      });

      it('should return false if rect height < text height', () => {
        expect(isTextInRect({ width: 20, height: 30 }, { width: 10, height: 50 }, { rotate: false })).to.equal(false);
      });

      it('should return true if rect width >= text width, and rect height >= text height', () => {
        expect(isTextInRect({ width: 30, height: 50 }, { width: 20, height: 40 }, { rotate: false })).to.equal(true);
      });
    });

    describe('when rotate = true', () => {
      it('should return false if rect height < text width', () => {
        expect(isTextInRect({ width: 100, height: 20 }, { width: 30, height: 1 }, { rotate: true })).to.equal(false);
      });

      it('should return false if rect width < text height', () => {
        expect(isTextInRect({ width: 30, height: 20 }, { width: 10, height: 50 }, { rotate: true })).to.equal(false);
      });

      it('should return true if rect height >= text width, and rect width >= text height', () => {
        expect(isTextInRect({ width: 50, height: 30 }, { width: 20, height: 40 }, { rotate: true })).to.equal(true);
      });
    });
  });

  describe('place text in rect', () => {
    it('should wiggle a bit', () => {
      const label = placeTextInRect(
        {
          x: 5, y: 30, width: 100, height: 200
        },
        'a',
        { align: 0.25, fontSize: 12, textMetrics: { height: 10, width: 20 } }
      );
      expect(label.x).to.equal(25); // rectX + align * (rectWidth - metricWidth)
    });

    it('should justify a bit', () => {
      const label = placeTextInRect(
        {
          x: 5, y: 30, width: 100, height: 200
        },
        'a',
        { justify: 0.4, fontSize: 12, textMetrics: { height: 24, width: 40 } }
      );
      expect(label.y).to.equal(118);
    });

    it('should rotate the label', () => {
      const label = placeTextInRect(
        {
          x: 5, y: 30, width: 100, height: 200
        },
        'a',
        {
          rotate: true, align: 0, justify: 0.0, fontSize: 12, textMetrics: { height: 24, width: 40 }
        }
      );
      expect(label.transform).to.equal('rotate(-90, 21, 30)');
    });
  });

  describe('findBestPlacement', () => {
    const placements = [
      { position: 'inside' },
      { position: 'outside' },
      { position: 'biggest' },
      { position: 'meh' }
    ];
    const rects = {
      inside: {
        x: 10, y: 20, width: 1, height: 2
      },
      outside: {
        x: 10, y: 20, width: 5, height: 30
      },
      biggest: {
        x: 10, y: 20, width: 400, height: 300
      },
      meh: {
        x: 10, y: 20, width: 10, height: 20
      }
    };
    const barRect = opts => rects[opts.position];
    beforeEach(() => {
      // barRect = sinon.stub();
    });

    it('should find first placement that fits in a vertical bar', () => {
      let p = findBestPlacement({
        direction: '',
        fitsHorizontally: false,
        lblStngs: { fontSize: 2 },
        measured: { width: 29, height: 50 },
        node: {},
        orientation: 'v',
        placementSettings: placements,
        rect: {}
      }, barRect);
      expect(p.placement).to.equal(placements[1]);
      expect(p.bounds).to.equal(rects.outside);
    });

    it('should find first placement that fits in a vertical bar, horizontally', () => {
      let p = findBestPlacement({
        direction: '',
        fitsHorizontally: true,
        lblStngs: { fontSize: 2 },
        measured: { width: 10, height: 8 },
        node: {},
        orientation: 'v',
        placementSettings: placements,
        rect: {}
      }, barRect);
      expect(p.placement).to.equal(placements[1]);
      expect(p.bounds).to.equal(rects.outside);
    });

    it('should find first placement that fits in a horizontal bar', () => {
      let p = findBestPlacement({
        direction: '',
        lblStngs: { fontSize: 2 },
        measured: { width: 4, height: 8 },
        node: {},
        orientation: 'h',
        placementSettings: placements,
        rect: {}
      }, barRect);
      expect(p.placement).to.equal(placements[1]);
      expect(p.bounds).to.equal(rects.outside);
    });

    it('should find largest rect as fallback, horizontal', () => {
      let p = findBestPlacement({
        direction: '',
        lblStngs: { fontSize: 2 },
        measured: { width: 900, height: 800 },
        node: {},
        orientation: 'h',
        placementSettings: placements,
        rect: {}
      }, barRect);
      expect(p.placement).to.equal(placements[2]);
      expect(p.bounds).to.equal(rects.biggest);
    });

    it('should find largest rect as fallback, vertical', () => {
      let p = findBestPlacement({
        direction: '',
        lblStngs: { fontSize: 2 },
        measured: { width: 900, height: 800 },
        node: {},
        orientation: 'v',
        placementSettings: placements,
        rect: {}
      }, barRect);
      expect(p.placement).to.equal(placements[2]);
      expect(p.bounds).to.equal(rects.biggest);
    });
  });

  describe('placeInBars', () => {
    let chart;
    let findPlacement;
    let placer;

    beforeEach(() => {
      chart = {};
      findPlacement = sinon.stub();
      placer = sinon.stub();
    });

    it('should skip label when text is falsy', () => {
      let labels = placeInBars({
        chart,
        targetNodes: [{
          node: {},
          texts: [''],
          direction: 'up'
        }]
      }, findPlacement, placer);
      expect(findPlacement.callCount).to.equal(0);
      expect(labels.length).to.equal(0);
    });

    it('should skip label when placement is not possible', () => {
      findPlacement.returns({});
      let labels = placeInBars({
        chart,
        targetNodes: [{
          node: {},
          texts: ['a'],
          measurements: [],
          labelSettings: [{}],
          placementSettings: [{}],
          direction: 'up'
        }]
      }, findPlacement, placer);
      expect(placer.callCount).to.equal(0);
      expect(labels.length).to.equal(0);
    });

    it('should return label', () => {
      findPlacement.returns({
        bounds: 'bounds',
        placement: {
          fill: () => 'blue',
          justify: 0.2,
          position: 'opposite',
          align: 0.4
        }
      });
      placer = (a, b, c) => [a, b, c];
      let labels = placeInBars({
        chart,
        targetNodes: [{
          node: {},
          texts: ['a'],
          measurements: [2],
          labelSettings: [{ fontSize: '11px', fontFamily: 'bb' }],
          placementSettings: [{}],
          direction: 'right'
        }],
        collectiveOrientation: 'h'
      }, findPlacement, placer, postFilter);
      expect(labels).to.eql([['bounds', 'a', {
        fill: 'blue',
        justify: 0.4,
        align: 0.8,
        fontSize: '11px',
        fontFamily: 'bb',
        textMetrics: 2,
        rotate: false,
        overflow: false
      }]]);
    });

    it('should return label with background', () => {
      findPlacement.returns({
        bounds: {
          x: 0, y: 0, width: 10, height: 15
        },
        placement: {
          fill: () => 'blue',
          justify: 0.2,
          position: 'opposite',
          align: 0.4,
          background: {
            fill: 'gold',
            padding: {
              left: 2,
              right: 2,
              top: 2,
              bottom: 2
            }
          }
        }
      });
      placer = (a, b, c) => Object.assign({
        x: 0, y: 0, dx: 0, dy: 0
      }, c);
      let labels = placeInBars({
        chart,
        targetNodes: [{
          node: {},
          texts: ['a'],
          measurements: [{ width: 1, height: 2 }],
          labelSettings: [{ fontSize: '11px', fontFamily: 'bb' }],
          placementSettings: [{}],
          direction: 'right'
        }],
        collectiveOrientation: 'h'
      }, findPlacement, placer, postFilter);

      expect(labels[0]).to.containSubset({
        type: 'rect',
        rx: 2,
        ry: 2,
        x: -2.000000001,
        y: -3.600000001,
        width: 4.999999999,
        height: 5.999999999,
        fill: 'gold'
      });
      expect(labels[1]).to.containSubset({
        fill: 'blue',
        fontSize: '11px',
        fontFamily: 'bb',
        x: 0,
        y: 0,
        dx: 0,
        dy: 0
      });
    });

    it('should call placer with certain arguments', () => {
      findPlacement.returns({
        bounds: 'bounds',
        placement: {
          fill: 'blue',
          justify: 0.3,
          direction: 'left',
          align: 0.4
        }
      });
      placeInBars({
        chart,
        targetNodes: [{
          node: {},
          texts: ['a'],
          measurements: [2],
          labelSettings: [{ fontSize: '11px', fontFamily: 'bb' }],
          placementSettings: [{}],
          direction: 'left'
        }],
        collectiveOrientation: 'h'
      }, findPlacement, placer, postFilter);
      expect(placer.firstCall).to.have.been.calledWithExactly('bounds', 'a', {
        fill: 'blue',
        justify: 0.4,
        align: 0.7,
        fontSize: '11px',
        fontFamily: 'bb',
        textMetrics: 2,
        rotate: false,
        overflow: false
      });
    });
  });

  describe('bar strategy', () => {
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
        direction: () => 'right',
        align: 0.4,
        justify: 0.8,
        labels: [{
          placements: [{
            position: 'inside', justify: 0.2, align: 0.5, fill: () => 'red'
          }],
          label: () => 'etikett'
        }]
      };
      const nodes = [{
        localBounds: {
          x: 10, y: 20, width: 40, height: 50
        }
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = bars({
        settings,
        chart,
        nodes,
        rect: {
          x: 0, y: 0, width: 100, height: 200
        },
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
        maxWidth: 32,
        x: 16.4,
        y: 47.5,
        dx: 0,
        dy: 0,
        fill: 'red',
        anchor: 'start',
        baseline: 'alphabetical',
        fontSize: '16px',
        fontFamily: 'simpsons'
      });
    });

    it('should link data', () => {
      const settings = {
        direction: () => 'right',
        align: 0.4,
        justify: 0.8,
        labels: [{
          placements: [{
            position: 'inside', justify: 0.2, align: 0.5, fill: () => 'red'
          }],
          label: () => 'etikett',
          linkData: ({ data }) => data
        }]
      };
      const nodes = [{
        localBounds: {
          x: 10, y: 20, width: 40, height: 50
        },
        data: 1
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = bars({
        settings,
        chart,
        nodes,
        rect: {
          x: 0, y: 0, width: 100, height: 200
        },
        renderer,
        style: {}
      });

      expect(labels[0]).to.containSubset({
        data: 1
      });
    });

    it('should skip node if outside container', () => {
      const settings = {
        direction: () => 'right',
        align: 0.4,
        justify: 0.8,
        labels: [{
          placements: [{
            position: 'inside', justify: 0.2, align: 0.5, fill: () => 'red'
          }],
          label: () => 'etikett'
        }]
      };
      const nodes = [{
        localBounds: {
          x: -100, y: -200, width: 40, height: 50
        }
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = bars({
        settings,
        chart,
        nodes,
        rect: {
          x: 0, y: 0, width: 100, height: 200
        },
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

    it('should skip node if label is falsy', () => {
      const settings = {
        direction: () => 'right',
        align: 0.4,
        justify: 0.8,
        labels: [{
          placements: [{
            position: 'inside', justify: 0.2, align: 0.5, fill: () => 'red'
          }],
          label: () => ''
        }]
      };
      const nodes = [{
        localBounds: {
          x: 10, y: 20, width: 40, height: 50
        }
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = bars({
        settings,
        chart,
        nodes,
        rect: {
          x: 0, y: 0, width: 100, height: 200
        },
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
