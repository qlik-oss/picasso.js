import { degreesToPoints } from '../../../core/math/angles';
import { hashObject } from '../../../core/utils/crypto';

export default function gradienter(bucket, hasher = hashObject) {
  let cache = {};
  let uid = Date.now();

  const p = {
    getOrCreateGradient(item = {}, attr = 'fill', url = '') {
      let gradientHash = hasher(item[attr]);
      let gradientId = `picasso-gradient-${uid}-${gradientHash}`;

      if (!cache[gradientHash]) {
        let { orientation, degree, stops = [] } = item[attr];
        let gradient = {};

        if (degree === undefined) {
          degree = 90;
        }

        // Default to linear
        if (orientation === 'radial') {
          gradient.type = 'radialGradient';
        } else {
          gradient = degreesToPoints(degree);
          ['x1', 'x2', 'y1', 'y2'].forEach((c) => {
            if (c in item[attr]) {
              gradient[c] = item[attr][c];
            }
          });
          gradient.type = 'linearGradient';
        }

        gradient.id = gradientId;
        gradient.children = stops.map(({ offset, color, opacity }) => ({
          type: 'stop',
          offset: `${offset * 100}%`,
          style: `stop-color:${color};stop-opacity:${typeof opacity !== 'undefined' ? opacity : 1}`
        }));

        bucket.push(gradient);
        cache[gradientHash] = gradientId;
      }

      return `url('${url}#${gradientId}')`;
    },
    onCreate(state) {
      let url = '';
      if (typeof window !== 'undefined') {
        url = window.location.href.split('#')[0];
      }

      const item = state.node;
      if (item.fill && typeof item.fill === 'object' && item.fill.type === 'gradient') {
        item.fillReference = p.getOrCreateGradient(item, 'fill', url);
      }

      if (item.stroke && typeof item.stroke === 'object' && item.stroke.type === 'gradient') {
        item.strokeReference = p.getOrCreateGradient(item, 'stroke', url);
      }
    },
    clear() {
      cache = {};
    }
  };

  return p;
}
