import create, { symbols as register } from '..';

function fixDecimals(str, precision = 5) {
  return str.replace(/\.([0-9]+)/gi, (match, g) => `.${g.substr(0, precision)}`);
}

describe('Symbols', () => {
  let input;
  let symbol;
  let expectedCollider;

  beforeEach(() => {
    input = {
      x: 10,
      y: 15,
      size: 64,
      fill: 'red',
      stroke: 'brown',
      strokeWidth: 2,
      opacity: 0.5,
      strokeDasharray: '10 10'
    };

    expectedCollider = {
      type: 'rect',
      x: -22,
      y: -17,
      width: 64,
      height: 64
    };
  });

  describe('Register', () => {
    afterEach(() => {
      register.remove('myNewSymbol');
    });

    it('should accept new symbols to be registered', () => {
      const myNewSymbol = options => ({ ...options, type: 'myCustomSymbol' }); // Just return input
      register.add('myNewSymbol', myNewSymbol);

      input.type = 'myNewSymbol';
      const mySym = create(input);
      expect(mySym).to.deep.equal({
        type: 'myCustomSymbol',
        x: 10,
        y: 15,
        size: 64,
        fill: 'red', // Default append style
        stroke: 'brown',
        strokeWidth: 2,
        opacity: 0.5,
        strokeDasharray: '10 10',
        collider: expectedCollider // Default append a collider
      });

      expect(register.get('myNewSymbol')).to.equal(myNewSymbol);
    });

    it('should allow new symbols to have custom colliders', () => {
      const myNewSymbol = () => ({ collider: { type: 'myCollider' } }); // Just return input
      register.add('myNewSymbol', myNewSymbol);

      input.type = 'myNewSymbol';
      const mySym = create(input);
      expect(mySym).to.deep.equal({
        fill: 'red', // Default append style
        stroke: 'brown',
        strokeWidth: 2,
        opacity: 0.5,
        strokeDasharray: '10 10',
        collider: { type: 'myCollider' }
      });
    });
  });

  describe('Circle', () => {
    beforeEach(() => {
      input.type = 'circle';
    });

    it('should output a circle', () => {
      symbol = create(input);

      expect(symbol).to.deep.equal({
        type: 'circle',
        fill: 'red',
        stroke: 'brown',
        strokeWidth: 2,
        opacity: 0.5,
        strokeDasharray: '10 10',
        cx: 10,
        cy: 15,
        r: 32,
        collider: { type: 'circle' }
      });
    });
  });

  describe('Bar', () => {
    beforeEach(() => {
      input.type = 'bar';
    });

    it('should output a bar', () => {
      symbol = create(input);

      expect(symbol).to.deep.equal({
        type: 'rect',
        fill: 'red',
        stroke: 'brown',
        strokeWidth: 2,
        opacity: 0.5,
        strokeDasharray: '10 10',
        x: -22,
        y: 7,
        width: 64,
        height: 16,
        collider: { type: 'rect' }
      });
    });

    describe('Options', () => {
      it('direction - vertical', () => {
        input.direction = 'vertical';
        symbol = create(input);

        expect(symbol).to.deep.equal({
          type: 'rect',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          x: 1.9999999999999982,
          y: -17,
          width: 16,
          height: 64,
          collider: { type: 'rect' }
        });
      });
    });
  });

  describe('Cross', () => {
    beforeEach(() => {
      input.type = 'cross';
    });

    it('should output a cross', () => {
      symbol = create(input);

      expect(symbol).to.deep.equal({
        type: 'path',
        fill: 'red',
        stroke: 'brown',
        strokeWidth: 2,
        opacity: 0.5,
        strokeDasharray: '10 10',
        d: 'M2 7 L2 -17 L18 -17 L18 7 L42 7 L42 23 L18 23 L18 47 L2 47 L2 23 L-22 23 L-22 7 Z',
        collider: expectedCollider
      });
    });

    describe('Options', () => {
      it('width', () => {
        input.width = 1;
        symbol = create(input);

        expect(symbol).to.deep.equal({
          type: 'path',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          d: 'M9.5 14.5 L9.5 -17 L10.5 -17 L10.5 14.5 L42 14.5 L42 15.5 L10.5 15.5 L10.5 47 L9.5 47 L9.5 15.5 L-22 15.5 L-22 14.5 Z',
          collider: expectedCollider
        });
      });
    });
  });

  describe('Diamond', () => {
    beforeEach(() => {
      input.type = 'diamond';
    });

    it('should output a diamond', () => {
      symbol = create(input);

      expect(symbol).to.deep.equal({
        type: 'path',
        fill: 'red',
        stroke: 'brown',
        strokeWidth: 2,
        opacity: 0.5,
        strokeDasharray: '10 10',
        d: 'M-22 15 L10 -17 L42 15 L10 47 L-22 15 Z',
        collider: expectedCollider
      });
    });
  });

  describe('Line', () => {
    beforeEach(() => {
      input.type = 'line';
    });

    it('should output a horizontal line', () => {
      symbol = create(input);

      expect(symbol).to.deep.equal({
        type: 'line',
        fill: 'red',
        stroke: 'brown',
        strokeWidth: 2,
        opacity: 0.5,
        strokeDasharray: '10 10',
        x1: -22,
        y1: 15,
        x2: 42,
        y2: 15,
        collider: expectedCollider
      });
    });

    describe('Options', () => {
      it('direction - vertical', () => {
        input.direction = 'vertical';
        symbol = create(input);

        expect(symbol).to.deep.equal({
          type: 'line',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          x1: 10,
          y1: -17,
          x2: 10,
          y2: 47,
          collider: expectedCollider
        });
      });
    });
  });

  describe('n-polygon', () => {
    beforeEach(() => {
      input.type = 'n-polygon';
    });

    it('should output a n-polygon', () => {
      symbol = create(input);

      symbol.d = fixDecimals(symbol.d);

      expect(symbol).to.deep.equal({
        type: 'path',
        fill: 'red',
        stroke: 'brown',
        strokeWidth: 2,
        opacity: 0.5,
        strokeDasharray: '10 10',
        d: fixDecimals('M26.000000000000004 -12.712812921102035 L-5.999999999999993 -12.712812921102042 L-22 14.999999999999996 L-6.000000000000014 42.71281292110203 L26.000000000000004 42.712812921102035 L42 15.000000000000007 Z'),
        collider: expectedCollider
      });
    });

    describe('Options', () => {
      it('sides', () => {
        input.sides = 5;
        symbol = create(input);

        symbol.d = fixDecimals(symbol.d);

        expect(symbol).to.deep.equal({
          type: 'path',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          d: fixDecimals('M19.88854381999832 -15.433808521444913 L-15.888543819998315 -3.809128073359144 L-15.888543819998318 33.80912807335913 L19.88854381999831 45.43380852144492 L42 15.000000000000007 Z'),
          collider: expectedCollider
        });
      });

      it('startAngle', () => {
        input.startAngle = 45;
        symbol = create(input);

        symbol.d = fixDecimals(symbol.d);

        expect(symbol).to.deep.equal({
          type: 'path',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          d: fixDecimals('M1.7177905567193328 -15.909626441250186 L-20.909626441250182 6.7177905567193275 L-12.627416997969526 37.62741699796952 L18.28220944328065 45.90962644125019 L40.90962644125018 23.282209443280664 L32.627416997969526 -7.627416997969515 Z'),
          collider: expectedCollider
        });
      });
    });
  });

  describe('Saltire', () => {
    beforeEach(() => {
      input.type = 'saltire';
    });

    it('should output a saltire', () => {
      symbol = create(input);

      expect(symbol).to.deep.equal({
        type: 'path',
        fill: 'red',
        stroke: 'brown',
        strokeWidth: 2,
        opacity: 0.5,
        strokeDasharray: '10 10',
        d: 'M-1.3137084989847594 15 L-23.213971311334014 -6.900262812349258 L-11.900262812349254 -18.21397131133402 L10 3.6862915010152406 L31.900262812349258 -18.213971311334014 L43.21397131133402 -6.900262812349254 L21.31370849898476 15 L43.213971311334014 36.900262812349254 L31.900262812349254 48.21397131133402 L10 26.31370849898476 L-11.900262812349258 48.213971311334014 L-23.21397131133402 36.900262812349254 Z',
        collider: expectedCollider
      });
    });

    describe('Options', () => {
      it('width', () => {
        input.width = 1;
        symbol = create(input);

        expect(symbol).to.deep.equal({
          type: 'path',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          d: 'M9.292893218813452 15 L-22.075873206958377 -16.368766425771835 L-21.36876642577183 -17.075873206958384 L10 14.292893218813452 L41.36876642577184 -17.075873206958377 L42.075873206958384 -16.36876642577183 L10.707106781186548 15 L42.07587320695838 46.36876642577184 L41.36876642577183 47.075873206958384 L10 15.707106781186548 L-21.368766425771835 47.07587320695838 L-22.075873206958384 46.36876642577183 Z',
          collider: expectedCollider
        });
      });
    });
  });

  describe('Square', () => {
    beforeEach(() => {
      input.type = 'square';
    });

    it('should output a square', () => {
      symbol = create(input);

      expect(symbol).to.deep.equal({
        type: 'rect',
        fill: 'red',
        stroke: 'brown',
        strokeWidth: 2,
        strokeDasharray: '10 10',
        opacity: 0.5,
        x: -22,
        y: -17,
        width: 64,
        height: 64,
        collider: expectedCollider
      });
    });
  });

  describe('Star', () => {
    beforeEach(() => {
      input.type = 'star';
    });

    it('should output a star', () => {
      symbol = create(input);

      symbol.d = fixDecimals(symbol.d);

      expect(symbol).to.deep.equal({
        type: 'path',
        fill: 'red',
        stroke: 'brown',
        strokeWidth: 2,
        opacity: 0.5,
        strokeDasharray: '10 10',
        d: fixDecimals('M-20.433808521444913 5.11145618000168 L-5.216904260722455 19.944271909999163 L-8.809128073359144 40.88854381999832 L9.999999999999996 31 L28.809128073359133 40.88854381999832 L25.21690426072246 19.944271909999163 L40.43380852144492 5.11145618000169 L19.404564036679584 2.0557280900008514 L10.00000000000001 -17 L0.5954359633204334 2.055728090000839 Z'),
        collider: expectedCollider
      });
    });

    describe('Options', () => {
      it('points', () => {
        input.points = 6;
        symbol = create(input);

        symbol.d = fixDecimals(symbol.d);

        expect(symbol).to.deep.equal({
          type: 'path',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          d: fixDecimals('M-17.71281292110204 -0.9999999999999982 L-6 14.999999999999998 L-17.712812921102035 31.000000000000004 L1.999999999999993 28.856406460551014 L9.999999999999995 47 L18 28.856406460551018 L37.71281292110203 31.000000000000014 L26 15.000000000000004 L37.71281292110205 -0.9999999999999769 L17.999999999999996 1.143593539448979 L10.00000000000001 -17 L2.0000000000000124 1.1435935394489753 Z'),
          collider: expectedCollider
        });
      });

      it('startAngle', () => {
        input.startAngle = 45;
        symbol = create(input);

        symbol.d = fixDecimals(symbol.d);

        expect(symbol).to.deep.equal({
          type: 'path',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          d: fixDecimals('M-4.527695991665496 -13.512208774027773 L-4.256104387013885 7.73615200416725 L-21.60602689904441 20.005902881287383 L-1.313708498984763 26.31370849898476 L4.994097118712607 46.60602689904441 L17.263847995832748 29.256104387013888 L38.51220877402777 29.527695991665503 L25.803013449522204 12.497048559356324 L32.627416997969526 -7.627416997969515 L12.502951440643685 -0.8030134495222043 Z'),
          collider: expectedCollider
        });
      });

      it('innerRadius', () => {
        input.innerRadius = input.size * 0.9;
        symbol = create(input);

        symbol.d = fixDecimals(symbol.d);

        expect(symbol).to.deep.equal({
          type: 'path',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          d: fixDecimals('M-20.433808521444913 5.11145618000168 L-17.39042766930042 23.899689437998497 L-8.809128073359144 40.88854381999832 L9.999999999999995 43.8 L28.809128073359133 40.88854381999832 L37.39042766930042 23.89968943799849 L40.43380852144492 5.11145618000169 L26.92821526602325 -8.299689437998467 L10.00000000000001 -17 L-6.928215266023219 -8.299689437998492 Z'),
          collider: expectedCollider
        });
      });
    });
  });

  describe('Triangle', () => {
    beforeEach(() => {
      input.type = 'triangle';
    });

    it('should output a triangle', () => {
      symbol = create(input);

      expect(symbol).to.deep.equal({
        type: 'path',
        fill: 'red',
        stroke: 'brown',
        strokeWidth: 2,
        opacity: 0.5,
        strokeDasharray: '10 10',
        d: 'M-22 47 L10 -17 L42 47 L-22 47 Z',
        collider: expectedCollider
      });
    });

    describe('Options', () => {
      it('direction - up', () => {
        input.direction = 'up';
        symbol = create(input);

        expect(symbol).to.deep.equal({
          type: 'path',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          d: 'M-22 47 L10 -17 L42 47 L-22 47 Z',
          collider: expectedCollider
        });
      });

      it('direction - down', () => {
        input.direction = 'down';
        symbol = create(input);

        expect(symbol).to.deep.equal({
          type: 'path',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          d: 'M42.00000000000001 -16.999999999999996 L9.999999999999996 47 L-21.999999999999996 -17.000000000000007 L42.00000000000001 -16.999999999999996 Z',
          collider: expectedCollider
        });
      });

      it('direction - left', () => {
        input.direction = 'left';
        symbol = create(input);

        expect(symbol).to.deep.equal({
          type: 'path',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          d: 'M42 47 L-22 14.999999999999998 L42 -16.999999999999996 L42 47 Z',
          collider: expectedCollider
        });
      });

      it('direction - right', () => {
        input.direction = 'right';
        symbol = create(input);

        expect(symbol).to.deep.equal({
          type: 'path',
          fill: 'red',
          stroke: 'brown',
          strokeWidth: 2,
          opacity: 0.5,
          strokeDasharray: '10 10',
          d: 'M-22 -16.999999999999996 L42 14.999999999999998 L-21.999999999999996 47 L-22 -16.999999999999996 Z',
          collider: expectedCollider
        });
      });
    });
  });
});
