const { join } = require('path');

module.exports = {
  // Changes the cache location for Puppeteer as the default "~/.cache/puppeteer" does not work on circleci
  cacheDirectory: join(__dirname, 'node_modules', 'puppeteer', '.cache'),
};
