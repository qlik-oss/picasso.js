/* global sinon */

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
    save: sinon.spy(),
    beginPath: sinon.spy(),
    moveTo: sinon.spy(),
    arc: sinon.spy(),
    fill: sinon.spy(),
    restore: sinon.spy(),
    scale: sinon.spy(),
    rect: sinon.spy(),
    createPattern: sinon.spy((...args) => new CanvasPattern(...args)),
    measureText: (text) => ({ width: text.length }),
  };

  if (contextType === '2d') {
    item.createRadialGradient = gradientFactory('radial');
    item.createLinearGradient = gradientFactory('linear');
  }

  return item;
}

export default canvascontext;
