const LOG_LEVEL = {
  OFF: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
};

const loggerFn = ({ level = LOG_LEVEL.OFF, pipe = console } = {}) => {
  let currentlevel = level;

  const LOG_FN = {
    [LOG_LEVEL.OFF]: () => {},
    [LOG_LEVEL.ERROR]: (...args) => pipe.error(...args),
    [LOG_LEVEL.WARN]: (...args) => pipe.warn(...args),
    [LOG_LEVEL.INFO]: (...args) => pipe.info(...args),
    [LOG_LEVEL.DEBUG]: (...args) => pipe.log(...args),
  };

  const log = (lev, ...args) => {
    if (!lev || currentlevel < lev) {
      return;
    }

    (LOG_FN[lev] || LOG_FN[LOG_LEVEL.DEBUG])(...args);
  };

  /**
   * @typedef {object} logger
   * @private
   */

  return /** @lends logger */ {
    /**
     * Log a message
     * @param {number} lev - The log level
     * @param {...any} args
     * @kind function
     */
    log,

    /**
     * Log an error message
     * @param {...any} args
     */
    error: (...args) => log(LOG_LEVEL.ERROR, ...args),

    /**
     * Log a warning message
     * @param {...any} args
     */
    warn: (...args) => log(LOG_LEVEL.WARN, ...args),

    /**
     * Log an info message
     * @param {...any} args
     */
    info: (...args) => log(LOG_LEVEL.INFO, ...args),

    /**
     * Log a debug message
     * @param {...any} args
     */
    debug: (...args) => log(LOG_LEVEL.DEBUG, ...args),

    /**
     * Set the current log level
     * @param {number} lev - The log level
     */
    level: (lev) => {
      if (typeof lev === 'number') {
        currentlevel = lev;
      }
      return currentlevel;
    },

    LOG_LEVEL,
  };
};

export default loggerFn;
