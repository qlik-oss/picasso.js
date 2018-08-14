module.exports = {
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }]
      ],
      plugins: [
        ['@babel/plugin-transform-react-jsx', { pragma: 'h' }],
        [
          'istanbul',
          {
            exclude: [
              '**/test/**',
              '**/dist/**'
            ]
          }
        ]
      ]
    }
  }
};
