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

function canvascontext(contextType = '2d') {
  let item = {
    save: () => {},
    beginPath: () => {},
    moveTo: () => {},
    arc: () => {},
    fill: () => {},
    restore: () => {},
    rect: () => {},
    measureText: text => ({ width: text.length })
  };

  if (contextType === '2d') {
    item.createRadialGradient = gradientFactory('radial');
    item.createLinearGradient = gradientFactory('linear');
  }


  return item;
}

export default canvascontext;
