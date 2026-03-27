import CanvasBuffer from '../canvas-buffer';

describe('canvasBuffer', () => {
  let targetCanvas;
  let bufferCanvas;
  let rect;
  let setTransform;
  let drawImage;

  beforeEach(() => {
    setTransform = sinon.spy();
    drawImage = sinon.spy();
    bufferCanvas = {
      style: {},
    };
    targetCanvas = {
      cloneNode: sinon.stub().returns(bufferCanvas),
      getContext: sinon.stub().returns({
        setTransform,
        drawImage,
      }),
    };
    rect = {
      computedPhysical: {
        height: 300,
        width: 400,
      },
    };
  });

  it('should clone element', () => {
    new CanvasBuffer(targetCanvas); // eslint-disable-line no-new
    expect(targetCanvas.cloneNode).to.have.been.calledOnce;
  });

  describe('updateSize', () => {
    it('should set default buffer size if not provided', () => {
      const buffer = new CanvasBuffer(targetCanvas);
      buffer.updateSize({ rect, dpiRatio: 2 });
      expect(buffer.bufferCanvas.style.width).to.equal('800px');
      expect(buffer.bufferCanvas.style.height).to.equal('700px');
      expect(buffer.bufferCanvas.width).to.equal(1600);
      expect(buffer.bufferCanvas.height).to.equal(1400);
    });

    it('should set provided canvasBufferSize', () => {
      const buffer = new CanvasBuffer(targetCanvas);
      buffer.updateSize({ rect, dpiRatio: 2, canvasBufferSize: { width: 1000, height: 600 } });
      expect(buffer.bufferCanvas.style.width).to.equal('1000px');
      expect(buffer.bufferCanvas.style.height).to.equal('600px');
      expect(buffer.bufferCanvas.width).to.equal(2000);
      expect(buffer.bufferCanvas.height).to.equal(1200);
    });
  });

  describe('apply', () => {
    it('should draw bufferCanvas on targetCanvas', () => {
      const buffer = new CanvasBuffer(targetCanvas);
      buffer.updateSize({ rect, dpiRatio: 2 });
      buffer.apply();
      expect(drawImage).to.have.been.calledWith(bufferCanvas, 0, 0);
    });
  });
});
