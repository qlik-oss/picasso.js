const serve = require('rollup-plugin-serve');
const path = require('path');

module.exports = {
  input: path.resolve(__dirname, 'index.js'),
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
  },
  plugins: [
    serve({
      contentBase: [__dirname, path.resolve(__dirname, '../../'), 'dist'],
    }),
  ],
};
