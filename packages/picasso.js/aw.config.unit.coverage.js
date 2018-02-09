module.exports = {
  require: ['babel-register', 'babel-helpers'],
  glob: ['test/unit/**/*.spec.js'],
  coverage: true,
  nyc: {
    reportDir: 'test/unit/coverage'
  },
  mocha: {
    reporter: 'min',
    useColors: true
  }
};
