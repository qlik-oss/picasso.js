const DEFAULT_PADDING = {
  horizontal: 200,
  vertical: 200,
};

/**
 * Creates a canvas element, preferrably larger than the target canvas.
 * This "buffer canvas" is detached from the DOM and allows rendering of shapes outside of the visible area.
 * Especially useful when applying transforms to target canvas.
 * @private
 */
class CanvasBuffer {
  constructor(targetCanvas) {
    this.targetCanvas = targetCanvas;
    this.bufferCanvas = targetCanvas.cloneNode();
  }

  /**
   * @param {object|function} [canvasBufferSize] object containing width and height or a function which returns it
   */
  updateSize({ rect, dpiRatio, canvasBufferSize }) {
    let bufferSize;
    if (canvasBufferSize) {
      bufferSize = typeof canvasBufferSize === 'function' ? canvasBufferSize(rect) : canvasBufferSize;
    } else {
      bufferSize = {
        width: rect.computedPhysical.width + DEFAULT_PADDING.horizontal * 2,
        height: rect.computedPhysical.height + DEFAULT_PADDING.vertical * 2,
      };
    }

    this.bufferCanvas.style.width = `${bufferSize.width}px`;
    this.bufferCanvas.style.height = `${bufferSize.height}px`;
    this.bufferCanvas.width = Math.round(bufferSize.width * dpiRatio);
    this.bufferCanvas.height = Math.round(bufferSize.height * dpiRatio);
  }

  /**
   * Draws buffer canvas on the target canvas.
   */
  apply() {
    const g = this.targetCanvas.getContext('2d');
    g.drawImage(this.bufferCanvas, 0, 0);
  }

  clear() {
    this.bufferCanvas.width = this.bufferCanvas.width; // eslint-disable-line
  }

  getContext() {
    return this.bufferCanvas.getContext('2d');
  }
}

export default CanvasBuffer;
