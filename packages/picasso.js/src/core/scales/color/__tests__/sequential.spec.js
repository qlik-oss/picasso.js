import sequential from '../sequential';

describe('Sequential', () => {
  let seq;
  let theme;
  beforeEach(() => {
    seq = sequential();
    theme = {
      palette: sinon.stub()
    };
    theme.palette.withArgs('sequential').returns(['rgb(180,221,212)', 'rgb(34, 83, 90)']);
  });

  describe('Basic colors', () => {
    let min = 0;
    let max = 100;
    let settings = {};
    const fields = [{ min: () => min, max: () => max }];

    beforeEach(() => {
      min = 0;
      max = 100;
      settings = {};
    });
    it('default settings', () => {
      seq = sequential({}, null, { theme });
      expect(seq.domain()).to.deep.equal([0, 1]);
      expect(seq.range()).to.deep.equal(['rgb(180,221,212)', 'rgb(34, 83, 90)']);
    });

    it('max/min settings', () => {
      settings.min = 20;
      settings.max = 100;
      seq = sequential(settings, null, { theme });
      expect(seq.domain()).to.deep.equal([20, 100]);
      expect(seq.range()).to.deep.equal(['rgb(180,221,212)', 'rgb(34, 83, 90)']);
    });

    it('invalid max/min settings', () => {
      settings.min = 'oops';
      settings.max = 'ooooops';
      seq = sequential(settings);
      expect(seq.domain()).to.deep.equal([0, 1]);
    });

    it('only fields', () => {
      seq = sequential({}, { fields }, { theme });
      expect(seq.domain()).to.deep.equal([0, 100]);
      expect(seq.range()).to.deep.equal(['rgb(180,221,212)', 'rgb(34, 83, 90)']);
    });

    it('should invert scale', () => {
      seq = sequential({ invert: true }, { fields }, { theme });
      expect(seq.domain()).to.deep.equal([0, 100]);
      expect(seq.range()).to.deep.equal(['rgb(34, 83, 90)', 'rgb(180,221,212)']);
    });

    it('invalid max/min on fields', () => {
      fields[0].min = () => 'oops';
      fields[0].max = () => 'ooops';
      seq = sequential({}, { fields });
      expect(seq.domain()).to.deep.equal([0, 1]);
    });

    it('should scale two rgb colors', () => {
      const c = seq.domain([0, 1]).range(['red', 'blue'])(0.5);
      expect(c).to.equal('rgb(128, 0, 128)');
    });

    it('should scale two hsl colors', () => {
      const c = seq.domain([0, 1]).range(['hsl(120,50%,10%)', 'hsl(360,100%,50%)'])(0.5);
      expect(c).to.equal('rgb(134, 19, 6)');
    });

    it('should scale rgb color to a hsl color', () => {
      const c = seq.domain([0, 1]).range(['blue', 'hsl(360,100%,50%)'])(0.5);
      expect(c).to.equal('rgb(128, 0, 128)');
    });

    it('should scale hsl color to a rgb color', () => {
      const c = seq.domain([0, 1]).range(['hsl(360,100%,50%)', 'blue'])(0.5);
      expect(c).to.equal('rgb(128, 0, 128)');
    });

    it('should scale a single color over lightness', () => {
      seq.domain([0, 1]).range(['hsl(0, 100%, 20%)', 'hsl(0, 100%, 80%)']);
      expect(seq(0)).to.equal('rgb(102, 0, 0)');
      expect(seq(1)).to.equal('rgb(255, 153, 153)');
    });

    it('should scale a single color over lightness when using classify', () => {
      seq.domain([0, 1]).range(['hsl(0, 100%, 20%)', 'hsl(0, 100%, 80%)']).classify(4);
      expect(seq(0)).to.equal('rgb(121, 19, 19)'); // First interval
      expect(seq(0.2)).to.equal('rgb(121, 19, 19)');
      expect(seq(0.5)).to.equal('rgb(198, 96, 96)'); // Second interval
      expect(seq(0.6)).to.equal('rgb(198, 96, 96)');
      expect(seq(0.75)).to.equal('rgb(236, 134, 134)'); // Thrid interval
      expect(seq(0.85)).to.equal('rgb(236, 134, 134)');
      expect(seq(0.90)).to.equal('rgb(236, 134, 134)'); // Fourth interval
      expect(seq(1)).to.equal('rgb(236, 134, 134)');
    });

    it('should clamp colors', () => {
      settings.min = 50;
      settings.max = 60;
      settings.range = ['rgb(100, 0, 0)', 'rgb(0, 0, 100)'];
      seq = sequential(settings);
      expect(seq(40)).to.deep.equal('rgb(100, 0, 0)');
      expect(seq(70)).to.deep.equal('rgb(0, 0, 100)');
    });
  });

  describe('Generate limits', () => {
    let min = 0;
    let max = 100;
    let settings = {};
    const fields = [{ min: () => min, max: () => max }];

    beforeEach(() => {
      min = 0;
      max = 100;
      settings = {};
    });
    it('should add limits if missing', () => {
      settings.range = ['red', 'green', 'blue'];
      seq = sequential(settings, { fields });
      expect(seq.domain()).to.deep.equal([0, 50, 100]);
    });

    it('should use input range if exists', () => {
      settings.range = ['red', 'green', 'blue'];
      settings.domain = [0, 25, 100];
      seq = sequential(settings, { fields });
      expect(seq.domain()).to.deep.equal([0, 25, 100]);
    });
    it('should generate more limits', () => {
      settings.range = ['red', 'green', 'blue', 'purple', 'yellow', 'magenta', 'pink', 'azure', 'black', 'white', 'brown'];
      seq = sequential(settings, { fields });
      expect(seq.domain()).to.deep.equal([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    });
  });
});
