import linear from '../linear';

describe('LinearScale', () => {
  let lin;
  beforeEach(() => {
    lin = linear();
  });

  it('should have 0-1 as defaults', () => {
    expect(lin.domain()).to.deep.equal([0, 1]);
    expect(lin.range()).to.deep.equal([0, 1]);
  });

  it('should have min/max depend on domain', () => {
    lin.domain([-13, 17]);
    expect(lin.min()).to.equal(-13);
    expect(lin.max()).to.equal(17);

    lin.domain([17, -13]);
    expect(lin.min()).to.equal(-13);
    expect(lin.max()).to.equal(17);
  });

  it('should have start/end depend on domain', () => {
    lin.domain([-10, 0, 1, 5]).range([1, 2, 3, 4]);
    expect(lin.start()).to.equal(-10);
    expect(lin.end()).to.equal(5);

    lin.domain([5, 1, 0, -10]).range([1, 2, 3, 4]);
    expect(lin.start()).to.equal(5);
    expect(lin.end()).to.equal(-10);
  });

  it('should return a linearly interpolated value', () => {
    lin.domain([-10, 10]).range([10, 20]);
    expect(lin(-10)).to.equal(10);
    expect(lin(10)).to.equal(20);
    expect(lin(0)).to.equal(15);
  });

  it('should return a inverted linearly interpolated value', () => {
    lin.domain([-10, 10]).range([10, 20]);
    expect(lin.invert(10)).to.equal(-10);
    expect(lin.invert(20)).to.equal(10);
    expect(lin.invert(15)).to.equal(0);
  });

  it('should return a rounded linearly interpolated value', () => {
    lin.domain([-10, 10]).rangeRound([-2, 2]);
    expect(lin(8)).to.equal(2);
    expect(lin(3)).to.equal(1);
    expect(lin(-3)).to.equal(-1);
  });

  it('should support a nice domain start/end value', () => {
    lin.domain([0.201479, 0.996679]).nice(10);
    expect(lin.start()).to.equal(0.2);
    expect(lin.end()).to.equal(1);
  });

  it('should return a linearly interpolated value with negative range', () => {
    lin.domain([10, -10]).range([100, 200]);
    expect(lin(10)).to.equal(100);
    expect(lin(-10)).to.equal(200);
    expect(lin(2)).to.equal(140);
  });

  it('should support clamping a linearly interpolated value', () => {
    lin
      .domain([-10, 10])
      .range([10, 20])
      .clamp(true);
    expect(lin(-100)).to.equal(10);
    expect(lin(100)).to.equal(20);
  });

  it('should return a ticks representation of the interpolated value', () => {
    lin.domain([-10, 10]).range([10, 20]);
    expect(lin.ticks(5)).to.deep.equal([-10, -5, 0, 5, 10]);
    expect(lin.ticks(2)).to.deep.equal([-10, 0, 10]);
    expect(lin.ticks(10)).to.deep.equal([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10]);
  });

  it('should support piecewise linear values', () => {
    lin.domain([5, 10, 20]).range([1, 0, -5]);
    expect(lin(5)).to.equal(1);
    expect(lin(10)).to.equal(0);
    expect(lin(20)).to.equal(-5);

    expect(lin(0)).to.equal(2);
    expect(lin(30)).to.equal(-10);
  });

  it('should support piecewise linear values with negative range', () => {
    lin.domain([10, 5, 0, -1]).range([100, 200, 300, 400]);
    expect(lin(10)).to.equal(100);
    expect(lin(6)).to.equal(180);
    expect(lin(4)).to.equal(220);
    expect(lin(-0.5)).to.equal(350);

    expect(lin(15)).to.equal(0);
    expect(lin(-2)).to.equal(500);
  });

  it('should support grouping values', () => {
    lin
      .domain([-10, 10])
      .range([-100, 100])
      .classify(5);
    expect(lin.domain().length).to.equal(10);
    expect(lin.range().length).to.equal(10);
    expect(lin(-10)).to.equal(-80);
    expect(lin(10)).to.equal(80);
  });

  it('should support grouping negative values', () => {
    lin
      .domain([-20, -10])
      .range([-200, -100])
      .classify(2);
    expect(lin.domain().length).to.equal(4);
    expect(lin.range().length).to.equal(4);
    expect(lin(-20)).to.equal(-175);
    expect(lin(-10)).to.equal(-125);
  });

  it('should support grouping a negative value range', () => {
    lin
      .domain([10, -10])
      .range([-100, 100])
      .classify(2);
    expect(lin.domain().length).to.equal(4);
    expect(lin.range().length).to.equal(4);
    expect(lin(10)).to.equal(-50);
    expect(lin(-10)).to.equal(50);
  });

  describe('norm', () => {
    it('should output a normalized value', () => {
      lin.domain([0, 10]).range([0, 100]);
      expect(lin.norm(5)).to.equal(0.5);
    });

    it('should support piecewise linear values', () => {
      lin.domain([0, 3, 10]).range([0, 50, 100]);
      expect(lin.norm(2)).to.equal(0.2);
    });

    it('should always clamp output', () => {
      lin.domain([0, 10]).range([0, 100]);
      expect(lin.norm(20)).to.equal(1);
    });

    it('should sync domain changes', () => {
      expect(lin.norm(0.5)).to.equal(0.5); // Assuming default domain [0, 1]
      lin.domain([0, 10]).range([0, 100]);
      expect(lin.norm(5)).to.equal(0.5);
    });
  });

  describe('normInvert', () => {
    it('should output a inverted value', () => {
      lin.domain([0, 10]).range([0, 100]);
      expect(lin.normInvert(0.5)).to.equal(5);
    });

    it('should support piecewise linear values', () => {
      lin.domain([0, 3, 10]).range([0, 50, 100]);
      expect(lin.normInvert(0.2)).to.equal(2);
    });

    it('should always clamp output', () => {
      lin.domain([0, 3, 10]).range([0, 50, 100]);
      expect(lin.normInvert(1.5)).to.equal(10);
    });

    it('should sync domain changes', () => {
      expect(lin.normInvert(0.5)).to.equal(0.5); // Assuming default domain [0, 1]
      lin.domain([0, 10]).range([0, 100]);
      expect(lin.normInvert(0.5)).to.equal(5);
    });
  });

  describe('Color Scale', () => {
    it('should scale two rgb colors', () => {
      const c = lin.domain([0, 1]).range(['red', 'blue'])(0.5);
      expect(c).to.equal('rgb(128, 0, 128)');
    });

    it('should scale two hsl colors', () => {
      const c = lin.domain([0, 1]).range(['hsl(120,50%,10%)', 'hsl(360,100%,50%)'])(0.5);
      expect(c).to.equal('rgb(134, 19, 6)');
    });

    it('should scale rgb color to a hsl color', () => {
      const c = lin.domain([0, 1]).range(['blue', 'hsl(360,100%,50%)'])(0.5);
      expect(c).to.equal('rgb(128, 0, 128)');
    });

    it('should scale hsl color to a rgb color', () => {
      const c = lin.domain([0, 1]).range(['hsl(360,100%,50%)', 'blue'])(0.5);
      expect(c).to.equal('rgb(128, 0, 128)');
    });

    it('should scale a single color over lightness', () => {
      lin.domain([0, 1]).range(['hsl(0, 100%, 20%)', 'hsl(0, 100%, 80%)']);
      expect(lin(0)).to.equal('rgb(102, 0, 0)');
      expect(lin(1)).to.equal('rgb(255, 153, 153)');
    });

    it('should scale a single color over lightness when using classify', () => {
      lin
        .domain([0, 1])
        .range(['hsl(0, 100%, 20%)', 'hsl(0, 100%, 80%)'])
        .classify(4);
      expect(lin(0)).to.equal('rgb(121, 19, 19)'); // First interval
      expect(lin(0.2)).to.equal('rgb(121, 19, 19)');
      expect(lin(0.5)).to.equal('rgb(198, 96, 96)'); // Second interval
      expect(lin(0.6)).to.equal('rgb(198, 96, 96)');
      expect(lin(0.75)).to.equal('rgb(236, 134, 134)'); // Thrid interval
      expect(lin(0.85)).to.equal('rgb(236, 134, 134)');
      expect(lin(0.9)).to.equal('rgb(236, 134, 134)'); // Fourth interval
      expect(lin(1)).to.equal('rgb(236, 134, 134)');
    });
  });
});
