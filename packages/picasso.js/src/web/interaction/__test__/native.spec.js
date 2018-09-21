import createElement from 'test-utils/mocks/element-mock';
import native from '../../../../src/web/interactions/native';

describe('native interaction mixin', () => {
  let element;
  let mediator;
  let chart;
  let settings;
  let nativeInteraction;

  beforeEach(() => {
    element = createElement('div');
    mediator = {};
    chart = {};
    settings = {
      type: 'native',
      enable: true,
      events: {
        mousedown() {
          // handle mousedown
        },
        mouseup() {
          // handle mouseup
        }
      }
    };
    nativeInteraction = native(chart, mediator, element);
  });

  it('should add native events to element', () => {
    nativeInteraction.set(settings);
    expect(element.listeners.length).to.equal(2);
  });
  it('should not add native events to element if enabled is false', () => {
    settings.enable = false;
    nativeInteraction.set(settings);
    expect(element.listeners.length).to.equal(0);
  });
  it('should remove event listeners when off is called', () => {
    nativeInteraction.set(settings);
    expect(element.listeners.length).to.equal(2);
    nativeInteraction.off();
    expect(element.listeners.length).to.equal(0);
  });
  it('should add event listeners again when on is called', () => {
    nativeInteraction.set(settings);
    expect(element.listeners.length).to.equal(2);
    nativeInteraction.off();
    expect(element.listeners.length).to.equal(0);
    nativeInteraction.on();
    expect(element.listeners.length).to.equal(2);
  });
  it('should not add event listeners when state is off', () => {
    nativeInteraction.set(settings);
    expect(element.listeners.length).to.equal(2);
    nativeInteraction.off();
    expect(element.listeners.length).to.equal(0);
    nativeInteraction.set(settings);
    expect(element.listeners.length).to.equal(0);
  });
  it('should change native events when set is called with new props', () => {
    nativeInteraction.set(settings);
    expect(element.listeners.length).to.equal(2);
    settings.events = {
      mousemove() {},
      mouseleave() {},
      mouseenter() {}
    };
    nativeInteraction.set(settings);
    expect(element.listeners.length).to.equal(3);
  });
  it('remove all event listeners on destroy', () => {
    nativeInteraction.set(settings);
    expect(element.listeners.length).to.equal(2);
    nativeInteraction.destroy();
    expect(element.listeners.length).to.equal(0);
  });
});
