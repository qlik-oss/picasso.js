const path = require('path');

module.exports = {
  root: path.resolve(__dirname),
  rewrite: {
    '/fixtures/(.*)': 'packages/picasso.js/test/integration/$1'
  }
};
