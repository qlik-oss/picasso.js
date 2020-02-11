import extend from 'extend';

/**
 * Creates a context. Input an array of strings that should be inherited by the context.
 * @private
 *
 * @param  {Array}  [whitelist=[]]  An array of whitelisted string keys to inherit
 * @return {Function}               A context function
 */
function contextFactory(whitelist = []) {
  const states = [{}];

  /**
   * Returns the current context as an object. The object is mutable.
   * @private
   *
   * @return {Object}   Current context
   */
  function context() {
    // Returns the current context, the last in the stack.
    const item = states[states.length - 1];
    return item;
  }

  /**
   * Call context.save() to save the current context and move down the stack.
   *
   * @param  {Object} [item={}]   Optional item to save.
   * @return {Object}             The current context, just as context()
   */
  context.save = function save(item = {}) {
    const current = context();
    const obj = {};
    let key = '';

    // Only inherit whitelisted properties
    for (let i = 0; i < whitelist.length; i++) {
      key = whitelist[i];
      if (typeof current[key] !== 'undefined') {
        obj[key] = current[key];
      }
    }

    // Extend the new object with the saved item
    extend(obj, item);

    // Push it to the stack
    states.push(obj);

    // Return the new current context
    return context();
  };

  /**
   * Restore the previous context. Returns the context.
   *
   * @return {Undefined}   Returns nothing
   */
  context.restore = function restore() {
    // Remove the last element from the stack
    states.splice(states.length - 1, 1);
  };

  return context;
}

export { contextFactory as default };
