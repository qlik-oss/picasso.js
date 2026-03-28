import canvascontext from './canvas-context';

interface MockElement {
  name: string;
  attributes: Record<string, unknown>;
  style: Record<string, unknown>;
  children: MockElement[];
  listeners: Record<string, EventListener>[];
  parentNode: MockElement | null;
  parentElement: MockElement | null;
  ownerDocument: {
    createElementNS(ns: string, tag: string): MockElement;
    createElement(tag: string): MockElement;
  };
  cloneNode(b?: boolean): MockElement;
  replaceChild(add: MockElement, remove: MockElement): void;
  setAttribute(attr: string, value: unknown): void;
  getAttribute(attr: string): unknown;
  appendChild(el: MockElement): void;
  firstChild: MockElement | undefined;
  removeChild(el: MockElement): void;
  insertBefore(el: MockElement, ref: MockElement): void;
  addEventListener(key: string, val: EventListener): void;
  removeEventListener(key: string, val: EventListener): void;
  trigger(listenerKey: string, arg: unknown): void;
  getBoundingClientRect(): { left: number; top: number; width: number; height: number };
  contains(target: MockElement): boolean;
  getContext?: (type: string) => ReturnType<typeof canvascontext>;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type EventListener = (arg: unknown) => void;

function element(name: string = '', rect: Rect = { x: 0, y: 0, width: 100, height: 100 }): MockElement {
  const e: MockElement = {
    name,
    attributes: {},
    style: {},
    children: [],
    listeners: [],
    parentNode: null,
    parentElement: null,
    ownerDocument: {
      createElementNS(ns: string, tag: string): MockElement {
        return element(`${ns}:${tag}`);
      },
      createElement(tag: string): MockElement {
        return element(tag);
      },
    },
    cloneNode(b?: boolean): MockElement {
      const ret = element(this.name);
      if (b) {
        ret.children = b ? this.children.slice() : [];
      }
      return ret;
    },
    replaceChild(add: MockElement, remove: MockElement): void {
      this.children.splice(this.children.indexOf(remove), 1, add);
    },
    setAttribute(attr: string, value: unknown): void {
      this.attributes[attr] = value;
    },
    getAttribute(attr: string): unknown {
      return this.attributes[attr];
    },
    appendChild(el: MockElement): void {
      this.children.push(el);
      el.parentNode = this;
      el.parentElement = this;
    },
    get firstChild(): MockElement | undefined {
      return this.children[0];
    },
    removeChild(el: MockElement): void {
      this.children.splice(this.children.indexOf(el), 1);
      el.parentNode = null;
      el.parentElement = this;
    },
    insertBefore(el: MockElement, ref: MockElement): void {
      const idx = this.children.indexOf(el);
      if (idx !== -1 && el !== ref) {
        this.children.splice(idx, 1);
      }
      this.children.splice(this.children.indexOf(ref), el === ref ? 1 : 0, el);
    },
    addEventListener(key: string, val: EventListener): void {
      const obj: Record<string, EventListener> = {};
      obj[key] = val;
      this.listeners.push(obj);
    },
    removeEventListener(key: string, val: EventListener): void {
      for (let i = this.listeners.length - 1; i >= 0; i--) {
        if (this.listeners[i][key] === val) {
          this.listeners.splice(i, 1);
        }
      }
    },
    trigger(listenerKey: string, arg: unknown): void {
      this.listeners
        .filter((l: Record<string, EventListener>): boolean => typeof l[listenerKey] !== 'undefined')
        .forEach((l: Record<string, EventListener>): void => {
          l[listenerKey].call(this, arg);
        });
    },
    getBoundingClientRect(): { left: number; top: number; width: number; height: number } {
      return {
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      };
    },
    contains(target: MockElement): boolean {
      return this.children.indexOf(target) !== -1;
    },
  };

  let context2d: ReturnType<typeof canvascontext> | undefined;

  if (name === 'canvas') {
    e.getContext = (): ReturnType<typeof canvascontext> => {
      context2d = context2d || canvascontext('2d');
      return context2d;
    };
  }

  return e;
}

export default element;
