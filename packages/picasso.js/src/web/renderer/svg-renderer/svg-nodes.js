import { ellipsText, measureText } from '../../text-manipulation';
import baselineHeuristic from '../../text-manipulation/baseline-heuristic';
import { detectTextDirection, flipTextAnchor } from '../../../core/utils/rtl-util';

const svgNs = 'http://www.w3.org/2000/svg';

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

const maintainer = (element, item) => {
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
};

export {
  svgNs,
  creator,
  maintainer,
  destroyer
};
