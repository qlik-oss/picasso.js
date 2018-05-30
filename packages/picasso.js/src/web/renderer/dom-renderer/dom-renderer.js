import { h, patch } from './vdom';
import createRendererBox from '../renderer-box';
import create from '../index';

export default function renderer(opts = {}) {
  const {
    createElement = document.createElement.bind(document)
  } = opts;

  let el;
  let rect = createRendererBox();
  let vnode;

  const dom = create();

  dom.element = () => el;

  dom.root = () => el;

  dom.appendTo = (element) => {
    if (!el) {
      el = createElement('div');
      el.style.position = 'absolute';
      el.style['-webkit-font-smoothing'] = 'antialiased';
      el.style['-moz-osx-font-smoothing'] = 'antialiased';
      el.style.pointerEvents = 'none';
    }

    element.appendChild(el);

    return el;
  };

  dom.render = (nodes) => {
    if (!el) {
      return false;
    }

    const scaleX = rect.scaleRatio.x;
    const scaleY = rect.scaleRatio.y;

    el.style.left = `${Math.round(rect.margin.left + (rect.x * scaleX))}px`;
    el.style.top = `${Math.round(rect.margin.left + (rect.y * scaleY))}px`;
    el.style.width = `${Math.round(rect.width * scaleX)}px`;
    el.style.height = `${Math.round(rect.height * scaleY)}px`;

    const node = h('div', {}, Array.isArray(nodes) ? nodes : [nodes]);

    if (vnode) {
      patch(vnode, node);
    } else {
      patch(el, node);
    }
    vnode = node;

    return true;
  };

  dom.renderArgs = [h]; // Arguments to render functions using the DOM renderer

  dom.clear = () => {
    if (el) {
      let first = el.firstChild;

      while (first) {
        el.removeChild(first);
        first = el.firstChild;
      }
      vnode = null;
    }

    return dom;
  };

  dom.destroy = () => {
    if (el && el.parentElement) {
      el.parentElement.removeChild(el);
    }
    el = null;
    vnode = null;
  };

  dom.size = (inner) => {
    if (inner) {
      rect = createRendererBox(inner);
    }
    return rect;
  };

  return dom;
}
