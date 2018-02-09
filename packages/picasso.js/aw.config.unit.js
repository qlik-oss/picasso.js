module.exports = {
  require: ['babel-register', 'babel-helpers'],
  glob: ['test/unit/**/*.spec.js'],
  nyc: {
    reportDir: 'test/unit/coverage'
  },
  mocha: {
    useColors: true
  }
};
