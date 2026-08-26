/* global vi */

function gradientFactory(gradientType) {
  function createGradient(...args) {
    function gradient() {
      return `dummyGradient-${gradientType}`;
    }

    gradient.stops = [];
    gradient.type = gradientType;
    gradient.args = args;

    gradient.addColorStop = (...i) => gradient.stops.push([...i]);

    return gradient;
  }

  return createGradient;
}

class CanvasPattern {}

function canvascontext(contextType = '2d') {
  let item = {
    save: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rect: vi.fn(),
    setTransform: vi.fn(),
    createPattern: vi.fn((...args) => new CanvasPattern(...args)),
    measureText: (text) => ({ width: text.length }),
  };

  if (contextType === '2d') {
    item.createRadialGradient = gradientFactory('radial');
    item.createLinearGradient = gradientFactory('linear');
    item.createConicGradient = gradientFactory('conic');
  }

  return item;
}

export default canvascontext;
