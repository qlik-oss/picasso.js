/**
 * @typedef {object} ComponentContainer
 * @experimental
 * @extends ComponentSettings
 * @property {string} [type='container']
 * @example
 * {
 *  type: 'container',
 *  preferredSize: ({ inner, outer, dock, children }) => {
 *    const sizes = children.map(c => c.preferredSize({ inner, outer }));
 *    return Math.max(...sizes);
 *  },
 *  strategy: (rect, components) => {
 *    const height = rect.height / components.length;
 *    components.forEach((c, i) => {
 *      c.resize({ ...rect, height, y: rect.y + i * height })
 *    });
 *    return { visible: components, hidden: [], order: components };
 *  },
 *  components: [
 *     ...
 *  ],
 * }
 */

const containerComponent = {
  render() {
    return [];
  },
};

export default containerComponent;
