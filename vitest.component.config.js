const baseConfig = require('./vitest.config');

module.exports = {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['**/test/component/**/*.comp.js'],
  },
};
