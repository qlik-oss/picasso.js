import { ellipsText, measureText } from '../../text-manipulation';
import baselineHeuristic from '../../text-manipulation/baseline-heuristic';
import { detectTextDirection, flipTextAnchor } from '../../../core/utils/rtl-util';

const svgNs = 'http://www.w3.org/2000/svg';
// const badValues = ['', NaN, 'NaN', undefined, null, false, true];

const creator = (type, parent) => {
  if (!type || typeof type !== 'string') {
    throw new Error(`Invalid type: ${type}`);
  }

  const el = parent.ownerDocument.createElementNS(svgNs, type === 'container' ? 'g' : type);

  parent.appendChild(el);
  return el;
};

const destroyer = (el) => {
  if (el.parentNode) {
    el.parentNode.removeChild(el);
  }
};

// isValid - is a way to bring a more consistent rendering behaviour between SVG and canvas.
// Where SVG would treat NaN values as 0, canvas would simple not render anything.
const isValid = (item) => {
  switch (item.type) {
    case 'circle':
      return !isNaN(item.attrs.cx) && !isNaN(item.attrs.cy) && !isNaN(item.attrs.r);
    case 'line':
      return !isNaN(item.attrs.x1) && !isNaN(item.attrs.y1) && !isNaN(item.attrs.x2) && !isNaN(item.attrs.y2);
    case 'rect':
      return !isNaN(item.attrs.x) && !isNaN(item.attrs.y) && !isNaN(item.attrs.width) && !isNaN(item.attrs.height);
    case 'text':
      return !isNaN(item.attrs.x) && !isNaN(item.attrs.y);
    case 'image':
      return !isNaN(item.attrs.x) && !isNaN(item.attrs.y);
    default:
      return true;
  }
};

function handleImageLoad({ element, attrs }) {
  return function onImageLoad() {
    const { width, height, imgPosition, imgScalingFactor, symbol } = attrs;
    let { x = 0, y = 0 } = attrs;

    let imgWidth = width > 0 ? width : this.naturalWidth;
    let imgHeight = height > 0 ? height : this.naturalHeight;

    if (imgScalingFactor) {
      imgWidth *= imgScalingFactor;
      imgHeight *= imgScalingFactor;
    }

    switch (imgPosition) {
      case 'top-center':
        y -= imgHeight / 2;
        break;
      case 'center-left':
        x -= imgWidth / 2;
        break;
      case 'center-right':
        x += imgWidth / 2;
        break;
      case 'top-left':
        x -= imgWidth / 2;
        y -= imgHeight / 2;
        break;
      case 'top-right':
        x += imgWidth / 2;
        y -= imgHeight / 2;
        break;
      case 'bottom-left':
        x -= imgWidth / 2;
        y += imgHeight / 2;
        break;
      case 'bottom-right':
        x += imgWidth / 2;
        y += imgHeight / 2;
        break;
      case 'bottom-center':
        y += imgHeight / 2;
        break;
      default:
        break;
    }

    element.setAttribute('width', imgWidth);
    element.setAttribute('height', imgHeight);
    element.setAttribute('x', x - imgWidth / 2);
    element.setAttribute('y', y - imgHeight / 2);
    element.setAttribute('preserveAspectRatio', 'none');

    if (symbol === 'circle') {
      const svg = element.ownerSVGElement;
      if (!svg) {
        return;
      }

      const id = `clip-${Math.random().toString(36).substr(2, 9)}`;
      if (!svg.querySelector(`#${id}`)) {
        const defs =
          svg.querySelector('defs') || svg.insertBefore(document.createElementNS(svgNs, 'defs'), svg.firstChild);

        const clipPath = document.createElementNS(svgNs, 'clipPath');
        clipPath.setAttribute('id', id);

        const circle = document.createElementNS(svgNs, 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', Math.min(imgWidth, imgHeight) / 2);
        clipPath.appendChild(circle);
        defs.appendChild(clipPath);
      }

      element.setAttribute('clip-path', `url(#${id})`);
    }
  };
}

const maintainer = (element, item) => {
  if (isValid(item)) {
    for (const attr in item.attrs) {
      if (attr === 'stroke' && item.strokeReference) {
        element.setAttribute('stroke', item.strokeReference);
      } else if (attr === 'fill' && item.fillReference) {
        element.setAttribute('fill', item.fillReference);
      } else if (attr === 'text') {
        element.setAttribute('style', 'white-space: pre');
        element.textContent = item.ellipsed || ellipsText(item.attrs, measureText);
        const dir = detectTextDirection(item.attrs.text);
        if (dir === 'rtl') {
          element.setAttribute('direction', 'rtl');
          element.setAttribute('dir', 'rtl');
          element.setAttribute('text-anchor', flipTextAnchor(element.getAttribute('text-anchor'), dir));
        }
      } else if (item.type === 'text' && (attr === 'dy' || attr === 'dominant-baseline')) {
        const dy = +element.getAttribute(attr) || 0;
        let val = 0;
        if (attr === 'dominant-baseline') {
          val = baselineHeuristic(item.attrs);
        } else {
          val = item.attrs[attr];
        }
        element.setAttribute('dy', val + dy);
      } else if (item.type === 'text' && attr === 'title' && item.attrs.title) {
        const t = element.ownerDocument.createElementNS(svgNs, 'title');
        t.textContent = item.attrs.title;
        element.appendChild(t);
      } else if (item.type === 'image' && attr === 'src') {
        element.setAttributeNS('http://www.w3.org/1999/xlink', 'href', item.attrs.src);
        let img = new Image();
        img.src = item.attrs.src;
        img.onload = handleImageLoad({ element, attrs: item.attrs });
      } else {
        element.setAttribute(attr, item.attrs[attr]);
      }
    }

    if (typeof item.data === 'string' || typeof item.data === 'number' || typeof item.data === 'boolean') {
      element.setAttribute('data', item.data);
    } else if (typeof item.data === 'object' && item.data !== null) {
      for (const d in item.data) {
        if (typeof item.data[d] === 'string' || typeof item.data[d] === 'number' || typeof item.data[d] === 'boolean') {
          element.setAttribute(`data-${d}`, item.data[d]);
        }
      }
    }
  }
};

export { svgNs, creator, maintainer, destroyer };
