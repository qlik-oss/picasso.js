import render, { positionImage } from '../image'; // adjust path as needed

describe('render()', () => {
  let canvas, g, createElementStub, lastCreatedImage;

  beforeEach(() => {
    // Mock Image class
    global.Image = class {
      constructor() {
        lastCreatedImage = this; // Store the last created image for testing
      }

      set src(value) {
        this._src = value;
      }

      get src() {
        return this._src;
      }

      //  onerror() {}

      naturalWidth = 100;

      onload = null;

      naturalHeight = 50;
    };

    // Create a mock canvas
    canvas = {
      clientWidth: 200,
      clientHeight: 100,
      width: 0,
      height: 0,
    };

    g = {
      canvas,
      setTransform: sinon.spy(),
      clearRect: sinon.spy(),
      drawImage: sinon.spy(),
      getTransform: sinon.spy(),
      save: sinon.spy(),
      beginPath: sinon.spy(),
      arc: sinon.spy(),
      clip: sinon.spy(),
      restore: sinon.spy(),
      globalAlpha: 1,
    };

    // Mock document if not defined (for Node.js test environments)
    if (typeof global.document === 'undefined') {
      global.document = {};
    }
    const doc = global.document;
    // Stub document.createElement
    createElementStub = sinon.stub(doc, 'createElement').callsFake(() => ({
      width: 0,
      height: 0,
    }));

    // Stub window.devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 2,
      writable: true,
    });
  });

  afterEach(() => {
    createElementStub.restore();
  });

  it('should render a circle symbol image correctly', (done) => {
    const img = {
      src: 'circle.png',
      symbol: 'circle',
      x: 50,
      y: 50,
      imageScalingFactor: 1,
    };

    render(img, { g });
    lastCreatedImage.onload();

    expect(g.arc.called).to.be.true;
    expect(g.drawImage.called).to.be.true;
    expect(g.drawImage.called).to.be.true;
    done();
  });

  it('should render a square symbol image correctly', (done) => {
    const img = {
      src: 'square.png',
      symbol: 'square',
      x: 100,
      y: 100,
      imageScalingFactor: 0.5,
    };

    render(img, { g });
    lastCreatedImage.onload();
    expect(g.drawImage.called).to.be.true;
    expect(g.arc.called).to.be.false; // should not draw arc for square
    expect(g.drawImage.called).to.be.true;
    done();
  });

  it('should resize the canvas and clear it before rendering', (done) => {
    const img = {
      src: 'resize.png',
      symbol: 'circle',
      x: 0,
      y: 0,
      imageScalingFactor: 1,
    };

    render(img, { g });
    lastCreatedImage.onload();
    expect(canvas.width).to.equal(400); // 200 * 2
    expect(canvas.height).to.equal(200); // 100 * 2
    expect(g.clearRect.called).to.be.true;
    expect(g.clearRect.called).to.be.true;
    done();
  });
  describe('positionImage()', () => {
    it('positions top-left correctly', () => {
      const img = { x: 100, y: 100, width: 40, height: 20, imagePosition: 'top-left' };
      positionImage(img);
      expect(img.x).to.equal(80); // x - width/2
      expect(img.y).to.equal(90); // y - height/2
    });

    it('scales image if symbol is circle', () => {
      const img = { symbol: 'circle', width: 80, height: 60 };
      positionImage(img);
      expect(img.width).to.equal(60);
      expect(img.height).to.equal(60);
    });
  });
});
