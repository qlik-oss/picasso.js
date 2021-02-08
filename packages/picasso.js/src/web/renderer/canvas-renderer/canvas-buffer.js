const DEFAULT_PADDING = {
  horizontal: 200,
  vertical: 200,
};

/**
 * @param {object|function} [canvasBufferSize] object containing width and height or a function which returns it
 */
export default function canvasBuffer({ el, canvasBufferSize }) {
  const outputCanvas = el;
  const bufferCanvas = el.cloneNode();

  let dpi;
  let outputSize;
  let bufferSize;
  let bufferOffset;

  return {
    updateSize: ({ rect, dpiRatio }) => {
      dpi = dpiRatio;
      outputSize = {
        width: rect.computedPhysical.width,
        height: rect.computedPhysical.height,
      };
      if (canvasBufferSize) {
        bufferSize = typeof canvasBufferSize === 'function' ? canvasBufferSize(rect) : canvasBufferSize;
      } else {
        bufferSize = {
          width: outputSize.width + DEFAULT_PADDING.horizontal * 2,
          height: outputSize.height + DEFAULT_PADDING.vertical * 2,
        };
      }
      bufferOffset = {
        left: (bufferSize.width - outputSize.width) / 2,
        top: (bufferSize.height - outputSize.height) / 2,
      };

      bufferCanvas.style.width = `${bufferSize.width}px`;
      bufferCanvas.style.height = `${bufferSize.height}px`;
      bufferCanvas.width = Math.round(bufferSize.width * dpi);
      bufferCanvas.height = Math.round(bufferSize.height * dpi);
    },
    getOffset: () => bufferOffset,
    apply: (transform) => {
      outputCanvas.width = outputCanvas.width; // eslint-disable-line
      const g = outputCanvas.getContext('2d');

      if (typeof transform === 'object') {
        const adjustedTransform = [
          transform.a,
          transform.b,
          transform.c,
          transform.d,
          transform.e * dpi,
          transform.f * dpi,
        ];
        g.setTransform(...adjustedTransform);
      }

      g.drawImage(bufferCanvas, -bufferOffset.left * dpi, -bufferOffset.top * dpi);
    },
    getContext: () => bufferCanvas.getContext('2d'),
  };
}
