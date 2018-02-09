import parse from '../../src/parse-path';

describe('parse', () => {
  // https://www.w3.org/TR/SVG/paths.html#PathDataGeneralInformation
  let path = '';
  let ary;

  beforeEach(() => {
    path = '';
    ary = [];
  });

  it('path data segement must begin with a moveTo command', () => {
    path = 'L3 4 L5 6';
    ary = parse(path);
    expect(ary).to.deep.equal([]);
  });

  it(' should join multiple commands', () => {
    path = 'M1 2 L3 4 Q5 6 7 8 Z';
    ary = parse(path);
    expect(ary).to.deep.equal([
      ['M', 1, 2],
      ['L', 3, 4],
      ['Q', 5, 6, 7, 8],
      ['Z']
    ]);
  });

  it('should be possible to chain command parameters', () => {
    path = 'M0 0 L 1 2 3 4';
    ary = parse(path);
    expect(ary).to.deep.equal([
      ['M', 0, 0],
      ['L', 1, 2],
      ['L', 3, 4]
    ]);

    path = 'M0 0 L 1 2 3 4 5'; // Only accept pairs
    ary = parse(path);
    expect(ary).to.deep.equal([
      ['M', 0, 0],
      ['L', 1, 2],
      ['L', 3, 4]
    ]);
  });

  it('superfluous white space and separators such as commas can be eliminated', () => {
    path = 'M0 0 L ,1 ,2';
    ary = parse(path);
    expect(ary).to.deep.equal([
      ['M', 0, 0],
      ['L', 1, 2]
    ]);

    path = 'M0 0 L    1    2';
    ary = parse(path);
    expect(ary).to.deep.equal([
      ['M', 0, 0],
      ['L', 1, 2]
    ]);
  });

  it('should discard invalid commands', () => {
    path = 'M 0 0 L 1 2, M3 4 Ö5, L 7 8';
    ary = parse(path);
    expect(ary).to.deep.equal([
      ['M', 0, 0],
      ['L', 1, 2],
      ['M', 3, 4],
      ['L', 7, 8]
    ]);

    path = 'M 0 0 L1 2, L3 4 Ö5 6, L7 8';
    ary = parse(path);
    expect(ary).to.deep.equal([
      ['M', 0, 0],
      ['L', 1, 2],
      ['L', 3, 4],
      ['L', 5, 6], // Should not do this and instead ignore this command as well?
      ['L', 7, 8]
    ]);
  });

  describe('moveTo', () => {
    it('M', () => {
      path = 'M123 456';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 123, 456]
      ]);
    });

    it('m', () => {
      path = 'm123 456';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['m', 123, 456]
      ]);
    });

    it('subsequent pairs are treated as implicit lineTo commands', () => {
      path = 'M1 2 3 4';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 1, 2],
        ['L', 3, 4]
      ]);

      path = 'm1 2 3 4';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['m', 1, 2],
        ['l', 3, 4]
      ]);

      path = 'm1 2 3'; // Invalid length on subsequnt paramaters
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['m', 1, 2]
      ]);
    });

    it('exceed max parameters', () => {
      path = 'M 1 2 3';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 1, 2]
      ]);
    });

    it('below parameter limit', () => {
      path = 'M 1';
      ary = parse(path);
      expect(ary).to.deep.equal([]);
    });
  });

  describe('lineTo', () => {
    it('L', () => {
      path = 'M0 0 L123 456 L 987 6';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['L', 123, 456],
        ['L', 987, 6]
      ]);
    });

    it('l', () => {
      path = 'M0 0 l123 456 l 987 6';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['l', 123, 456],
        ['l', 987, 6]
      ]);
    });

    it('V', () => {
      path = 'M0 0 V1 V2';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['V', 1],
        ['V', 2]
      ]);
    });

    it('v', () => {
      path = 'M0 0 v1 v2';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['v', 1],
        ['v', 2]
      ]);
    });

    it('H', () => {
      path = 'M0 0 H1 H2';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['H', 1],
        ['H', 2]
      ]);
    });

    it('h', () => {
      path = 'M0 0 h1 h2';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['h', 1],
        ['h', 2]
      ]);
    });

    it('exceed max parameters', () => {
      path = 'M0 0 L 1 2 3';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['L', 1, 2]
      ]);
    });

    it('L - below parameter limit', () => {
      path = 'M0 0 L 1';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0]
      ]);
    });

    it('V - below parameter limit', () => {
      path = 'M0 0 V';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0]
      ]);
    });

    it('H - below parameter limit', () => {
      path = 'M0 0 H';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0]
      ]);
    });
  });

  describe('closePath', () => {
    it('z', () => {
      path = 'M0 0 Z';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['Z']
      ]);
    });

    it('z', () => {
      path = 'M0 0 z';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['z']
      ]);
    });

    it('exceed max parameters', () => {
      path = 'M0 0 Z 1';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['Z']
      ]);
    });
  });

  describe('cubic Bézier curve', () => {
    it('C', () => {
      path = 'M 0 0 C 1 2 3 4 5 6';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['C', 1, 2, 3, 4, 5, 6]
      ]);
    });

    it('c', () => {
      path = 'M0 0 c 1 2 3 4 5 6';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['c', 1, 2, 3, 4, 5, 6]
      ]);
    });

    it('S', () => {
      path = 'M0 0 S 1 2 3 4';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['S', 1, 2, 3, 4]
      ]);
    });

    it('s', () => {
      path = 'M0 0 s 1 2 3 4';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['s', 1, 2, 3, 4]
      ]);
    });

    it('C - exceed max parameters', () => {
      path = 'M0 0 C 1 2 3 4 5 6 7';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['C', 1, 2, 3, 4, 5, 6]
      ]);
    });

    it('S - exceed max parameters', () => {
      path = 'M0 0 S 1 2 3 4 5';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['S', 1, 2, 3, 4]
      ]);
    });

    it('C - below parameter limit', () => {
      path = 'M0 0 C 1 2 3 4 5';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0]
      ]);
    });

    it('S - below parameter limit', () => {
      path = 'M0 0 S 1 2 3';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0]
      ]);
    });
  });

  describe('quadratic Bézier curve', () => {
    it('Q', () => {
      path = 'M0 0 Q 1 2 3 4';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['Q', 1, 2, 3, 4]
      ]);
    });

    it('q', () => {
      path = 'M0 0 q 1 2 3 4';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['q', 1, 2, 3, 4]
      ]);
    });

    it('T', () => {
      path = 'M0 0 T 1 2';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['T', 1, 2]
      ]);
    });

    it('t', () => {
      path = 'M0 0 t 1 2';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['t', 1, 2]
      ]);
    });

    it('Q - exceed max parameters', () => {
      path = 'M0 0 Q 1 2 3 4 5';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['Q', 1, 2, 3, 4]
      ]);
    });

    it('T - exceed max parameters', () => {
      path = 'M0 0 T 1 2 3';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['T', 1, 2]
      ]);
    });

    it('Q - below parameter limit', () => {
      path = 'M0 0 Q 1 2 3';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0]
      ]);
    });

    it('T - below parameter limit', () => {
      path = 'M0 0 T 1';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0]
      ]);
    });
  });

  describe('elliptical arc curve', () => {
    it('A', () => {
      path = 'M0 0 A 1 2 3 4 5 6 7';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['A', 1, 2, 3, 4, 5, 6, 7]
      ]);
    });

    it('a', () => {
      path = 'M0 0 a 1 2 3 4 5 6 7';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['a', 1, 2, 3, 4, 5, 6, 7]
      ]);
    });

    it('exceed max parameters', () => {
      path = 'M0 0 A 1 2 3 4 5 6 7 8';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0],
        ['A', 1, 2, 3, 4, 5, 6, 7]
      ]);
    });

    it('below parameter limit', () => {
      path = 'M0 0 A 1 2 3 4 5 6';
      ary = parse(path);
      expect(ary).to.deep.equal([
        ['M', 0, 0]
      ]);
    });
  });
});
