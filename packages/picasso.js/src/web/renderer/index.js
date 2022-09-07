import { measureText, textBounds } from '../text-manipulation';

/**
 * Base renderer factory
 * @private
 */
export default function create() {
  /**
   * @interface
   * @alias Renderer
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
     * Set or Get renderer settings
     * @param {object} [settings] Settings for the renderer
     */
    settings: () => {},

    /**
     * @param {HTMLElement} element - Element to attach renderer to
     * @returns {HTMLElement} Root element of the renderer
     */
    appendTo: () => {},

    /**
     * Get Scene based on provided nodes, constructed in the same way as in the render function.
     * Only the canvas and svg renderer uses scene nodes.
     * @private
     * @param {object[]} nodes - Nodes on which the scene will be constructed
     * @returns {Scene}
     */
    getScene: () => [],

    /**
     * @param {object[]} nodes - Nodes to render
     * @returns {boolean} True if the nodes were rendered, otherwise false
     */
    render: () => false,

    /**
     * Get nodes renderer at area
     * @param {Point|Circle|Rect|Line|Polygon|Geopolygon} geometry - Get nodes that intersects with geometry
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
     * @returns {Renderer} The renderer instance
     */
    clear: () => {},

    /**
     * Remove the renderer root element from its parent element
     */
    destory: () => {},

    /**
     * Set or Get the size definition of the renderer container.
     * @param {Renderer~SizeDefinition} [opts] - Size definition
     * @returns {Renderer~SizeDefinition} The current size definition
     */
    size: () => {},

    /**
     * @function
     * @param {object} opts
     * @param {string} opts.text - Text to measure
     * @param {string} opts.fontSize - Font size
     * @param {string} opts.fontFamily - Font family
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
     * @private
     * @param {TextNode} node
     * @return {Rect} The bounding rectangle
     */
    textBounds,

    setKey: (key) => {
      renderer.element().setAttribute('data-key', key);
    },
  };

  return renderer;
}
