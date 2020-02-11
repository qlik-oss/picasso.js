/**
 * Initilize a new dock configuration
 * @private
 * @param {object} [settings] - Settings object
 * @returns {object} A dock configuration instance
 * @example
 * let instance = dockConfig({
 *  dock: 'left',
 *  displayOrder: 2,
 *  prioOrder: 1,
 *  preferredSize: 33,
 *  minimumLayoutMode: 'L',
 *  show: true
 * });
 */
function dockConfig(settings = {}, callbackContext = {}) {
  let {
    dock = 'center',
    displayOrder = 0,
    prioOrder = 0,
    preferredSize = 0,
    minimumLayoutMode,
    show = true,
  } = settings;

  // avoid empty string dock
  dock = dock || 'center';

  /**
   * @private
   */
  return {
    /**
     * Returns the preferred size of a component.
     * The return value of the function can either be a number representing the required size in the dock direction
     * or an object with a `size` and `edgeBleed` property.
     * @param {object} [inner]
     * @param {object} [outer]
     * @returns {number|object} Returns the computed preferred size
     * @example
     * dockConfig.computePreferredSize(() => 150); // Require a size of 150 in the dock direction
     *
     * dockConfig.computePreferredSize(() => ({
     *  size: 150,
     *  edgeBleed: {
     *    left: 50,
     *    right: 50
     *  }
     * })); // Require a size of 150 in the dock direction and a bleed size of 50 to the left and right dock direction
     */
    computePreferredSize({ inner, outer }) {
      if (typeof preferredSize === 'function') {
        return preferredSize({ inner, outer, dock: this.dock() }, callbackContext);
      }
      return preferredSize;
    },

    /**
     * Set the dock direction, supported values are left | right | top | bottom. Any other value will be interpreted as center dock.
     * @param {string} [val=''] - Dock direction
     * @returns {this} The current context
     * @example
     * dockConfig.dock('left');
     */
    dock(val) {
      if (typeof val !== 'undefined') {
        dock = val;
        return this;
      }
      return typeof dock === 'function' ? dock(callbackContext) : dock;
    },

    /**
     * The `displayOrder` property is used by the layout engine to lay out components.
     * Components are interpreted in the ascending order of the `displayOrder` value. The layout engine apply the value in two ways,
     * the first is the order in which components are rendererd. The second is the area components are laid out in
     * when they have a direction, i.e. docked to either top, bottom, left or right.
     *
     * If docked at the same area, the component with a higher `displayOrder` will be rendered
     * on top of the component with a lower `displayOrder`. It can be seen as defining a z-index.
     * A lower `displayOrder` also means that a component will be laid out first in a given direction,
     * i.e. laid out closer to the central area (non-directional area) then a component with a higher `displayOrder`.
     * It can in this case be seen as the x-index or y-index.
     * @param {number} [val=0] - The display order
     * @returns {this|number} The current context or display order
     * @example
     * dockConfig.displayOrder(99);
     */
    displayOrder(val) {
      if (typeof val !== 'undefined') {
        displayOrder = val;
        return this;
      }
      return typeof displayOrder === 'function' ? displayOrder(callbackContext) : displayOrder;
    },

    /**
     * The `prioOrder` property is used to define the order in which components are added to the layout engine,
     * this is done before any components are laid out. When there is not enough space to add any more components
     * to a given area, all components not all ready added, are then discarded. The `prioOrder` is interpreted
     * in the ascending order. Such that a lower value is added to the layout engine first.
     * @param {number} [val=0] - The prio order
     * @returns {this|number} The current context or prio order
     * @example
     * dockConfig.prioOrder(-1);
     */
    prioOrder(val) {
      if (typeof val !== 'undefined') {
        prioOrder = val;
        return this;
      }
      return typeof prioOrder === 'function' ? prioOrder(callbackContext) : prioOrder;
    },

    /**
     * Ger or set the minimumLayoutMode
     * @param {string|object} [val] - The minimum layout mode
     * @returns {string|object|this} If no parameter is passed the current context is returned, else the current layout mode.
     * @example
     * dockConfig.minimumLayoutMode('L');
     * dockConfig.minimumLayoutMode({ width: 'S', height: 'L' });
     */
    minimumLayoutMode(val) {
      if (typeof val !== 'undefined') {
        minimumLayoutMode = val;
        return this;
      }
      return typeof minimumLayoutMode === 'function' ? minimumLayoutMode(callbackContext) : minimumLayoutMode;
    },

    /**
     * Set the component visibility. If false the component is not added to the layout engine.
     * @param {boolean} [val=true] - Toggle visibility
     * @returns {this|boolean} The current context or show
     */
    show(val) {
      if (typeof val !== 'undefined') {
        show = val;
        return this;
      }
      return typeof show === 'function' ? show(callbackContext) : show;
    },
  };
}

export default dockConfig;
