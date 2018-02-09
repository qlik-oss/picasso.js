function getBasicEvent(event) {
  let ix;
  let ret;
  ['start', 'end'].forEach((s) => {
    ix = event.indexOf(s);
    if (ix >= 0) {
      ret = event.substring(0, ix);
    }
  });
  return ret || event;
}

class Manager {
  constructor(element) {
    this.element = element;
    this.gestures = [];
  }
  add(gesture) {
    gesture.manager = this;
    this.gestures.push(gesture);
  }
  remove(event) {
    let i = 0;
    for (; i < this.gestures.length; ++i) {
      if (this.gestures[i].opts.event === event) {
        break;
      }
    }
    if (i >= 0) {
      this.gestures.splice(i, 1);
    }
  }
  get(event) {
    for (let i = 0; i < this.gestures.length; ++i) {
      if (this.gestures[i].opts.event === event) {
        return this.gestures[i];
      }
    }
    return null;
  }
  on(event, listener) {
    if (this.get(getBasicEvent(event)).opts.enable) {
      this.element.addEventListener(event, listener);
    }
  }
  off(event, listener) {
    this.element.removeEventListener(event, listener);
  }
  destroy() {
    this.gestures = [];
  }
}

class BaseGesture {
  constructor(opts) {
    this.opts = opts;
    this._recognizeWith = [];
    this._requireFailure = [];
  }

  recognizeWith(events) {
    events.forEach((event) => {
      if (this.manager.get(event)) {
        this._recognizeWith.push(event);
      } else {
        throw new Error(`event "${event}" does not exist`);
      }
    });
  }

  requireFailure(events) {
    events.forEach((event) => {
      if (this.manager.get(event)) {
        this._requireFailure.push(event);
      } else {
        throw new Error(`event "${event}" does not exist`);
      }
    });
  }
}

class Tap extends BaseGesture {
  constructor(opts) {
    opts.event = opts.event || 'tap';
    super(opts);
  }
}
class Pan extends BaseGesture {
  constructor(opts) {
    opts.event = opts.event || 'pan';
    super(opts);
  }
}

function hammerMock() {
  const Hammer = {};
  Hammer.Manager = Manager;
  Hammer.Tap = Tap;
  Hammer.Pan = Pan;
  global.Hammer = Hammer;
  return Hammer;
}

export default hammerMock;
