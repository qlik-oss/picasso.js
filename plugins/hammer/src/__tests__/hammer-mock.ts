/* eslint max-classes-per-file: 0 */

function getBasicEvent(event: string): string {
  let ix: number;
  let ret: string | undefined;
  ['start', 'end'].forEach((s: string) => {
    ix = event.indexOf(s);
    if (ix >= 0) {
      ret = event.substring(0, ix);
    }
  });
  return ret || event;
}

interface GestureOptions {
  event?: string;
  enable?: boolean | (() => boolean);
  [key: string]: unknown;
}

interface BaseGestureInstance {
  opts: GestureOptions;
  manager?: Manager;
  _recognizeWith: string[];
  _requireFailure: string[];
  recognizeWith(events: string[]): void;
  requireFailure(events: string[]): void;
}

class Manager {
  element: Element;
  gestures: BaseGestureInstance[] = [];

  constructor(element: Element) {
    this.element = element;
    this.gestures = [];
  }

  add(gesture: BaseGestureInstance): void {
    gesture.manager = this;
    this.gestures.push(gesture);
  }

  remove(event: string): void {
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

  get(event: string): BaseGestureInstance | null {
    for (let i = 0; i < this.gestures.length; ++i) {
      if (this.gestures[i].opts.event === event) {
        return this.gestures[i];
      }
    }
    return null;
  }

  on(event: string, listener: EventListener): void {
    const gesture = this.get(getBasicEvent(event));
    if (gesture && gesture.opts.enable) {
      this.element.addEventListener(event, listener);
    }
  }

  off(event: string, listener: EventListener): void {
    this.element.removeEventListener(event, listener);
  }

  destroy(): void {
    this.gestures = [];
  }
}

class BaseGesture implements BaseGestureInstance {
  opts: GestureOptions;
  manager?: Manager;
  _recognizeWith: string[] = [];
  _requireFailure: string[] = [];

  constructor(opts: GestureOptions) {
    this.opts = opts;
    this._recognizeWith = [];
    this._requireFailure = [];
  }

  recognizeWith(events: string[]): void {
    events.forEach((event: string) => {
      if (this.manager && this.manager.get(event)) {
        this._recognizeWith.push(event);
      } else {
        throw new Error(`event "${event}" does not exist`);
      }
    });
  }

  requireFailure(events: string[]): void {
    events.forEach((event: string) => {
      if (this.manager && this.manager.get(event)) {
        this._requireFailure.push(event);
      } else {
        throw new Error(`event "${event}" does not exist`);
      }
    });
  }
}

class Tap extends BaseGesture {
  constructor(opts: GestureOptions) {
    opts.event = opts.event || 'tap';
    super(opts);
  }
}

class Pan extends BaseGesture {
  constructor(opts: GestureOptions) {
    opts.event = opts.event || 'pan';
    super(opts);
  }
}

interface HammerMock {
  Manager: typeof Manager;
  Tap: typeof Tap;
  Pan: typeof Pan;
  [key: string]: unknown;
}

function hammerMock(): HammerMock {
  const Hammer: HammerMock = {
    Manager,
    Tap,
    Pan,
  };
  return Hammer;
}

export default hammerMock;
