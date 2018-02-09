module.exports = {
  require: ['babel-register', 'babel-helpers'],
  glob: ['*(packages|plugins)/*/test/component/**/*.comp.js'],
  watchGlob: ['*(packages|plugins)/*/*(src|test)/**/*.js'],
  src: ['*(packages|plugins)/*/src/**/*.js'],
  coverage: true,
  nyc: {
    reportDir: 'coverage/component'
  },
  mocha: {
    reporter: 'min'
  }
};
