process.env.NODE_ENV = 'testNode';

module.exports = {
  glob: ['test/puppet/**/*.puppet.js'],
  watchGlob: ['test/puppet/**/*.{js,html}']
};
