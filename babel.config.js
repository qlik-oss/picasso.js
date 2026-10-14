module.exports = {
  env: {
    test: {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
      plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'classic', pragma: 'h' }]],
    },
  },
};
