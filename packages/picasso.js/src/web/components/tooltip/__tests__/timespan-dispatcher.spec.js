import timeSpanDispatcher from '../timespan-dispatcher';

describe('timeSpanDispatcher', () => {
  let sandbox;
  let action;
  let clock;
  let settings;

  beforeEach(() => {
    sandbox = vi;
    action = vi.fn();
    clock = vi.useFakeTimers();
    settings = {
      defaultDuration: 20,
      defaultDelay: 10,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('invoke should call action with default delay and duration', () => {
    timeSpanDispatcher(settings).invoke(action);
    vi.advanceTimersByTime(10);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('invoke should call action with delay and duration', () => {
    settings.defaultDelay = 20;
    settings.defaultDuration = 40;
    timeSpanDispatcher(settings).invoke(action);
    vi.advanceTimersByTime(10);
    expect(action).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('invoke should debounce queued actions', () => {
    const instance = timeSpanDispatcher(settings);
    const spy = vi.fn();
    instance.on('debounced', spy);
    instance.invoke(action);
    expect(spy).not.toHaveBeenCalled();
    instance.invoke(action);
    vi.advanceTimersByTime(15);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  describe('events', () => {
    it('should trigger `pending` event on invoke', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = vi.fn();
      instance.on('pending', spy);
      instance.invoke(action);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should trigger `active` event after delay', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = vi.fn();
      instance.on('active', spy);
      instance.invoke(action);
      vi.advanceTimersByTime(15);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should trigger `fulfilled` event after duration', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = vi.fn();
      instance.on('fulfilled', spy);
      instance.invoke(action);
      vi.advanceTimersByTime(45);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not trigger `fulfilled` event if no duration is set', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = vi.fn();
      instance.on('fulfilled', spy);
      instance.invoke(action, 0);
      vi.advanceTimersByTime(45);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should only trigger `fulfilled` event for last invoke', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = vi.fn();
      instance.on('fulfilled', spy);
      instance.invoke(action, 100, 0); // Fulfilled will not be triggered for this invoke
      vi.advanceTimersByTime(1);
      instance.invoke(action, 10, 0);
      vi.advanceTimersByTime(200);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should trigger `cancelled` event for active invoke', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = vi.fn();
      instance.on('cancelled', spy);
      instance.invoke(action);
      vi.advanceTimersByTime(20);
      instance.clear();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should trigger `rejected` event for pending invoke', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = vi.fn();
      instance.on('rejected', spy);
      instance.invoke(action);
      vi.advanceTimersByTime(5);
      instance.clear();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
