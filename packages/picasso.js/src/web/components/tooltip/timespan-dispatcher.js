// Successfull flow: pending -> active -> fulfilled (only with duration)
// Cancelled flow: pending -> active -> cancelled
// Rejected flow: pending -> rejected
// Debounced flow: pending -> debounced -> pending -> [rejected|fulfilled]
function dispatcherState() {
  const fn = function fn() { };
  const on = {
    pending: [],
    debounced: [],
    active: [],
    cancelled: [],
    rejected: [],
    fulfilled: []
  };
  let state;

  fn.set = (s) => {
    state = s;
    on[state].forEach(event => event(s));
  };

  fn.on = (key, event) => {
    if (Array.isArray(key)) {
      key.forEach(k => on[k].push(event));
    } else {
      on[key].push(event);
    }
  };

  // fn.on(['pending', 'debounced', 'active', 'cancelled', 'rejected', 'fulfilled'], (e) => {
  //   console.log(e);
  // });

  return fn;
}

export default function timeSpanDispatcher({
  defaultDuration,
  defaultDelay
}) {
  let actionId = null;
  let fulfilledId = null;
  let isActive = false;
  const state = dispatcherState();
  const fn = function fn() {};
  const fulfilled = () => {
    actionId = null;
    fulfilledId = null;
    isActive = false;
    state.set('fulfilled');
  };

  fn.invoke = (action, duration = defaultDuration, delay = defaultDelay) => {
    if (actionId) {
      clearTimeout(actionId);
      state.set('debounced');
    }

    state.set('pending');
    actionId = setTimeout(() => {
      action();
      isActive = true;
      actionId = null;
      state.set('active');
    }, delay);

    if (duration > 0) {
      if (fulfilledId) {
        clearTimeout(fulfilledId);
      }
      fulfilledId = setTimeout(fulfilled, duration + Math.max(delay, 0));
    }
  };

  fn.clear = () => {
    if (isActive) {
      state.set('cancelled');
    } else if (actionId) {
      clearTimeout(actionId);
      state.set('rejected');
    }
    if (fulfilledId) {
      clearTimeout(fulfilledId);
    }
    actionId = null;
    fulfilledId = null;
    isActive = false;
  };

  fn.on = (key, event) => {
    state.on(key, event);
  };

  return fn;
}
