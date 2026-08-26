import extend from 'extend';
import elementMock from 'test-utils/mocks/element-mock';
import tooltip from '../tooltip';
import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import * as instanceHandler from '../instance-handler';
import { vi } from 'vitest';

vi.mock('../instance-handler', async (importOriginal) => ({
  ...(await importOriginal()),
  remove: vi.fn(),
}));

function componentMock() {
  return {
    emit: vi.fn(),
  };
}

function chartMock() {
  return {
    componentsFromPoint: vi.fn().mockReturnValue([]),
    shapesAt: vi.fn().mockReturnValue([]),
    brushFromShapes: vi.fn(),
    component: vi.fn().mockReturnValue(componentMock()),
    element: {
      ...elementMock(),
      getBoundingClientRect: vi.fn().mockReturnValue({
        left: 0,
        top: 0,
      }),
    },
  };
}

describe('Tooltip', () => {
  let instance;
  let invokeSpy;
  let dispatcherSpy;
  let cMock;
  let isEql;
  let componentFixture;
  let sandbox;
  let config;
  let clock;

  beforeEach(() => {
    componentFixture = componentFactoryFixture();
    sandbox = vi;
    cMock = extend(componentFixture.mocks().chart, chartMock());
    vi.useFakeTimers();
    isEql = vi.fn().mockReturnValue(false);

    config = {
      settings: {
        filter: (nodes) => nodes,
        isEqual: isEql,
      },
    };

    instance = componentFixture.simulateCreate(tooltip, config);
    componentFixture.simulateRender({
      inner: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    }); // To attach h to context

    invokeSpy = vi.spyOn(instance.def, 'invokeRenderer').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('events', () => {
    describe('show', () => {
      it('should do shape loookup and show tooltip', () => {
        cMock.shapesAt.mockReturnValue([0, 1, 2]);
        instance.def.show({});
        vi.advanceTimersByTime(500);

        expect(invokeSpy).toHaveBeenCalledWith([0, 1, 2]);
      });

      it('should show tooltip with provided nodes', () => {
        instance.def.show({}, { nodes: [0, 1, 2] });
        vi.advanceTimersByTime(500);

        expect(invokeSpy).toHaveBeenCalledWith([0, 1, 2]);
      });

      it('should not re-render tooltip if over same nodes', () => {
        isEql.mockReturnValue(true);
        cMock.shapesAt.mockReturnValue([0, 1, 2]);
        instance.def.show({});

        expect(invokeSpy).not.toHaveBeenCalled();
        expect(isEql).toHaveBeenCalled();
      });

      it('should not show tooltip if there are no matching nodes', () => {
        cMock.shapesAt.mockReturnValue([]);
        instance.def.show({});

        expect(invokeSpy).not.toHaveBeenCalled();

        instance.def.show({}, { nodes: [] });

        expect(invokeSpy).not.toHaveBeenCalled();
      });
    });

    describe('hide', () => {
      it('should hide tooltip', () => {
        dispatcherSpy = vi.spyOn(instance.def.dispatcher, 'clear');
        instance.def.hide();

        expect(dispatcherSpy).toHaveBeenCalled();
      });
    });

    describe('prevent', () => {
      it('should prevent `show` from being invoked', () => {
        instance.def.prevent(true);
        instance.def.show({});

        expect(isEql).not.toHaveBeenCalled();
      });
    });
  });

  describe('lifecycle hooks', () => {
    let hookSpy;

    beforeEach(() => {
      hookSpy = vi.fn();
      cMock.shapesAt.mockReturnValue([0, 1, 2]);
    });

    it('should call beforeShow', () => {
      instance.def.props.beforeShow = hookSpy;
      instance.def.show({});

      expect(hookSpy).toHaveBeenCalled();
    });

    it('should call afterShow', () => {
      instance.def.props.afterShow = hookSpy;
      instance.def.show({});
      vi.advanceTimersByTime(500);

      expect(hookSpy).toHaveBeenCalled();
    });

    it('should call beforeHide', () => {
      instance.def.props.afterShow = hookSpy;
      instance.def.show({});
      vi.advanceTimersByTime(8500);

      expect(hookSpy).toHaveBeenCalled();
    });

    it('should not call beforeHide if tooltip is not displayed', () => {
      instance.def.props.afterShow = hookSpy;
      instance.def.hide();

      expect(hookSpy).not.toHaveBeenCalled();
    });

    it('should call onHide', () => {
      instance.def.props.onHide = hookSpy;
      instance.def.show({});
      vi.advanceTimersByTime(8500);

      expect(hookSpy).toHaveBeenCalled();
    });

    it('should not call onHide if tooltip is not displayed', () => {
      instance.def.props.onHide = hookSpy;
      instance.def.hide();

      expect(hookSpy).not.toHaveBeenCalled();
    });

    it('should call afterHide', () => {
      instance.def.props.afterHide = hookSpy;
      instance.def.show({});
      vi.advanceTimersByTime(8500);

      expect(hookSpy).toHaveBeenCalled();
    });

    it('should not call afterHide if tooltip is not displayed', () => {
      instance.def.props.afterHide = hookSpy;
      instance.def.hide();

      expect(hookSpy).not.toHaveBeenCalled();
    });
  });

  describe('beforeUpdate', () => {
    it('should destroy dispatcher', () => {
      dispatcherSpy = vi.spyOn(instance.def.dispatcher, 'destroy');
      instance.beforeUpdate({});

      expect(dispatcherSpy).toHaveBeenCalled();
    });

    it('should call remove on instance handler', () => {
      instanceHandler.remove.mockClear();
      instance.beforeUpdate({});

      expect(instanceHandler.remove).toHaveBeenCalled();
    });
  });

  describe('appendTo', () => {
    let container;

    beforeEach(() => {
      container = {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        scaleRatio: { x: 0, y: 0 },
      };

      componentFixture.mocks().renderer.size = vi.fn().mockReturnValue(container);
    });

    it('should apply appendTo on mounted', () => {
      const stub = vi.fn().mockReturnValue({ getBoundingClientRect: () => container, appendChild: vi.fn() });
      instance.def.props.appendTo = stub;
      componentFixture.simulateRender({ inner: container, outer: container });

      expect(stub).toHaveBeenCalled();
      expect(componentFixture.mocks().renderer.size).toHaveBeenCalledWith({ width: 100, height: 50 });
    });

    it('should apply appendTo on updated', () => {
      const stub = vi.fn().mockReturnValue({ getBoundingClientRect: () => container, appendChild: vi.fn() });
      config.settings.appendTo = stub;
      componentFixture.simulateUpdate(config);

      expect(stub).toHaveBeenCalled();
      expect(componentFixture.mocks().renderer.size).toHaveBeenCalledWith({ width: 100, height: 50 });
    });
  });
});
