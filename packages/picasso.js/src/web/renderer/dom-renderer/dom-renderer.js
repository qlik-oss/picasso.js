import { h, render } from 'preact';
import createRendererBox from '../renderer-box';
import create from '../index';

export default function renderer(opts = {}) {
  const { createElement = document.createElement.bind(document) } = opts;

  let el;
  let rect = createRendererBox();
  let dNode;

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

    el.style.left = `${rect.computedPhysical.x}px`;
    el.style.top = `${rect.computedPhysical.y}px`;
    el.style.width = `${rect.computedPhysical.width}px`;
    el.style.height = `${rect.computedPhysical.height}px`;

    let vNode;
    if (Array.isArray(nodes)) {
      vNode = <div>{nodes}</div>;
    } else {
      vNode = nodes;
    }

    dNode = render(vNode, el, dNode);

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
      dNode = null;
    }

    return dom;
  };

  dom.destroy = () => {
    if (el && el.parentElement) {
      el.parentElement.removeChild(el);
    }
    el = null;
    dNode = null;
  };

  dom.size = (inner) => {
    if (inner) {
      rect = createRendererBox(inner);
    }
    return rect;
  };

  return dom;
}
