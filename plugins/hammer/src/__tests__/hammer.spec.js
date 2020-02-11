import createElement from 'test-utils/mocks/element-mock';
import hammer from '../hammer';
import hammerMock from './hammer-mock';

describe('hammer interaction mixin', () => {
  let element;
  let mediator;
  let chart;
  let settings;
  let hammerInteraction;

  beforeEach(() => {
    hammerMock();
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
    hammerInteraction = hammer(chart, mediator, element);
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
});
