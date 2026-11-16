const translateKnownTypes = {
  click: 'Tap',
  Click: 'Tap',
  tap: 'Tap',
  pan: 'Pan',
  swipe: 'Swipe',
  rotate: 'Rotate',
  press: 'Press',
  pinch: 'Pinch',
};

/**
 * Helper function for translating typical non-hammer gesture to a hammer gesture. Currently only supporting 'click'
 * @param {String} type Gesture type
 * @private
 */
function getGestureType(type) {
  return translateKnownTypes[type] || type;
}

/**
 * Manages event handlers for HammerJS.
 * @param {Hammer} Hammered - The Hammer instance
 */
function hammered(Hammered) {
  return function hammer(chart, mediator, element) {
    let settings;
    let instance;
    let mc;
    let key;
    let hammerGestures = [];
    let isOn = true;
    /**
     * Set default settings
     * @private
     */
    function setDefaultSettings(newSettings) {
      key = newSettings.key;
      settings = newSettings;
      instance = { chart, mediator, settings };
      settings.gestures = settings.gestures || [];
      if (settings.enable === undefined) {
        settings.enable = true;
      }
    }

    /**
     * @private
     * add hammer recognizers based on settings
     */
    function addRecognizers() {
      if (typeof settings.enable === 'function') {
        settings.enable = settings.enable.bind(instance)();
      }
      if (!settings.enable) {
        return; // interaction is disabled
      }
      // The gesture objects belong to the caller and may be passed in again on the next set()
      // (e.g. when a chart reuses them between updates). Never modify them: work on copies and
      // keep the bound handlers that were registered so that exactly those can be removed.
      settings.gestures.forEach((gesture) => {
        const options = { ...gesture.options };
        // handle action enable
        if (options.enable === undefined) {
          options.enable = true;
        }
        if (typeof options.enable === 'function') {
          options.enable = options.enable.bind(instance);
        }
        // setup hammer gestures
        const type = getGestureType(gesture.type);
        if (Hammered && Hammered[type]) {
          options.event = options.event || gesture.type.toLowerCase();
          mc = mc || new Hammered.Manager(element);
          mc.add(new Hammered[type](options));
          const events = {};
          Object.keys(gesture.events).forEach((eventName) => {
            events[eventName] = gesture.events[eventName].bind(instance);
            mc.on(eventName, events[eventName]);
          });
          hammerGestures.push({ gesture, event: options.event, events });
        }
      });

      // setup mixing hammer gestures
      hammerGestures.forEach(({ gesture, event }) => {
        if (gesture.recognizeWith) {
          mc.get(event).recognizeWith(gesture.recognizeWith.split(' ').filter((e) => e !== ''));
        }
        if (gesture.requireFailure) {
          mc.get(event).requireFailure(gesture.requireFailure.split(' ').filter((e) => e !== ''));
        }
      });
    }
    /**
     * @private
     * removes all added hammer recognizers and native events
     */
    function removeAddedEvents() {
      // remove hammer recognizers and registered events
      hammerGestures.forEach(({ event, events }) => {
        Object.keys(events).forEach((eventName) => {
          mc.off(eventName, events[eventName]);
        });
        mc.remove(event);
      });
      hammerGestures = [];
    }

    return {
      /**
       * Getter for the key.
       */
      get key() {
        return key;
      },
      /**
       * Updates this with new settings
       * @typedef settings
       * @type {object}
       * @property {string} [type] - The interaction type. Is 'hammer' for this component
       * @property {boolean|function} [enable] - Should the interaction be enabled or not.
       * This is only run when adding event handlers. In effect at startup, update or during on/off.
       * It does not run during every event loop.
       * @property {object} [events] - The keys in this object is the names of native events
       * that should be added to the chart element and they should all point to function which
       * will be the corresponding event handler.
       */
      set(newSettings) {
        setDefaultSettings(newSettings);
        removeAddedEvents();
        if (isOn) {
          addRecognizers();
        }
      },
      /**
       * Turns off interactions
       */
      off() {
        isOn = false;
        removeAddedEvents();
      },
      /**
       * Turns off interactions
       */
      on() {
        isOn = true;
        if (hammerGestures.length === 0) {
          addRecognizers();
        }
      },
      /**
       * Destroys and unbinds all event handlers
       */
      destroy() {
        removeAddedEvents();
        if (mc) {
          mc.destroy();
        }
        mc = null;
        instance = null;
        settings = null;
      },
    };
  };
}

export default hammered;
