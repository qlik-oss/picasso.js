import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import legendSeq from '../legend-seq';
import sequentialScale from '../../../scales/color/sequential';
import linearScale from '../../../scales/linear';

describe('Legend Sequential', () => {
  const ticksSelector = '[id="legend-seq-ticks"] text';
  const tickFillBoundarySelector = '[id="legend-seq-ticks"] rect';
  const titleSelector = '.legend-title';
  let componentFixture;
  let userDef;
  let container;
  let chartMock;
  let theme;

  function render() {
    componentFixture.simulateCreate(legendSeq, userDef);
    componentFixture.simulateRender(container);
  }

  beforeEach(() => {
    container = {
      inner: {
        x: 0, y: 0, width: 100, height: 100
      },
      outer: {
        x: 0, y: 0, width: 100, height: 100
      }
    };

    theme = {
      palette: () => ['rgb(180,221,212)', 'rgb(34, 83, 90)']
    };

    componentFixture = componentFactoryFixture();
    userDef = {
      layout: {},
      settings: {
        fill: 'fillScale',
        major: 'majorScale',
        title: {
          text: 'testing'
        }
      }
    };

    chartMock = componentFixture.mocks().chart;

    const seqScale = sequentialScale({}, null, { theme });
    seqScale.data = () => ({
      fields: [{ formatter: () => undefined }]
    });
    chartMock.scale.withArgs('fillScale').returns(seqScale);
    const linScale = linearScale();
    linScale.data = () => ({
      fields: [{ formatter: () => undefined, title: () => 'scaleTitle' }]
    });
    chartMock.scale.withArgs('majorScale').returns(linScale);
  });

  it('defaults', () => {
    render();

    const ticks = componentFixture.findNodes(ticksSelector);
    const title = componentFixture.findNodes(titleSelector)[0];
    const gradientNode = componentFixture.findNodes('rect')[0];

    expect(ticks[0]).to.include({
      x: 25,
      y: 15,
      dx: 0,
      dy: 0,
      text: 0,
      anchor: 'start',
      baseline: 'text-before-edge'
    });

    expect(ticks[1]).to.include({
      x: 25,
      y: 50,
      dx: 0,
      dy: 0,
      text: 1,
      anchor: 'start',
      baseline: 'text-after-edge'
    });

    expect(title).to.include({
      x: 5,
      y: 10,
      anchor: 'start',
      text: 'testing'
    });

    expect(gradientNode).to.include({
      x: 5,
      y: 15,
      width: 15,
      height: 35
    });

    expect(componentFixture.simulateLayout(container)).to.equal(31);
  });

  it('should support titles from scales', () => {
    userDef.settings.title = {};
    render();

    const title = componentFixture.findNodes(titleSelector)[0];

    expect(title).to.include({
      x: 5,
      y: 10,
      anchor: 'start',
      text: 'scaleTitle'
    });

    expect(componentFixture.simulateLayout(container)).to.equal(31);
  });

  describe('preferredSize', () => {
    beforeEach(() => {
      componentFixture.mocks().renderer.measureText = () => ({ width: 1000, height: 1000 });
    });

    it('should request to be hidden if tick labels are vertically overlapping', () => {
      userDef.layout.dock = 'left';
      userDef.settings.tick = { anchor: 'left' };
      componentFixture.simulateCreate(legendSeq, userDef);
      expect(componentFixture.simulateLayout(container)).to.equal(100); // Return cointainer width
    });

    it('should request to be hidden if tick labels are horizontallay overlapping', () => {
      userDef.layout.dock = 'top';
      userDef.settings.tick = { anchor: 'top' };
      componentFixture.simulateCreate(legendSeq, userDef);
      expect(componentFixture.simulateLayout(container)).to.equal(100); // Return cointainer height
    });
  });

  describe('Vertical layout', () => {
    beforeEach(() => {
      userDef.layout.dock = 'left';
    });

    it('should anchor ticks to the right', () => {
      userDef.settings.tick = { anchor: 'right' };
      render();
      const ticks = componentFixture.findNodes(ticksSelector);
      expect(ticks[0]).to.include({
        x: 25,
        y: 15,
        dx: 0,
        dy: 0,
        text: 0,
        anchor: 'start',
        baseline: 'text-before-edge'
      });

      expect(ticks[1]).to.include({
        x: 25,
        y: 50,
        dx: 0,
        dy: 0,
        text: 1,
        anchor: 'start',
        baseline: 'text-after-edge'
      });

      const fillBoundary = componentFixture.findNodes(tickFillBoundarySelector)[0];
      expect(fillBoundary).to.include({
        type: 'rect',
        width: 0,
        height: 35,
        fill: 'transparent',
        x: 20,
        y: 15
      });

      expect(componentFixture.simulateLayout(container)).to.equal(31);
    });

    it('should anchor ticks to the left', () => {
      userDef.settings.tick = { anchor: 'left' };
      render();
      const ticks = componentFixture.findNodes(ticksSelector);
      expect(ticks[0]).to.include({
        x: 75,
        y: 15,
        dx: 0,
        dy: 0,
        text: 0,
        anchor: 'end',
        baseline: 'text-before-edge'
      });

      expect(ticks[1]).to.include({
        x: 75,
        y: 50,
        dx: 0,
        dy: 0,
        text: 1,
        anchor: 'end',
        baseline: 'text-after-edge'
      });

      const fillBoundary = componentFixture.findNodes(tickFillBoundarySelector)[0];
      expect(fillBoundary).to.include({
        width: 0,
        height: 35,
        x: 80,
        y: 15
      });

      expect(componentFixture.simulateLayout(container)).to.equal(31);
    });

    it('should not render title node', () => {
      userDef.settings.title.show = false;
      render();

      expect(componentFixture.findNodes(titleSelector)).to.be.empty;
      expect(componentFixture.simulateLayout(container)).to.equal(31);
    });

    it('should support an inverted fill scale', () => {
      const scaleInstance = sequentialScale({ invert: true }, null, { theme });
      scaleInstance.sources = [];
      chartMock.scale.withArgs('fillScale').returns(scaleInstance);
      userDef.settings.tick = { anchor: 'right' };
      render();

      const gradientNode = componentFixture.findNodes('rect')[0];

      expect(gradientNode.fill).to.deep.equal({
        type: 'gradient',
        stops: [{
          color: 'rgb(34, 83, 90)',
          offset: 0,
          type: 'stop'
        },
        {
          color: 'rgb(180, 221, 212)',
          offset: 1,
          type: 'stop'
        }],
        degree: 90
      });
    });
  });

  describe('Horizontal layout', () => {
    beforeEach(() => {
      userDef.layout.dock = 'top';
    });

    it('should anchor ticks on the top', () => {
      userDef.settings.tick = { anchor: 'top' };
      render();
      const ticks = componentFixture.findNodes(ticksSelector);

      expect(ticks[0]).to.include({
        x: 39.5,
        y: 75,
        dx: 0,
        dy: -1.25,
        text: 0,
        anchor: 'start',
        baseline: 'alphabetical'
      });

      expect(ticks[1]).to.include({
        x: 72.5,
        y: 75,
        dx: 0,
        dy: -1.25,
        text: 1,
        anchor: 'end',
        baseline: 'alphabetical'
      });

      const fillBoundary = componentFixture.findNodes(tickFillBoundarySelector)[0];
      expect(fillBoundary).to.include({
        type: 'rect',
        width: 33,
        height: 0,
        fill: 'transparent',
        x: 39.5,
        y: 80
      });

      expect(componentFixture.simulateLayout(container)).to.equal(35);
    });

    it('should anchor ticks on the bottom', () => {
      userDef.settings.tick = { anchor: 'bottom' };
      render();
      const ticks = componentFixture.findNodes(ticksSelector);

      expect(ticks[0]).to.include({
        x: 39.5,
        y: 25,
        dx: 0,
        dy: 4,
        text: 0,
        anchor: 'start',
        baseline: 'alphabetical'
      });

      expect(ticks[1]).to.include({
        x: 72.5,
        y: 25,
        dx: 0,
        dy: 4,
        text: 1,
        anchor: 'end',
        baseline: 'alphabetical'
      });

      const fillBoundary = componentFixture.findNodes(tickFillBoundarySelector)[0];
      expect(fillBoundary).to.include({
        type: 'rect',
        width: 33,
        height: 0,
        fill: 'transparent',
        x: 39.5,
        y: 20
      });

      expect(componentFixture.simulateLayout(container)).to.equal(35);
    });

    it('should anchor title to the right', () => {
      userDef.settings.title.anchor = 'right';
      render();
      const ticks = componentFixture.findNodes(ticksSelector);
      const title = componentFixture.findNodes(titleSelector)[0];
      const gradientNode = componentFixture.findNodes('rect')[0];

      expect(ticks[0]).to.include({
        x: 27.5,
        y: 75,
        dx: 0,
        dy: -1.25,
        text: 0,
        anchor: 'start',
        baseline: 'alphabetical'
      });

      expect(ticks[1]).to.include({
        x: 60.5,
        y: 75,
        dx: 0,
        dy: -1.25,
        text: 1,
        anchor: 'end',
        baseline: 'alphabetical'
      });

      expect(title).to.include({
        x: 65.5,
        y: 95,
        anchor: 'start'
      });

      expect(gradientNode).to.include({
        x: 27.5,
        y: 80,
        width: 33,
        height: 15
      });

      expect(componentFixture.simulateLayout(container)).to.equal(35);
    });

    it('should not render title', () => {
      userDef.settings.title.show = false;
      render();

      expect(componentFixture.findNodes(titleSelector)).to.be.empty;
      expect(componentFixture.simulateLayout(container)).to.equal(35);
    });

    it('should support an inverted fill scale', () => {
      const scaleInstance = sequentialScale({ invert: true });
      scaleInstance.sources = [];
      componentFixture.mocks().chart.scale.returns(scaleInstance);
      userDef.settings.tick = { anchor: 'top' };
      render();

      const gradientNode = componentFixture.findNodes('rect')[0];

      expect(gradientNode.fill).to.deep.equal({
        type: 'gradient',
        stops: [{
          color: 'rgb(180, 221, 212)',
          offset: 0,
          type: 'stop'
        },
        {
          color: 'rgb(34, 83, 90)',
          offset: 1,
          type: 'stop'
        }],
        degree: 180
      });
    });
  });
});
