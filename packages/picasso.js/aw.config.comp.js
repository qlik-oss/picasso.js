module.exports = {
  require: ['babel-register', 'babel-helpers'],
  glob: ['test/component/**/*.comp.js'],
  mocha: {
    useColors: true
  }
};
