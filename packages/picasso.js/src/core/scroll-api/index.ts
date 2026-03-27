import EventEmitter from '../utils/event-emitter';

export default function scrollApi() {
  let min = 0;
  let max = 0;
  let start = 0;
  let viewSize = 0;
  start = start || min;

  /**
   * The scroll api
   * @private
   * @alias scroll
   */
  const s = {
    /**
     * Move the current scroll
     * @param {number} value
     * @emits update
     */
    move(value) {
      this.moveTo(start + value);
    },

    /**
     * Change the current scroll to a specific value
     * @param {number} value
     * @emits update
     */
    moveTo(value) {
      const newStart = Math.max(min, Math.min(max - viewSize, value));
      if (start !== newStart) {
        start = newStart;
        s.emit('update');
      }
    },

    /**
     * Update scroll settings
     * @param {number} [settings.min]
     * @param {number} [settings.max]
     * @param {number} [settings.viewSize]
     * @emits update
     */
    update(settings) {
      let triggerUpdate = false;
      ({ min = min, max = max } = settings);
      if (settings.viewSize !== undefined && settings.viewSize !== viewSize) {
        viewSize = settings.viewSize;
        triggerUpdate = true;
      }

      // update scroll to be within the new bounds
      const newStart = Math.max(min, Math.min(max - viewSize, start));
      if (start !== newStart) {
        start = newStart;
        triggerUpdate = true;
      }

      if (triggerUpdate) {
        s.emit('update');
      }
    },

    /**
     * Get the current scroll state
     * @return {object} with min, max, start & viewSize
     */
    getState() {
      return {
        min,
        max,
        start,
        viewSize,
      };
    },
  };

  EventEmitter.mixin(s);

  return s;
}
