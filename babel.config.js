module.exports = {
  presets: [['@babel/preset-typescript', { allowDeclareFields: true }]],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-typescript', { allowDeclareFields: true }],
      ],
      plugins: [['@babel/plugin-transform-react-jsx', { pragma: 'h' }]],
    },
  },
};
