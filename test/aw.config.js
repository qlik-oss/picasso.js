process.env.NODE_ENV = 'testNode';

module.exports = {
  glob: ['test/puppet/**/*.int.js'],
  watchGlob: ['test/puppet/**/*.{js,html}']
};
