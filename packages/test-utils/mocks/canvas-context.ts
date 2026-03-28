import sinon from 'sinon';

interface GradientFunction {
  (): string;
  stops: unknown[][];
  type: string;
  args: unknown[];
  addColorStop(...args: unknown[]): void;
}

function gradientFactory(gradientType: string) {
  function createGradient(...args: unknown[]): GradientFunction {
    function gradient(): string {
      return `dummyGradient-${gradientType}`;
    }

    const typedGradient = gradient as unknown as GradientFunction;
    typedGradient.stops = [];
    typedGradient.type = gradientType;
    typedGradient.args = args;

    typedGradient.addColorStop = (...i: unknown[]): void => {
      typedGradient.stops.push([...i]);
    };

    return typedGradient;
  }

  return createGradient;
}

class CanvasPattern {}

interface CanvasContextMock {
  save: sinon.SinonSpy;
  beginPath: sinon.SinonSpy;
  moveTo: sinon.SinonSpy;
  arc: sinon.SinonSpy;
  fill: sinon.SinonSpy;
  restore: sinon.SinonSpy;
  scale: sinon.SinonSpy;
  rect: sinon.SinonSpy;
  setTransform: sinon.SinonSpy;
  createPattern: sinon.SinonSpy;
  measureText(text: string): { width: number };
  createRadialGradient?: (arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown, arg6: unknown) => GradientFunction;
  createLinearGradient?: (arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown) => GradientFunction;
  createConicGradient?: (arg1: unknown, arg2: unknown, arg3: unknown) => GradientFunction;
}

function canvascontext(contextType: string = '2d'): CanvasContextMock {
  const item: CanvasContextMock = {
    save: sinon.spy(),
    beginPath: sinon.spy(),
    moveTo: sinon.spy(),
    arc: sinon.spy(),
    fill: sinon.spy(),
    restore: sinon.spy(),
    scale: sinon.spy(),
    rect: sinon.spy(),
    setTransform: sinon.spy(),
    createPattern: sinon.spy((...args: unknown[]): CanvasPattern => new CanvasPattern()),
    measureText: (text: string): { width: number } => ({ width: text.length }),
  };

  if (contextType === '2d') {
    item.createRadialGradient = gradientFactory('radial');
    item.createLinearGradient = gradientFactory('linear');
    item.createConicGradient = gradientFactory('conic');
  }

  return item;
}

export default canvascontext;
