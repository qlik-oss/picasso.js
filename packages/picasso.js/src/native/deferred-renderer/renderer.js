import sceneFactory from '../../core/scene-graph/scene';
import createRendererBox from '../../web/renderer/renderer-box';
import create from '../../web/renderer/index';

const d3 = require('d3-path');
const getPixelWidth = require('string-pixel-width');

const renderer = (sceneFn = sceneFactory) => {
  const rnRnderer = create();
  let rect = createRendererBox();
  let element;
  let scene;
  let _key;

  function buildRect(context, _rect, obj) {
    context.rect(_rect.x, _rect.y, _rect.width, _rect.height);
    obj.stroke = _rect.stroke;
    obj.strokeWidth = _rect.strokeWidth;
    obj.opacity = _rect?.opacity;
    obj.fill = _rect.fill;
    obj.path = context.toString();
  }

  rnRnderer.setKey = (k) => {
    _key = k;
    if (element && element.setAnimationKey) {
      element.setAnimationKey(k);
    }
  };

  rnRnderer.appendTo = (parent) => {
    if (!element) {
      element = parent.createElement(rect, _key);
    }
  };

  rnRnderer.element = () => {
    return element;
  };

  rnRnderer.root = () => element;

  rnRnderer.measureText = (opt) => {
    let size = parseInt(opt.fontSize, 10);
    if (isNaN(size)) {
      size = 12;
    }
    const fontFamily = opt.fontFamily.split(',').map((s) => s.trim().toLowerCase());
    const font = fontFamily.length > 1 ? fontFamily[1] : fontFamily[0];
    const dims = opt.fontSize
      ? { width: getPixelWidth(opt.text, { size, font }), height: size }
      : { width: getPixelWidth(opt.text, { size: 12, font }) };
    return dims;
  };

  rnRnderer.size = (opts) => {
    if (opts) {
      const newRect = createRendererBox(opts);
      rect = newRect;
      return newRect;
    }

    return rect;
  };

  rnRnderer.clear = () => {
    if (element) {
      element.clear();
    }
    scene = null;
  };

  rnRnderer.destroy = () => {
    if (element) {
      element.destroy();
    }
    scene = null;
  };

  rnRnderer.render = (shapes) => {
    element.clear();
    const sceneContainer = {
      type: 'container',
      children: shapes,
    };

    const newScene = sceneFn({
      items: [sceneContainer],
    });

    shapes.forEach((shape) => {
      const obj = { type: shape.type };
      // do individual properties because in react-native
      // these objects are transfered over the bridge.  The bridge
      // serializes the object into JSON, when there's 1000's of objects, every little bit helps.
      switch (shape.type) {
        case 'line': {
          const context = d3.path();
          context.moveTo(shape.x1, shape.y1);
          context.lineTo(shape.x2, shape.y2);
          obj.stroke = shape.stroke;
          obj.strokeWidth = shape.strokeWidth;
          obj.opacity = shape?.opacity;
          obj.path = context.toString();
          element.add(obj);
          break;
        }
        case 'path': {
          obj.fill = shape.fill;
          obj.stroke = shape.stroke;
          obj.strokeWidth = shape?.strokeWidth;
          obj.path = shape.d;
          element.add(obj);
          break;
        }
        case 'circle': {
          const context = d3.path();
          context.arc(shape.cx, shape.cy, shape.r, 0, 2 * Math.PI);
          obj.stroke = shape.stroke;
          obj.strokeWidth = shape.strokeWidth;
          obj.opacity = shape?.opacity;
          obj.fill = shape.fill;
          obj.path = context.toString();
          element.add(obj);
          break;
        }
        case 'text': {
          obj.text = shape.text;
          obj.transform = shape?.transform;
          obj.boundingRect = shape?.boundingRect;
          obj.fill = shape.fill;
          obj.font = {
            fontFamily: shape.fontFamily,
            fontSize: parseFloat(shape.fontSize),
            anchor: shape.anchor,
            x: shape.x,
            y: shape.y,
            maxWidth: shape?.maxWidth,
            maxHeight: shape?.maxHeight,
          };
          element.add(obj);
          break;
        }
        case 'container': {
          const context = d3.path();
          const _rect = shape.children[0];
          buildRect(context, _rect, obj);
          element.add(obj);
          break;
        }
        case 'rect': {
          const context = d3.path();
          buildRect(context, shape, obj);
          element.add(obj);
          break;
        }
        default: {
          break;
        }
      }
    });

    scene = newScene;
  };

  rnRnderer.itemsAt = (input) => (scene ? scene.getItemsFrom(input) : []);

  rnRnderer.findShapes = (selector) => (scene ? scene.findShapes(selector) : []);

  return rnRnderer;
};
export default renderer;
