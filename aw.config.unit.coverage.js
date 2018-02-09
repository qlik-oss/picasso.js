module.exports = {
  require: ['babel-register', 'babel-helpers'],
  glob: ['*(packages|plugins)/*/test/unit/**/*.spec.js'],
  watchGlob: ['*(packages|plugins)/*/*(src|test)/**/*.js'],
  src: ['*(packages|plugins)/*/src/**/*.js'],
  coverage: true,
  nyc: {
    reportDir: 'coverage/unit'
  },
  mocha: {
    reporter: 'min'
  }
};
