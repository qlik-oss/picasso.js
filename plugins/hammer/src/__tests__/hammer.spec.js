import createElement from 'test-utils/mocks/element-mock';
import hammer from '../hammer';
import { vi } from 'vitest';
import hammerMock from './hammer-mock';

describe('hammer interaction mixin', () => {
  let element;
  let mediator;
  let chart;
  let settings;
  let hammerInteraction;
  let Hammer;

  beforeEach(() => {
    Hammer = hammerMock();
    element = createElement('div');
    mediator = {};
    chart = {};
    settings = {
      type: 'hammer',
      enable: true,
      gestures: [
        {
          type: 'Pan',
          options: {
            event: 'pan',
          },
          events: {
            panstart() {},
            pan() {},
            panend() {},
          },
        },
      ],
    };
    hammerInteraction = hammer(Hammer)(chart, mediator, element);
  });

  it('should add ', () => {
    hammerInteraction.set(settings);
    expect(element.listeners.length).to.equal(3);
  });
  it('should not add events to element if enabled is false', () => {
    settings.enable = false;
    hammerInteraction.set(settings);
    expect(element.listeners.length).to.equal(0);
  });
  it('should not add events to element if gesture is disabled', () => {
    settings.gestures[0].options.enable = false;
    hammerInteraction.set(settings);
    expect(element.listeners.length).to.equal(0);
  });
  it('should remove event listeners when off is called', () => {
    hammerInteraction.set(settings);
    expect(element.listeners.length).to.equal(3);
    hammerInteraction.off();
    expect(element.listeners.length).to.equal(0);
  });
  it('should add event listeners again when on is called', () => {
    hammerInteraction.set(settings);
    expect(element.listeners.length).to.equal(3);
    hammerInteraction.off();
    expect(element.listeners.length).to.equal(0);
    hammerInteraction.on();
    expect(element.listeners.length).to.equal(3);
  });
  it('should not add event listeners when state is off', () => {
    hammerInteraction.set(settings);
    expect(element.listeners.length).to.equal(3);
    hammerInteraction.off();
    expect(element.listeners.length).to.equal(0);
    hammerInteraction.set(settings);
    expect(element.listeners.length).to.equal(0);
  });
  it('should change hammer events when set is called with new props', () => {
    hammerInteraction.set(settings);
    expect(element.listeners.length).to.equal(3);
    const newSettings = {
      type: 'hammer',
      enable: true,
      gestures: [
        {
          type: 'Click',
          events: {
            click() {},
          },
        },
      ],
    };
    hammerInteraction.set(newSettings);
    expect(element.listeners.length).to.equal(1);
    hammerInteraction.off();
    expect(element.listeners.length).to.equal(0);
  });
  it('remove all event listeners on destroy', () => {
    hammerInteraction.set(settings);
    expect(element.listeners.length).to.equal(3);
    hammerInteraction.destroy();
    expect(element.listeners.length).to.equal(0);
  });
  it('set recognizewith and requirefailure', () => {
    settings = {
      type: 'hammer',
      enable: true,
      gestures: [
        {
          type: 'Tap',
          options: {
            event: 'tap',
          },
          events: {
            tap() {},
          },
          recognizeWith: 'double ',
          requireFailure: 'double ',
        },
        {
          type: 'Tap',
          options: {
            event: 'double',
            taps: 2,
          },
          events: {
            double() {},
          },
          recognizeWith: 'tap ',
        },
      ],
    };
    expect(hammerInteraction.set.bind(this, settings)).to.not.throw(Error);
  });

  describe('reusing gesture objects', () => {
    it('should not modify the gesture objects it is given', () => {
      const { panstart, pan, panend } = settings.gestures[0].events;
      const gestureKeys = Object.keys(settings.gestures[0]);
      const enableFn = () => true;
      settings.gestures[0].options.enable = enableFn;

      hammerInteraction.set(settings);

      const [gesture] = settings.gestures;
      expect(Object.keys(gesture)).to.deep.equal(gestureKeys);
      expect(gesture.events.panstart).to.equal(panstart);
      expect(gesture.events.pan).to.equal(pan);
      expect(gesture.events.panend).to.equal(panend);
      expect(gesture.options.enable).to.equal(enableFn);
    });

    it('should not add defaults to gesture options that were not given', () => {
      settings.gestures = [{ type: 'Click', events: { click() {} } }];

      hammerInteraction.set(settings);

      expect(settings.gestures[0].options).to.equal(undefined);
    });

    it('should not add event or enable to the options object it is given', () => {
      const options = {};
      settings.gestures = [{ type: 'Tap', options, events: { tap() {} } }];

      hammerInteraction.set(settings);

      expect(options).to.deep.equal({});
    });

    it('should not nest bound handlers when the same gesture objects are set again', () => {
      const handler = vi.fn();
      const gesture = { type: 'Tap', options: { event: 'tap' }, events: { tap: handler } };
      const other = hammer(hammerMock())(chart, mediator, element);

      for (let i = 0; i < 5; i++) {
        other.set({ type: 'hammer', enable: true, gestures: [gesture] });
      }

      expect(gesture.events.tap).to.equal(handler);
    });

    it('should call handlers with the latest settings when the same gesture objects are set again', () => {
      const thisValues = [];
      const gesture = {
        type: 'Tap',
        options: { event: 'tap' },
        events: {
          tap() {
            thisValues.push(this);
          },
        },
      };
      const first = { type: 'hammer', enable: true, gestures: [gesture] };
      const second = { type: 'hammer', enable: true, gestures: [gesture] };

      hammerInteraction.set(first);
      hammerInteraction.set(second);
      element.trigger('tap');

      expect(thisValues).to.have.length(1);
      expect(thisValues[0].settings).to.equal(second);
      expect(thisValues[0].chart).to.equal(chart);
      expect(thisValues[0].mediator).to.equal(mediator);
    });

    it('should keep one listener per event when the same gesture objects are set repeatedly', () => {
      for (let i = 0; i < 5; i++) {
        hammerInteraction.set(settings);
      }
      expect(element.listeners.length).to.equal(3);
      hammerInteraction.off();
      expect(element.listeners.length).to.equal(0);
      hammerInteraction.on();
      expect(element.listeners.length).to.equal(3);
      hammerInteraction.destroy();
      expect(element.listeners.length).to.equal(0);
    });

    it('should not call a handler of an earlier set', () => {
      const first = vi.fn();
      const second = vi.fn();
      hammerInteraction.set({
        type: 'hammer',
        gestures: [{ type: 'Tap', options: { event: 'tap' }, events: { tap: first } }],
      });
      hammerInteraction.set({
        type: 'hammer',
        gestures: [{ type: 'Tap', options: { event: 'tap' }, events: { tap: second } }],
      });

      element.trigger('tap');

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });

    it('should not modify the settings object it is given', () => {
      const enable = () => true;
      const given = { type: 'hammer', enable };
      const withoutEnable = { type: 'hammer', gestures: [] };

      hammerInteraction.set(given);
      hammerInteraction.set(withoutEnable);

      expect(given).to.deep.equal({ type: 'hammer', enable });
      expect(withoutEnable).to.deep.equal({ type: 'hammer', gestures: [] });
    });

    it('should evaluate a settings.enable function again when the same settings are set again', () => {
      let enabled = false;
      const enable = vi.fn(function enableFn() {
        return enabled;
      });
      settings.enable = enable;

      hammerInteraction.set(settings);
      expect(element.listeners.length).to.equal(0);

      enabled = true;
      hammerInteraction.set(settings);
      expect(element.listeners.length).to.equal(3);
      expect(settings.enable).to.equal(enable);
      expect(enable.mock.contexts[1].settings).to.equal(settings);
    });

    it('should evaluate a settings.enable function again on on()', () => {
      let enabled = true;
      settings.enable = () => enabled;

      hammerInteraction.set(settings);
      expect(element.listeners.length).to.equal(3);
      hammerInteraction.off();
      enabled = false;
      hammerInteraction.on();
      expect(element.listeners.length).to.equal(0);
    });

    it('should hand the recognizer an options.enable bound to the interaction instance and keep the given one', () => {
      let thisValue;
      const enable = function enableFn() {
        thisValue = this;
        return true;
      };
      const recognizerOptions = [];
      const { Tap } = Hammer;
      Hammer.Tap = class extends Tap {
        constructor(opts) {
          super(opts);
          recognizerOptions.push(opts);
        }
      };
      settings.gestures = [{ type: 'Tap', options: { event: 'tap', enable }, events: { tap() {} } }];

      hammerInteraction.set(settings);

      expect(settings.gestures[0].options.enable).to.equal(enable);
      expect(recognizerOptions).to.have.length(1);
      expect(recognizerOptions[0].enable).to.not.equal(enable);
      recognizerOptions[0].enable();
      expect(thisValue.settings).to.equal(settings);
    });
  });
});
