import EventEmitter from '../utils/event-emitter';

export default function mediator() {
  const instance = {};
  EventEmitter.mixin(instance);
  return instance;
}
