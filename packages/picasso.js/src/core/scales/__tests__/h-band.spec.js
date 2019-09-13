import { hierarchy } from 'd3-hierarchy';
import hBand from '../h-band';


describe('Hierarchical band scale', () => {
  const childGen = (d) => ({ value: d });
  let scale;
  let data;
  let settings;

  beforeEach(() => {
    const leftChildren = ['A', 'B', 'C'].map(childGen);
    const rightChildren = ['D', 'E'].map(childGen);
    data = {
      root: hierarchy({
        value: 'root',
        children: [{
          value: 'left',
          children: leftChildren
        },
        {
          value: 'right',
          children: rightChildren
        }]
      })
    };

    settings = {};
  });

  describe('domain', () => {
    it('should have empty domain as default', () => {
      scale = hBand();
      expect(scale.domain()).to.deep.equal([]);
      expect(scale.range()).to.deep.equal([0, 1]);
    });

    it('should set domain to leaf nodes and inject spacer values for each branch node', () => {
      scale = hBand(settings, data);
      expect(scale.domain()).to.deep.equal(['left,A', 'left,B', 'left,C', 'SPACER_0_SPACER', 'right,D', 'right,E']);
    });
  });

  describe('range', () => {
    it('should use a normalized range', () => {
      scale = hBand(settings, data);
      expect(scale.range()).to.deep.equal([0, 1]);
    });

    it('should support invert', () => {
      settings.invert = true;
      scale = hBand(settings, data);
      expect(scale.range()).to.deep.equal([1, 0]);
    });
  });

  describe('labels', () => {
    it('should return labels for leaf nodes', () => {
      scale = hBand(settings, data);
      expect(scale.labels()).to.deep.equal(['A', 'B', 'C', 'D', 'E']);
    });
  });

  describe('bandwidth', () => {
    it('should return correct bandwidth for leaf nodes', () => {
      scale = hBand(settings, data);
      expect(scale.bandwidth()).to.approximately(0.166, 0.001);
      expect(scale.bandwidth(['left', 'B'])).to.approximately(0.166, 0.001);
    });

    it('should return correct bandwidth for a branch node', () => {
      scale = hBand(settings, data);
      expect(scale.bandwidth(['left'])).to.approximately(0.500, 0.001);
      expect(scale.bandwidth(['right'])).to.approximately(0.333, 0.001);
    });

    it('should return leaf node bandwidth for unkown input', () => {
      scale = hBand(settings, data);
      expect(scale.bandwidth(['unknown'])).to.approximately(0.166, 0.001);
    });
  });

  describe('step', () => {
    it('should return correct step size for leaf nodes', () => {
      scale = hBand(settings, data);
      expect(scale.step()).to.approximately(0.166, 0.001);
      expect(scale.step(['left', 'B'])).to.approximately(0.166, 0.001);
    });

    it('should return correct step size for a branch nodes', () => {
      scale = hBand(settings, data);
      expect(scale.step(['left'])).to.approximately(0.500, 0.001);
      expect(scale.step(['right'])).to.approximately(0.333, 0.001);
    });

    it('should return leaf node step size for unknown input', () => {
      scale = hBand(settings, data);
      expect(scale.step(['unknown'])).to.approximately(0.166, 0.001);
    });
  });

  describe('value', () => {
    it('should return correct value for a leaf node', () => {
      scale = hBand(settings, data);
      expect(scale(['left', 'C'])).to.approximately(0.333, 0.001);
      expect(scale(['right', 'D'])).to.approximately(0.666, 0.001);
    });

    it('should return correct value for a branch node', () => {
      scale = hBand(settings, data);
      expect(scale(['left'])).to.equal(0);
      expect(scale(['right'])).to.approximately(0.666, 0.001);
    });

    it('should handle unknown input', () => {
      scale = hBand(settings, data);
      expect(scale(['unkown'])).to.equal(undefined);
    });

    it('should return correct value when inverted', () => {
      settings.invert = true;
      scale = hBand(settings, data);
      expect(scale(['left', 'C'])).to.approximately(0.5, 0.001);
      expect(scale(['right', 'D'])).to.approximately(0.166, 0.001);
    });
  });

  describe('datum', () => {
    it('should return node data value', () => {
      scale = hBand(settings, data);
      expect(scale.datum(['left', 'C'])).to.deep.equal({ value: 'C' });
      expect(scale.datum(['right', 'D'])).to.deep.equal({ value: 'D' });
      expect(scale.datum(['right'])).to.deep.include({ value: 'right' });
    });

    it('should handle unknown input', () => {
      scale = hBand(settings, data);
      expect(scale.datum(['left', 'unknown'])).to.equal(null);
    });
  });

  describe('ticks', () => {
    it('should by default return ticks for each leaf node', () => {
      scale = hBand(settings, data);
      const ticks = scale.ticks();
      expect(ticks).to.be.of.length(5);

      expect(ticks[0].label).to.equal('A');
      expect(ticks[0].data).to.deep.equal({ value: 'A' });
      expect(ticks[0].start).to.approximately(0, 0.001);
      expect(ticks[0].position).to.approximately(0.083, 0.001);
      expect(ticks[0].end).to.approximately(0.166, 0.001);

      expect(ticks[1].label).to.equal('B');
      expect(ticks[1].data).to.deep.equal({ value: 'B' });
      expect(ticks[1].start).to.approximately(0.166, 0.001);
      expect(ticks[1].position).to.approximately(0.25, 0.001);
      expect(ticks[1].end).to.approximately(0.333, 0.001);

      expect(ticks[2].label).to.equal('C');
      expect(ticks[2].data).to.deep.equal({ value: 'C' });
      expect(ticks[2].start).to.approximately(0.333, 0.001);
      expect(ticks[2].position).to.approximately(0.416, 0.001);
      expect(ticks[2].end).to.approximately(0.5, 0.001);

      expect(ticks[3].label).to.equal('D');
      expect(ticks[3].data).to.deep.equal({ value: 'D' });
      expect(ticks[3].start).to.approximately(0.666, 0.001);
      expect(ticks[3].position).to.approximately(0.75, 0.001);
      expect(ticks[3].end).to.approximately(0.833, 0.001);

      expect(ticks[4].label).to.equal('E');
      expect(ticks[4].data).to.deep.equal({ value: 'E' });
      expect(ticks[4].start).to.approximately(0.833, 0.001);
      expect(ticks[4].position).to.approximately(0.916, 0.001);
      expect(ticks[4].end).to.approximately(0.999, 0.001);
    });

    it('should return ticks at depth', () => {
      settings.ticks = { depth: 1 };
      scale = hBand(settings, data);
      const ticks = scale.ticks();
      expect(ticks).to.be.of.length(2);

      expect(ticks[0].label).to.equal('left');
      expect(ticks[0].data.value).to.equal('left');
      expect(ticks[0].start).to.approximately(0, 0.001);
      expect(ticks[0].position).to.approximately(0.25, 0.001);
      expect(ticks[0].end).to.approximately(0.5, 0.001);

      expect(ticks[1].label).to.equal('right');
      expect(ticks[1].data.value).to.equal('right');
      expect(ticks[1].start).to.approximately(0.666, 0.001);
      expect(ticks[1].position).to.approximately(0.833, 0.001);
      expect(ticks[1].end).to.approximately(1, 0.001);
    });
  });

  describe('pxScale', () => {
    it('with start align should adjust correctly for leaf nodes', () => {
      settings.maxPxStep = 10;
      settings.padding = 0;
      settings.align = 0;
      scale = hBand(settings, data);
      const pxScale = scale.pxScale(100);

      expect(pxScale.step()).to.approximately(0.1, 0.000001);
      expect(pxScale.bandwidth()).to.approximately(0.1, 0.000001);
      expect(pxScale(['left', 'A'])).to.equals(0.0);
      expect(pxScale(['right', 'D'])).to.approximately(0.4, 0.000001);
    });

    it('with start align should adjust correctly for branch nodes', () => {
      settings.maxPxStep = 10;
      settings.padding = 0;
      settings.align = 0;
      scale = hBand(settings, data);
      const pxScale = scale.pxScale(100);

      expect(pxScale.step(['left'])).to.approximately(0.1 * 3, 0.000001);
      expect(pxScale.bandwidth(['left'])).to.approximately(0.1 * 3, 0.000001);
      expect(pxScale(['left'])).to.equals(0.0);
      expect(pxScale(['right'])).to.approximately(0.4, 0.000001);
    });

    it('with padding should adjust correctly for leaf nodes', () => {
      settings.maxPxStep = 10;
      settings.padding = 0.5;
      scale = hBand(settings, data);
      const pxScale = scale.pxScale(100);

      expect(pxScale.step()).to.approximately(0.1, 0.000001);
      expect(pxScale.bandwidth()).to.approximately(0.05, 0.000001);
      expect(pxScale(['left', 'A'])).to.approximately(0.225, 0.000001);
      expect(pxScale(['right', 'D'])).to.approximately(0.625, 0.000001);
    });

    it('with padding should adjust correctly for branch nodes', () => {
      settings.maxPxStep = 10;
      settings.padding = 0.5;
      scale = hBand(settings, data);
      const pxScale = scale.pxScale(100);

      expect(pxScale.step(['left'])).to.approximately(0.1 * 3, 0.000001);
      expect(pxScale.bandwidth(['left'])).to.approximately((0.1 * 3) - 0.05, 0.000001); // Leaf node step size * 3 leaf nodes - padding
      expect(pxScale(['left'])).to.approximately(0.225, 0.000001);
      expect(pxScale(['right'])).to.approximately(0.625, 0.000001);
    });
  });
});
