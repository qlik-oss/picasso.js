module.exports = {
  test: {
    globals: true,
    include: ['**/test/integration/**/*.int.js'],
    setupFiles: ['./vitest.integration.setup.js'],
    pool: 'forks',
    singleFork: true,
  },
};
