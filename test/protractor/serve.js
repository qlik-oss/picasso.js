const path = require('path');

const rollup = require('rollup');
const pluginServe = require('rollup-plugin-serve');

const base = path.resolve(__dirname, '../integration');

async function serve() {
  const bundle = await rollup.rollup({
    input: path.resolve(base, 'index.js'),
    plugins: [
      pluginServe({
        contentBase: [base, path.resolve(base, '../../'), 'dist'],
      }),
    ],
  });

  await bundle.generate({
    file: 'dist/bundle.js',
    format: 'umd',
  });
}

module.exports = serve;
