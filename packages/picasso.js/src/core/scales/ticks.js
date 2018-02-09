export default {
  niceNum(v, round) {
    let sign = v >= 0 ? 1 : -1,
      exp = Math.floor(Math.log(Math.abs(v)) / Math.log(10)),
      f = Math.abs(v) / Math.pow(10, exp),
      nf = 1;

    if (round) {
      if (f < 1.5) {
        nf = 1;
      } else if (f < 3) {
        nf = 2;
      } else if (f < 7) {
        nf = 5;
      } else {
        nf = 10;
      }
    } else if (f <= 1) {
      nf = 1;
    } else if (f <= 2) {
      nf = 2;
    } else if (f <= 5) {
      nf = 5;
    } else {
      nf = 10;
    }
    return sign * nf * Math.pow(10, exp);
  },
  generateTicks(start, end, nTicks = 2, round = false) {
    let nfrac,
      d,
      graphmin,
      graphmax,
      range,
      max = Math.max(start, end),
      min = Math.min(start, end),
      ticks = [];

    range = this.niceNum(max - min, round);
    d = this.niceNum(range / Math.max(1, (nTicks - 1)), true);
    graphmin = Math.floor(min / d) * d;
    graphmax = Math.ceil(max / d) * d;
    nfrac = Math.max(-Math.floor(Math.log(d) / Math.log(10)), 0);
    for (let v = graphmin; v < graphmax + (0.5 * d); v += d) {
      ticks.push(v);
    }
    if (start > end) {
      [graphmin, graphmax] = [graphmax, graphmin];
      ticks.reverse();
    }
    return {
      start: graphmin,
      end: graphmax,
      nfrac,
      ticks
    };
  }
};
