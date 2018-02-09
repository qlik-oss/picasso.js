import {
  getBarRect,
  placeTextInRect,
  // precalculate,
  placeInBars,
  findBestPlacement,
  bars
} from '../../../../../src/core/chart-components/labels/strategies';

function place(position, direction) {
  return getBarRect({
    bar: { x: 10, y: 40, width: 20, height: 30 },
    view: { width: 200, height: 100 },
    direction,
    position,
    padding: 2
  });
}

describe('labeling - bars', () => {
  describe('bar rects', () => {
    it('inside', () => {
      expect(place('inside')).to.eql({ x: 12, y: 42, width: 16, height: 26 });
    });

    it('outside-up/opposite-down', () => {
      expect(place('outside', 'up')).to.eql({ x: 12, y: 2, width: 16, height: 36 });
      expect(place('opposite', 'down')).to.eql({ x: 12, y: 2, width: 16, height: 36 });
    });

    it('outside-down/opposite-up', () => {
      expect(place('outside', 'down')).to.eql({ x: 12, y: 72, width: 16, height: 26 });
      expect(place('opposite', 'up')).to.eql({ x: 12, y: 72, width: 16, height: 26 });
    });

    it('outside-right/opposite-left', () => {
      expect(place('outside', 'right')).to.eql({ x: 32, y: 42, width: 166, height: 26 });
      expect(place('opposite', 'left')).to.eql({ x: 32, y: 42, width: 166, height: 26 });
    });

    it('outside-left/opposite-right', () => {
      expect(place('outside', 'left')).to.eql({ x: 2, y: 42, width: 6, height: 26 });
      expect(place('opposite', 'right')).to.eql({ x: 2, y: 42, width: 6, height: 26 });
    });
  });

  describe('place text in rect', () => {
    it('should return false when text doesn\'t fit', () => {
      const whenTooNarrow = placeTextInRect(
        { width: 9, height: 20 },
        '',
        { fontSize: 10, textMetrics: { height: 15 } }
      );
      const whenTooSmall = placeTextInRect(
        { width: 15, height: 20 },
        '',
        { fontSize: 10, textMetrics: { height: 30 } }
      );
      expect(whenTooNarrow).to.equal(false);
      expect(whenTooSmall).to.equal(false);
    });

    it('should wiggle a bit', () => {
      const label = placeTextInRect(
        { x: 5, y: 30, width: 100, height: 200 },
        'a',
        { align: 0.25, fontSize: 12, textMetrics: { height: 10, width: 20 } }
      );
      expect(label.x).to.equal(25); // rectX + align * (rectWidth - metricWidth)
    });

    it('should justify a bit', () => {
      const label = placeTextInRect(
        { x: 5, y: 30, width: 100, height: 200 },
        'a',
        { justify: 0.4, fontSize: 12, textMetrics: { height: 24, width: 40 } }
      );
      expect(label.y).to.equal(118);
    });

    it('should rotate the label', () => {
      const label = placeTextInRect(
        { x: 5, y: 30, width: 100, height: 200 },
        'a',
        { rotate: true, align: 0, justify: 0.0, fontSize: 12, textMetrics: { height: 24, width: 40 } }
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
      inside: { x: 10, y: 20, width: 1, height: 2 },
      outside: { x: 10, y: 20, width: 5, height: 30 },
      biggest: { x: 10, y: 20, width: 400, height: 300 },
      meh: { x: 10, y: 20, width: 10, height: 20 }
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
        nodes: [{}],
        texts: [['']],
        directions: ['up']
      }, findPlacement, placer);
      expect(findPlacement.callCount).to.equal(0);
      expect(labels.length).to.equal(0);
    });

    it('should skip label when placement is not possible', () => {
      findPlacement.returns({});
      let labels = placeInBars({
        chart,
        nodes: [{}],
        texts: [['a']],
        measurements: [[]],
        labelSettings: [{}],
        placementSettings: [{}],
        directions: ['up']
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
        nodes: [{}],
        texts: [['a']],
        measurements: [[2]],
        labelSettings: [{ fontSize: '11px', fontFamily: 'bb' }],
        placementSettings: [{}],
        directions: ['right'],
        collectiveOrientation: 'h'
      }, findPlacement, placer);
      expect(labels).to.eql([['bounds', 'a', {
        fill: 'blue',
        justify: 0.4,
        align: 0.8,
        fontSize: '11px',
        fontFamily: 'bb',
        textMetrics: 2,
        rotate: false
      }]]);
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
          placements: [{ position: 'inside', justify: 0.2, align: 0.5, fill: () => 'red' }],
          label: () => 'etikett'
        }]
      };
      const nodes = [{
        localBounds: { x: 10, y: 20, width: 40, height: 50 }
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = bars({
        settings,
        chart,
        nodes,
        rect: { x: 0, y: 0, width: 100, height: 200 },
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
  });
});
