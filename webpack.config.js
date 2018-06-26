const path = require('path');
const webpack = require('webpack');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const cwd = process.cwd();
const { name, version, main } = require(path.join(cwd, 'package.json')); // eslint-disable-line
const basename = path.basename(main);
const dir = path.dirname(main);
const umdName = basename.replace(/-([a-z])/g, (m, p1) => p1.toUpperCase()).split('.js').join('');

module.exports = {
  mode,
  entry: path.resolve(cwd, 'src', 'index'),
  output: {
    path: path.resolve(dir),
    filename: basename,
    library: umdName,
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: [
          path.resolve(cwd, 'src'),
          /path2d-polyfill/
        ],
        sideEffects: false,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false,
                targets: {
                  browsers: ['ie 11']
                }
              }]
            ]
          }
        }
      }]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `${name} v${version}
Copyright (c) ${new Date().getFullYear()} QlikTech International AB`
    })
  ]
};
