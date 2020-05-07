/**
 * Manages event handlers for native events
 * @private
 */
function native(chart, mediator, element) {
  let instance = { chart, mediator, element };
  let nativeEvents = [];
  let settings;
  let itKey;
  let isOn = true;

  /**
   * Set default settings
   * @private
   */
  function setDefaultSettings(newSettings) {
    itKey = newSettings.key;
    settings = newSettings;
    settings.events = settings.events || [];
    if (settings.enable === undefined) {
      settings.enable = true;
    }
  }

  /**
   * Add native events based on settings
   * @private
   */
  function addEvents() {
    if (typeof settings.enable === 'function') {
      settings.enable = settings.enable.bind(instance)();
    }
    if (!settings.enable) {
      return; // interaction is disabled
    }
    Object.keys(settings.events).forEach((key) => {
      const listener = settings.events[key].bind(instance);
      element.addEventListener(key, listener);
      nativeEvents.push({ key, listener });
    });
  }

  /**
   * Removes all added native events
   * @private
   */
  function removeAddedEvents() {
    // remove added native events
    nativeEvents.forEach(({ key, listener }) => {
      element.removeEventListener(key, listener);
    });
    nativeEvents = [];
  }

  return {
    /**
     * Getter for the key.
     * @private
     */
    get key() {
      return itKey;
    },
    /**
     * Updates this with new settings
     * @private
     * @param {object} newSettings
     * @param {string} [newSettings.type] - The interaction type. Is 'native' for this component
     * @param {boolean|function} [newSettings.enable=true] - Should the interactions defined here be enabled or not.
     * This is only run when adding event handlers. In effect at startup, update or during on/off.
     * It does not run during every event loop.
     * @param {array} [newSettings.gestures] - The keys in this object is the names of native events
     * that should be added to the chart element and they should all point to function which
     * will be the corresponding event handler.
     */
    set(newSettings) {
      setDefaultSettings(newSettings);
      removeAddedEvents();
      if (isOn) {
        addEvents();
      }
    },
    /**
     * Turns off interactions
     * @private
     */
    off() {
      isOn = false;
      removeAddedEvents();
    },
    /**
     * Turns off interactions
     * @private
     */
    on() {
      isOn = true;
      if (nativeEvents.length === 0) {
        addEvents();
      }
    },
    /**
     * Destroys and unbinds all event handlers
     * @private
     */
    destroy() {
      removeAddedEvents();
      instance = null;
      settings = null;
    },
  };
}

export { native as default };
