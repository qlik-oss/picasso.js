const path = require('path');

module.exports = {
  baseUrl: 'http://localhost:10001/',
  capabilities: process.platform === 'win32' ? {
    name: 'desktop-ie',
    browserName: 'internet explorer',
    version: '11',
    platform: 'WINDOWS'
  } : {
    browserName: 'chrome'
  },
  specs: [
    path.resolve(__dirname, 'test/protractor/**/*.spec.js')
  ],
  directConnect: false,
  mochaOpts: {
    reporter: 'spec'
  }
};
