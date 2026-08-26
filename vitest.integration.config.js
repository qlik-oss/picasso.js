module.exports = {
  test: {
    globals: true,
    include: ['**/test/integration/**/*.int.js'],
    setupFiles: ['./vitest.integration.setup.js'],
    hookTimeout: 30000,
    pool: 'forks',
    singleFork: true,
  },
};
