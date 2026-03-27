import { h, render } from 'preact';
import createRendererBox from '../renderer-box';
import create from '../index';

/** Options for the DOM renderer */
interface DomRendererOptions {
  createElement?: (tagName: string) => HTMLElement;
}

/** Settings for the DOM renderer */
interface DomRendererSettings {
  transform: string | undefined;
  disableScreenReader: boolean;
}

export default function renderer(opts: DomRendererOptions = {}) {
  const { createElement = document.createElement.bind(document) } = opts;

  let el: HTMLElement | undefined;
  let rect = createRendererBox();
  let dNode: unknown;
  const settings: DomRendererSettings = {
    transform: undefined,
    disableScreenReader: false,
  };

  const dom: ReturnType<typeof create> & Record<string, unknown> = create() as ReturnType<typeof create> &
    Record<string, unknown>;

  dom.element = () => el;

  dom.root = () => el;

  dom.settings = (rendererSettings) => {
    if (rendererSettings) {
      Object.keys(settings).forEach((key) => {
        if (rendererSettings[key] !== undefined) {
          settings[key] = rendererSettings[key];
        }
      });
    }

    return settings;
  };

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

    const transformation = typeof settings.transform === 'function' && settings.transform();
    if (transformation) {
      const {
        horizontalScaling,
        horizontalSkewing,
        verticalSkewing,
        verticalScaling,
        horizontalMoving,
        verticalMoving,
      } = transformation;
      el.style.transform = `matrix(${horizontalScaling}, ${horizontalSkewing}, ${verticalSkewing}, ${verticalScaling}, ${horizontalMoving}, ${verticalMoving})`;
      return true;
    }
    el.style.transform = '';

    const disableScreenReader = settings.disableScreenReader;
    if (disableScreenReader) {
      el.setAttribute('aria-hidden', true);
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
