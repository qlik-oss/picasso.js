import { measureText, textBounds } from '../text-manipulation';

/**
 * Base renderer factory
 * @private
 */
function create() {
  /**
   * @interface
   * @alias renderer
   */
  const renderer = {
    /**
     * Get the element this renderer is attached to
     * @returns {HTMLElement}
     */
    element: () => {},

    /**
     * Get the root element of the renderer
     * @returns {HTMLElement}
     */
    root: () => {},

    /**
     * @param {HTMLElement} element - Element to attach renderer to
     * @returns {HTMLElement} Root element of the renderer
     */
    appendTo: () => {},

    /**
     * @param {node-def[]} nodes - Nodes to render
     * @returns {boolean} True if the nodes where rendered, otherwise false
     */
    render: () => false,

    /**
     * Get nodes renderer at area
     * @param {point|circle|rect|line|polygon|geopolygon} geometry - Get nodes that intersects with geometry
     * @returns {SceneNode[]}
     */
    itemsAt: () => [],

    /**
     * Get all nodes matching the provided selector
     * @param {string} selector CSS selector [type, attribute, universal, class]
     * @returns {SceneNode[]} Array of objects containing matching nodes
     */
    findShapes: () => [],

    /**
     * Clear all child elements from the renderer root element
     * @returns {renderer} The renderer instance
     */
    clear: () => {},

    /**
     * Remove the renderer root element from its parent element
     */
    destory: () => {},

    /**
     * Set or Get the size definition of the renderer container.
     * @param {renderer-container-def} [opts] - Size definition
     * @returns {renderer-container-def} The current size definition
     */
    size: () => {},

    /**
     * @function
     * @param {object} opts
     * @param {string} opts.text - Text to measure
     * @param {string} opts.fontSize - {@link https://www.w3.org/TR/SVG/text.html#FontPropertiesUsedBySVG}
     * @param {string} opts.fontFamily - {@link https://www.w3.org/TR/SVG/text.html#FontPropertiesUsedBySVG}
     * @returns {object} Width and height of text
     * @example
     * measureText({
     *  text: 'my text',
     *  fontSize: '12px',
     *  fontFamily: 'Arial'
     * }); // returns { width: 20, height: 12 }
     */
    measureText,

    /**
     * Calculates the bounding rectangle of a text node. Including any potential line breaks.
     * @function
     * @param {node--text-def} node
     * @return {rect} The bounding rectangle
     */
    textBounds,

    setKey: (key) => {
      renderer.element().setAttribute('data-key', key);
    },
  };

  return renderer;
}

export { create as default };
