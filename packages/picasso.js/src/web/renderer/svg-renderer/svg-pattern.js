import { hashObject } from '../../../core/utils/crypto';

export default function patternizer(bucket, hasher = hashObject) {
  let cache = {};
  let uid = Date.now();
  const p = {
    onCreate(state) {
      let inputs = {};

      if (
        state.node &&
        typeof state.node.fill === 'object' &&
        state.node.fill.type === 'pattern' &&
        state.node.fill.shapes
      ) {
        inputs.fill = state.node.fill;
      }
      if (
        state.node &&
        typeof state.node.stroke === 'object' &&
        state.node.stroke.type === 'pattern' &&
        state.node.stroke.shapes
      ) {
        inputs.stroke = state.node.stroke;
      }

      Object.keys(inputs).forEach(key => {
        let url = '';
        const input = inputs[key];
        const patternHash = hasher(input);
        const pnid = `picasso-pattern-${uid}-${patternHash}`;

        if (typeof window !== 'undefined') {
          url = window.location.href.split('#')[0];
        }

        if (!cache[patternHash]) {
          const pn = {
            patternUnits: 'userSpaceOnUse',
            x: 0,
            y: 0,
            width: input.width,
            height: input.height,
            type: 'pattern',
            id: pnid,
            children: [],
            fill: input.fill,
          };

          input.shapes.forEach(s => {
            pn.children.push(s);
          });

          bucket.push(pn);
          cache[patternHash] = true;
        }

        state.node[`${key}Reference`] = `url('${url}#${pnid}')`;
      });
    },
    clear() {
      cache = {};
    },
  };

  return p;
}
