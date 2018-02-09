module.exports = {
  require: ['babel-register', 'babel-helpers'],
  nyc: {
    reportDir: 'test/unit/coverage'
  },
  mocha: {
    useColors: true
  }
};
