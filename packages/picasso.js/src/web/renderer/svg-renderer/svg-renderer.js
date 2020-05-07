import { tree as treeFactory } from './svg-tree';
import { svgNs } from './svg-nodes';
import sceneFactory from '../../../core/scene-graph/scene';
import { onLineBreak } from '../../text-manipulation';
// import {
//   resetGradients,
//   onGradient,
//   createDefsNode
// } from './svg-gradient';

import gradienter from './svg-gradient';
import patternizer from './svg-pattern';

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

  const defs = {
    type: 'defs',
    children: [],
  };
  const patterns = patternizer(defs.children);
  const gradients = gradienter(defs.children);

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
      el.style.left = `${rect.computedPhysical.x}px`;
      el.style.top = `${rect.computedPhysical.y}px`;
      el.setAttribute('width', rect.computedPhysical.width);
      el.setAttribute('height', rect.computedPhysical.height);
    }

    gradients.clear();
    patterns.clear();
    defs.children.length = 0;

    const sceneContainer = {
      type: 'container',
      children: Array.isArray(nodes) ? [...nodes, defs] : nodes,
      transform: rect.edgeBleed.bool
        ? `translate(${rect.edgeBleed.left * scaleX}, ${rect.edgeBleed.top * scaleY})`
        : '',
    };

    if (scaleX !== 1 || scaleY !== 1) {
      sceneContainer.transform += `scale(${scaleX}, ${scaleY})`;
    }

    const newScene = sceneFn({
      items: [sceneContainer],
      on: {
        create: [
          (state) => {
            state.node.fillReference = undefined;
            state.node.strokeReference = undefined;
          },
          gradients.onCreate,
          patterns.onCreate,
          onLineBreak(svg.measureText),
          injectTextBoundsFn(svg),
        ],
      },
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

  svg.itemsAt = (input) => (scene ? scene.getItemsFrom(input) : []);

  svg.findShapes = (selector) => (scene ? scene.findShapes(selector) : []);

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
    // parentElement is not supported in IE11 for SVGElement.
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
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
