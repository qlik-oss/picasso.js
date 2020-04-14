const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, '../picasso.js/src'), path.resolve(__dirname, '../../plugins/**/src')],
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [['@babel/plugin-transform-react-jsx', { pragma: 'h' }]],
          },
        },
      },
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, 'src')],
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-syntax-dynamic-import', '@babel/plugin-proposal-class-properties'],
          },
        },
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
    ],
  },
  devtool: 'eval-source-map',
  devServer: {
    stats: 'errors-only',
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new MonacoWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CopyWebpackPlugin([{ from: 'public', ignore: ['index.html'] }]),
  ],
};
