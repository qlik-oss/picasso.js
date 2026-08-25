import timeSpanDispatcher from '../timespan-dispatcher';

describe('timeSpanDispatcher', () => {
  let sandbox;
  let action;
  let clock;
  let settings;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    action = sandbox.spy();
    clock = sandbox.useFakeTimers();
    settings = {
      defaultDuration: 20,
      defaultDelay: 10,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('invoke should call action with default delay and duration', () => {
    timeSpanDispatcher(settings).invoke(action);
    clock.tick(10);
    expect(action).to.have.been.calledOnce;
  });

  it('invoke should call action with delay and duration', () => {
    settings.defaultDelay = 20;
    settings.defaultDuration = 40;
    timeSpanDispatcher(settings).invoke(action);
    clock.tick(10);
    expect(action).not.to.have.been.called;
    clock.tick(10);
    expect(action).to.have.been.calledOnce;
  });

  it('invoke should debounce queued actions', () => {
    const instance = timeSpanDispatcher(settings);
    const spy = sinon.spy();
    instance.on('debounced', spy);
    instance.invoke(action);
    expect(spy).not.to.have.been.called;
    instance.invoke(action);
    clock.tick(15);
    expect(spy).to.have.been.calledOnce;
  });

  describe('events', () => {
    it('should trigger `pending` event on invoke', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = sinon.spy();
      instance.on('pending', spy);
      instance.invoke(action);
      expect(spy).to.have.been.calledOnce;
    });

    it('should trigger `active` event after delay', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = sinon.spy();
      instance.on('active', spy);
      instance.invoke(action);
      clock.tick(15);
      expect(spy).to.have.been.calledOnce;
    });

    it('should trigger `fulfilled` event after duration', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = sinon.spy();
      instance.on('fulfilled', spy);
      instance.invoke(action);
      clock.tick(45);
      expect(spy).to.have.been.calledOnce;
    });

    it('should not trigger `fulfilled` event if no duration is set', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = sinon.spy();
      instance.on('fulfilled', spy);
      instance.invoke(action, 0);
      clock.tick(45);
      expect(spy).to.not.have.been.called;
    });

    it('should only trigger `fulfilled` event for last invoke', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = sinon.spy();
      instance.on('fulfilled', spy);
      instance.invoke(action, 100, 0); // Fulfilled will not be triggered for this invoke
      clock.tick(1);
      instance.invoke(action, 10, 0);
      clock.tick(200);
      expect(spy).to.have.been.calledOnce;
    });

    it('should trigger `cancelled` event for active invoke', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = sinon.spy();
      instance.on('cancelled', spy);
      instance.invoke(action);
      clock.tick(20);
      instance.clear();
      expect(spy).to.have.been.calledOnce;
    });

    it('should trigger `rejected` event for pending invoke', () => {
      const instance = timeSpanDispatcher(settings);
      const spy = sinon.spy();
      instance.on('rejected', spy);
      instance.invoke(action);
      clock.tick(5);
      instance.clear();
      expect(spy).to.have.been.calledOnce;
    });
  });
});
