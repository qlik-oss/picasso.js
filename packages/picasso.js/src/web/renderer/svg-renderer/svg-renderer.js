import { tree as treeFactory } from './svg-tree';
import { svgNs } from './svg-nodes';
import sceneFactory from '../../../core/scene-graph/scene';
import { onLineBreak } from '../../text-manipulation';
import {
  resetGradients,
  onGradient,
  createDefsNode
} from './svg-gradient';
import createRendererBox from '../renderer-box';
import create from '../index';
import injectTextBoundsFn from '../../text-manipulation/inject-textbounds';

/**
 * Create a new svg renderer
 * @typedef {function} svgRendererFactory
 * @param {function} treeFactory - Node tree factory
 * @param {string} ns - Namespace definition
 * @param {function} sceneFn - Scene factory
 * @returns {renderer} A svg renderer instance
 */
export default function renderer(treeFn = treeFactory, ns = svgNs, sceneFn = sceneFactory) {
  const tree = treeFn();
  let el;
  let group;
  let hasChangedRect = false;
  let rect = createRendererBox();
  let scene;

  const svg = create();

  svg.element = () => el;

  svg.root = () => group;

  svg.appendTo = (element) => {
    if (!el) {
      el = element.ownerDocument.createElementNS(ns, 'svg');
      el.style.position = 'absolute';
      el.style['-webkit-font-smoothing'] = 'antialiased';
      el.style['-moz-osx-font-smoothing'] = 'antialiased';
      el.style.pointerEvents = 'none';
      el.setAttribute('xmlns', ns);
      group = element.ownerDocument.createElementNS(ns, 'g');
      group.style.pointerEvents = 'auto';
      el.appendChild(group);
    }

    element.appendChild(el);

    return el;
  };

  svg.render = (nodes) => {
    if (!el) {
      return false;
    }

    const scaleX = rect.scaleRatio.x;
    const scaleY = rect.scaleRatio.y;

    if (hasChangedRect) {
      el.style.left = `${Math.round(rect.margin.left + (rect.x * scaleX))}px`;
      el.style.top = `${Math.round(rect.margin.top + (rect.y * scaleY))}px`;
      el.setAttribute('width', Math.round(rect.width * scaleX));
      el.setAttribute('height', Math.round(rect.height * scaleY));
    }

    resetGradients();

    const sceneContainer = {
      type: 'container',
      children: Array.isArray(nodes) ? [...nodes, createDefsNode()] : nodes
    };

    if (scaleX !== 1 || scaleY !== 1) {
      sceneContainer.transform = `scale(${scaleX}, ${scaleY})`;
    }

    const newScene = sceneFn({
      items: [sceneContainer],
      on: {
        create: [
          onGradient,
          onLineBreak(svg.measureText),
          injectTextBoundsFn(svg)
        ]
      }
    });
    const hasChangedScene = scene ? !newScene.equals(scene) : true;

    const doRender = hasChangedRect || hasChangedScene;
    if (doRender) {
      svg.clear();
      tree.render(newScene.children, group);
    }

    hasChangedRect = false;
    scene = newScene;
    return doRender;
  };

  svg.itemsAt = input => (scene ? scene.getItemsFrom(input) : []);

  svg.findShapes = selector => (scene ? scene.findShapes(selector) : []);

  svg.clear = () => {
    if (!group) {
      return svg;
    }
    scene = null;
    const g = group.cloneNode(false);
    el.replaceChild(g, group);
    group = g;
    return svg;
  };

  svg.destroy = () => {
    if (el && el.parentElement) {
      el.parentElement.removeChild(el);
    }
    el = null;
    group = null;
  };

  svg.size = (opts) => {
    if (opts) {
      const newRect = createRendererBox(opts);

      if (JSON.stringify(rect) !== JSON.stringify(newRect)) {
        hasChangedRect = true;
        rect = newRect;
      }
    }

    return rect;
  };

  return svg;
}

export function rendererComponent(picasso) {
  picasso.renderer('svg', renderer);
}
