import elementMock from 'test-utils/mocks/element-mock';
import componentFactory from '../../src/core/component/component-factory';
import findNodes from './node-def-selector';

interface Rect {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface ComputedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function computeRect(rect: Rect): ComputedRect {
  return {
    x: rect.x ?? 0,
    y: rect.y ?? 0,
    width: rect.width ?? 0,
    height: rect.height ?? 0,
  };
}

export default function componentFactoryFixture(): any {
  let comp: any;
  let chartMock: any;
  let rendererMock: any;
  let rendererOutput: any[] = [];
  let mediatorMock: any;
  let themeMock: any;
  let registriesMock: any;
  const sandbox = sinon.createSandbox();
  let rendererElement: any;

  const fn: any = function func() {
    chartMock = {
      brush: () => ({
        on: () => {},
      }),
      scale: sandbox.stub(),
      dataset: sandbox.stub(),
      container: sandbox.stub(),
      formatter: sandbox.stub(),
      logger: () => ({
        warn: sandbox.stub(),
      }),
      element: elementMock(),
    };

    rendererMock = {
      size(rect: Rect): any {
        const s: any = {
          x: rect.x || 0,
          y: rect.y || 0,
          width: rect.width || 100,
          height: rect.height || 100,
          margin: {
            left: 0,
            top: 0,
          },
          scaleRatio: {
            x: 1,
            y: 1,
          },
          edgeBleed: {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
          },
        };

        (s as any).computedPhysical = {
          x: s.x,
          y: s.y,
          width: s.width,
          height: s.height,
        };
        return s;
      },
      render: (nodes: any[]): void => {
        rendererOutput = nodes;
      },
      appendTo: (el: any): any => {
        if (!rendererElement) {
          rendererElement = elementMock();
        }
        el.appendChild(rendererElement);
        return rendererElement;
      },
      measureText: ({ text }: { text: any }): any => ({
        width: text.toString().length,
        height: 5,
      }),
      textBounds: ({ text, x, y }: { text: any; x?: number; y?: number }): any => ({
        x: x || 0,
        y: y || 0,
        width: text.toString().length,
        height: 5,
      }),
      element: (): any => rendererElement,
      clear: (): void => {},
      destroy: (): void => {},
      setKey: (key: string): void => rendererElement.setAttribute('data-key', key),
      settings: (): void => {},
    };

    mediatorMock = {
      on: sandbox.stub(),
    };

    themeMock = {
      palette: sandbox.stub(),
      style: sandbox.stub(),
    };

    registriesMock = {
      renderer: sandbox.stub(),
    };

    return fn;
  };

  fn.mocks = (): any => ({
    chart: chartMock,
    renderer: rendererMock,
    theme: themeMock,
    registries: registriesMock,
  });

  fn.simulateCreate = (componentDef: any, settings: any): any => {
    comp = componentFactory(componentDef, {
      settings,
      chart: chartMock,
      renderer: rendererMock,
      mediator: mediatorMock,
      theme: themeMock,
      registries: registriesMock,
    });

    rendererMock.appendTo(chartMock.element);

    return comp;
  };

  fn.simulateRender = (opts: { inner?: any; outer?: any }): any => {
    const { inner, outer } = opts;
    if (inner && !inner.computed) {
      inner.computed = computeRect(inner);
    }
    if (outer && !outer.computed) {
      outer.computed = computeRect(outer);
    }

    comp.beforeMount();
    comp.resize(inner, outer);
    comp.beforeRender();
    comp.render();
    comp.mounted();

    return rendererOutput;
  };

  fn.simulateUpdate = (settings: any): any => {
    comp.set({ settings });
    comp.beforeUpdate(settings);
    comp.beforeRender();
    comp.update();
    comp.updated();

    return rendererOutput;
  };

  fn.simulateLayout = (opts: any): any => comp.dockConfig().computePreferredSize(opts);

  fn.getRenderOutput = (): any[] => rendererOutput;

  fn.sandbox = (): any => sandbox;

  fn.instance = (): any => comp;

  fn.findNodes = (s: string): any[] => findNodes(s, { children: rendererOutput });

  return fn();
}
