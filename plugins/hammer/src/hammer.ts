interface TranslateKnownTypes {
  [key: string]: string;
}

const translateKnownTypes: TranslateKnownTypes = {
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
function getGestureType(type: string): string {
  return translateKnownTypes[type] || type;
}

interface GestureEventHandler {
  [key: string]: (e: unknown) => void;
}

interface GestureOptions {
  event?: string;
  enable?: boolean | ((this: unknown) => boolean);
  [key: string]: unknown;
}

interface Gesture {
  type: string;
  options?: GestureOptions;
  events: GestureEventHandler;
  recognizeWith?: string;
  requireFailure?: string;
}

interface HammerSettings {
  key?: string;
  enable?: boolean | ((this: unknown) => boolean);
  gestures?: Gesture[];
  [key: string]: unknown;
}

interface HammerManagerLike {
  add(recognizer: unknown): void;
  on(event: string, handler: (e: unknown) => void): void;
  off(event: string, handler: (e: unknown) => void): void;
  get(event: string): { recognizeWith(events: string[]): void; requireFailure(events: string[]): void } | null;
  remove(event: string): void;
  destroy(): void;
}

interface HammerLike {
  [key: string]: unknown;
  Manager: new (element: Element, options?: Record<string, unknown>) => HammerManagerLike;
}

interface InteractionInstance {
  chart: unknown;
  mediator: unknown;
  settings: HammerSettings;
}

/**
 * Manages event handlers for HammerJS.
 * @param {Hammer} Hammered - The Hammer instance
 */
function hammered(Hammered: HammerLike): (chart: unknown, mediator: unknown, element: Element) => {
  readonly key: string | undefined;
  set(newSettings: HammerSettings): void;
  off(): void;
  on(): void;
  destroy(): void;
} {
  return function hammer(chart: unknown, mediator: unknown, element: Element) {
    let settings: HammerSettings | undefined;
    let instance: InteractionInstance | undefined;
    let mc: HammerManagerLike | undefined;
    let key: string | undefined;
    let hammerGestures: Gesture[] = [];
    let isOn = true;

    /**
     * Set default settings
     * @private
     */
    function setDefaultSettings(newSettings: HammerSettings): void {
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
    function addRecognizers(): void {
      if (!settings) return;
      if (typeof settings.enable === 'function') {
        settings.enable = settings.enable.bind(instance)();
      }
      if (!settings.enable || !settings.gestures) {
        return; // interaction is disabled
      }
      settings.gestures.forEach((gesture: Gesture) => {
        gesture.options = gesture.options || {};
        // handle action enable
        if (gesture.options.enable === undefined) {
          gesture.options.enable = true;
        }
        if (typeof gesture.options.enable === 'function') {
          gesture.options.enable = gesture.options.enable.bind(instance);
        }
        // setup hammer gestures
        const type = getGestureType(gesture.type);
        if (Hammered && Hammered[type]) {
          gesture.options.event = gesture.options.event || gesture.type.toLowerCase();
          mc = mc || new Hammered.Manager(element);
          mc.add(new (Hammered[type] as any)(gesture.options));
          Object.keys(gesture.events).forEach((eventName: string) => {
            gesture.events[eventName] = gesture.events[eventName].bind(instance);
            if (mc) {
              mc.on(eventName, gesture.events[eventName]);
            }
          });
          hammerGestures.push(gesture);
        }
      });

      // setup mixing hammer gestures
      settings.gestures.forEach((gesture: Gesture) => {
        const type = getGestureType(gesture.type);
        if (Hammered && Hammered[type]) {
          if (gesture.recognizeWith && mc) {
            const gestureItem = mc.get(gesture.options?.event as string);
            if (gestureItem) {
              gestureItem.recognizeWith(gesture.recognizeWith.split(' ').filter((e: string) => e !== ''));
            }
          }
          if (gesture.requireFailure && mc) {
            const gestureItem = mc.get(gesture.options?.event as string);
            if (gestureItem) {
              gestureItem.requireFailure(gesture.requireFailure.split(' ').filter((e: string) => e !== ''));
            }
          }
        }
      });
    }

    /**
     * @private
     * removes all added hammer recognizers and native events
     */
    function removeAddedEvents(): void {
      // remove hammer recognizers and registered events
      hammerGestures.forEach((gesture: Gesture) => {
        Object.keys(gesture.events).forEach((eventName: string) => {
          if (mc) {
            mc.off(eventName, gesture.events[eventName]);
          }
        });
        if (mc && gesture.options?.event) {
          mc.remove(gesture.options.event as string);
        }
      });
      hammerGestures = [];
    }

    return {
      /**
       * Getter for the key.
       */
      get key(): string | undefined {
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
      set(newSettings: HammerSettings): void {
        setDefaultSettings(newSettings);
        removeAddedEvents();
        if (isOn) {
          addRecognizers();
        }
      },
      /**
       * Turns off interactions
       */
      off(): void {
        isOn = false;
        removeAddedEvents();
      },
      /**
       * Turns off interactions
       */
      on(): void {
        isOn = true;
        if (hammerGestures.length === 0) {
          addRecognizers();
        }
      },
      /**
       * Destroys and unbinds all event handlers
       */
      destroy(): void {
        removeAddedEvents();
        if (mc) {
          mc.destroy();
        }
        mc = undefined;
        instance = undefined;
        settings = undefined;
      },
    };
  };
}

export default hammered;
