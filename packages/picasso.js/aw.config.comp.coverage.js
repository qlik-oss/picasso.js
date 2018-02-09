module.exports = {
  require: ['babel-register', 'babel-helpers'],
  glob: ['test/component/**/*.comp.js'],
  coverage: true,
  nyc: {
    reportDir: 'test/component/coverage'
  },
  mocha: {
    reporter: 'min',
    useColors: true
  }
};
